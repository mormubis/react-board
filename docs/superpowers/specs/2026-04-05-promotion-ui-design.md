# Promotion UI

## Summary

Add a `<PromotionDialog />` component and allow `<Board />` to render children
inside its grid. The board stays dumb — it doesn't detect or handle promotion.
The consumer detects promotion in their `onMove` handler, positions the dialog
inside the board's grid using `squareCoords`, and handles the result.

## Board change: children prop

`<Board />` accepts `children`. They are rendered inside the 8x8 CSS grid
container after the squares. The board does not inspect, modify, or position
children — it just renders them. This is a general-purpose feature useful beyond
promotion (custom overlays, annotations, etc.).

```tsx
interface BoardProperties {
  // ... existing props
  children?: React.ReactNode;
}
```

## PromotionDialog component

A column of 4 clickable piece components. No positioning logic.

```tsx
interface PromotionDialogProps {
  color: 'white' | 'black';
  onCancel?: () => void;
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  pieces?: PieceSet;
  squareSize: number;
}
```

### Props

| Prop         | Type                                        | Default          | Description                         |
| ------------ | ------------------------------------------- | ---------------- | ----------------------------------- |
| `color`      | `'white' \| 'black'`                        | —                | Which color is promoting            |
| `onCancel`   | `() => void`                                | —                | Called when dialog is dismissed     |
| `onSelect`   | `(piece: 'q' \| 'r' \| 'b' \| 'n') => void` | —                | Called when a piece is clicked      |
| `pieces`     | `PieceSet`                                  | `DEFAULT_PIECES` | Piece component set (same as board) |
| `squareSize` | `number`                                    | —                | Square size in pixels               |

### Rendering

Renders a vertical column of 4 squares, each containing a clickable piece.
Order: queen, rook, bishop, knight (most common choice first). Each square has
the same dimensions as a board square (`squareSize`). Background color
alternates or uses a neutral color — details in implementation.

### Styling

Uses a CSS variable for background:

- `--board-promotion-background` (default: `rgba(0, 0, 0, 0.6)`)

Each piece is rendered using the same `PieceSet` components the board uses. The
piece key follows the existing convention: `wQ`, `wR`, `wB`, `wN` for white,
`bQ`, `bR`, `bB`, `bN` for black.

## Export squareCoords

`squareCoords` already exists in `src/utilities.ts`. It returns
`{ col: number; row: number }` for a square given an orientation. Add it to the
barrel export in `src/index.ts` so consumers can compute grid placement.

## Consumer usage

```tsx
function ChessGame() {
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  function handleMove(move: MoveEvent) {
    if (isPromotion(move.from, move.to)) {
      setPromotion(move);
      return false; // reject — handle async
    }
    game.move(move);
    return true;
  }

  const coords = promotion ? squareCoords(promotion.to, orientation) : null;

  return (
    <Board position={fen} onMove={handleMove} orientation={orientation}>
      {promotion && coords && (
        <div
          style={{
            gridColumn: coords.col,
            gridRow: `${coords.row} / span 4`,
            zIndex: 10,
          }}
        >
          <PromotionDialog
            color="white"
            onSelect={(piece) => {
              game.move({ ...promotion, promotion: piece });
              setPromotion(null);
            }}
            onCancel={() => setPromotion(null)}
            squareSize={60}
          />
        </div>
      )}
    </Board>
  );
}
```

## Files affected

- `src/types.ts` — add `children` to `BoardProperties`
- `src/board.tsx` — destructure and render `children` inside grid
- `src/promotion-dialog.tsx` — new component
- `src/index.ts` — export `PromotionDialog`, `PromotionDialogProps`,
  `squareCoords`
- `src/__stories__/board.stories.tsx` — add promotion story
- `src/__tests__/promotion-dialog.spec.tsx` — tests for the dialog
- `AGENTS.md` — update docs with new component and export
