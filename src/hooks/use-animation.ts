import { useEffect, useRef, useState } from 'react';

import { diffPositions, squareCoords } from '../utilities.js';

import type { Piece, Square } from '@echecs/position';

interface AnimationOffset {
  x: number;
  y: number;
}

function useAnimation(
  position: Map<Square, Piece>,
  squareSize: number,
  orientation: 'black' | 'white',
  animate: boolean,
): Map<Square, AnimationOffset> {
  const previousPositionReference = useRef<Map<Square, Piece>>(position);
  const [offsets, setOffsets] = useState<Map<Square, AnimationOffset>>(
    new Map(),
  );

  useEffect(() => {
    if (!animate) {
      previousPositionReference.current = position;
      return;
    }

    const previousPosition = previousPositionReference.current;
    previousPositionReference.current = position;

    const deltas = diffPositions(previousPosition, position);

    if (deltas.length === 0) {
      return;
    }

    const newOffsets = new Map<Square, AnimationOffset>();

    for (const { from, to } of deltas) {
      const oldCoords = squareCoords(from, orientation);
      const newCoords = squareCoords(to, orientation);

      newOffsets.set(to, {
        x: (oldCoords.col - newCoords.col) * squareSize,
        y: (oldCoords.row - newCoords.row) * squareSize,
      });
    }

    setOffsets(newOffsets);

    const frameId = requestAnimationFrame(() => {
      setOffsets((previous) => {
        const cleared = new Map<Square, AnimationOffset>();

        for (const [square] of previous) {
          cleared.set(square, { x: 0, y: 0 });
        }

        return cleared;
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [animate, orientation, position, squareSize]);

  if (!animate) {
    return new Map();
  }

  return offsets;
}

export { useAnimation };
export type { AnimationOffset };
