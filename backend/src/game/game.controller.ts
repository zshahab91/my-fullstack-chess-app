import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  Patch,
  UsePipes,
  ValidationPipe,
  Param,
  Get,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Response } from 'express';
import { SseService } from '../sse/sse.service'; // Import SseService
import { UserService } from 'src/user/user.service';
import { MoveRequestDto } from './dto/move-request.dto';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly sseService: SseService,
    private readonly userService: UserService,
  ) {}

  @Post('start')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async start(@Req() req: any, @Res() res: Response) {
    try {
      const token = req.user?.token;
      if (!token) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Missing authorization token' });
      }
      const { game, isNew } = this.gameService.startOrJoinGame({ token });
      this.sseService.sendGameStartMessages(game, this.userService);
      const response = this.gameService.getGameResponse(game, token);
      return res.status(HttpStatus.OK).json({ ...response, isNew });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @Patch('move')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async move(
    @Body() moveRequestDto: MoveRequestDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const token = req.user?.token;
      if (!token) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Missing authorization token' });
      }
      const { game, user } = await this.gameService.makeMove(
        moveRequestDto.move,
        token,
      );
      this.sseService.sendMoveMessages(game, user, this.userService);
      const response = this.gameService.getGameResponse(game, user.token);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res
        .status(error.status || HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @Get(':id')
  async getGameById(@Param('id') id: string, @Res() res: Response) {
    try {
      const game = this.gameService.findGameById(id);
      if (!game) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ error: 'Game not found' });
      }
      return res.status(HttpStatus.OK).json(game);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @Get('token')
  async getGameByToken(@Req() req: any, @Res() res: Response) {
    try {
      const token = req.user?.token;
      if (!token) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Missing authorization token' });
      }

      const game = this.gameService.findGameByToken(token);
      // If black player not joined yet, send waiting message
      if (!game.black || !game) {
        return res.status(HttpStatus.OK).json({
          message: 'Waiting for a Black player to join...',
          status: game.status,
          color: 'white',
          opponent: null,
          board: game.board,
          isNew: false,
        });
      }

      const response = this.gameService.getGameResponse(game, token);
      return res.status(HttpStatus.OK).json({ ...response, isNew: false });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
}
