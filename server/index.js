import cors from 'cors'
import generate from '@babel/generator'
import { parse } from '@babel/parser'
import * as t from '@babel/types'
import esbuild from 'esbuild'
import express from 'express'
import fs from 'node:fs/promises'
import { statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const app = express()
const port = 4310
const thisFileDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = resolveProjectRoot()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

function isDirectory(targetPath) {
  try {
    return statSync(targetPath).isDirectory()
  } catch {
    return false
  }
}

function resolveProjectRoot() {
  const envRoot = process.env.VE_PROJECT_ROOT
    ? path.isAbsolute(process.env.VE_PROJECT_ROOT)
      ? process.env.VE_PROJECT_ROOT
      : path.resolve(process.cwd(), process.env.VE_PROJECT_ROOT)
    : null

  const candidates = [
    envRoot,
    path.resolve(process.cwd(), 'src', 'playground'),
    path.resolve(process.cwd(), '..', 'src', 'playground'),
    path.resolve(thisFileDir, '..', 'src', 'playground'),
    path.resolve(thisFileDir, '..', '..', 'src', 'playground'),
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (isDirectory(candidate)) {
      return candidate
    }
  }

  return path.resolve(process.cwd(), 'src', 'playground')
}

function isTsxFile(fileName) {
  return fileName.endsWith('.tsx') && !fileName.endsWith('.d.tsx')
}

function normalizeToPosix(filePath) {
  return filePath.replace(/\\/g, '/')
}

function parseSource(source) {
  return parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })
}

function walkAst(node, visit) {
  if (!node || typeof node !== 'object') {
    return
  }
  visit(node)
  for (const key of Object.keys(node)) {
    const value = node[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        walkAst(item, visit)
      }
      continue
    }
    if (value && typeof value === 'object') {
      walkAst(value, visit)
    }
  }
}

function getStringLiteralValue(node) {
  if (!node) {
    return ''
  }
  if (t.isStringLiteral(node)) {
    return node.value
  }
  if (t.isTemplateLiteral(node) && node.expressions.length === 0) {
    return node.quasis[0]?.value?.cooked || ''
  }
  return ''
}

function findDefaultPropAssignment(ast, propName) {
  let result = null

  walkAst(ast, (node) => {
    if (result) {
      return
    }
    if (!t.isFunctionDeclaration(node) || node.params.length === 0) {
      return
    }
    const firstParam = node.params[0]
    if (!t.isObjectPattern(firstParam)) {
      return
    }

    for (const property of firstParam.properties) {
      if (!t.isObjectProperty(property) || !t.isIdentifier(property.key, { name: propName })) {
        continue
      }

      if (t.isAssignmentPattern(property.value) && t.isStringLiteral(property.value.right)) {
        result = property.value
        return
      }
    }
  })

  return result
}

function findArrayExpressionByName(ast, arrayName) {
  let result = null

  walkAst(ast, (node) => {
    if (result) {
      return
    }
    if (!t.isVariableDeclarator(node) || !t.isIdentifier(node.id, { name: arrayName })) {
      return
    }
    if (t.isArrayExpression(node.init)) {
      result = node.init
    }
  })

  return result
}

function findObjectPropertyByKey(objectExpression, keyName) {
  return objectExpression.properties.find(
    (property) =>
      t.isObjectProperty(property) && t.isIdentifier(property.key) && property.key.name === keyName,
  )
}

function findArrayItemByMatch(arrayExpression, matchKey, matchValue) {
  return arrayExpression.elements.find((element) => {
    if (!t.isObjectExpression(element)) {
      return false
    }
    const matchProperty = findObjectPropertyByKey(element, matchKey)
    if (!matchProperty || !t.isObjectProperty(matchProperty)) {
      return false
    }
    return getStringLiteralValue(matchProperty.value) === matchValue
  })
}

function serializeObjectExpression(objectExpression) {
  const output = {}
  for (const property of objectExpression.properties) {
    if (!t.isObjectProperty(property) || !t.isIdentifier(property.key)) {
      continue
    }
    output[property.key.name] = getStringLiteralValue(property.value)
  }
  return output
}

function findJsxByVeId(ast, veId) {
  let result = null

  walkAst(ast, (node) => {
    if (result) {
      return
    }
    if (!t.isJSXOpeningElement(node)) {
      return
    }

    const veIdAttribute = node.attributes.find(
      (attribute) =>
        t.isJSXAttribute(attribute) &&
        t.isJSXIdentifier(attribute.name, { name: 'data-ve-id' }) &&
        t.isStringLiteral(attribute.value) &&
        attribute.value.value === veId,
    )

    if (veIdAttribute) {
      result = node
    }
  })

  return result
}

