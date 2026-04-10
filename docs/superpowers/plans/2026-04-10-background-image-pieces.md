# Background-Image Pieces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace React component-based piece rendering with CSS
`background-image` divs to eliminate stacking context issues during drag and
animation.

**Architecture:** Each piece becomes a data URI string instead of a React
component. The board renders pieces as `div` elements with `background-image`
instead of mounting SVG component trees. The `PieceSet` type changes from
`Record<PieceKey, React.ComponentType<{ size: number }>>` to
`Record<PieceKey, string>`.

**Tech Stack:** React, TypeScript, vitest, Storybook

---

### Task 1: Convert SVG piece components to data URI strings

**Files:**

- Delete: `src/pieces/b-b.tsx`, `src/pieces/b-k.tsx`, `src/pieces/b-n.tsx`,
  `src/pieces/b-p.tsx`, `src/pieces/b-q.tsx`, `src/pieces/b-r.tsx`,
  `src/pieces/w-b.tsx`, `src/pieces/w-k.tsx`, `src/pieces/w-n.tsx`,
  `src/pieces/w-p.tsx`, `src/pieces/w-q.tsx`, `src/pieces/w-r.tsx`
- Rewrite: `src/pieces/index.ts`

Each TSX component currently renders an `<svg viewBox="0 0 300 300">` with
`<path>` elements. Extract the SVG markup from each component, wrap it in a
proper SVG root, and encode it as a `data:image/svg+xml,...` URI.

The conversion for each piece follows the same pattern. For example, `w-p.tsx`
contains:

```tsx
<svg height={size} viewBox="0 0 300 300" width={size} xmlns="http://www.w3.org/2000/svg">
  <path d="..." fill="#F7F7F7" transform="translate(174.3125,74.125)" />
  <path d="..." fill="#F7F7F7" transform="translate(132,175)" />
  <!-- ... more paths ... -->
</svg>
```

This becomes a static SVG string (without `height`/`width` since
`background-size: contain` handles scaling):

```svg
<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <path d="..." fill="#F7F7F7" transform="translate(174.3125,74.125)" />
  ...
</svg>
```

Then encoded as: `data:image/svg+xml,${encodeURIComponent(svgString)}`

- [ ] **Step 1: Create a conversion script**

Create a temporary Node script at `scripts/convert-pieces.mjs` that reads each
TSX file, extracts the SVG content between `<svg ...>` and `</svg>`, builds a
clean SVG string with
`viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"`, and outputs the data
URIs.

```javascript
// scripts/convert-pieces.mjs
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PIECES_DIR = join(import.meta.dirname, '..', 'src', 'pieces');
const PIECE_FILES = [
  'b-b',
  'b-k',
  'b-n',
  'b-p',
  'b-q',
  'b-r',
  'w-b',
  'w-k',
  'w-n',
  'w-p',
  'w-q',
  'w-r',
];

const KEY_MAP = {
  'b-b': 'bB',
  'b-k': 'bK',
  'b-n': 'bN',
  'b-p': 'bP',
  'b-q': 'bQ',
  'b-r': 'bR',
  'w-b': 'wB',
  'w-k': 'wK',
  'w-n': 'wN',
  'w-p': 'wP',
  'w-q': 'wQ',
  'w-r': 'wR',
};

for (const file of PIECE_FILES) {
  const tsx = readFileSync(join(PIECES_DIR, `${file}.tsx`), 'utf8');
  // Extract everything between the opening <svg and closing </svg>
  const svgMatch = tsx.match(/<svg[\s\S]*?<\/svg>/);
  if (!svgMatch) {
    console.error(`No SVG found in ${file}.tsx`);
    continue;
  }
  let svg = svgMatch[0];
  // Remove JSX props: height={size}, width={size}
  svg = svg.replace(/\s+height=\{size\}/g, '');
  svg = svg.replace(/\s+width=\{size\}/g, '');
  // Clean up whitespace
  svg = svg.replace(/\n\s+/g, '');
  const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  console.log(`  ${KEY_MAP[file]}: '${uri}',`);
}
```

