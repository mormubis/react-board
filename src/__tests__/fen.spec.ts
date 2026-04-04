import { describe, expect, it } from 'vitest';

import { parseFen } from '../fen.js';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const AFTER_E4_FEN =
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';

describe('parseFen', () => {
  describe('starting position', () => {
    it('has 32 pieces', () => {
      const pos = parseFen(STARTING_FEN);
      expect(pos.size).toBe(32);
    });

    it('has white king on e1', () => {
      const pos = parseFen(STARTING_FEN);
      expect(pos.get('e1')).toEqual({ color: 'w', type: 'k' });
    });

    it('has black king on e8', () => {
      const pos = parseFen(STARTING_FEN);
      expect(pos.get('e8')).toEqual({ color: 'b', type: 'k' });
    });

    it('has white pawns on rank 2', () => {
      const pos = parseFen(STARTING_FEN);
      for (const file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        expect(pos.get(`${file}2` as Parameters<typeof pos.get>[0])).toEqual({
          color: 'w',
          type: 'p',
        });
      }
    });

    it('has black pawns on rank 7', () => {
      const pos = parseFen(STARTING_FEN);
      for (const file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        expect(pos.get(`${file}7` as Parameters<typeof pos.get>[0])).toEqual({
          color: 'b',
          type: 'p',
        });
      }
    });
  });

  describe('after 1.e4', () => {
    it('has pawn on e4', () => {
      const pos = parseFen(AFTER_E4_FEN);
      expect(pos.get('e4')).toEqual({ color: 'w', type: 'p' });
    });

    it('has empty e2', () => {
      const pos = parseFen(AFTER_E4_FEN);
      expect(pos.get('e2')).toBeUndefined();
    });
  });

  describe('empty board', () => {
    it('has 0 pieces', () => {
      const pos = parseFen('8/8/8/8/8/8/8/8 w - - 0 1');
      expect(pos.size).toBe(0);
    });
  });
});
