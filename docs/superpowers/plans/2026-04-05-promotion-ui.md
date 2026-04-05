# Promotion UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `<PromotionDialog />` component and allow `<Board />` to render
children inside its CSS grid, so consumers can position overlays (like promotion
dialogs) on specific squares.

**Architecture:** The board accepts `children` and renders them inside its 8x8
grid div. `PromotionDialog` is a standalone component — a column of 4 clickable
pieces with no positioning logic. The consumer positions it using CSS grid
placement via the exported `squareCoords` utility.

**Tech Stack:** React, TypeScript, Vitest, @testing-library/react

---

### Task 1: Add `children` to BoardProperties and render in grid

**Files:**

- Modify: `src/types.ts`
- Modify: `src/board.tsx`

- [ ] **Step 1: Add `children` to `BoardProperties` in `src/types.ts`**

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
  from: Square;
  promotion?: string;
  to: Square;
}

type PieceComponent = React.ComponentType<{ size: number }>;

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

type PieceSet = Record<PieceKey, PieceComponent>;

export type {
  Arrow,
  BoardProperties as BoardProps,
  MoveEvent,
  PieceComponent,
  PieceKey,
  PieceSet,
};
```

- [ ] **Step 2: Destructure `children` in Board and render inside both grid
      paths**

In `src/board.tsx`, add `children` to the destructured props (line 18):

```typescript
function Board({
  animate = true,
  children,
  coordinates = true,
  highlight: highlightSquares = [],
  interactive = true,
  legalMoves,
  onMove,
  orientation = 'white',
  pieces = DEFAULT_PIECES,
  position,
  turn,
}: BoardProperties): React.JSX.Element {
```

In the interactive grid (the `data-board-grid` div), render `children` after the
squares map but inside the grid div. Find the closing of `{SQUARES.map(...)}`
inside the interactive block (~line 289) and add `{children}` before the closing
`</div>`:

```tsx
          {SQUARES.map((square) => {
            // ... existing square rendering
          })}
          {children}
        </div>
```

Do the same for the non-interactive grid block (~line 410):

```tsx
          {SQUARES.map((square) => {
            // ... existing square rendering
          })}
          {children}
        </div>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/board.tsx
git commit -m "add children prop to Board for grid overlays"
```

---

### Task 2: Export `squareCoords` from barrel

**Files:**

- Modify: `src/index.ts`

- [ ] **Step 1: Add `squareCoords` and `SquareCoords` to exports**

```typescript
export { default as Board } from './board.js';
export { DEFAULT_PIECES } from './pieces/index.js';
export { squareCoords } from './utilities.js';

export type {
  Arrow,
  BoardProps,
  MoveEvent,
  PieceComponent,
  PieceKey,
  PieceSet,
} from './types.js';

export type { SquareCoords } from './utilities.js';
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "export squareCoords utility for grid placement"
```

---

### Task 3: Create PromotionDialog component

**Files:**

- Create: `src/promotion-dialog.tsx`

- [ ] **Step 1: Create `src/promotion-dialog.tsx`**

```tsx
import { DEFAULT_PIECES } from './pieces/index.js';

import type { PieceKey, PieceSet } from './types.js';
import type React from 'react';

type PromotionPiece = 'b' | 'n' | 'q' | 'r';

interface PromotionDialogProps {
  color: 'black' | 'white';
  onCancel?: () => void;
  onSelect: (piece: PromotionPiece) => void;
  pieces?: PieceSet;
  squareSize: number;
}

const PROMOTION_PIECES: PromotionPiece[] = ['q', 'r', 'b', 'n'];

function PromotionDialog({
  color,
  onCancel,
  onSelect,
  pieces = DEFAULT_PIECES,
  squareSize,
}: PromotionDialogProps): React.JSX.Element {
  const colorPrefix = color === 'white' ? 'w' : 'b';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 100,
  };

  const itemStyle: React.CSSProperties = {
    alignItems: 'center',
    background: 'var(--board-promotion-background, rgba(0, 0, 0, 0.6))',
    cursor: 'pointer',
    display: 'flex',
    height: squareSize,
    justifyContent: 'center',
    width: squareSize,
  };

  return (
    <div data-promotion-dialog style={containerStyle}>
      {PROMOTION_PIECES.map((piece) => {
        const key: PieceKey =
          `${colorPrefix}${piece.toUpperCase()}` as PieceKey;
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
      })}
      {onCancel && (
        <div
          data-promotion-cancel
          onClick={(event) => {
            event.stopPropagation();
            onCancel();
          }}
          style={{
            ...itemStyle,
            fontSize: squareSize * 0.3,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {'\u00d7'}
        </div>
      )}
    </div>
  );
}

export { PromotionDialog };
export type { PromotionDialogProps, PromotionPiece };
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/promotion-dialog.tsx
git commit -m "add PromotionDialog component"
```

---

### Task 4: Export PromotionDialog from barrel

**Files:**

- Modify: `src/index.ts`

- [ ] **Step 1: Add PromotionDialog exports to `src/index.ts`**

```typescript
export { default as Board } from './board.js';
export { DEFAULT_PIECES } from './pieces/index.js';
export { PromotionDialog } from './promotion-dialog.js';
export { squareCoords } from './utilities.js';

export type {
  Arrow,
  BoardProps,
  MoveEvent,
  PieceComponent,
  PieceKey,
  PieceSet,
} from './types.js';

export type {
  PromotionDialogProps,
  PromotionPiece,
} from './promotion-dialog.js';
export type { SquareCoords } from './utilities.js';
```

- [ ] **Step 2: Verify TypeScript compiles and build succeeds**

Run: `pnpm tsc --noEmit && pnpm build`

Expected: no errors, clean build.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "export PromotionDialog from package"
```

---

### Task 5: Add tests for PromotionDialog

**Files:**

- Create: `src/__tests__/promotion-dialog.spec.tsx`

- [ ] **Step 1: Create test file**

```tsx
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PromotionDialog } from '../promotion-dialog.js';

describe('PromotionDialog', () => {
  it('renders four promotion piece options', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromotionDialog color="white" onSelect={onSelect} squareSize={60} />,
    );
    const pieces = container.querySelectorAll('[data-promotion-piece]');
    expect(pieces).toHaveLength(4);
  });

  it('renders pieces in order: queen, rook, bishop, knight', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromotionDialog color="white" onSelect={onSelect} squareSize={60} />,
    );
    const pieces = container.querySelectorAll('[data-promotion-piece]');
    expect(pieces[0]?.getAttribute('data-promotion-piece')).toBe('q');
    expect(pieces[1]?.getAttribute('data-promotion-piece')).toBe('r');
    expect(pieces[2]?.getAttribute('data-promotion-piece')).toBe('b');
    expect(pieces[3]?.getAttribute('data-promotion-piece')).toBe('n');
  });

  it('calls onSelect with the clicked piece', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromotionDialog color="white" onSelect={onSelect} squareSize={60} />,
    );
    const rook = container.querySelector(
      '[data-promotion-piece="r"]',
    ) as HTMLElement;
    fireEvent.click(rook);
    expect(onSelect).toHaveBeenCalledWith('r');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onSelect = vi.fn();
    const onCancel = vi.fn();
    const { container } = render(
      <PromotionDialog
        color="white"
        onCancel={onCancel}
        onSelect={onSelect}
        squareSize={60}
      />,
    );
    const cancel = container.querySelector(
      '[data-promotion-cancel]',
    ) as HTMLElement;
    fireEvent.click(cancel);
    expect(onCancel).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not render cancel button when onCancel is not provided', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromotionDialog color="white" onSelect={onSelect} squareSize={60} />,
    );
    expect(container.querySelector('[data-promotion-cancel]')).toBeNull();
  });

  it('renders black pieces when color is black', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromotionDialog color="black" onSelect={onSelect} squareSize={60} />,
    );
    // The dialog should render — we can't easily check the piece color
    // from the DOM, but we verify it renders 4 pieces without error
    const pieces = container.querySelectorAll('[data-promotion-piece]');
    expect(pieces).toHaveLength(4);
  });

  it('uses the promotion background CSS variable', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromotionDialog color="white" onSelect={onSelect} squareSize={60} />,
    );
    const piece = container.querySelector(
      '[data-promotion-piece]',
    ) as HTMLElement;
    expect(piece.style.background).toBe(
      'var(--board-promotion-background, rgba(0, 0, 0, 0.6))',
    );
  });
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm test`

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/promotion-dialog.spec.tsx
git commit -m "add PromotionDialog tests"
```

---

### Task 6: Add test for Board children prop

**Files:**

- Modify: `src/__tests__/board.spec.tsx`

- [ ] **Step 1: Add test for children rendering inside the grid**

Add this test inside the existing `Board` describe block:

```typescript
it('renders children inside the board grid', () => {
  const { container } = render(
    <Board>
      <div data-testid="custom-overlay" style={{ gridColumn: 5, gridRow: 1 }}>
        overlay
      </div>
    </Board>,
  );
  const grid = container.querySelector('[data-board-grid]');
  const overlay = grid?.querySelector('[data-testid="custom-overlay"]');
  expect(overlay).toBeTruthy();
  expect(overlay?.textContent).toBe('overlay');
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm test`

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/board.spec.tsx
git commit -m "add test for Board children prop"
```

---

### Task 7: Add Storybook story for promotion

**Files:**

- Modify: `src/__stories__/board.stories.tsx`

- [ ] **Step 1: Add a Promotion story**

Add to `src/__stories__/board.stories.tsx`:

```tsx
import { useState } from 'react';

import { Board } from '../index.js';
import { PromotionDialog } from '../promotion-dialog.js';
import { squareCoords } from '../utilities.js';

import type { BoardProps } from '../types.js';
import type { PromotionPiece } from '../promotion-dialog.js';
import type { Square } from '@echecs/position';
import type { Meta, StoryObj } from '@storybook/react-vite';
```

Then add the story at the end:

```tsx
// -- Promotion dialog: interactive demo ---

function PromotionDemo(): React.JSX.Element {
  const [showPromotion, setShowPromotion] = useState(true);
  const promotionSquare = 'e8' as Square;
  const coords = squareCoords(promotionSquare, 'white');

  return (
    <Board position="rnbqkbnr/ppppPppp/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1">
      {showPromotion && (
        <div
          style={{
            gridColumn: coords.col,
            gridRow: `${coords.row} / span 4`,
            zIndex: 10,
          }}
        >
          <PromotionDialog
            color="white"
            onCancel={() => setShowPromotion(false)}
            onSelect={(piece: PromotionPiece) => {
              setShowPromotion(false);
            }}
            squareSize={50}
          />
        </div>
      )}
    </Board>
  );
}

export const Promotion: Story = {
  render: () => <PromotionDemo />,
};
```

Note: the existing imports at the top of the file need to be updated to include
`useState`, `PromotionDialog`, `squareCoords`, `PromotionPiece`, and `Square`.
Merge with the existing imports.

- [ ] **Step 2: Verify Storybook builds**

Run: `pnpm storybook:build`

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/__stories__/board.stories.tsx
git commit -m "add promotion dialog Storybook story"
```

---

### Task 8: Update documentation

**Files:**

- Modify: `AGENTS.md`
- Modify: `BACKLOG.md`

- [ ] **Step 1: Update AGENTS.md**

Add `<PromotionDialog />` to the component API section after the `<Board />`
section:

```markdown
### `<PromotionDialog />`

| Prop         | Type                                        | Default          | Description                         |
| ------------ | ------------------------------------------- | ---------------- | ----------------------------------- |
| `color`      | `'white' \| 'black'`                        | —                | Which colour is promoting           |
| `onCancel`   | `() => void`                                | —                | Called when dialog is dismissed     |
| `onSelect`   | `(piece: 'q' \| 'r' \| 'b' \| 'n') => void` | —                | Called when a piece is clicked      |
| `pieces`     | `PieceSet`                                  | `DEFAULT_PIECES` | Piece component set (same as board) |
| `squareSize` | `number`                                    | —                | Square size in pixels               |
```

Add `children` to the `<Board />` props table:

```markdown
| `children` | `React.ReactNode` | — | Content rendered inside the board grid |
```

Add `--board-promotion-background` to the CSS variables table:

```markdown
| `--board-promotion-background` | `rgba(0,0,0,0.6)` | Promotion dialog
background |
```

Add `squareCoords` to the package structure under exports or add a note in the
barrel exports section.

- [ ] **Step 2: Update BACKLOG.md — mark promotion item complete**

Change the promotion item from unchecked to checked:

```markdown
- [x] ~~Promotion UI~~ — added `<PromotionDialog />` component and `children`
      prop on Board. Consumer positions dialog in the board grid.
```

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md BACKLOG.md
git commit -m "update docs for promotion dialog"
```

---

### Task 9: Final verification

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`

Expected: all tests pass.

- [ ] **Step 2: Run type check**

Run: `pnpm tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Run build**

Run: `pnpm build`

Expected: clean build.