- [ ] **Step 2: Run the script to generate data URIs**

Run: `node scripts/convert-pieces.mjs`

Copy the output. This gives us the 12 data URI strings.

- [ ] **Step 3: Rewrite `src/pieces/index.ts`**

Replace the current file with the generated data URIs:

```typescript
import type { PieceSet } from '../types.js';

const DEFAULT_PIECES: PieceSet = {
  bB: 'data:image/svg+xml,...',
  bK: 'data:image/svg+xml,...',
  bN: 'data:image/svg+xml,...',
  bP: 'data:image/svg+xml,...',
  bQ: 'data:image/svg+xml,...',
  bR: 'data:image/svg+xml,...',
  wB: 'data:image/svg+xml,...',
  wK: 'data:image/svg+xml,...',
  wN: 'data:image/svg+xml,...',
  wP: 'data:image/svg+xml,...',
  wQ: 'data:image/svg+xml,...',
  wR: 'data:image/svg+xml,...',
};

export { DEFAULT_PIECES };
```

(Use the actual generated URIs from step 2.)

- [ ] **Step 4: Delete the 12 TSX piece component files**

```bash
rm src/pieces/b-b.tsx src/pieces/b-k.tsx src/pieces/b-n.tsx src/pieces/b-p.tsx src/pieces/b-q.tsx src/pieces/b-r.tsx src/pieces/w-b.tsx src/pieces/w-k.tsx src/pieces/w-n.tsx src/pieces/w-p.tsx src/pieces/w-q.tsx src/pieces/w-r.tsx
```

- [ ] **Step 5: Delete the conversion script**

```bash
rm scripts/convert-pieces.mjs
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "convert piece components to data URI strings"
```

---

### Task 2: Update types

**Files:**

- Modify: `src/types.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Update `src/types.ts`**

Remove `PieceComponent` type. Change `PieceSet` from component record to string
record. Keep `import type React from 'react'` because `BoardProperties.children`
still uses `React.ReactNode`.

```typescript
import type { Piece, Square } from '@echecs/position';
import type React from 'react';

interface Arrow {
  brush: string;
  from: Square;
  to: Square;
}

interface BoardProperties {
  animate?: boolean;
  arrows?: Arrow[];
  children?: React.ReactNode;
  coordinates?: boolean;
  highlight?: Square[];
  interactive?: boolean;
  legalMoves?: Map<Square, Square[]>;
  onMove?: (move: MoveEvent) => boolean;
  onSquareClick?: (square: Square) => void;
  orientation?: 'black' | 'white';
  pieces?: PieceSet;
  position?: Map<Square, Piece> | string;
  turn?: 'black' | 'white';
}

interface MoveEvent {
  capture: boolean;
  from: Square;
  promotion?: string;
  to: Square;
}

type PieceKey =
  | 'bB'
  | 'bK'
  | 'bN'
  | 'bP'
  | 'bQ'
  | 'bR'
  | 'wB'
  | 'wK'
  | 'wN'
  | 'wP'
  | 'wQ'
  | 'wR';

type PieceSet = Record<PieceKey, string>;

export type {
  Arrow,
  BoardProperties as BoardProps,
  MoveEvent,
  PieceKey,
  PieceSet,
};
```

- [ ] **Step 2: Update `src/index.ts`**

Remove `PieceComponent` from the type exports:

```typescript
export { default as Board } from './board.js';
export { DEFAULT_PIECES } from './pieces/index.js';
export { PromotionDialog } from './promotion-dialog.js';
export { squareCoords } from './utilities.js';

export type {
  Arrow,
  BoardProps,
  MoveEvent,
  PieceKey,
  PieceSet,
} from './types.js';

