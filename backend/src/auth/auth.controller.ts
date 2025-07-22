import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string}) {
    const { username } = body;
    // Generate JWT token
    const token = jwt.sign(
      { username: username },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '5h' }
    );
    return { message: 'Login successful', token };
  }
}