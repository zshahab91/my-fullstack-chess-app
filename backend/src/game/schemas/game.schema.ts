import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MoveDto, BoardDto } from '../dto/game.dto';

@Schema({ timestamps: true })
export class Game extends Document {
  @Prop({ required: true })
  declare id: string;

  @Prop({ type: String, default: null })
  white: string | null;

  @Prop({ type: String, default: null })
  black: string | null;

  @Prop({ required: true })
  createdAt: string;

  @Prop()
  updatedAt?: string;

  @Prop({ type: [Object], default: [] })
  moves: MoveDto[];

  @Prop({ type: [Object], default: [] })
  board: BoardDto[];

  @Prop({ enum: ['waiting', 'in-progress', 'finished'], required: true })
  status: 'waiting' | 'in-progress' | 'finished';

  @Prop({ required: true, default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' })
  fen: string;
}

export const GameSchema = SchemaFactory.createForClass(Game);