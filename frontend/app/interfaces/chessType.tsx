 export type Piece = {
  position: string;
  piece: string;
  color: string;
};

export type ChessBoardProps = {
  positions?: Piece[];
};

export type Board = {
  id: string;
  positions: any[];
};

export const boardSquares = [
  ...Array(8)
    .fill(null)
    .map((_, row) =>
      Array(8)
        .fill(null)
        .map((_, col) => String.fromCharCode(97 + col) + (8 - row))
    ),
].flat();