import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Board extends Document {
  @Prop({ required: true })
  declare id: string;

  @Prop({ type: [Object], required: true })
  positions: any[];
}

export const BoardSchema = SchemaFactory.createForClass(Board);