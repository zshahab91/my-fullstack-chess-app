import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  use = async (req: any, res: any, next: () => void) => {
    console.log('UserMiddleware:', req.headers['authorization']);
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.replace('Bearer ', '');

    try {
      const user = await this.userModel.findOne({ token }).exec();
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
        return res.status(401).json({ error: 'Token expired' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Middleware error' });
    }
  }
}