export type {
  PromotionDialogProps,
  PromotionPiece,
} from './promotion-dialog.js';
export type { SquareCoords } from './utilities.js';
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm run lint:types` Expected: no errors (board.tsx and
promotion-dialog.tsx will have type errors at this point since they still
reference `PieceComponent` -- that's expected and will be fixed in the next
tasks)

Actually, this step will fail because board.tsx and promotion-dialog.tsx still
use the old type. Skip verification here -- it will be verified after Task 3
and 4.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/index.ts
git commit -m "change PieceSet type from components to image URLs"
```

---

### Task 3: Update board rendering

**Files:**

- Modify: `src/board.tsx`

The board currently renders pieces like:

```tsx
<div style={pieceStyle}>
  <PieceComponent size={squareSize} />
</div>
```

Change to:

```tsx
<div style={pieceStyle} />
```

Where `pieceStyle` includes `backgroundImage`, `backgroundSize`,
`backgroundRepeat`, `backgroundPosition`.

- [ ] **Step 1: Update piece rendering in the interactive branch (lines
      248-284)**

In the interactive `SQUARES.map` callback, replace the piece lookup and
rendering.

Current code (lines 248-269):

```typescript
let PieceComponent: PieceComponentType | undefined;

if (piece && !hidePiece) {
  const key: PieceKey = `${piece.color}${piece.type.toUpperCase()}` as PieceKey;
  PieceComponent = pieces[key];
}

const animOffset = animationOffsets.get(square);
const pieceStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  ...(animOffset
    ? {
        transform: `translate(${animOffset.x}px, ${animOffset.y}px)`,
        transition:
          animOffset.x !== 0 || animOffset.y !== 0
            ? 'none'
            : 'transform 200ms ease',
      }
    : undefined),
};
```

New code:

```typescript
let pieceImage: string | undefined;

if (piece && !hidePiece) {
  const key: PieceKey = `${piece.color}${piece.type.toUpperCase()}` as PieceKey;
  pieceImage = pieces[key];
}

const animOffset = animationOffsets.get(square);
const pieceStyle: React.CSSProperties | undefined = pieceImage
  ? {
      backgroundImage: `url("${pieceImage}")`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      height: '100%',
      position: 'relative',
      width: '100%',
      zIndex: 1,
      ...(animOffset
        ? {
            transform: `translate(${animOffset.x}px, ${animOffset.y}px)`,
            transition:
              animOffset.x !== 0 || animOffset.y !== 0
                ? 'none'
                : 'transform 200ms ease',
          }
        : undefined),
    }
  : undefined;
```

And the JSX changes from:

```tsx
{
  PieceComponent && (
    <div style={pieceStyle}>
      <PieceComponent size={squareSize} />
    </div>
  );
}
```

To:

```tsx
{
  pieceStyle && <div data-piece style={pieceStyle} />;
}
```

Add `data-piece` attribute to make pieces queryable in tests.

- [ ] **Step 2: Update piece rendering in the non-interactive branch (lines
      380-410)**

Same change as step 1 but for the non-interactive code path. There's no
`hidePiece` check in this branch.

Current:

```typescript
let PieceComponent: PieceComponentType | undefined;

if (piece) {
  const key: PieceKey = `${piece.color}${piece.type.toUpperCase()}` as PieceKey;
  PieceComponent = pieces[key];
}
```

New:

```typescript
let pieceImage: string | undefined;

if (piece) {
  const key: PieceKey = `${piece.color}${piece.type.toUpperCase()}` as PieceKey;
  pieceImage = pieces[key];
}
```

Same `pieceStyle` construction and JSX as step 1.

- [ ] **Step 3: Update ghost piece rendering (lines 130-154, 428-432)**

Current ghost piece lookup (lines 130-141):

```typescript
let GhostPiece: PieceComponentType | undefined;

if (dragState.isDragging && dragState.from) {
  const ghostPiece = positionMap.get(dragState.from);

  if (ghostPiece) {
    const ghostKey: PieceKey =
      `${ghostPiece.color}${ghostPiece.type.toUpperCase()}` as PieceKey;
    GhostPiece = pieces[ghostKey];
  }
}
```

