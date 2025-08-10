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
      const { game, isNew } = await this.gameService.startOrJoinGame({ token });
      await this.sseService.sendGameStartMessages(game, this.userService);
      const response = await this.gameService.getGameResponse(game, token);
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
      await this.sseService.sendMoveMessages(game, user, this.userService);
      const response = await this.gameService.getGameResponse(game, user.token);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res
        .status(error.status || HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @Get('status')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getGameByToken(@Req() req: any, @Res() res: Response) {
    try {
      const token = req.user?.token;
      if (!token) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Missing authorization token' });
      }

      // Always assign game, creating if not found
      const result = await this.gameService.findGameByToken(token)
        ?? await this.gameService.startOrJoinGame({ token });
      // result is either a Game or { game, isNew }
      const game = 'game' in result ? result.game : result;
      const isNew = 'isNew' in result ? result.isNew : false;
      // Determine color and opponent
      const color: 'white' | 'black' =
        game.white === token ? 'white' : game.black === token ? 'black' : 'white';
      const opponentToken = color === 'white' ? game.black : game.white;
      const opponentUser = opponentToken
        ? await this.userService.findByToken(opponentToken)
        : null;
      const opponentNickName = opponentUser?.nickName ?? null;

      // Custom message
      let message: string;
      if (game.moves.length === 0) {
        if (color === 'white') {
          message = !game.black
            ? "Waiting for a Black player to join..."
            : "A new game has started and it's your turn!";
        } else {
          message = "Waiting for White to make the first move...";
        }
      } else {
        const turn = game.moves.length % 2 === 0 ? 'white' : 'black';
        if (color === turn) {
          message = "It's your turn!";
        } else {
          message = "Waiting for opponent to move...";
        }
      }
      return res.status(HttpStatus.OK).json({
        message,
        status: game.status,
        color,
        opponent: opponentNickName,
        board: game.board,
        isNew,
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
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
}
