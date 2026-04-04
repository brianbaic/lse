export type DefaultPropBinding = {
  kind: 'defaultProp'
  prop: string
}

export type ArrayItemPropertyBinding = {
  kind: 'arrayItemProperty'
  array: string
  matchKey: string
  matchValue: string
  property: string
}

export type ArrayBinding = {
  kind: 'array'
  array: string
  idKey?: string
  template: Record<string, string>
}

export type ClassTokenBinding = {
  kind: 'classToken'
  veId: string
  tokenPrefix: string
  fallbackToken?: string
}

export type TextControl = {
  id: string
  type: 'text'
  label: string
  binding: DefaultPropBinding | ArrayItemPropertyBinding
}

export type ImageControl = {
  id: string
  type: 'image'
  label: string
  binding: DefaultPropBinding | ArrayItemPropertyBinding
}

export type RepeaterControl = {
  id: string
  type: 'repeater'
  label: string
  binding: ArrayBinding
}

export type LayoutControl = {
  id: string
  type: 'layout'
  label: string
  binding: ClassTokenBinding
  options: Array<{ label: string; value: string }>
}

export type SchemaControl = TextControl | ImageControl | RepeaterControl | LayoutControl

export type EditorSchema = {
  version: number
  component: string
  controls: SchemaControl[]
}
