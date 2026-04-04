# CSS Variable Theming

## Summary

Replace the `theme` prop and `BoardTheme` type with a pure CSS custom property
theming system. All visual styling is driven by `--board-*` CSS variables set on
the component root with sensible defaults. Consumers override them from CSS — no
JS prop needed.

## Motivation

- single theming mechanism (CSS) instead of two (JS prop + CSS variables)
- consumers can theme the board from a stylesheet, a parent class, or a
  CSS-in-JS solution without touching component props
- prepares for the coordinate label fix which needs two coordinate colors (one
  per square shade)

## Breaking changes

- remove `theme` prop from `BoardProps`
- remove `BoardTheme` type from public exports
- remove `DEFAULT_THEME` constant and JS merge logic
- replace single `coordinate` field with two CSS variables

## CSS variables

Set on the component root element. Consumer definitions on a parent element
override them via CSS inheritance.

| Variable                      | Default                  | Purpose                          |
| ----------------------------- | ------------------------ | -------------------------------- |
| `--board-border`              | `transparent`            | board border color               |
| `--board-dark-square`         | `#779952`                | dark square background           |
| `--board-light-square`        | `#edeed1`                | light square background          |
| `--board-highlight`           | `rgba(255, 255, 0, 0.4)` | highlight overlay color          |
| `--board-legal-dot`           | `rgba(0, 0, 0, 0.2)`     | legal move dot color             |
| `--board-coordinate-on-light` | `#779952`                | coordinate text on light squares |
| `--board-coordinate-on-dark`  | `#edeed1`                | coordinate text on dark squares  |

Coordinate defaults use the opposite square color (Lichess/chess.com pattern).

## Consumer usage

```css
.my-board {
  --board-dark-square: #b58863;
  --board-light-square: #f0d9b5;
  --board-coordinate-on-light: #b58863;
  --board-coordinate-on-dark: #f0d9b5;
}
```

```jsx
<div className="my-board">
  <Board position={fen} />
</div>
```

## Implementation approach

### Component root

Defaults live at the point of consumption using `var()` fallbacks. The component
does NOT set the variables on its root — it only reads them. This way a parent
definition always wins without specificity concerns:

```tsx
// square background
background: 'var(--board-dark-square, #779952)';

// coordinate color
color: 'var(--board-coordinate-on-light, #779952)';
```

No variable assignment on the root element. The fallback in `var()` IS the
default.

### Files affected

- `src/types.ts` — remove `BoardTheme`, remove `theme` from `BoardProperties`
- `src/board.tsx` — remove `DEFAULT_THEME`, remove theme merge logic, set CSS
  variable defaults on root, replace all inline color references with `var()`
  calls, update coordinate styles to use the two new variables
- `src/index.ts` — remove `BoardTheme` from exports
- `src/__tests__/board.spec.tsx` — update any tests that use the `theme` prop
- `AGENTS.md` — update component API docs

### What stays in JS

`squareSize` stays as a JS-computed value (from `ResizeObserver`) because it
drives piece sizing, animation offsets, and ghost positioning — things that
can't be done with CSS alone. Coordinate font-size will still be computed from
`squareSize` in JS (`squareSize * 0.15`). The color and weight will come from
CSS variables.
