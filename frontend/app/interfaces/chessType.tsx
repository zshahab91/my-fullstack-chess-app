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
  board?: BoardPosition[];
  [key: string]: string | BoardPosition[] | undefined;
}
export interface BoardPosition{
    piece: string;
    position: string;
    color: string;
}
export interface Move {
  from: string;
  to: string;
  piece: string;
  color: string;
}
export interface GameResponse {
  color: 'white' | 'black';
  status: string;
  board?: BoardPosition[];
  move?: Move[];
  message?: string;
  opponent?: string | null;
  isNew?: boolean;
}

export interface StartGameResponse {
  game: GameResponse;
  isNew: boolean;
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