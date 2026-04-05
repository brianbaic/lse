import generate from '@babel/generator'
import { parse } from '@babel/parser'
import { useEffect, useMemo, useRef, useState } from 'react'

type EditorNode = {
  id: string
  tagName: string
  className: string
}

type ComponentsResponse = {
  root: string
  files: string[]
}

type SchemaControlBase = {
  id: string
  type: 'text' | 'image' | 'repeater' | 'layout'
  label: string
}

type SchemaControl = SchemaControlBase & {
  value?: string
  items?: Array<Record<string, string>>
  options?: Array<{ label: string; value: string }>
}

type EditorSchema = {
  version: number
  component: string
  controls: SchemaControl[]
}

const utilityPalette = [
  'bg-white',
  'bg-slate-50',
  'bg-slate-900',
  'text-slate-900',
  'text-slate-600',
  'text-white',
  'p-4',
  'p-8',
  'px-5',
  'py-2.5',
  'rounded-lg',
  'rounded-2xl',
  'shadow-sm',
  'shadow-lg',
  'font-semibold',
  'tracking-tight',
  'border',
  'border-slate-200',
]

function getApiUrl(path: string): string {
  const isPreview = window.location.hostname === 'localhost' && window.location.port === '4173'
  if (isPreview) {
    return `http://localhost:4310${path}`
  }
  return `/api${path.replace(/^\/api/, '')}`
}

function getTagName(nameNode: any): string {
  if (!nameNode) {
    return 'unknown'
  }
  if (nameNode.type === 'JSXIdentifier') {
    return nameNode.name
  }
  if (nameNode.type === 'JSXMemberExpression') {
    return `${getTagName(nameNode.object)}.${getTagName(nameNode.property)}`
  }
  return 'unknown'
}

