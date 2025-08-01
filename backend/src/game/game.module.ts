import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { SseModule } from '../sse/sse.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [SseModule],
  controllers: [GameController],
  providers: [GameService, UserService],
  exports: [GameService],
})
export class GameModule {}
