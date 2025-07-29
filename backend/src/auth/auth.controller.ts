import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { nickName: string }, @Res() res: Response) {
    try {
      const { nickName } = body;
      if (!nickName) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Nick Name is required' });
      }
      // Generate opaque token using uuid
      const token = uuidv4();
      // Set expiresAt to 5 hours from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();

      // Prepare user data
      const userData = { nickName, token, expiresAt };

      // Prepare users.json path
      const dbDir = path.join(__dirname, '..', 'db');
      const usersPath = path.join(dbDir, 'users.json');

      // Ensure db directory exists
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Read existing users or initialize
      let users: any[] = [];
      if (fs.existsSync(usersPath)) {
        try {
          const usersRaw = fs.readFileSync(usersPath, 'utf8');
          users = JSON.parse(usersRaw) || [];
        } catch (error) {
          // If error reading, reset users to empty array
          users = [];
        }
      }

      // Add or update user by nickName
      const existingIndex = users.findIndex((u) => u.nickName === nickName);
      if (existingIndex !== -1) {
        users[existingIndex] = userData;
      } else {
        users.push(userData);
      }

      // Save users back to file
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');

      return res.status(HttpStatus.OK).json({ message: 'Login successful', token });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
}