function getClassAttribute(openingElement) {
  return openingElement.attributes.find(
    (attribute) =>
      t.isJSXAttribute(attribute) &&
      t.isJSXIdentifier(attribute.name, { name: 'className' }) &&
      t.isStringLiteral(attribute.value),
  )
}

function setClassToken(className, tokenPrefix, value) {
  const tokens = className.split(/\s+/).filter(Boolean)
  const filtered = tokens.filter((token) => !token.startsWith(tokenPrefix))
  return [...filtered, `${tokenPrefix}${value}`].join(' ')
}

function readClassToken(className, tokenPrefix, fallbackToken) {
  const tokens = className.split(/\s+/).filter(Boolean)
  const current = tokens.find((token) => token.startsWith(tokenPrefix)) || fallbackToken || ''
  return current.startsWith(tokenPrefix) ? current.slice(tokenPrefix.length) : ''
}

function discoverEditableText(source) {
  const ast = parseSource(source)
  const controls = []
  const discovered = new Set()
  let textNodeCounter = 0

  walkAst(ast, (node) => {
    if (!t.isJSXText(node)) {
      return
    }

    const text = node.value.trim()
    if (!text || text.length === 0 || text.match(/^[\s\n]*$/)) {
      return
    }

    if (discovered.has(text)) {
      return
    }

    discovered.add(text)

    const controlId = `text-node-${textNodeCounter++}`
    controls.push({
      id: controlId,
      type: 'text',
      label: `Text: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
      value: text,
      binding: {
        kind: 'textNode',
        content: text,
      },
    })
  })

  return { version: 1, component: 'auto-discovered', controls, isAutoGenerated: true }
}

function injectEditableMarkers(source) {
  const ast = parseSource(source)
  const textMap = new Map()
  let currentIdx = 0

  walkAst(ast, (node) => {
    if (!t.isJSXText(node)) {
      return
    }
    const text = node.value.trim()
    if (!text || text.length === 0 || text.match(/^[\s\n]*$/)) {
      return
    }
    if (!textMap.has(text)) {
      textMap.set(text, currentIdx++)
    }
  })

  let modifiedSource = source
  let markerIndex = 0

  textMap.forEach((index, text) => {
    const escapedText = text.replace(/[-[\]{}()*+?.\\^$|#\s]/g, '\\$&')
    const regex = new RegExp(`(>\\s*)(${escapedText})(\\s*<)`, 'g')
    
    modifiedSource = modifiedSource.replace(regex, (match, before, textContent, after) => {
      const uniqueId = `auto-text-${index}-${markerIndex++}`
      return `${before}<span data-editable-field="text" data-schema-id="${uniqueId}" className="cursor-pointer hover:opacity-75 transition">${textContent}</span>${after}`
    })
  })

  return modifiedSource
}

function extractComponentName(source) {
  const ast = parseSource(source)
  let componentName = 'App'

  walkAst(ast, (node) => {
    if (t.isExportDefaultDeclaration(node)) {
      if (t.isFunctionDeclaration(node.declaration) && node.declaration.id) {
        componentName = node.declaration.id.name
      } else if (t.isIdentifier(node.declaration)) {
        componentName = node.declaration.name
      }
    }
  })

  return componentName
}

async function loadSchemaForFile(relativeTsxPath) {
  const schemaPath = resolveWithinProject(relativeTsxPath.replace(/\.tsx$/i, '.schema.json'))
  const schemaText = await fs.readFile(schemaPath, 'utf8')
  return JSON.parse(schemaText)
}

async function loadOrDiscoverSchema(relativeTsxPath, source) {
  try {
    return await loadSchemaForFile(relativeTsxPath)
  } catch {
    return discoverEditableText(source)
  }
}

function resolveSchemaValues(source, schema) {
  const ast = parseSource(source)

  const controls = schema.controls.map((control) => {
    const next = { ...control }

    if (control.binding?.kind === 'textNode') {
      next.value = control.binding.content || ''
      return next
    }

    if (control.binding?.kind === 'defaultProp') {
      const assignment = findDefaultPropAssignment(ast, control.binding.prop)
      next.value = assignment ? getStringLiteralValue(assignment.right) : ''
      return next
    }

    if (control.binding?.kind === 'arrayItemProperty') {
      const arrayExpression = findArrayExpressionByName(ast, control.binding.array)
      if (!arrayExpression) {
        next.value = ''
        return next
      }
      const item = findArrayItemByMatch(arrayExpression, control.binding.matchKey, control.binding.matchValue)
      if (!item || !t.isObjectExpression(item)) {
        next.value = ''
        return next
      }
      const prop = findObjectPropertyByKey(item, control.binding.property)
      next.value = prop && t.isObjectProperty(prop) ? getStringLiteralValue(prop.value) : ''
      return next
    }

    if (control.binding?.kind === 'array') {
      const arrayExpression = findArrayExpressionByName(ast, control.binding.array)
      next.items = (arrayExpression?.elements || [])
        .filter((element) => t.isObjectExpression(element))
        .map((element) => serializeObjectExpression(element))
      return next
    }

    if (control.binding?.kind === 'classToken') {
      const opening = findJsxByVeId(ast, control.binding.veId)
      if (!opening) {
        next.value = ''
        return next
      }
      const classAttribute = getClassAttribute(opening)
      const className = classAttribute?.value?.value || ''
      next.value = readClassToken(className, control.binding.tokenPrefix, control.binding.fallbackToken)
      return next
    }

    return next
  })

  return { ...schema, controls }
}

function applyMutation(source, control, payload) {
  const ast = parseSource(source)

  if (control.binding?.kind === 'textNode' && payload.action === 'set') {
    walkAst(ast, (node) => {
      if (!t.isJSXText(node)) {
        return
      }
      if (node.value.trim() === control.binding.content.trim()) {
        node.value = String(payload.value || '')
      }
    })
    return generate(ast, { retainLines: true }).code
  }

  if (control.binding?.kind === 'defaultProp' && payload.action === 'set') {
    const assignment = findDefaultPropAssignment(ast, control.binding.prop)
    if (!assignment) {
      throw new Error(`Could not locate default prop binding: ${control.binding.prop}`)
    }
    assignment.right = t.stringLiteral(String(payload.value || ''))
  }

  if (control.binding?.kind === 'arrayItemProperty' && payload.action === 'set') {
    const arrayExpression = findArrayExpressionByName(ast, control.binding.array)
    if (!arrayExpression) {
      throw new Error(`Could not locate array: ${control.binding.array}`)
    }
    const item = findArrayItemByMatch(arrayExpression, control.binding.matchKey, control.binding.matchValue)
    if (!item || !t.isObjectExpression(item)) {
      throw new Error('Could not locate bound array item.')
    }
    const property = findObjectPropertyByKey(item, control.binding.property)
    if (!property || !t.isObjectProperty(property)) {
      throw new Error(`Could not locate property: ${control.binding.property}`)
    }
    property.value = t.stringLiteral(String(payload.value || ''))
  }

  if (control.binding?.kind === 'array') {
    const arrayExpression = findArrayExpressionByName(ast, control.binding.array)
    if (!arrayExpression) {
      throw new Error(`Could not locate array: ${control.binding.array}`)
    }

    if (payload.action === 'add-item') {
      const nextItem = { ...control.binding.template, id: `${control.binding.template.id}-${Date.now()}` }
      const properties = Object.entries(nextItem).map(([key, value]) =>
        t.objectProperty(t.identifier(key), t.stringLiteral(String(value))),
      )
      arrayExpression.elements.push(t.objectExpression(properties))
    }

    if (payload.action === 'remove-item') {
      const idKey = control.binding.idKey || 'id'
      arrayExpression.elements = arrayExpression.elements.filter((element) => {
        if (!t.isObjectExpression(element)) {
          return true
        }
        const idProperty = findObjectPropertyByKey(element, idKey)
        if (!idProperty || !t.isObjectProperty(idProperty)) {
          return true
        }
        return getStringLiteralValue(idProperty.value) !== payload.itemId
      })
    }

    if (payload.action === 'set-item-field') {
      const idKey = control.binding.idKey || 'id'
      const targetField = String(payload.field || '')
      const targetItem = findArrayItemByMatch(arrayExpression, idKey, String(payload.itemId || ''))
      if (!targetItem || !t.isObjectExpression(targetItem)) {
        throw new Error('Could not locate repeater item.')
      }
      const existing = findObjectPropertyByKey(targetItem, targetField)
      if (existing && t.isObjectProperty(existing)) {
        existing.value = t.stringLiteral(String(payload.value || ''))
      } else {
        targetItem.properties.push(
          t.objectProperty(t.identifier(targetField), t.stringLiteral(String(payload.value || ''))),
        )
      }
    }
  }

  if (control.binding?.kind === 'classToken' && payload.action === 'set') {
    const opening = findJsxByVeId(ast, control.binding.veId)
    if (!opening) {
      throw new Error(`Could not locate data-ve-id target: ${control.binding.veId}`)
    }
    const classAttribute = getClassAttribute(opening)
    if (!classAttribute || !t.isStringLiteral(classAttribute.value)) {
      throw new Error('Class token control requires a static string className.')
    }
    classAttribute.value = t.stringLiteral(
      setClassToken(classAttribute.value.value, control.binding.tokenPrefix, String(payload.value || '')),
    )
  }

  return generate(ast, { retainLines: true }).code
}

async function listTsxFiles(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return listTsxFiles(fullPath, baseDir)
      }
      if (entry.isFile() && isTsxFile(entry.name)) {
        const relative = path.relative(baseDir, fullPath)
        return [relative.split(path.sep).join('/')]
      }
      return []
    }),
  )

  return nested.flat().sort((a, b) => a.localeCompare(b))
}

function resolveWithinProject(relativePath) {
  const normalized = String(relativePath || '').replaceAll('\\', '/').replaceAll('..', '')
  const sanitized = normalized.replace(/^\/+/, '')
  const absolutePath = path.resolve(projectRoot, sanitized)
  if (!absolutePath.startsWith(projectRoot)) {
    throw new Error('Path escapes editable project root.')
  }
  return absolutePath
}

app.get('/api/components', async (_, res) => {
  try {
    const files = await listTsxFiles(projectRoot)
    res.json({ root: 'src/playground', files })
  } catch (error) {
    res.status(500).json({ message: 'Failed to list components.', error: String(error) })
  }
})

app.get('/api/source', async (req, res) => {
  try {
    const file = String(req.query.file || '')
    const absolutePath = resolveWithinProject(file)
    const source = await fs.readFile(absolutePath, 'utf8')
    res.json({ file, source })
  } catch (error) {
    res.status(400).json({ message: 'Failed to read source.', error: String(error) })
  }
})

app.get('/api/schema', async (req, res) => {
  try {
    const file = String(req.query.file || '')
    const absolutePath = resolveWithinProject(file)
    const source = await fs.readFile(absolutePath, 'utf8')
    const schema = await loadOrDiscoverSchema(file, source)
    const resolvedSchema = resolveSchemaValues(source, schema)
    res.json({ file, schema: resolvedSchema })
  } catch (error) {
    res.status(400).json({ message: 'Failed to load schema.', error: String(error) })
  }
})

app.post('/api/source', async (req, res) => {
  try {
    const file = String(req.body.file || '')
    const source = String(req.body.source || '')
    const absolutePath = resolveWithinProject(file)
    await fs.writeFile(absolutePath, source, 'utf8')
    res.json({ ok: true })
  } catch (error) {
    res.status(400).json({ message: 'Failed to save source.', error: String(error) })
  }
})

app.post('/api/mutate', async (req, res) => {
  try {
    const file = String(req.body.file || '')
    const controlId = String(req.body.controlId || '')
    const payload = req.body

    const absolutePath = resolveWithinProject(file)
    const source = await fs.readFile(absolutePath, 'utf8')
    const schema = await loadOrDiscoverSchema(file, source)
    const control = schema.controls.find((candidate) => candidate.id === controlId)

    if (!control) {
      throw new Error(`Unknown control id: ${controlId}`)
    }

    const nextSource = applyMutation(source, control, payload)
    await fs.writeFile(absolutePath, nextSource, 'utf8')

    const resolvedSchema = resolveSchemaValues(nextSource, schema)
    res.json({ ok: true, source: nextSource, schema: resolvedSchema })
  } catch (error) {
    res.status(400).json({ message: 'Failed to apply schema mutation.', error: String(error) })
  }
})

app.get('/api/preview', async (req, res) => {
  try {
    const file = String(req.query.file || '')
    const absolutePath = resolveWithinProject(file)
    const componentSource = await fs.readFile(absolutePath, 'utf8')
    const schema = await loadOrDiscoverSchema(file, componentSource)
    
    let sourceToUse = componentSource
    if (schema.isAutoGenerated) {
      try {
        sourceToUse = injectEditableMarkers(componentSource)
      } catch (injectionError) {
        console.error('Marker injection failed:', injectionError)
        sourceToUse = componentSource
      }
    }

    const componentName = extractComponentName(sourceToUse)

    const renderSource = `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      
      ${sourceToUse}

      const mount = document.getElementById('root');

      function RuntimeBoundary() {
        try {
          return React.createElement(${componentName}, {});
        } catch (error) {
          return React.createElement('pre', { style: { whiteSpace: 'pre-wrap', color: '#7f1d1d', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' } }, String(error));
        }
      }

      createRoot(mount).render(React.createElement(RuntimeBoundary));
    `

    const result = await esbuild.build({
      stdin: {
        contents: renderSource,
        sourcefile: 'visual-preview-entry.tsx',
        loader: 'tsx',
        resolveDir: path.dirname(absolutePath),
      },
      bundle: true,
      write: false,
      format: 'iife',
      platform: 'browser',
      jsx: 'automatic',
      logLevel: 'silent',
    })

    res.json({ script: result.outputFiles[0].text })
  } catch (error) {
    res.status(400).json({ message: 'Failed to compile preview bundle.', error: String(error) })
  }
})

if (!process.env.VERCEL) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Visual editor API running at http://localhost:${port}`)
  })
}

export default app
