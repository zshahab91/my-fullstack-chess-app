import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourtPieceController } from './court-piece.controller';
import { CourtPieceService } from './court-piece.service';
import { CourtPieceGame, CourtPieceGameSchema } from './schemas/court-piece-game.schema';
import { SseModule } from '../sse/sse.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    SseModule,
    UserModule,
    MongooseModule.forFeature([
      { name: CourtPieceGame.name, schema: CourtPieceGameSchema },
    ]),
  ],
  controllers: [CourtPieceController],
  providers: [CourtPieceService],
  exports: [CourtPieceService],
})
export class CourtPieceModule {}