New:

```typescript
let ghostImage: string | undefined;

if (dragState.isDragging && dragState.from) {
  const ghostPiece = positionMap.get(dragState.from);

  if (ghostPiece) {
    const ghostKey: PieceKey =
      `${ghostPiece.color}${ghostPiece.type.toUpperCase()}` as PieceKey;
    ghostImage = pieces[ghostKey];
  }
}
```

Current ghost style (lines 143-154):

```typescript
const ghostStyle: React.CSSProperties | undefined =
  dragState.isDragging && dragState.floating
    ? {
        filter:
          'var(--board-drag-shadow, drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4)))',
        left: dragState.floating.x - squareSize / 2,
        pointerEvents: 'none',
        position: 'fixed',
        top: dragState.floating.y - squareSize / 2,
        zIndex: 9999,
      }
    : undefined;
```

New (add background-image properties and explicit dimensions):

```typescript
const ghostStyle: React.CSSProperties | undefined =
  dragState.isDragging && dragState.floating && ghostImage
    ? {
        backgroundImage: `url("${ghostImage}")`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        filter:
          'var(--board-drag-shadow, drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4)))',
        height: squareSize,
        left: dragState.floating.x - squareSize / 2,
        pointerEvents: 'none',
        position: 'fixed',
        top: dragState.floating.y - squareSize / 2,
        width: squareSize,
        zIndex: 9999,
      }
    : undefined;
```

Current ghost JSX (lines 428-432):

```tsx
{
  GhostPiece && ghostStyle && (
    <div data-ghost style={ghostStyle}>
      <GhostPiece size={squareSize} />
    </div>
  );
}
```

New:

```tsx
{
  ghostStyle && <div data-ghost style={ghostStyle} />;
}
```

- [ ] **Step 4: Remove the PieceComponentType import**

Remove the `PieceComponent as PieceComponentType` import from the types import
at the top of `board.tsx` (line 11):

Current:

```typescript
import type {
  BoardProps as BoardProperties,
  PieceComponent as PieceComponentType,
  PieceKey,
} from './types.js';
```

New:

```typescript
import type { BoardProps as BoardProperties, PieceKey } from './types.js';
```

- [ ] **Step 5: Verify types compile**

Run: `pnpm run lint:types` Expected: `promotion-dialog.tsx` may still have
errors (fixed in Task 4). `board.tsx` should be clean.

- [ ] **Step 6: Commit**

```bash
git add src/board.tsx
git commit -m "render pieces as background-image divs"
```

---

### Task 4: Update promotion dialog

**Files:**

- Modify: `src/promotion-dialog.tsx`

- [ ] **Step 1: Update promotion dialog rendering**

Current rendering (lines 46-63):

```tsx
{
  PROMOTION_PIECES.map((piece) => {
    const key: PieceKey = `${colorPrefix}${piece.toUpperCase()}` as PieceKey;
    const PieceComponent = pieces[key];

    return (
      <div
        data-promotion-piece={piece}
        key={piece}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(piece);
        }}
        style={itemStyle}
      >
        <PieceComponent size={squareSize * 0.85} />
      </div>
    );
  });
}
```

New:

```tsx
{
  PROMOTION_PIECES.map((piece) => {
    const key: PieceKey = `${colorPrefix}${piece.toUpperCase()}` as PieceKey;
    const pieceImage = pieces[key];

    return (
      <div
        data-promotion-piece={piece}
        key={piece}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(piece);
        }}
        style={itemStyle}
      >
        <div
          style={{
            backgroundImage: `url("${pieceImage}")`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            height: squareSize * 0.85,
            width: squareSize * 0.85,
          }}
        />
      </div>
    );
  });
}
```

- [ ] **Step 2: Verify types compile**

Run: `pnpm run lint:types` Expected: PASS -- no type errors across the whole
project.

- [ ] **Step 3: Commit**

