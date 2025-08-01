import { Injectable, NestMiddleware } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.replace('Bearer ', '');

    // Read users.json
    const usersPath = path.join(__dirname, '..', 'db', 'users.json');
    let users: any[] = [];
    try {
      if (fs.existsSync(usersPath)) {
        const usersRaw = fs.readFileSync(usersPath, 'utf8');
        users = JSON.parse(usersRaw) || [];
      }
    } catch (error) {
      return res.status(500).json({ error: 'Error reading users data' });
    }

    // Find user by token and check expiration
    const user = users.find((u) => u.token === token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Token expired' });
    }

    req.user = user;
    next();
  }
}
