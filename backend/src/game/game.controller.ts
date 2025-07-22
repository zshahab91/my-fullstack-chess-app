import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { GameService } from './game.service';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  async start(@Req() req: any, @Res() res: Response) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error: 'No token provided' });
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    } catch (e) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error: 'Invalid token' });
    }

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
    if (game ) {
      if (game.white === decoded.username) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'You are already in this game' });
      }
      // Update game with black player
      game.black = decoded.username || token;
      game.status = 'in-progress';
      game.updatedAt = new Date().toISOString();
    } else {
      game = {
        id: Date.now().toString(),
        white: decoded.username || token,
        black: null,
        createdAt: new Date().toISOString(),
        moves: [],
        board: [],
        status: 'waiting',
      };
      gamesData.push(game);
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
      color: game.white === decoded.username ? 'white' : 'black',
      status: game.status,
    });
  }
}
