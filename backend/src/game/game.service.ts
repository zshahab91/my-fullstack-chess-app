import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  /**
   * Applies a move to the board and returns the new board state.
   * @param board The current board (array of positions/pieces)
   * @param move The move object (should contain from, to, and piece info)
   * @returns The updated board array
   */
  applyMove(board: any[], move: { from: string; to: string; piece: string; }): any[] {
    // Deep copy the board to avoid mutation
    const newBoard = board.map((piece: any) => ({ ...piece }));

    // Remove the piece from the "from" position
    const fromIndex = newBoard.findIndex((p: any) => p.position === move.from);
    if (fromIndex === -1) return newBoard; // Invalid move

    // Remove any piece at the "to" position (capture)
    const toIndex = newBoard.findIndex((p: any) => p.position === move.to);
    if (toIndex !== -1) {
      newBoard.splice(toIndex, 1);
    }

    // Move the piece
    newBoard[fromIndex].position = move.to;

    return newBoard;
  }
}
