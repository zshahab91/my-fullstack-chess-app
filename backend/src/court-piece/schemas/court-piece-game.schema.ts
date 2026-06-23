import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  CourtPiecePlayerDto,
  CourtPiecePlayedCardDto,
  CourtPieceSuit,
} from '../dto/court-piece.dto';

@Schema({ timestamps: true })
export class CourtPieceGame extends Document {
  @Prop({ required: true })
  declare id: string;

  @Prop({ required: true })
  createdAt!: string;

  @Prop()
  updatedAt?: string;

  @Prop({ enum: ['in-progress', 'finished'], required: true })
  status!: 'in-progress' | 'finished';

  @Prop({ required: true })
  trumpSuit!: CourtPieceSuit;

  @Prop({ type: String, default: null })
  currentTurnToken!: string | null;

  @Prop({ type: Number, default: 0 })
  currentTurnIndex!: number;

  @Prop({ type: String, default: null })
  leadSuit!: CourtPieceSuit | null;

  @Prop({ type: [Object], default: [] })
  currentTrick!: CourtPiecePlayedCardDto[];

  @Prop({ type: [Object], default: [] })
  lastCompletedTrick!: CourtPiecePlayedCardDto[];

  @Prop({ type: [Object], default: [] })
  players!: CourtPiecePlayerDto[];

  @Prop({ type: String, default: null })
  winnerToken!: string | null;
}

export const CourtPieceGameSchema = SchemaFactory.createForClass(CourtPieceGame);