function walkAst(node: any, visit: (currentNode: any) => void): void {
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

function findClassAttribute(openingElement: any): any | undefined {
  return openingElement.attributes?.find(
    (attribute: any) =>
      attribute?.type === 'JSXAttribute' &&
      attribute.name?.type === 'JSXIdentifier' &&
      attribute.name.name === 'className',
  )
}

function extractClassValue(attribute: any): string {
  if (!attribute?.value) {
    return ''
  }
  if (attribute.value.type === 'StringLiteral') {
    return attribute.value.value
  }
  if (
    attribute.value.type === 'JSXExpressionContainer' &&
    attribute.value.expression?.type === 'StringLiteral'
  ) {
    return attribute.value.expression.value
  }
  return ''
}

function collectNodes(source: string): EditorNode[] {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  const nodes: EditorNode[] = []
  let index = 0

  walkAst(ast, (node) => {
    if (node.type !== 'JSXOpeningElement') {
      return
    }

    const classAttribute = findClassAttribute(node)
    if (!classAttribute) {
      return
    }

    const line = node.loc?.start?.line ?? 0
    const column = node.loc?.start?.column ?? 0

    nodes.push({
      id: `${line}:${column}:${index}`,
      tagName: getTagName(node.name),
      className: extractClassValue(classAttribute),
    })

    index += 1
  })

  return nodes
}

function collectNodesSafe(source: string): EditorNode[] {
  try {
    return collectNodes(source)
  } catch {
    return []
  }
}

function replaceNodeClassName(source: string, targetId: string, newClassName: string): string {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  let index = 0

  walkAst(ast, (node) => {
    if (node.type !== 'JSXOpeningElement') {
      return
    }

    const line = node.loc?.start?.line ?? 0
    const column = node.loc?.start?.column ?? 0
    const nodeId = `${line}:${column}:${index}`
    index += 1

    if (nodeId !== targetId) {
      return
    }

    const classAttribute = findClassAttribute(node)
    if (!classAttribute) {
      return
    }

    classAttribute.value = {
      type: 'StringLiteral',
      value: newClassName.trim(),
    }
  })

  return generate(ast, { retainLines: true }).code
}

function buildPreviewDocument(script: string, theme: 'light' | 'dark') {
  const inlineEditScript = buildInlineEditScript()
  const background = theme === 'dark' ? '#0f172a' : '#f8fafc'
  const textColor = theme === 'dark' ? '#e2e8f0' : '#0f172a'
  const themeOverrides =
    theme === 'dark'
      ? `
          body[data-ve-theme='dark'] .bg-white { background-color: #0f172a !important; }
          body[data-ve-theme='dark'] .bg-slate-50 { background-color: #111827 !important; }
          body[data-ve-theme='dark'] .bg-slate-100 { background-color: #1f2937 !important; }
          body[data-ve-theme='dark'] .bg-sky-50 { background-color: #0b253d !important; }
          body[data-ve-theme='dark'] .bg-amber-50 { background-color: #3a2a12 !important; }
          body[data-ve-theme='dark'] .bg-blue-50 { background-color: #1e293b !important; }
          body[data-ve-theme='dark'] .bg-sky-50 { background-color: #1e293b !important; }
          body[data-ve-theme='dark'] .bg-slate-900 { background-color: #020617 !important; }
          body[data-ve-theme='dark'] .bg-blue-600 { background-color: #2563eb !important; }
          body[data-ve-theme='dark'] .bg-blue-700 { background-color: #1d4ed8 !important; }
          body[data-ve-theme='dark'] .bg-emerald-500 { background-color: #34d399 !important; }
          body[data-ve-theme='dark'] .bg-green-500 { background-color: #22c55e !important; }

          body[data-ve-theme='dark'] .from-white { --tw-gradient-from: #0f172a var(--tw-gradient-from-position) !important; --tw-gradient-to: rgb(15 23 42 / 0) var(--tw-gradient-to-position) !important; }
          body[data-ve-theme='dark'] .from-slate-50 { --tw-gradient-from: #111827 var(--tw-gradient-from-position) !important; --tw-gradient-to: rgb(17 24 39 / 0) var(--tw-gradient-to-position) !important; }
          body[data-ve-theme='dark'] .from-slate-100 { --tw-gradient-from: #1f2937 var(--tw-gradient-from-position) !important; --tw-gradient-to: rgb(31 41 55 / 0) var(--tw-gradient-to-position) !important; }
          body[data-ve-theme='dark'] .to-white { --tw-gradient-to: #0f172a var(--tw-gradient-to-position) !important; }
          body[data-ve-theme='dark'] .to-slate-50 { --tw-gradient-to: #111827 var(--tw-gradient-to-position) !important; }
          body[data-ve-theme='dark'] .to-slate-100 { --tw-gradient-to: #1f2937 var(--tw-gradient-to-position) !important; }
          body[data-ve-theme='dark'] .via-white { --tw-gradient-via: #0f172a var(--tw-gradient-via-position) !important; }
          body[data-ve-theme='dark'] .via-slate-50 { --tw-gradient-via: #111827 var(--tw-gradient-via-position) !important; }
          body[data-ve-theme='dark'] .bg-gradient-to-b,
          body[data-ve-theme='dark'] .bg-gradient-to-r,
          body[data-ve-theme='dark'] .bg-gradient-to-l,
          body[data-ve-theme='dark'] .bg-gradient-to-t,
          body[data-ve-theme='dark'] .bg-gradient-to-br,
          body[data-ve-theme='dark'] .bg-gradient-to-bl,
          body[data-ve-theme='dark'] .bg-gradient-to-tr,
          body[data-ve-theme='dark'] .bg-gradient-to-tl {
            background-image: none !important;
            background-color: #0f172a !important;
          }

          body[data-ve-theme='dark'] .text-slate-900 { color: #f8fafc !important; }
          body[data-ve-theme='dark'] .text-slate-800 { color: #e2e8f0 !important; }
          body[data-ve-theme='dark'] .text-slate-700 { color: #d1d5db !important; }
          body[data-ve-theme='dark'] .text-slate-600 { color: #cbd5e1 !important; }
          body[data-ve-theme='dark'] .text-slate-500 { color: #94a3b8 !important; }
          body[data-ve-theme='dark'] .text-slate-400 { color: #94a3b8 !important; }
          body[data-ve-theme='dark'] .text-sky-700 { color: #93c5fd !important; }
          body[data-ve-theme='dark'] .text-amber-800 { color: #fcd34d !important; }
          body[data-ve-theme='dark'] .text-amber-900 { color: #fde68a !important; }
          body[data-ve-theme='dark'] .text-green-500 { color: #4ade80 !important; }
          body[data-ve-theme='dark'] .text-blue-600 { color: #93c5fd !important; }
          body[data-ve-theme='dark'] .text-blue-700 { color: #bfdbfe !important; }
          body[data-ve-theme='dark'] .text-blue-900 { color: #e0f2fe !important; }
          body[data-ve-theme='dark'] :where(h1, h2, h3, h4, h5, h6, p, span, li, small, label) {
            color: #dbeafe;
          }
          body[data-ve-theme='dark'] :where(h1, h2, h3, h4, h5, h6) {
            color: #f8fafc;
          }

          body[data-ve-theme='dark'] .border-slate-200 { border-color: #334155 !important; }
          body[data-ve-theme='dark'] .border-slate-300 { border-color: #475569 !important; }
          body[data-ve-theme='dark'] .border-sky-200 { border-color: #1e40af !important; }
          body[data-ve-theme='dark'] .border-amber-200 { border-color: #92400e !important; }
          body[data-ve-theme='dark'] .border-blue-500 { border-color: #3b82f6 !important; }
          body[data-ve-theme='dark'] .border-blue-200 { border-color: #334155 !important; }
          body[data-ve-theme='dark'] .border-blue-300 { border-color: #475569 !important; }

          body[data-ve-theme='dark'] .from-purple-500 { --tw-gradient-from: #334155 var(--tw-gradient-from-position) !important; }
          body[data-ve-theme='dark'] .to-pink-500 { --tw-gradient-to: #1e293b var(--tw-gradient-to-position) !important; }

          body[data-ve-theme='dark'] input,
          body[data-ve-theme='dark'] textarea,
          body[data-ve-theme='dark'] select {
            background-color: #0f172a !important;
            color: #e2e8f0 !important;
            border-color: #475569 !important;
          }

          body[data-ve-theme='dark'] input::placeholder,
          body[data-ve-theme='dark'] textarea::placeholder {
            color: #94a3b8 !important;
            opacity: 1 !important;
          }

          body[data-ve-theme='dark'] .shadow-sm,
          body[data-ve-theme='dark'] .shadow,
          body[data-ve-theme='dark'] .shadow-lg { box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35) !important; }
        `
      : ''
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"><\/script>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: ${background};
            color: ${textColor};
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
          }
          ${themeOverrides}
        </style>
      </head>
      <body data-ve-theme="${theme}">
        <div id="root"></div>
        <script>
          (function () {
            function showRuntimeError(prefix, detail) {
              var message = prefix + ': ' + String(detail || 'Unknown error')
              document.body.innerHTML = '<pre style="margin:0;padding:20px;background:#fff7ed;color:#7c2d12;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;line-height:1.45">' + message.replace(/</g, '&lt;') + '</pre>'
            }

            window.addEventListener('error', function (event) {
              showRuntimeError('Preview runtime error', event && event.message)
            })

            window.addEventListener('unhandledrejection', function (event) {
              var reason = event && event.reason ? (event.reason.stack || event.reason.message || event.reason) : 'Unknown promise rejection'
              showRuntimeError('Preview module error', reason)
            })
          })()
        <\/script>
        <script type="module">${script}<\/script>
        <script>${inlineEditScript}<\/script>
      </body>
    </html>
  `
}

function buildErrorDocument(message: string) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: #fff7ed;
            color: #7c2d12;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            white-space: pre-wrap;
            line-height: 1.45;
          }
        </style>
      </head>
      <body>${message.replace(/</g, '&lt;')}</body>
    </html>
  `
}

