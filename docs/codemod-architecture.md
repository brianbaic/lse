# Codemod Architecture

This editor writes source code through AST transforms, not text regex replacements.

## Pipeline

1. Read source from disk.
2. Parse with `@babel/parser` using `typescript` + `jsx` plugins.
3. Resolve schema control bindings to current values.
4. Apply a mutation for one control action.
5. Generate code with `@babel/generator`.
6. Persist file.
7. Re-resolve schema values and refresh preview bundle.

## Supported mutation actions

- `set`: update scalar values (text/image/layout token).
- `add-item`: append repeater item from schema template.
- `remove-item`: remove repeater item by id.
- `set-item-field`: mutate one field in one repeater item.

## Binding strategies

- `defaultProp`:
  - Target: function parameter object pattern defaults.
  - Example: `title = "..."`.

- `arrayItemProperty`:
  - Target: named `const` array of object literals.
  - Match item by `matchKey` + `matchValue`, then mutate `property`.

- `array` (repeater):
  - Target: named `const` array of object literals.
  - Add/remove/update item objects.

- `classToken` (layout):
  - Target: JSX opening element with `data-ve-id="..."`.
  - Mutate only one utility token prefix (e.g. `md:grid-cols-`, `gap-`).

## Guardrails

- File access is constrained to `src/playground`.
- Mutations fail fast if AST target is not found.
- Unsupported structures remain read-only instead of guessed.
