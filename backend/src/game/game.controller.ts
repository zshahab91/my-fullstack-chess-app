import { Body, Controller, Post, Req, Res, HttpStatus, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
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
  async start(
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const token = req.user?.token;
      if (!token) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing authorization token' });
      }
      const { game, isNew } = this.gameService.startOrJoinGame({token});
      this.sseService.sendGameStartMessages(game, this.userService);
      const response = this.gameService.getGameResponse(game, token);
      return res.status(HttpStatus.OK).json({ ...response, isNew });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  @Patch('move')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async move(
    @Body() moveRequestDto: MoveRequestDto,
    @Req() req: any,
    @Res() res: Response
  ) {
    try {
      console.log('Received move request:', moveRequestDto);
      const token = req.user?.token;
      if (!token) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing authorization token' });
      }
      const { game, user } = await this.gameService.makeMove(moveRequestDto.move, token);
      this.sseService.sendMoveMessages(game, user, this.userService);
      const response = this.gameService.getGameResponse(game, user.token);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