function buildInlineEditScript() {
  return `
    (function() {
      let currentEditor = null;
      let highlightedElement = null;
      let inspectModeActive = false;

      window.parent.postMessage({ type: 've-init' }, '*');

      window.addEventListener('message', function(event) {
        if (event.data.type === 've-inspect-mode') {
          inspectModeActive = event.data.enabled;
          if (!inspectModeActive && highlightedElement) {
            highlightedElement.style.outline = '';
            highlightedElement = null;
          }
        }
      });

      function closeEditor() {
        if (currentEditor && currentEditor.container && currentEditor.container.parentElement) {
          currentEditor.container.remove();
        }
        currentEditor = null;
      }

      function getElementMetadata(element) {
        const tagName = element.tagName.toLowerCase();
        const className = element.getAttribute('class') || '';
        const text = element.textContent || '';
        const elementPath = getElementPath(element);
        const schemaId = element.getAttribute('data-schema-id') || '';
        const editableField = element.getAttribute('data-editable-field') || '';
        const itemId = element.getAttribute('data-item-id') || '';

        return {
          tagName: tagName,
          className: className,
          text: text,
          path: elementPath,
          schemaId: schemaId,
          editableField: editableField,
          itemId: itemId,
          attributes: {
            href: element.getAttribute('href'),
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            id: element.getAttribute('id'),
            title: element.getAttribute('title'),
          },
        };
      }

      function postSelectedElement(element) {
        const metadata = getElementMetadata(element);
        window.parent.postMessage({
          type: 've-element-selected',
          ...metadata,
        }, '*');
      }

      function getElementPath(element) {
        const path = [];
        let current = element;
        while (current && current.parentElement) {
          const classes = current.getAttribute('class') || '';
          const id = current.getAttribute('id') || '';
          let selector = current.tagName.toLowerCase();
          if (id) selector += '#' + id;
          if (classes) selector += '.' + classes.split(/\\s+/).join('.');
          path.unshift(selector);
          current = current.parentElement;
        }
        return path.join(' > ');
      }

      function highlightElement(element) {
        if (highlightedElement) {
          highlightedElement.style.outline = '';
          highlightedElement.style.opacity = '';
        }
        element.style.outline = '3px solid #3b82f6';
        element.style.outlineOffset = '2px';
        highlightedElement = element;
      }

      function findEditableTarget(target) {
        if (!target || !target.closest) {
          return null;
        }
        const schemaTarget = target.closest('[data-schema-id][data-editable-field]');
        if (schemaTarget) {
          return schemaTarget;
        }

        const fallback = target.closest('h1, h2, h3, h4, h5, h6, p, span, li, a, button, label, small, strong, em, blockquote');
        if (!fallback) {
          return null;
        }
        const hasDirectText = Array.from(fallback.childNodes || []).some(function(node) {
          return node.nodeType === Node.TEXT_NODE && String(node.textContent || '').trim().length > 0;
        });
        return hasDirectText ? fallback : null;
      }

      function buildEditorForElement(element) {
        const metadata = getElementMetadata(element);
        const editableField = metadata.editableField || '';
        const isImageLike = editableField === 'image' || editableField === 'src' || metadata.tagName === 'img';
        const initialValue = isImageLike
          ? (element.getAttribute('src') || metadata.attributes.src || '')
          : metadata.text;
        const isDarkTheme = document.body.getAttribute('data-ve-theme') === 'dark';

        const rect = element.getBoundingClientRect();
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.zIndex = '2147483647';
        container.style.left = Math.max(8, rect.left) + 'px';
        container.style.top = Math.max(8, rect.bottom + 8) + 'px';
        container.style.width = Math.min(460, Math.max(220, rect.width)) + 'px';
        container.style.maxWidth = 'min(460px, calc(100vw - 16px))';
        container.style.maxHeight = 'calc(100vh - 16px)';
        container.style.overflow = 'auto';
        container.style.background = isDarkTheme ? '#0f172a' : '#ffffff';
        container.style.border = isDarkTheme ? '1px solid #475569' : '1px solid #cbd5e1';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.15)';
        container.style.padding = '10px';

        const label = document.createElement('div');
        label.textContent = metadata.tagName + ' · ' + editableField;
        label.style.fontSize = '11px';
        label.style.fontWeight = '700';
        label.style.color = isDarkTheme ? '#cbd5e1' : '#334155';
        label.style.marginBottom = '8px';

        const input = isImageLike ? document.createElement('input') : document.createElement('textarea');
        input.value = initialValue || '';
        input.style.width = '100%';
        input.style.border = isDarkTheme ? '1px solid #475569' : '1px solid #cbd5e1';
        input.style.borderRadius = '8px';
        input.style.padding = '8px';
        input.style.fontSize = '13px';
        input.style.outline = 'none';
        input.style.background = isDarkTheme ? '#020617' : '#ffffff';
        input.style.color = isDarkTheme ? '#e2e8f0' : '#0f172a';
        input.style.caretColor = isDarkTheme ? '#e2e8f0' : '#0f172a';
        if (!isImageLike) {
          input.rows = 3;
          input.style.resize = 'vertical';
        }

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '8px';
        actions.style.justifyContent = 'flex-end';
        actions.style.marginTop = '8px';

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.textContent = 'Cancel';
        cancelButton.style.border = isDarkTheme ? '1px solid #475569' : '1px solid #cbd5e1';
        cancelButton.style.background = isDarkTheme ? '#1e293b' : '#f8fafc';
        cancelButton.style.color = isDarkTheme ? '#e2e8f0' : '#334155';
        cancelButton.style.borderRadius = '8px';
        cancelButton.style.padding = '6px 10px';
        cancelButton.style.fontSize = '12px';
        cancelButton.style.fontWeight = '600';
        cancelButton.style.cursor = 'pointer';

        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.textContent = 'Save';
        saveButton.style.border = '1px solid #1d4ed8';
        saveButton.style.background = '#2563eb';
        saveButton.style.color = '#fff';
        saveButton.style.borderRadius = '8px';
        saveButton.style.padding = '6px 10px';
        saveButton.style.fontSize = '12px';
        saveButton.style.fontWeight = '700';
        saveButton.style.cursor = 'pointer';

        function commit() {
          const nextValue = input.value;
          const previousValue = metadata.text;
          if (isImageLike) {
            element.setAttribute('src', nextValue);
          } else {
            element.textContent = nextValue;
          }

          if (metadata.schemaId) {
            window.parent.postMessage({
              type: 've-mutation',
              schemaId: metadata.schemaId,
              editableField: metadata.editableField,
              itemId: metadata.itemId,
              value: nextValue,
            }, '*');
          } else if (!isImageLike) {
            window.parent.postMessage({
              type: 've-text-replace',
              oldText: previousValue,
              value: nextValue,
            }, '*');
          }
          closeEditor();
        }

        saveButton.addEventListener('click', function(event) {
          event.stopPropagation();
          commit();
        });

        cancelButton.addEventListener('click', function(event) {
          event.stopPropagation();
          closeEditor();
        });

        input.addEventListener('keydown', function(event) {
          if (event.key === 'Escape') {
            event.preventDefault();
            closeEditor();
          }
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            commit();
          }
        });

        actions.appendChild(cancelButton);
        actions.appendChild(saveButton);
        container.appendChild(label);
        container.appendChild(input);
        container.appendChild(actions);
        document.body.appendChild(container);

        // Clamp editor inside viewport and flip above target if bottom space is limited.
        const editorRect = container.getBoundingClientRect();
        const margin = 8;
        let left = rect.left;
        let top = rect.bottom + 8;

        if (left + editorRect.width > window.innerWidth - margin) {
          left = window.innerWidth - editorRect.width - margin;
        }
        if (left < margin) {
          left = margin;
        }

        if (top + editorRect.height > window.innerHeight - margin) {
          const aboveTop = rect.top - editorRect.height - 8;
          top = aboveTop >= margin ? aboveTop : window.innerHeight - editorRect.height - margin;
        }
        if (top < margin) {
          top = margin;
        }

        container.style.left = left + 'px';
        container.style.top = top + 'px';

        input.focus();
        if (input.select) {
          input.select();
        }

        currentEditor = {
          container: container,
        };
      }

      function refreshEditableHints() {
        const editable = document.querySelectorAll('[data-schema-id][data-editable-field]');
        editable.forEach(function(node) {
          node.style.cursor = 'pointer';
          if (!node.getAttribute('title')) {
            node.setAttribute('title', 'Click to edit');
          }
        });

        const fallbackCandidates = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, a, button, label, small, strong, em, blockquote');
        fallbackCandidates.forEach(function(node) {
          if (node.hasAttribute('data-schema-id')) {
            return;
          }
          const hasDirectText = Array.from(node.childNodes || []).some(function(child) {
            return child.nodeType === Node.TEXT_NODE && String(child.textContent || '').trim().length > 0;
          });
          if (!hasDirectText) {
            return;
          }
          node.style.cursor = 'pointer';
          if (!node.getAttribute('title')) {
            node.setAttribute('title', 'Click to edit');
          }
        });
      }

      document.addEventListener('click', function(event) {
        if (currentEditor && currentEditor.container && currentEditor.container.contains(event.target)) {
          return;
        }

        if (currentEditor) {
          closeEditor();
        }

        const editableTarget = findEditableTarget(event.target);
        if (editableTarget) {
          event.stopPropagation();
          event.preventDefault();
          highlightElement(editableTarget);
          postSelectedElement(editableTarget);
          closeEditor();
          buildEditorForElement(editableTarget);
          return false;
        }

        if (!inspectModeActive) {
          return;
        }
        event.stopPropagation();
        event.preventDefault();
        highlightElement(event.target);
        postSelectedElement(event.target);
        return false;
      }, true);

      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && highlightedElement) {
          highlightedElement.style.outline = '';
          highlightedElement.style.opacity = '';
          highlightedElement = null;
        }
      });

      refreshEditableHints();
      setTimeout(refreshEditableHints, 50);
      setTimeout(refreshEditableHints, 300);
    })();
  `
}

