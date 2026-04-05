# Turn Restriction

## Summary

Add an optional `turn` prop to `<Board />` that restricts which color can
interact with the board. When set, only pieces of the matching color can be
dragged or click-selected.

## Prop

```typescript
turn?: 'white' | 'black'
```

- `undefined` (default): any piece can be moved — no restriction
- `'white'`: only white pieces (`color === 'w'`) are interactive
- `'black'`: only black pieces (`color === 'b'`) are interactive

## Behavior

The check lives in the drag hook (`use-drag.ts`). In `onPointerDown`, after
resolving the clicked square and confirming a piece exists there, verify the
piece color matches `turn`. If it doesn't, bail — no drag start, no selection.

The same check applies to re-selection in click-to-move: clicking a piece of the
wrong color while another piece is selected should not re-select it.

### What it does NOT do

- Does not affect `legalMoves` — consumer's responsibility
- Does not affect non-interactive mode (`interactive={false}`)
- Does not add visual feedback for wrong-color pieces (no cursor change, etc.)

## Mapping

The public API uses `'white' | 'black'` (matching `orientation`). Internally map
to `'w' | 'b'` (matching `@echecs/position` `Color` type):

```typescript
const turnColor = turn === 'white' ? 'w' : turn === 'black' ? 'b' : undefined;
```

## Files affected

- `src/types.ts` — add `turn` to `BoardProperties`
- `src/board.tsx` — pass `turn` to `useDrag`
- `src/hooks/use-drag.ts` — add `turn` to `UseDragOptions`, add color check in
  `onPointerDown` and click-to-move re-selection
- `src/__tests__/board.spec.tsx` — add tests
- `AGENTS.md` — add `turn` to props table
