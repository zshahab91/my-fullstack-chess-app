import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { SseService } from '../sse/sse.service'; // Import SseService

@Module({
  controllers: [GameController],
  providers: [GameService, SseService], // Add SseService here
})
export class GameModule {}
