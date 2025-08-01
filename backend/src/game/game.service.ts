import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  private gamesFilePath = path.join(__dirname, '..', 'db', 'games.json');

  // Find a game where the user is either white or black
  findGameByToken(token: string): any | null {
    if (!fs.existsSync(this.gamesFilePath)) return null;
    const gamesRaw = fs.readFileSync(this.gamesFilePath, 'utf8');
    const games = JSON.parse(gamesRaw);
    return games.find((g: any) => g.white === token || g.black === token) || null;
  }

  // Find a game with status "waiting"
  findWaitingGame(): any | null {
    if (!fs.existsSync(this.gamesFilePath)) return null;
    const gamesRaw = fs.readFileSync(this.gamesFilePath, 'utf8');
    const games = JSON.parse(gamesRaw);
    return games.find((g: any) => g.status === 'waiting') || null;
  }

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

  pushOrUpdateGame(game: any): void {
    let games: any[] = [];
    if (fs.existsSync(this.gamesFilePath)) {
      const gamesRaw = fs.readFileSync(this.gamesFilePath, 'utf8');
      games = JSON.parse(gamesRaw) || [];
    }

    const index = games.findIndex((g: any) => g.id === game.id);
    if (index !== -1) {
      // Update existing game
      games[index] = game;
    } else {
      // Add new game
      games.push(game);
    }

    fs.writeFileSync(this.gamesFilePath, JSON.stringify(games, null, 2), 'utf8');
  }

  findInitialBoard(): any[] {
    const chessJsonPath = path.join(__dirname, '../..', 'db', 'chess.json');
    if (!fs.existsSync(chessJsonPath)) return [];
    try {
      const chessRaw = fs.readFileSync(chessJsonPath, 'utf8');
      const chessBoards = JSON.parse(chessRaw);
      const initial = chessBoards.find((b: any) => b.id === 'initial');
      if (initial && Array.isArray(initial.positions)) {
        return initial.positions;
      }
    } catch (error) {
      // Optionally log error
    }
    return [];
  }
}
