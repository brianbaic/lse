# Schema Spec (v1)

This project uses sidecar schema files to declare editable controls per component.

## File naming

- Component file: `src/playground/HeroCard.tsx`
- Schema file: `src/playground/HeroCard.schema.json`

## Top-level shape

```json
{
  "version": 1,
  "component": "HeroCard",
  "controls": []
}
```

## Control types

### Text/Image control

```json
{
  "id": "title",
  "type": "text",
  "label": "Headline",
  "binding": {
    "kind": "defaultProp",
    "prop": "title"
  }
}
```

Supported bindings:
- `defaultProp`: edits default values in function parameter object patterns.
- `arrayItemProperty`: edits one property in one object inside a named array.

### Repeater control

```json
{
  "id": "cards",
  "type": "repeater",
  "label": "Feature Cards",
  "binding": {
    "kind": "array",
    "array": "cards",
    "idKey": "id",
    "template": {
      "id": "new-card",
      "title": "New Card",
      "description": "Describe value",
      "image": "https://..."
    }
  }
}
```

### Layout control

```json
{
  "id": "cardColumns",
  "type": "layout",
  "label": "Card Columns",
  "binding": {
    "kind": "classToken",
    "veId": "cards-grid",
    "tokenPrefix": "md:grid-cols-",
    "fallbackToken": "md:grid-cols-3"
  },
  "options": [
    { "label": "1", "value": "1" },
    { "label": "2", "value": "2" }
  ]
}
```

`classToken` requires a static string `className` on a JSX element marked with `data-ve-id`.

## Runtime-resolved fields

The server resolves current values and augments controls with:
- `value` for text/image/layout controls
- `items` for repeater controls
