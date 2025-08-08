import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async findByToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ token }).exec();
  }

  async findByNickName(nickName: string): Promise<User | null> {
    return this.userModel.findOne({ nickName }).exec();
  }
  async setGameId(token: string, gameId: string): Promise<void> {
    await this.userModel.findOneAndUpdate({ token }, { gameId }).exec();
  }

  async login({
    nickName,
  }: {
    nickName: string;
  }): Promise<{ token: string } | { error: string }> {
    // Example logic: find user or create new one
    let user = await this.findByNickName(nickName);
    if (!user) {
      // Generate a token (use a proper method in production)
      const token = Math.random().toString(36).substring(2);
      user = await this.create({ nickName, token, id: uuidv4() });
    }
    if (!user) {
      return { error: 'Login failed' };
    }
    return { token: user.token };
  }
}
