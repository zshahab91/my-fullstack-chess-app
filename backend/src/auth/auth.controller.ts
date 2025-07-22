import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string }, @Res() res: Response) {
    try {
      const { username } = body;
      if (!username) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Username is required' });
      }
      // Generate JWT token
      const token = jwt.sign(
        { username: username },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '5h' }
      );
      return res.status(HttpStatus.OK).json({ message: 'Login successful', token });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
}