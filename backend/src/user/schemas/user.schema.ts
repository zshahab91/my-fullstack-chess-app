import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  declare id: string;

  @Prop({ required: true, unique: true })
  nickName: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ default: null })
  gameId?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  expiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
