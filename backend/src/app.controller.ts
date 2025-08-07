import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(): string {
    console.log('AppController: getHello called');
    return this.appService.start();
  }

  @Get('boards')
  getAllBoards(@Res() res: Response): any {
    const dbPath = path.join(__dirname, '..', 'db', 'chess.json');
    let boardsData: any[];
    try {
      const data = fs.readFileSync(dbPath, 'utf8');
      boardsData = JSON.parse(data);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: `Error reading chess data: ${error}` });
    }
    if (!Array.isArray(boardsData)) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Invalid chess data format' });
    }
    return res.status(HttpStatus.OK).json(boardsData.map((board: { id: string }) => ({ id: board.id })));
  }

  @Get('boards/:id')
  getBoard(@Param('id') id: string, @Res() res: Response): any {
    const dbPath = path.join(__dirname, '..', 'db', 'chess.json');
    let boardsData: any[];
    try {
      const data = fs.readFileSync(dbPath, 'utf8');
      boardsData = JSON.parse(data);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: `Error reading chess data: ${error}` });
    }
    if (!Array.isArray(boardsData)) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Invalid chess data format' });
    }
    const board = boardsData.find((b: { id: string }) => b.id === id);
    if (!board) {
      return res.status(HttpStatus.NOT_FOUND).json({ error: 'Board not found' });
    }
    return res.status(HttpStatus.OK).json(board);
  }
}
