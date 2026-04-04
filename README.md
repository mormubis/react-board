# @echecs/react-board

React chessboard component with drag & drop, animation, and theming. Bundled
cburnett piece set, zero external dependencies beyond React.

## Installation

```bash
npm install @echecs/react-board
# or
pnpm add @echecs/react-board
```

React ≥18 is a peer dependency.

## Quick start

### Minimal

```tsx
import { Board } from '@echecs/react-board';

export function App() {
  return <Board />;
}
```

### Full featured

```tsx
import { useState } from 'react';
import { Board } from '@echecs/react-board';
import type { MoveEvent } from '@echecs/react-board';
import type { Piece, Square } from '@echecs/position';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function ChessGame() {
  const [position, setPosition] = useState(STARTING_FEN);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');

  function handleMove(event: MoveEvent): boolean {
    // validate and apply move, then update position
    // return false to reject the move
    return true;
  }

  return (
    <div style={{ width: 480 }}>
      <Board
        animate
        coordinates
        orientation={orientation}
        position={position}
        onMove={handleMove}
        theme={{ darkSquare: '#b58863', lightSquare: '#f0d9b5' }}
      />
      <button
        onClick={() =>
          setOrientation((o) => (o === 'white' ? 'black' : 'white'))
        }
      >
        Flip board
      </button>
    </div>
  );
}
```

## Props

| Prop          | Type                           | Default           | Description                                            |
| ------------- | ------------------------------ | ----------------- | ------------------------------------------------------ |
| `animate`     | `boolean`                      | `true`            | Enable CSS transition animation on piece moves         |
| `coordinates` | `boolean`                      | `true`            | Show rank/file coordinate labels                       |
| `highlight`   | `Square[]`                     | `[]`              | Squares to highlight with an overlay                   |
| `interactive` | `boolean`                      | `true`            | Enable drag & drop and click-to-move                   |
| `legalMoves`  | `Map<Square, Square[]>`        | —                 | Legal move map — restricts user interaction            |
| `onMove`      | `(move: MoveEvent) => boolean` | —                 | Called on every attempted move; return false to reject |
| `orientation` | `'white' \| 'black'`           | `'white'`         | Which side is at the bottom                            |
| `pieces`      | `PieceSet`                     | `DEFAULT_PIECES`  | Custom piece component record                          |
| `position`    | `string \| Map<Square, Piece>` | starting position | FEN string or position map                             |
| `theme`       | `BoardTheme`                   | —                 | Override board colours                                 |

## Theming

Pass a `BoardTheme` object to override any colour:

```tsx
<Board
  theme={{
    darkSquare: '#b58863',
    lightSquare: '#f0d9b5',
    highlight: 'rgba(20, 85, 30, 0.5)',
    legalDot: 'rgba(0, 0, 0, 0.3)',
    coordinate: '#b58863',
    border: 'transparent',
  }}
/>
```

All fields are optional — unset fields use the default green theme.

## Custom pieces

Supply a `PieceSet` record mapping piece keys to React components:

```tsx
import type { PieceComponent, PieceSet } from '@echecs/react-board';

const MyPawn: PieceComponent = ({ size }) => (
  <svg width={size} height={size}>
    {/* your SVG */}
  </svg>
);

const myPieces: PieceSet = {
  ...DEFAULT_PIECES,
  wP: MyPawn,
};

<Board pieces={myPieces} />;
```

Piece key format: `'b' | 'w'` + `'B' | 'K' | 'N' | 'P' | 'Q' | 'R'` (e.g. `'wK'`
= white king, `'bP'` = black pawn).

## License

MIT
