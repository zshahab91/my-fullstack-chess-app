import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { GameResponseDto } from './dto/game-response.dto';
import { GameDto, MoveDto } from './dto/game.dto';
import { StartGameRequestDto } from './dto/start-game-request.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GameService {
  private dbDir = path.join(__dirname, '..', 'db');
  private dbPath = path.join(this.dbDir, 'games.json');


  constructor(private readonly userService: UserService) {
    this.readGames(); // This will ensure dbDir and games.json exist
  }

  private ensureDbDir() {
    if (!fs.existsSync(this.dbDir)) {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }
    // Ensure games.json exists
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, '[]', 'utf8');
    }
  }

  private readGames(): any[] {
    this.ensureDbDir();
    try {
      const gamesRaw = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(gamesRaw) || [];
    } catch {
      return [];
    }
  }

  private writeGames(games: any[]) {
    console.log('Writing games.json with', games.length, 'games');
    this.ensureDbDir();
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(games, null, 2), 'utf8');
      console.log('games.json updated:', games.length, 'games');
    } catch (err) {
      console.error('Failed to write games.json:', err);
    }
  }

  findGameByToken(token: string) {
    const games = this.readGames();
    return games.find((g) => g.white === token || g.black === token) || null;
  }

  findWaitingGame() {
    const games = this.readGames();
    return games.find((g) => g.status === 'waiting') || null;
  }

  pushOrUpdateGame(game: any) {
    console.log('Pushing or updating game:', game);
    const games = this.readGames();
    const idx = games.findIndex((g) => g.id === game.id);
    if (idx !== -1) {
      games[idx] = game;
    } else {
      games.push(game);
    }
    console.log('Updated games.json with', games.length, 'games');
    this.writeGames(games);
  }

  findInitialBoard() {
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
      console.error('Error reading initial chess board:', error);
    }
    return [];
  }

  applyMove(board: any[], move: MoveDto) {
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

  getGameResponse(game: any, userToken: string): GameResponseDto {
    return {
      color: game.white === userToken ? 'white' : 'black',
      status: game.status,
      board: game.board,
      opponent: game.white === userToken
        ? (game.black ? this.userService.findUserByToken(game.black)?.nickName : null)
        : (game.white ? this.userService.findUserByToken(game.white)?.nickName : null),
    };
  }

  updateGameWithMove(userToken: string, move: MoveDto) {
    const games = this.readGames();
    const gameIndex = games.findIndex(
      (g) => g.white === userToken || g.black === userToken,
    );
    if (gameIndex === -1) {
      throw new Error('Game not found for this user');
    }
    const game = games[gameIndex];
    if (game.status !== 'in-progress') {
      throw new Error('Game is not in progress');
    }
    // Check turn logic here if needed

    game.moves.push(move);
    game.board = this.applyMove(game.board, move);
    game.updatedAt = new Date().toISOString();
    games[gameIndex] = game;
    this.writeGames(games);
    return game;
  }

  async makeMove(move: MoveDto, userToken: string): Promise<{ game: any; user: any }> {
    // Find the game for this user
    const games = this.readGames();
    const gameIndex = games.findIndex(
      (g) => g.white === userToken || g.black === userToken,
    );
    if (gameIndex === -1) {
      throw { status: 404, message: 'Game not found for this user' };
    }
    const game = games[gameIndex];

    // Validate turn (optional: add your own logic)
    const isWhiteTurn = game.moves.length % 2 === 0;
    if (
      (isWhiteTurn && game.white !== userToken) ||
      (!isWhiteTurn && game.black !== userToken)
    ) {
      throw { status: 403, message: 'It is not your turn to move' };
    }

    // Apply the move (implement your own logic in applyMove)
    game.moves.push(move);
    game.board = this.applyMove(game.board, move);
    game.updatedAt = new Date().toISOString();

    // Save the updated game
    games[gameIndex] = game;
    this.writeGames(games);

    // Get user info
    const user = this.userService.findUserByToken(userToken);

    return { game, user };
  }

  startOrJoinGame(token: string): { game: any; isNew: boolean } {
    let game = this.findGameByToken(token);
    if (game) {
      return { game, isNew: false };
    }

    // Try to join a waiting game
    game = this.findWaitingGame();
    if (game) {
      game.black = token;
      game.status = 'in-progress';
      game.updatedAt = new Date().toISOString();
      this.pushOrUpdateGame(game);
      return { game, isNew: false };
    }

    // Create a new game
    const initialBoard = this.findInitialBoard();
    game = {
      id: Date.now().toString(),
      white: token,
      black: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      moves: [],
      board: initialBoard,
      status: 'waiting',
    };
    this.pushOrUpdateGame(game);
    return { game, isNew: true };
  }

  getTurn(game: GameDto): 'white' | 'black' {
    return (game.moves?.length ?? 0) % 2 === 0 ? 'white' : 'black';
  }
}
