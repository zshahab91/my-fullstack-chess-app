import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() body: { nickName: string }, @Res() res: Response) {
    try {
      const { nickName } = body;
      const result = this.userService.login({ nickName });
      if ('error' in result) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      }
      return res.status(HttpStatus.OK).json({ message: 'Login successful', token: result.token });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
}