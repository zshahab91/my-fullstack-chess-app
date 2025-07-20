import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('start')
  start(): string {
    return this.appService.start();
  }
  @Get('board/:id')
  getBoard(@Param('id') id: string): any {
    const dbPath = path.join(__dirname, '..', 'db', 'chess.json');
    let boardsData: any[];
    try {
      const data = fs.readFileSync(dbPath, 'utf8');
      boardsData = JSON.parse(data);
    } catch (error) {
      console.error('Error reading chess data:', error);
      return { error: 'Error reading chess data' };
    }
    console.log('Boards Data:', boardsData);
    if (!Array.isArray(boardsData)) {
      return { error: 'Invalid chess data format' };
    }
    const board = boardsData.find((b: { id: string }) => b.id === id);
    if (!board) {
      return { error: 'Board not found' };
    }
    return board;
  }
}