function pickInitialComponent(files: string[]): string {
  if (!files.length) {
    return ''
  }
  const preferred = files.find((file) => file === 'ProjectClassic/FullPage.tsx')
  if (preferred) {
    return preferred
  }
  const anyFullPage = files.find((file) => file.endsWith('/FullPage.tsx'))
  if (anyFullPage) {
    return anyFullPage
  }
  return files[0]
}

function App() {
  const [components, setComponents] = useState<string[]>([])
  const [root, setRoot] = useState('src/playground')
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [source, setSource] = useState('')
  const [nodes, setNodes] = useState<EditorNode[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string>('')
  const [classDraft, setClassDraft] = useState('')
  const [previewScript, setPreviewScript] = useState('')
  const [schema, setSchema] = useState<EditorSchema | null>(null)
  const [status, setStatus] = useState('Loading components...')
  const [selectedElement, setSelectedElement] = useState<{
    path: string
    tagName: string
    className: string
    text?: string
    schemaId?: string
    editableField?: string
    itemId?: string
    attributes?: Record<string, string>
  } | null>(null)
  const [elementTextDraft, setElementTextDraft] = useState('')
  const [elementClassDraft, setElementClassDraft] = useState('')
  const [elementAttrDrafts, setElementAttrDrafts] = useState<Record<string, string>>({})
  const [inspectMode, setInspectMode] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    async function loadComponents() {
      const response = await fetch(getApiUrl('/api/components'))
      const payload: ComponentsResponse = await response.json()
      setRoot(payload.root)
      setComponents(payload.files)
      setSelectedFile(pickInitialComponent(payload.files))
      setStatus('Ready')
    }

    loadComponents().catch((error: unknown) => {
      setStatus(`Failed to load components: ${String(error)}`)
    })
  }, [])

  useEffect(() => {
    if (!selectedFile) {
      return
    }

    async function loadSelectedFile(): Promise<boolean> {
      const sourceResponse = await fetch(getApiUrl(`/api/source?file=${encodeURIComponent(selectedFile)}`))
      const sourcePayload = await sourceResponse.json()
      const nextSource = String(sourcePayload.source ?? '')
      const extractedNodes = collectNodesSafe(nextSource)

      setSource(nextSource)
      setNodes(extractedNodes)
      setSelectedNodeId(extractedNodes[0]?.id ?? '')
      setClassDraft(extractedNodes[0]?.className ?? '')

      const schemaResponse = await fetch(getApiUrl(`/api/schema?file=${encodeURIComponent(selectedFile)}`))
      if (schemaResponse.ok) {
        const schemaPayload = await schemaResponse.json()
        setSchema(schemaPayload.schema as EditorSchema)
      } else {
        setSchema(null)
      }

      const previewResponse = await fetch(getApiUrl(`/api/preview?file=${encodeURIComponent(selectedFile)}`))
      let previewPayload: any = {}
      try {
        previewPayload = await previewResponse.json()
      } catch {
        previewPayload = {}
      }
      if (!previewResponse.ok) {
        const message = String(previewPayload.error ?? previewPayload.message ?? 'Preview compilation failed.')
        setPreviewScript('')
        setStatus(`Preview error: ${message}`)
        return false
      }

      setPreviewScript(String(previewPayload.script ?? ''))
      return true
    }

    setStatus(`Loading ${selectedFile}...`)
    loadSelectedFile()
      .then((ok) => {
        if (ok) {
          setStatus('Ready')
        }
      })
      .catch((error: unknown) => {
        setStatus(`Failed to load file: ${String(error)}`)
      })
  }, [selectedFile, components])

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId],
  )

  const matchedNode = useMemo(() => {
    if (!selectedElement) {
      return null
    }
    const exact = nodes.find(
      (node) =>
        node.tagName.toLowerCase() === selectedElement.tagName.toLowerCase() &&
        node.className.trim() === (selectedElement.className || '').trim(),
    )
    if (exact) {
      return exact
    }
    return nodes.find((node) => node.tagName.toLowerCase() === selectedElement.tagName.toLowerCase()) || null
  }, [nodes, selectedElement])

  useEffect(() => {
    if (!selectedElement) {
      setElementTextDraft('')
      setElementClassDraft('')
      setElementAttrDrafts({})
      return
    }
    setElementTextDraft(selectedElement.text || '')
    setElementClassDraft(selectedElement.className || '')
    setElementAttrDrafts({ ...(selectedElement.attributes || {}) })
  }, [selectedElement])

  useEffect(() => {
    if (matchedNode) {
      setSelectedNodeId(matchedNode.id)
      setClassDraft(matchedNode.className)
    }
  }, [matchedNode])

  useEffect(() => {
    setClassDraft(selectedNode?.className ?? '')
  }, [selectedNode?.className])

  async function applyClassChange(nextClassName: string) {
    if (!selectedFile || !selectedNodeId) {
      return
    }

    try {
      const updatedSource = replaceNodeClassName(source, selectedNodeId, nextClassName)

      await fetch(getApiUrl('/api/source'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: selectedFile, source: updatedSource }),
      })

      const nextNodes = collectNodesSafe(updatedSource)
      setSource(updatedSource)
      setNodes(nextNodes)
      setClassDraft(nextClassName)

      const previewResponse = await fetch(getApiUrl(`/api/preview?file=${encodeURIComponent(selectedFile)}`))
      const previewPayload = await previewResponse.json()
      if (!previewResponse.ok) {
        const message = String(previewPayload.error ?? previewPayload.message ?? 'Preview compilation failed.')
        setPreviewScript('')
        setStatus(`Preview error: ${message}`)
        return
      }

      setPreviewScript(String(previewPayload.script ?? ''))

      setStatus('Saved changes to source')
    } catch (error) {
      setStatus(`Failed to apply class changes: ${String(error)}`)
    }
  }

  function toggleUtility(token: string) {
    const currentTokens = classDraft.split(/\s+/).filter(Boolean)
    const exists = currentTokens.includes(token)
    const nextTokens = exists
      ? currentTokens.filter((currentToken) => currentToken !== token)
      : [...currentTokens, token]

    const nextClassName = nextTokens.join(' ')
    setClassDraft(nextClassName)
    void applyClassChange(nextClassName)
  }

  async function applySchemaMutation(payload: {
    controlId: string
    action: 'set' | 'add-item' | 'remove-item' | 'set-item-field'
    value?: string
    itemId?: string
    field?: string
  }) {
    if (!selectedFile) {
      return
    }

    try {
      const response = await fetch(getApiUrl('/api/mutate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: selectedFile, ...payload }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(String(result.error ?? result.message ?? 'Unknown mutation error'))
      }

      const updatedSource = String(result.source ?? '')
      setSource(updatedSource)
      setNodes(collectNodesSafe(updatedSource))
      setSchema(result.schema as EditorSchema)

      const previewResponse = await fetch(getApiUrl(`/api/preview?file=${encodeURIComponent(selectedFile)}`))
      const previewPayload = await previewResponse.json()
      if (!previewResponse.ok) {
        const message = String(previewPayload.error ?? previewPayload.message ?? 'Preview compilation failed.')
        setPreviewScript('')
        setStatus(`Preview error: ${message}`)
        return
      }

      setPreviewScript(String(previewPayload.script ?? ''))
      setStatus('Saved schema mutation to source')
    } catch (error) {
      setStatus(`Failed to apply schema mutation: ${String(error)}`)
    }
  }

  function normalizeItemId(rawItemId: string): string {
    return rawItemId.replace(/^card-/, '').replace(/-(title|description|image|icon|text)$/, '')
  }

  async function applyElementTextChange() {
    if (!selectedElement?.schemaId) {
      setStatus('Text edit requires a schema-linked element. Use auto-discovered text or schema fields.')
      return
    }

    if (selectedElement.itemId && selectedElement.editableField) {
      await applySchemaMutation({
        controlId: selectedElement.schemaId,
        action: 'set-item-field',
        itemId: normalizeItemId(selectedElement.itemId),
        field: selectedElement.editableField,
        value: elementTextDraft,
      })
      return
    }

    await applySchemaMutation({
      controlId: selectedElement.schemaId,
      action: 'set',
      value: elementTextDraft,
    })
  }

  async function applyElementClassChange(nextClassName: string) {
    setElementClassDraft(nextClassName)
    if (!matchedNode) {
      setStatus('Could not map selected element to JSX node for class edit.')
      return
    }

    setSelectedNodeId(matchedNode.id)
    setClassDraft(nextClassName)
    await applyClassChange(nextClassName)
    setSelectedElement((current) => (current ? { ...current, className: nextClassName } : current))
  }

  async function applyElementAttributeChange(key: string) {
    const value = elementAttrDrafts[key] || ''
    setSelectedElement((current) => {
      if (!current) {
        return current
      }
      return {
        ...current,
        attributes: {
          ...(current.attributes || {}),
          [key]: value,
        },
      }
    })

    // Attribute persistence is currently supported through schema-linked value fields.
    if (selectedElement?.schemaId && selectedElement?.editableField) {
      if (selectedElement.itemId) {
        await applySchemaMutation({
          controlId: selectedElement.schemaId,
          action: 'set-item-field',
          itemId: normalizeItemId(selectedElement.itemId),
          field: selectedElement.editableField,
          value,
        })
      } else {
        await applySchemaMutation({
          controlId: selectedElement.schemaId,
          action: 'set',
          value,
        })
      }
      return
    }

    setStatus(`Updated ${key} in inspector. Persisted save is available for schema-linked attributes.`)
  }

  async function toggleElementColorToken(prefix: 'bg-' | 'text-' | 'border-', token: string) {
    const tokens = elementClassDraft.split(/\s+/).filter(Boolean)
    const filtered = tokens.filter((currentToken) => !currentToken.startsWith(prefix))
    const next = [...filtered, token].join(' ')
    await applyElementClassChange(next)
  }

  async function applyLooseTextReplacement(oldText: string, nextText: string) {
    if (!selectedFile) {
      return
    }

    const oldValue = String(oldText || '')
    const newValue = String(nextText || '')
    if (!oldValue.trim()) {
      setStatus('Could not persist text change: original text was empty.')
      return
    }

    const escaped = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matches = source.match(new RegExp(escaped, 'g')) || []
    if (matches.length !== 1) {
      setStatus('Could not persist text change: text is not unique in source. Add schema binding for this field.')
      return
    }

    const updatedSource = source.replace(oldValue, newValue)

    try {
      await fetch(getApiUrl('/api/source'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: selectedFile, source: updatedSource }),
      })

      const nextNodes = collectNodesSafe(updatedSource)
      setSource(updatedSource)
      setNodes(nextNodes)

      const previewResponse = await fetch(getApiUrl(`/api/preview?file=${encodeURIComponent(selectedFile)}`))
      const previewPayload = await previewResponse.json()
      if (!previewResponse.ok) {
        const message = String(previewPayload.error ?? previewPayload.message ?? 'Preview compilation failed.')
        setPreviewScript('')
        setStatus(`Preview error: ${message}`)
        return
      }

      setPreviewScript(String(previewPayload.script ?? ''))
      setStatus('Saved text directly to source')
    } catch (error) {
      setStatus(`Failed to persist text edit: ${String(error)}`)
    }
  }

  useEffect(() => {
    function handleIframeMessage(event: MessageEvent) {
      if (event.data.type === 've-element-selected') {
        setSelectedElement(event.data)
        return
      }

      if (event.data.type === 've-init') {
        // Iframe is ready, send inspect mode state
        const iframeElement = iframeRef.current
        if (iframeElement && iframeElement.contentWindow) {
          iframeElement.contentWindow.postMessage(
            { type: 've-inspect-mode', enabled: inspectMode },
            '*'
          )
        }
        return
      }

      if (event.data.type !== 've-mutation') {
        if (event.data.type === 've-text-replace') {
          void applyLooseTextReplacement(String(event.data.oldText || ''), String(event.data.value || ''))
        }
        return
      }

      const { schemaId, editableField, itemId, value } = event.data

      const control = schema?.controls.find((c) => c.id === schemaId)
      if (!control) {
        return
      }

      if (itemId) {
        void applySchemaMutation({
          controlId: schemaId,
          action: 'set-item-field',
          itemId: itemId.replace(/^card-/, '').replace(/-(title|description|image)$/, ''),
          field: editableField,
          value: String(value || ''),
        })
      } else {
        void applySchemaMutation({
          controlId: schemaId,
          action: 'set',
          value: String(value || ''),
        })
      }
    }

    window.addEventListener('message', handleIframeMessage)
    return () => window.removeEventListener('message', handleIframeMessage)
  }, [schema, selectedFile, inspectMode, source])

  useEffect(() => {
    const iframeElement = iframeRef.current
    if (iframeElement && iframeElement.contentWindow) {
      iframeElement.contentWindow.postMessage(
        { type: 've-inspect-mode', enabled: inspectMode },
        '*'
      )
    }
  }, [inspectMode])

  const isDark = theme === 'dark'
  const groupedComponents = useMemo(() => {
    const groups = new Map<string, string[]>()
    for (const file of components) {
      const [groupName, ...rest] = file.split('/')
      const key = rest.length ? groupName : 'Other'
      const label = rest.length ? rest.join('/') : file
      const existing = groups.get(key) || []
      existing.push(label)
      groups.set(key, existing)
    }
    return Array.from(groups.entries())
      .map(([name, files]) => ({
        name,
        files: files.sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [components])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <header className={`border-b px-6 py-4 flex items-start justify-between ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Local Visual Editor</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">React + Tailwind, code as source of truth</h1>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            Editable root: <strong>{root}</strong> · {status}
          </p>
          <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Configure with <code className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} px-1 py-0.5 rounded`}>VE_PROJECT_ROOT</code> environment variable</p>
        </div>
        <div className="ml-4 flex items-center gap-2">
          <button
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
              theme === 'dark'
                ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => setInspectMode(!inspectMode)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
              inspectMode
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : theme === 'dark'
                  ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {inspectMode ? '✓ Inspect On' : 'Inspect Off'}
          </button>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-108px)] grid-cols-1 gap-4 p-4 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
        <aside className={`rounded-2xl border p-4 shadow-sm overflow-y-auto ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className={`border-b pb-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <h3 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>Getting Started</h3>
            <div className={`space-y-3 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <div>
                <p className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>1. Select a Component</p>
                <p>Click any component above to load it. The live preview will appear in the center panel.</p>
              </div>
              <div>
                <p className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>2. Edit in Preview</p>
                <p>Click on any text or image in the preview to edit it directly. A popup editor will appear.</p>
              </div>
              <div>
                <p className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>3. Manage Classes</p>
                <p>Use the right panel to select elements, edit classNames, and toggle utility classes.</p>
              </div>
              <div>
                <p className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>4. Schema Controls</p>
                <p>Use the Schema Editor section to add/edit repeater items, change text, and manage layout.</p>
              </div>
              <div className={`pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>All changes are saved directly to the source code.</p>
              </div>
            </div>
          </div>

          <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>Components</h2>
          <div className="space-y-2">
            {groupedComponents.map((group) => (
              <div key={group.name} className="space-y-2">
                <p className={`px-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {group.name}
                </p>
                {group.files.map((label) => {
                  const fullPath = group.name === 'Other' ? label : `${group.name}/${label}`
                  return (
                    <button
                      key={fullPath}
                      type="button"
                      onClick={() => setSelectedFile(fullPath)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        selectedFile === fullPath
                          ? isDark
                            ? 'border-blue-500 bg-blue-600 text-white'
                            : 'border-slate-900 bg-slate-900 text-white'
                          : isDark
                            ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </aside>

        <section className={`rounded-2xl border p-3 shadow-sm ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <p className={`mb-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Live preview for {selectedFile || 'none selected'}</p>
          <iframe
            ref={iframeRef}
            title="Component preview"
            className={`h-[72vh] w-full rounded-xl border ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200'}`}
            srcDoc={
              previewScript
                ? buildPreviewDocument(previewScript, theme)
                : buildErrorDocument('Preview is unavailable. Check the status message for details.')
            }
          />
        </section>

        <aside className={`rounded-2xl border p-4 shadow-sm ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>Class Inspector</h2>

          <div className="mt-3 space-y-2">
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left ${
                  selectedNodeId === node.id
                    ? isDark
                      ? 'border-blue-500 bg-slate-800'
                      : 'border-sky-500 bg-sky-50'
                    : isDark
                      ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{node.tagName}</p>
                <p className={`mt-1 truncate text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{node.className || '(empty className)'}</p>
              </button>
            ))}
          </div>

          <div className={`mt-5 border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <label className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-500'}`} htmlFor="className-input">
              className
            </label>
            <textarea
              id="className-input"
              value={classDraft}
              onChange={(event) => setClassDraft(event.target.value)}
              onBlur={() => void applyClassChange(classDraft)}
              rows={4}
              className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none ring-sky-500 focus:ring ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-900'}`}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {utilityPalette.map((utility) => {
                const active = classDraft.split(/\s+/).includes(utility)
                return (
                  <button
                    key={utility}
                    type="button"
                    onClick={() => toggleUtility(utility)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? isDark
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-slate-900 bg-slate-900 text-white'
                        : isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {utility}
                  </button>
                )
              })}
            </div>
          </div>

          <div className={`mt-6 border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            {selectedElement && (
              <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-900">Element Inspector</h3>
                  <button
                    onClick={() => setSelectedElement(null)}
                    className="text-blue-600 hover:text-blue-900 text-xs font-semibold"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Element</p>
                    <p className="text-blue-700">&lt;{selectedElement.tagName}&gt;</p>
                  </div>

                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Text</p>
                    <textarea
                      value={elementTextDraft}
                      onChange={(event) => setElementTextDraft(event.target.value)}
                      rows={3}
                      className="w-full rounded border border-blue-200 bg-white p-2 text-xs text-blue-800"
                    />
                    <button
                      type="button"
                      onClick={() => void applyElementTextChange()}
                      className="mt-2 rounded border border-blue-300 bg-white px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Apply Text
                    </button>
                  </div>

                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Classes</p>
                    <textarea
                      value={elementClassDraft}
                      onChange={(event) => setElementClassDraft(event.target.value)}
                      rows={3}
                      className="w-full rounded border border-blue-200 bg-white p-2 text-xs font-mono text-blue-800"
                    />
                    <button
                      type="button"
                      onClick={() => void applyElementClassChange(elementClassDraft)}
                      className="mt-2 rounded border border-blue-300 bg-white px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Apply Classes
                    </button>
                  </div>

                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Quick Colors</p>
                    <div className="flex flex-wrap gap-1">
                      {['bg-white', 'bg-slate-50', 'bg-slate-900'].map((token) => (
                        <button
                          key={token}
                          type="button"
                          onClick={() => void toggleElementColorToken('bg-', token)}
                          className="rounded border border-blue-200 bg-white px-2 py-1 text-[10px] font-semibold text-blue-700"
                        >
                          {token}
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {['text-slate-900', 'text-slate-600', 'text-white'].map((token) => (
                        <button
                          key={token}
                          type="button"
                          onClick={() => void toggleElementColorToken('text-', token)}
                          className="rounded border border-blue-200 bg-white px-2 py-1 text-[10px] font-semibold text-blue-700"
                        >
                          {token}
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {['border-slate-200', 'border-slate-400', 'border-white'].map((token) => (
                        <button
                          key={token}
                          type="button"
                          onClick={() => void toggleElementColorToken('border-', token)}
                          className="rounded border border-blue-200 bg-white px-2 py-1 text-[10px] font-semibold text-blue-700"
                        >
                          {token}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Attributes</p>
                    <div className="space-y-2">
                      {['href', 'src', 'alt', 'title', 'id'].map((key) => (
                        <div key={key}>
                          <label className="block text-[10px] font-semibold uppercase tracking-wide text-blue-700">{key}</label>
                          <input
                            value={elementAttrDrafts[key] || ''}
                            onChange={(event) =>
                              setElementAttrDrafts((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                            onBlur={() => void applyElementAttributeChange(key)}
                            className="mt-1 w-full rounded border border-blue-200 bg-white px-2 py-1 text-xs text-blue-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {!selectedElement.schemaId && (
                    <p className="text-blue-600 italic">
                      Text/attribute persistence requires schema-linked or auto-discovered editable elements.
                    </p>
                  )}

                  <p className="text-blue-600 italic">Click an element in the preview while Inspect mode is on.</p>
                </div>
              </div>
            )}

            <h3 className={`text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>Schema Editor</h3>
            {!schema && <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No schema file found for this component.</p>}

            {schema && (
              <div className="mt-3 space-y-4">
                {(schema as any).isAutoGenerated && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <p className="text-xs font-semibold text-blue-900">🤖 Auto-discovered controls</p>
                    <p className="text-xs text-blue-700 mt-1">No .schema.json found. All text elements are editable.</p>
                  </div>
                )}
                {schema.controls.map((control) => (
                  <div key={control.id} className={`rounded-lg border p-3 ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{control.label}</p>

                    {(control.type === 'text' || control.type === 'image') && (
                      <input
                        type="text"
                        value={control.value || ''}
                        onChange={(event) =>
                          setSchema((current) =>
                            current
                              ? {
                                  ...current,
                                  controls: current.controls.map((currentControl) =>
                                    currentControl.id === control.id
                                      ? { ...currentControl, value: event.target.value }
                                      : currentControl,
                                  ),
                                }
                              : current,
                          )
                        }
                        onBlur={(event) =>
                          void applySchemaMutation({
                            controlId: control.id,
                            action: 'set',
                            value: event.target.value,
                          })
                        }
                        className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white'}`}
                      />
                    )}

                    {control.type === 'layout' && (
                      <select
                        value={control.value || ''}
                        onChange={(event) =>
                          void applySchemaMutation({
                            controlId: control.id,
                            action: 'set',
                            value: event.target.value,
                          })
                        }
                        className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white'}`}
                      >
                        {(control.options || []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {control.type === 'repeater' && (
                      <div className="mt-2 space-y-3">
                        {(control.items || []).map((item) => (
                          <div key={item.id} className={`rounded-md border p-2 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex items-center justify-between">
                              <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.id}</p>
                              <button
                                type="button"
                                className="rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700"
                                onClick={() =>
                                  void applySchemaMutation({
                                    controlId: control.id,
                                    action: 'remove-item',
                                    itemId: item.id,
                                  })
                                }
                              >
                                Remove
                              </button>
                            </div>

                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(event) =>
                                void applySchemaMutation({
                                  controlId: control.id,
                                  action: 'set-item-field',
                                  itemId: item.id,
                                  field: 'title',
                                  value: event.target.value,
                                })
                              }
                              className={`mt-2 w-full rounded border px-2 py-1 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white'}`}
                              placeholder="Card title"
                            />

                            <input
                              type="text"
                              value={item.image || ''}
                              onChange={(event) =>
                                void applySchemaMutation({
                                  controlId: control.id,
                                  action: 'set-item-field',
                                  itemId: item.id,
                                  field: 'image',
                                  value: event.target.value,
                                })
                              }
                              className={`mt-2 w-full rounded border px-2 py-1 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white'}`}
                              placeholder="Image URL"
                            />

                            <textarea
                              value={item.description || ''}
                              onChange={(event) =>
                                void applySchemaMutation({
                                  controlId: control.id,
                                  action: 'set-item-field',
                                  itemId: item.id,
                                  field: 'description',
                                  value: event.target.value,
                                })
                              }
                              rows={2}
                              className={`mt-2 w-full rounded border px-2 py-1 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white'}`}
                              placeholder="Description"
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-700'}`}
                          onClick={() =>
                            void applySchemaMutation({
                              controlId: control.id,
                              action: 'add-item',
                            })
                          }
                        >
                          Add Card
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
