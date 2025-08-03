export type Piece = {
  position: string;
  piece: string;
  color: string;
};

export type ChessBoardProps = {
  positions: Piece[];
};

export type Board = {
  id: string;
  positions: Piece[];
};
export interface Message {
  message?: string;
  update?: string;
  board?: any;
  [key: string]: any;
}
export interface GameResponse {
  color: 'white' | 'black';
  status: 'waiting' | 'in-progress' | 'finished';
  board: Piece[];
  opponent: string | null;
}
export interface Move {
  from: string;
  to: string;
  piece: string;
  color: 'white' | 'black';
}

export const boardSquares = [
  ...Array(8)
    .fill(null)
    .map((_, row) =>
      Array(8)
        .fill(null)
        .map((_, col) => String.fromCharCode(97 + col) + (8 - row))
    ),
].flat();