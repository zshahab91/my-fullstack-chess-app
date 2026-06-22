import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';
import { CourtPieceService } from './court-piece.service';
import { StartCourtPieceRequestDto } from './dto/start-court-piece-request.dto';
import { PlayCardRequestDto } from './dto/play-card-request.dto';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected server error';
}

@Controller('court-piece')
export class CourtPieceController {
  constructor(private readonly courtPieceService: CourtPieceService) {}

  @Post('start')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async startGame(@Req() req: any, @Res() res: Response) {
    try {
      const token = req.user?.token;
      if (!token) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Missing authorization token' });
      }

      const { game, isNew } = await this.courtPieceService.startOrJoinGame({
        token,
      } as StartCourtPieceRequestDto);
      return res.status(HttpStatus.OK).json({ game, isNew });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: getErrorMessage(error) });
    }
  }

  @Get('status')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getGameStatus(@Req() req: any, @Res() res: Response) {
    try {
      const token = req.user?.token;
      if (!token) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Missing authorization token' });
      }

      const response = await this.courtPieceService.getGameStateForToken(token);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      return res
        .status(status)
        .json({ error: getErrorMessage(error) });
    }
  }

  @Patch('play')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async playCard(
    @Body() playCardRequestDto: PlayCardRequestDto,
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

      await this.courtPieceService.playCard(playCardRequestDto.cardId, token);
      const response = await this.courtPieceService.getGameStateForToken(token);
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      return res
        .status(status)
        .json({ error: getErrorMessage(error) });
    }
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getGameById(@Param('id') id: string, @Res() res: Response) {
    try {
      const game = await this.courtPieceService.findGameById(id);
      if (!game) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ error: 'Game not found' });
      }
      return res.status(HttpStatus.OK).json(game);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: getErrorMessage(error) });
    }
  }
}