```bash
git add src/promotion-dialog.tsx
git commit -m "render promotion pieces as background-image divs"
```

---

### Task 5: Update tests

**Files:**

- Modify: `src/__tests__/board.spec.tsx`
- Modify: `src/__tests__/promotion-dialog.spec.tsx`

Tests currently query for `svg` elements inside squares to verify pieces are
rendered. Since pieces are now background-image divs, we need to query for
`[data-piece]` elements and check their `backgroundImage` style instead.

- [ ] **Step 1: Update board tests**

In `src/__tests__/board.spec.tsx`, make these changes:

**Test: "renders pieces from FEN" (line 17-23)**

Current:

```typescript
it('renders pieces from FEN', () => {
  const { container } = render(
    <Board position="8/8/8/8/8/8/8/4K3 w - - 0 1" />,
  );
  const kingSquare = container.querySelector('[data-square="e1"]');
  expect(kingSquare?.querySelector('svg')).toBeTruthy();
});
```

New:

```typescript
it('renders pieces from FEN', () => {
  const { container } = render(
    <Board position="8/8/8/8/8/8/8/4K3 w - - 0 1" />,
  );
  const kingSquare = container.querySelector('[data-square="e1"]');
  expect(kingSquare?.querySelector('[data-piece]')).toBeTruthy();
});
```

**Test: "renders default starting position" (line 25-30)**

Current:

```typescript
it('renders default starting position when no position prop', () => {
  const { container } = render(<Board />);
  const svgs = container.querySelectorAll('[data-square] svg');
  expect(svgs).toHaveLength(32);
});
```

New:

```typescript
it('renders default starting position when no position prop', () => {
  const { container } = render(<Board />);
  const pieces = container.querySelectorAll('[data-square] [data-piece]');
  expect(pieces).toHaveLength(32);
});
```

**Test: "renders empty squares with no pieces" (line 32-38)**

Current:

```typescript
it('renders empty squares with no pieces', () => {
  const { container } = render(
    <Board position="8/8/8/8/8/8/8/8 w - - 0 1" />,
  );
  const svgs = container.querySelectorAll('[data-square] svg');
  expect(svgs).toHaveLength(0);
});
```

New:

```typescript
it('renders empty squares with no pieces', () => {
  const { container } = render(
    <Board position="8/8/8/8/8/8/8/8 w - - 0 1" />,
  );
  const pieces = container.querySelectorAll('[data-square] [data-piece]');
  expect(pieces).toHaveLength(0);
});
```

**Test: "uses custom piece set" (line 151-174)**

This test uses component-based custom pieces. Change it to use string URLs:

Current:

```typescript
it('uses custom piece set when pieces prop provided', () => {
  const { container } = render(
    <Board
      pieces={{
        bB: () => <div data-testid="custom-piece" />,
        bK: () => <div />,
        bN: () => <div />,
        bP: () => <div />,
        bQ: () => <div />,
        bR: () => <div />,
        wB: () => <div />,
        wK: () => <div data-testid="custom-wk" />,
        wN: () => <div />,
        wP: () => <div />,
        wQ: () => <div />,
        wR: () => <div />,
      }}
      position={STARTING_FEN}
    />,
  );
  const kingSquare = container.querySelector('[data-square="e1"]');
  expect(kingSquare?.querySelector('[data-testid="custom-wk"]')).toBeTruthy();
});
```

New:

```typescript
it('uses custom piece set when pieces prop provided', () => {
  const customPieces = {
    bB: 'custom-bb.svg',
    bK: 'custom-bk.svg',
    bN: 'custom-bn.svg',
    bP: 'custom-bp.svg',
    bQ: 'custom-bq.svg',
    bR: 'custom-br.svg',
    wB: 'custom-wb.svg',
    wK: 'custom-wk.svg',
    wN: 'custom-wn.svg',
    wP: 'custom-wp.svg',
    wQ: 'custom-wq.svg',
    wR: 'custom-wr.svg',
  };
  const { container } = render(
    <Board pieces={customPieces} position={STARTING_FEN} />,
  );
  const kingSquare = container.querySelector('[data-square="e1"]');
  const pieceDev = kingSquare?.querySelector('[data-piece]') as HTMLElement;
  expect(pieceDev?.style.backgroundImage).toContain('custom-wk.svg');
});
```

