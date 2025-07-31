import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { GameService } from './game.service';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { SseService } from '../sse/sse.service'; // Import SseService

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly sseService: SseService,
  ) {}

  @Post('start')
  async start(@Req() req: any, @Res() res: Response) {
    const user = req.user; // user info from middleware

    // Prepare db paths
    const dbDir = path.join(__dirname, '..', 'db');
    const dbPath = path.join(dbDir, 'games.json');

    // Read or initialize gamesData once
    let gamesData: any[] = [];
    try {
      if (fs.existsSync(dbPath)) {
        const gamesRaw = fs.readFileSync(dbPath, 'utf8');
        gamesData = JSON.parse(gamesRaw) || [];
      }
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: `Error reading chess data: ${error}` });
    }

    // Find or create a game
    let game = gamesData.find((g) => g.black === null);
    if (game) {
      if (game.white === user.token) {
        return res.status(HttpStatus.OK).json({
          color: 'white',
          status: game.status,
        });
      }
      // Update game with black player
      game.black = user.token;
      game.status = 'in-progress';
      game.updatedAt = new Date().toISOString();

      // Send SSE event just to the white player
      this.sseService.sendEvent(game.white, {
        message: 'A new game has started, please join!',
        status: game.status,
        color: 'white',
        name: user.nickName || 'Player',
      });
    } else {
      // Read initial board from chess.json
      let initialBoard: any[] = [];
      try {
        const chessJsonPath = path.join(__dirname, '../..', 'db', 'chess.json');
        if (fs.existsSync(chessJsonPath)) {
          const chessRaw = fs.readFileSync(chessJsonPath, 'utf8');
          const chessBoards = JSON.parse(chessRaw);
          const initial = chessBoards.find((b: any) => b.id === 'initial');
          if (initial && Array.isArray(initial.positions)) {
            initialBoard = initial.positions;
          }
        }
      } catch (error) {
        // fallback to empty board if error
        initialBoard = [];
      }

      game = {
        id: Date.now().toString(),
        white: user.token,
        black: null,
        createdAt: new Date().toISOString(),
        moves: [],
        board: initialBoard,
        status: 'waiting',
      };
      gamesData.push(game);
       this.sseService.sendEvent(game.white, {
        message: 'A new game has started, please join!',
        status: game.status,
        color: 'test',
        name: user.nickName || 'Player',
      });
    }

    // Save updated gamesData
    try {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(gamesData, null, 2), 'utf8');
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: `Error writing chess data: ${error}` });
    }

    return res.status(HttpStatus.OK).json({
      color: game.white === user.token ? 'white' : 'black',
      status: game.status,
      board: game.board,
    });
  }
}
