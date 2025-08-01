import { Controller, Post, Req, Res, HttpStatus, Patch } from '@nestjs/common';
import { GameService } from './game.service';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { SseService } from '../sse/sse.service'; // Import SseService
import { UserService } from 'src/user/user.service';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly sseService: SseService,
    private readonly userService: UserService,
  ) {}

  @Post('start')
  async start(@Req() req: any, @Res() res: Response) {
    const user = req.user; // user info from middleware
    // Use GameService to find a waiting game
    let game = this.gameService.findWaitingGame();

    if (game) {
      if (game.white === user.token) {
        // Use pushOrUpdateGame instead of pushing directly and saving manually
        this.gameService.pushOrUpdateGame(game);
        this.sseService.sendToClient(game.white, {
          message:
            'You are now playing as White but we need a black player to start the game!',
          status: game.status,
          color: game.white === user.token ? 'white' : 'black',
          opponent: null,
        });

        return res.status(HttpStatus.OK).json({
          color: 'white',
          status: game.status,
        });
      }
      // Update game with black player
      game.black = user.token;
      game.status = 'in-progress';
      game.updatedAt = new Date().toISOString();
      const blackPlayer = this.userService.findUserByToken(game.black);
      const whitePlayer = this.userService.findUserByToken(game.white);
      this.sseService.sendToClient(game.white, {
        message: 'A new game has started, please join!',
        status: game.status,
        color: game.white === user.token ? 'white' : 'black',
        opponent: blackPlayer ? blackPlayer.nickName : null,
        board: game.board,
      });
      this.sseService.sendToClient(game.black, {
        message:
          'You are now playing as Black player, please wait for White to make a move!',
        status: game.status,
        color: game.white === user.token ? 'white' : 'black',
        opponent: whitePlayer ? whitePlayer.nickName : null,
        board: game.board,
      });
      // Save updated game
      this.gameService.pushOrUpdateGame(game);
    } else {
      // Use GameService to get the initial board from chess.json
      const initialBoard = this.gameService.findInitialBoard();
      game = {
        id: Date.now().toString(),
        white: user.token,
        black: null,
        createdAt: new Date().toISOString(),
        moves: [],
        board: initialBoard,
        status: 'waiting',
      };
      // Use pushOrUpdateGame for new game
      this.gameService.pushOrUpdateGame(game);
    }

    return res.status(HttpStatus.OK).json({
      color: game.white === user.token ? 'white' : 'black',
      status: game.status,
    });
  }
  @Patch('move')
  async move(@Req() req: any, @Res() res: Response) {
    const user = req.user; // user info from middleware
    const { move } = req.body;
    const userToken = user.token;

    if (!move) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Move is required' });
    }

    // Prepare db paths
    const dbDir = path.join(__dirname, '..', 'db');
    const dbPath = path.join(dbDir, 'games.json');

    // Read existing gamesData
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

    // Find the game by ID
    const gameIndex = gamesData.findIndex(
      (g) => g.white === userToken || g.black === userToken,
    );
    if (gameIndex === -1) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ error: 'Game not found for this user' });
    }
    const game = gamesData[gameIndex];
    if (game.status !== 'in-progress') {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Game is not in progress' });
    }

    // Check if the user is allowed to make a move
    if (
      (game.white === user.token && game.moves.length % 2 === 0) ||
      (game.black === user.token && game.moves.length % 2 === 1)
    ) {
      return res.status(HttpStatus.FORBIDDEN).json({
        error: 'It is not your turn to make a move',
      });
    }

    // Update the game with the new move
    game.moves.push(move);
    game.board = this.gameService.applyMove(game.board, move);
    game.updatedAt = new Date().toISOString();

    // Save updated gamesData
    try {
      fs.writeFileSync(dbPath, JSON.stringify(gamesData, null, 2), 'utf8');
      this.sseService.sendToClient(game.white, {
        message: `Move made by ${user.nickName}`,
        status: game.status,
        board: game.board,
      });
      this.sseService.sendToClient(game.black, {
        message: `Move made by ${user.nickName}`,
        status: game.status,
        board: game.board,
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: `Error writing chess data: ${error}` });
    }
    return res.status(HttpStatus.OK).json({
      message: 'Move made successfully',
      board: game.board,
      status: game.status,
    });
  }
}