- [ ] **Step 2: Run board tests**

Run: `pnpm test src/__tests__/board.spec.tsx` Expected: PASS

- [ ] **Step 3: Update promotion dialog tests**

The promotion dialog tests don't directly query for SVGs -- they query
`[data-promotion-piece]` and check structure/callbacks. These should still pass
without changes. Verify:

Run: `pnpm test src/__tests__/promotion-dialog.spec.tsx` Expected: PASS

- [ ] **Step 4: Run full test suite**

Run: `pnpm test` Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/board.spec.tsx
git commit -m "update tests for background-image piece rendering"
```

---

### Task 6: Update stories

**Files:**

- Modify: `src/__stories__/board.stories.tsx`

The stories file imports `BoardProps` and `MoveEvent` from types but doesn't
directly reference `PieceComponent`. The `Interactive` and `Promotion` stories
use `DEFAULT_PIECES` implicitly through the `Board` default prop. No story
currently passes a custom `pieces` prop, so they should work without changes.

- [ ] **Step 1: Verify storybook builds**

Run: `pnpm storybook:build` Expected: Build succeeds. All stories render
correctly.

- [ ] **Step 2: Commit (only if changes were needed)**

If any changes were required, commit them. Otherwise skip.

---

### Task 7: Update README

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Update the "Custom pieces" section**

Current (lines 112-131):

```markdown
## Custom pieces

Supply a `PieceSet` record mapping piece keys to React components:

\`\`\`tsx import type { PieceComponent, PieceSet } from '@echecs/react-board';

const MyPawn: PieceComponent = ({ size }) => ( <svg width={size} height={size}>
{/_ your SVG _/} </svg> );

const myPieces: PieceSet = { ...DEFAULT_PIECES, wP: MyPawn, };

<Board pieces={myPieces} />; \`\`\`
```

New:

```markdown
## Custom pieces

Supply a `PieceSet` record mapping piece keys to image URLs (any format the
browser can render as a CSS `background-image` — data URIs, SVG files, PNGs):

\`\`\`tsx import { DEFAULT_PIECES } from '@echecs/react-board'; import type {
PieceSet } from '@echecs/react-board';

const myPieces: PieceSet = { ...DEFAULT_PIECES, wP:
'/assets/pieces/white-pawn.svg', };

<Board pieces={myPieces} />; \`\`\`
```

- [ ] **Step 2: Update the "Exported types" table**

Remove the `PieceComponent` row from the table at lines 198-208.

Current row:

```
| `PieceComponent`       | `React.ComponentType<{ size: number }>` — piece render contract  |
```

Remove it. Update `PieceSet` description:

Current:

```
| `PieceSet`             | `Record<PieceKey, PieceComponent>` — full piece set map          |
```

New:

```
| `PieceSet`             | `Record<PieceKey, string>` — maps piece keys to image URLs       |
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "update README for background-image piece API"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full lint**

Run: `pnpm lint` Expected: PASS

- [ ] **Step 2: Run full test suite**

Run: `pnpm test` Expected: All tests pass.

- [ ] **Step 3: Run format check**

Run: `pnpm format:ci` Expected: PASS (run `pnpm format` first if needed)

- [ ] **Step 4: Build the package**

Run: `pnpm build` Expected: Build succeeds, `dist/` output is generated.

- [ ] **Step 5: Build storybook**

Run: `pnpm storybook:build` Expected: Storybook builds successfully.

- [ ] **Step 6: Visually verify in storybook (optional)**

Run: `pnpm storybook` Check: Default story shows pieces, drag works, ghost piece
appears above board, animation works.
