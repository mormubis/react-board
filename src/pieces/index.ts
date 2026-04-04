import BB from './b-b.js';
import BK from './b-k.js';
import BN from './b-n.js';
import BP from './b-p.js';
import BQ from './b-q.js';
import BR from './b-r.js';
import WB from './w-b.js';
import WK from './w-k.js';
import WN from './w-n.js';
import WP from './w-p.js';
import WQ from './w-q.js';
import WR from './w-r.js';

import type { PieceSet } from '../types.js';

const DEFAULT_PIECES: PieceSet = {
  bB: BB,
  bK: BK,
  bN: BN,
  bP: BP,
  bQ: BQ,
  bR: BR,
  wB: WB,
  wK: WK,
  wN: WN,
  wP: WP,
  wQ: WQ,
  wR: WR,
};

export { DEFAULT_PIECES };
