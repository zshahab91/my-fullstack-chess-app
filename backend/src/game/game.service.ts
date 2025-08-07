import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GameResponseDto } from './dto/game-response.dto';
import { GameDto, MoveDto } from './dto/game.dto';
import { StartGameRequestDto } from './dto/start-game-request.dto';
import { UserService } from 'src/user/user.service';
import { Chess } from 'chess.js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game } from './schemas/game.schema';
import { Board } from './schemas/board.schema';

@Injectable()
export class GameService {
  constructor(
    private readonly userService: UserService,
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(Board.name) private boardModel: Model<Board>,
  ) {}

  async findGameByToken(token: string): Promise<Game | null> {
    return this.gameModel.findOne({ $or: [{ white: token }, { black: token }] }).exec();
  }

  async findWaitingGame(): Promise<Game | null> {
    return this.gameModel.findOne({ status: 'waiting' }).exec();
  }

  async pushOrUpdateGame(game: Partial<Game>): Promise<Game> {
    if (game.id) {
      return this.gameModel.findOneAndUpdate({ id: game.id }, game, { new: true, upsert: true }).exec();
    } else {
      const createdGame = new this.gameModel(game);
      return createdGame.save();
    }
  }

  async findInitialBoard(): Promise<any[]> {
    const board = await this.boardModel.findOne({ id: 'initial' }).exec();
    return board?.positions ?? [];
  }

  async getGameResponse(game: GameDto, userToken: string): Promise<GameResponseDto> {
    const opponentToken = game.white === userToken ? game.black : game.white;
    let opponentNickName: string | null = null;
    if (opponentToken) {
      const opponentUser = await this.userService.findByToken(opponentToken);
      opponentNickName = opponentUser?.nickName ?? null;
    }
    return {
      color: game.white === userToken ? 'white' : 'black',
      status: game.status,
      board: game.board,
      opponent: opponentNickName,
    };
  }

  async makeMove(move: MoveDto, userToken: string): Promise<{ game: any; user: any }> {
    const game = await this.findGameByToken(userToken);
    console.log('GameService: makeMove called with move:', move, 'for user:', userToken);
    if (!game) {
      throw new HttpException('Game not found for this user', HttpStatus.NOT_FOUND);
    }

    // Validate turn
    const isWhiteTurn = game.moves.length % 2 === 0;
    if (
      (isWhiteTurn && game.white !== userToken) ||
      (!isWhiteTurn && game.black !== userToken)
    ) {
      throw new HttpException('It is not your turn to move', HttpStatus.FORBIDDEN);
    }

    const chess = new Chess(game.fen || undefined);

    // Validate and make the move
    const result = chess.move({ from: move.from, to: move.to, promotion: 'q' });
    if (!result) {
      console.error('Invalid move attempted:', move);
      throw new HttpException('Invalid move according to chess rules', HttpStatus.BAD_REQUEST);
    }

    // Update game state
    game.moves.push(move);
    game.board = [{
      id: 'current',
      positions: chess.board().flat().filter(Boolean).map((p: any) => ({
        piece: p.type,
        color: p.color,
        position: p.square,
      }))
    }];
    game.fen = chess.fen();
    game.status = chess.isGameOver() ? 'finished' : 'in-progress';
    game.updatedAt = new Date().toISOString();

    await game.save();

    const user = await this.userService.findByToken(userToken);

    return { game, user };
  }

  async startOrJoinGame(startGameDto: StartGameRequestDto): Promise<{ game: any; isNew: boolean }> {
    const token = startGameDto.token;
    let game = await this.findGameByToken(token);
    if (game) {
      return { game, isNew: false };
    }

    // Try to join a waiting game
    game = await this.findWaitingGame();
    if (game) {
      game.black = token;
      game.status = 'in-progress';
      game.updatedAt = new Date().toISOString();
      await game.save();
      return { game, isNew: false };
    }

    // Create a new game
    const initialBoard = await this.findInitialBoard();
    const newGame = new this.gameModel({
      id: Date.now().toString(),
      white: token,
      black: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      moves: [],
      board: initialBoard,
      status: 'waiting',
    });
    await newGame.save();
    console.log(`New game created with ID: ${newGame}`);
    return { game: newGame, isNew: true };
  }

  getTurn(game: GameDto): 'white' | 'black' {
    if (!game || !game.moves) {
      return 'white'; // Default to white if no moves exist
    }
    return (game.moves?.length ?? 0) % 2 === 0 ? 'white' : 'black';
  }

  async findGameById(id: string): Promise<Game | null> {
    return this.gameModel.findOne({ id }).exec();
  }
}
