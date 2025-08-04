import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { GameResponseDto } from './dto/game-response.dto';
import { GameDto, MoveDto } from './dto/game.dto';
import { StartGameRequestDto } from './dto/start-game-request.dto';
import { UserService } from 'src/user/user.service';
import { Chess } from 'chess.js';

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
    this.ensureDbDir();
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(games, null, 2), 'utf8');
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
    const games = this.readGames();
    const idx = games.findIndex((g) => g.id === game.id);
    if (idx !== -1) {
      games[idx] = game;
    } else {
      games.push(game);
    }
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

  async makeMove(move: MoveDto, userToken: string): Promise<{ game: any; user: any }> {
    const games = this.readGames();
    const gameIndex = games.findIndex(
      (g) => g.white === userToken || g.black === userToken,
    );
    if (gameIndex === -1) {
      throw new HttpException('Game not found for this user', HttpStatus.NOT_FOUND);
    }
    const game = games[gameIndex];

    // Validate turn
    const isWhiteTurn = game.moves.length % 2 === 0;
    if (
      (isWhiteTurn && game.white !== userToken) ||
      (!isWhiteTurn && game.black !== userToken)
    ) {
      throw new HttpException('It is not your turn to move', HttpStatus.FORBIDDEN);
    }

    const chess = new Chess(game.fen || undefined);

    // Validate and make the move
    const result = chess.move({ from: move.from, to: move.to, promotion: 'q' });
    if (!result) {
      console.error('Invalid move attempted:', move);
      throw new HttpException('Invalid move according to chess rules', HttpStatus.BAD_REQUEST);
    }

    // Update game state
    game.moves.push(move);
    game.board = chess.board().flat().filter(Boolean).map((p: any) => ({
      piece: p.type,
      color: p.color,
      position: p.square,
    }));
    game.fen = chess.fen();
    game.status = chess.isGameOver() ? 'finished' : 'in-progress';
    game.updatedAt = new Date().toISOString();

    games[gameIndex] = game;
    this.writeGames(games);

    const user = this.userService.findUserByToken(userToken);

    return { game, user };
  }

  startOrJoinGame(startGameDto: StartGameRequestDto): { game: any; isNew: boolean } {
    const token = startGameDto.token;
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
    if (!game || !game.moves) {
      return 'white'; // Default to white if no moves exist
    }
    return (game.moves?.length ?? 0) % 2 === 0 ? 'white' : 'black';
  }
}
