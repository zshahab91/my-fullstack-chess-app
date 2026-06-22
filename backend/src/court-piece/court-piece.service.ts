import {
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CourtPieceGame } from './schemas/court-piece-game.schema';
import {
  CourtPieceCardDto,
  CourtPieceGameDto,
  CourtPieceGameResponseDto,
  CourtPiecePlayerDto,
  CourtPiecePlayerViewDto,
  CourtPiecePlayedCardDto,
  CourtPieceRank,
  CourtPieceSuit,
} from './dto/court-piece.dto';
import { StartCourtPieceRequestDto } from './dto/start-court-piece-request.dto';

const SUITS: CourtPieceSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: CourtPieceRank[] = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
];
const RANK_POWER: Record<CourtPieceRank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

type CourtPieceActionResult = {
  trickCompleted: boolean;
  winnerToken?: string | null;
};

@Injectable()
export class CourtPieceService {
  constructor(
    private readonly userService: UserService,
    @InjectModel(CourtPieceGame.name)
    private courtPieceGameModel: Model<CourtPieceGame>,
  ) {}

  private createCard(
    suit: CourtPieceSuit,
    rank: CourtPieceRank,
  ): CourtPieceCardDto {
    const suitSymbols: Record<CourtPieceSuit, string> = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠',
    };

    return {
      id: `${suit}-${rank}`,
      suit,
      rank,
      label: `${rank}${suitSymbols[suit]}`,
    };
  }

  private shuffleDeck(deck: CourtPieceCardDto[]): CourtPieceCardDto[] {
    const shuffled = [...deck];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }
    return shuffled;
  }

  private createDeck(): CourtPieceCardDto[] {
    return SUITS.flatMap((suit) =>
      RANKS.map((rank) => this.createCard(suit, rank)),
    );
  }

  private createAiPlayer(seatIndex: number): CourtPiecePlayerDto {
    return {
      token: `court-piece-ai-${seatIndex + 1}`,
      nickName: `Computer ${seatIndex + 1}`,
      isAI: true,
      seatIndex,
      hand: [],
      score: 0,
      tricksWon: 0,
    };
  }

  private createHumanPlayer(
    token: string,
    nickName: string,
    seatIndex: number,
  ): CourtPiecePlayerDto {
    return {
      token,
      nickName,
      isAI: false,
      seatIndex,
      hand: [],
      score: 0,
      tricksWon: 0,
    };
  }

  private getPlayerByToken(game: CourtPieceGameDto, token: string) {
    const player = game.players.find((entry) => entry.token === token);
    if (!player) {
      throw new HttpException(
        'Game not found for this user',
        HttpStatus.NOT_FOUND,
      );
    }

    return player;
  }

  private getCurrentPlayer(game: CourtPieceGameDto) {
    if (!game.currentTurnToken) {
      return null;
    }

    return game.players.find((entry) => entry.token === game.currentTurnToken) ?? null;
  }

  private getLeadSuit(game: CourtPieceGameDto) {
    return game.currentTrick[0]?.card.suit ?? game.leadSuit;
  }

  private getLegalCards(game: CourtPieceGameDto, player: CourtPiecePlayerDto) {
    const leadSuit = this.getLeadSuit(game);
    if (!leadSuit || game.currentTrick.length === 0) {
      return player.hand;
    }

    const matchingLeadSuit = player.hand.filter(
      (candidate) => candidate.suit === leadSuit,
    );
    return matchingLeadSuit.length > 0 ? matchingLeadSuit : player.hand;
  }

  private getNextSeatIndex(game: CourtPieceGameDto, seatIndex: number) {
    return (seatIndex + 1) % game.players.length;
  }

  private determineTrickWinner(
    trick: CourtPiecePlayedCardDto[],
    trumpSuit: CourtPieceSuit,
    leadSuit: CourtPieceSuit,
  ): CourtPiecePlayedCardDto {
    const playable = trick.filter(
      (playedCard) =>
        playedCard.card.suit === trumpSuit || playedCard.card.suit === leadSuit,
    );

    const rankedPlays = playable.length > 0 ? playable : trick;
    return rankedPlays.reduce((best, current) => {
      const bestCard = best.card;
      const currentCard = current.card;

      const bestIsTrump = bestCard.suit === trumpSuit;
      const currentIsTrump = currentCard.suit === trumpSuit;

      if (bestIsTrump && !currentIsTrump) {
        return best;
      }
      if (!bestIsTrump && currentIsTrump) {
        return current;
      }
      if (bestCard.suit === currentCard.suit) {
        return RANK_POWER[bestCard.rank] >= RANK_POWER[currentCard.rank]
          ? best
          : current;
      }
      if (bestCard.suit === leadSuit) {
        return best;
      }
      if (currentCard.suit === leadSuit) {
        return current;
      }
      return RANK_POWER[bestCard.rank] >= RANK_POWER[currentCard.rank]
        ? best
        : current;
    });
  }

  private getWinnerPlayer(game: CourtPieceGameDto) {
    if (!game.winnerToken) {
      return null;
    }

    return game.players.find((player) => player.token === game.winnerToken) ?? null;
  }

  private async buildResponse(
    game: CourtPieceGameDto,
    token: string,
    message?: string,
  ): Promise<CourtPieceGameResponseDto> {
    const player = this.getPlayerByToken(game, token);
    const currentTurn = this.getCurrentPlayer(game);
    const winner = this.getWinnerPlayer(game);
    const humanView = game.players.map((entry) => ({
      token: entry.token,
      nickName: entry.nickName,
      isAI: entry.isAI,
      isHuman: entry.token === token,
      seatIndex: entry.seatIndex,
      handCount: entry.hand.length,
      score: entry.score,
      tricksWon: entry.tricksWon,
    }));

    return {
      status: game.status,
      trumpSuit: game.trumpSuit,
      currentTurn: currentTurn
        ? {
            token: currentTurn.token,
            nickName: currentTurn.nickName,
            isAI: currentTurn.isAI,
            isHuman: !currentTurn.isAI,
            seatIndex: currentTurn.seatIndex,
            handCount: currentTurn.hand.length,
            score: currentTurn.score,
            tricksWon: currentTurn.tricksWon,
          }
        : null,
      leadSuit: game.leadSuit,
      currentTrick: game.currentTrick,
      players: humanView,
      hand: player.hand,
      winner: winner
        ? {
            token: winner.token,
            nickName: winner.nickName,
            isAI: winner.isAI,
            isHuman: !winner.isAI,
            seatIndex: winner.seatIndex,
            handCount: winner.hand.length,
            score: winner.score,
            tricksWon: winner.tricksWon,
          }
        : null,
      isNew: false,
      message,
    };
  }

  async findGameByToken(token: string): Promise<CourtPieceGame | null> {
    return this.courtPieceGameModel
      .findOne({ 'players.token': token })
      .exec();
  }

  async findGameById(id: string): Promise<CourtPieceGame | null> {
    return this.courtPieceGameModel.findOne({ id }).exec();
  }

  private createInitialGame(token: string, nickName: string): CourtPieceGame {
    const deck = this.shuffleDeck(this.createDeck());
    const players = [
      this.createHumanPlayer(token, nickName, 0),
      this.createAiPlayer(1),
      this.createAiPlayer(2),
      this.createAiPlayer(3),
    ];

    players.forEach((player, index) => {
      player.hand = deck.slice(index * 13, (index + 1) * 13);
    });

    return new this.courtPieceGameModel({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'in-progress',
      trumpSuit: SUITS[Math.floor(Math.random() * SUITS.length)],
      currentTurnToken: token,
      currentTurnIndex: 0,
      leadSuit: null,
      currentTrick: [],
      players,
      winnerToken: null,
    });
  }

  private hasLegalPlay(game: CourtPieceGameDto, player: CourtPiecePlayerDto) {
    return this.getLegalCards(game, player).length > 0;
  }

  private finishGameIfNeeded(game: CourtPieceGameDto) {
    const allHandsEmpty = game.players.every((player) => player.hand.length === 0);
    if (!allHandsEmpty) {
      return;
    }

    game.status = 'finished';
    const sortedPlayers = [...game.players].sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return right.tricksWon - left.tricksWon;
    });

    const topPlayer = sortedPlayers[0];
    const tiedTopPlayers = sortedPlayers.filter(
      (entry) => entry.score === topPlayer.score && entry.tricksWon === topPlayer.tricksWon,
    );
    game.winnerToken = tiedTopPlayers.length === 1 ? topPlayer.token : null;
    game.currentTurnToken = null;
  }

  private resolveTrick(game: CourtPieceGameDto) {
    const leadSuit = game.leadSuit ?? game.currentTrick[0]?.card.suit;
    if (!leadSuit) {
      return;
    }

    const winningPlay = this.determineTrickWinner(
      game.currentTrick,
      game.trumpSuit,
      leadSuit,
    );
    const winner = game.players.find((entry) => entry.token === winningPlay.token);
    if (!winner) {
      return;
    }

    winner.tricksWon += 1;
    winner.score += 1;
    game.currentTrick = [];
    game.leadSuit = null;
    game.currentTurnIndex = winner.seatIndex;
    game.currentTurnToken = winner.token;
    this.finishGameIfNeeded(game);
  }

  private playCardForPlayer(
    game: CourtPieceGameDto,
    token: string,
    cardId: string,
  ): CourtPieceActionResult {
    const player = this.getPlayerByToken(game, token);
    if (game.currentTurnToken !== token) {
      throw new HttpException('It is not your turn', HttpStatus.FORBIDDEN);
    }

    const cardIndex = player.hand.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) {
      throw new HttpException('Card not found in your hand', HttpStatus.NOT_FOUND);
    }

    const card = player.hand[cardIndex];
    const leadSuit = this.getLeadSuit(game);
    if (leadSuit) {
      const matchingLeadSuit = player.hand.filter((candidate) => candidate.suit === leadSuit);
      if (matchingLeadSuit.length > 0 && card.suit !== leadSuit) {
        throw new HttpException(
          `You must follow the lead suit: ${leadSuit}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    player.hand.splice(cardIndex, 1);
    game.currentTrick.push({
      token: player.token,
      nickName: player.nickName,
      seatIndex: player.seatIndex,
      card,
    });

    if (game.currentTrick.length === 4) {
      this.resolveTrick(game);
      return { trickCompleted: true };
    }

    game.currentTurnIndex = this.getNextSeatIndex(game, player.seatIndex);
    const nextPlayer = game.players[game.currentTurnIndex];
    game.currentTurnToken = nextPlayer.token;
    game.leadSuit = game.currentTrick.length === 1 ? card.suit : game.leadSuit;

    return { trickCompleted: false };
  }

  private chooseAiCard(game: CourtPieceGameDto, player: CourtPiecePlayerDto) {
    const legalCards = this.getLegalCards(game, player);
    return legalCards[Math.floor(Math.random() * legalCards.length)];
  }

  private async advanceAiTurns(game: CourtPieceGameDto) {
    let safetyCounter = 0;

    while (game.status === 'in-progress' && safetyCounter < 100) {
      const currentPlayer = this.getCurrentPlayer(game);
      if (!currentPlayer || !currentPlayer.isAI) {
        break;
      }

      const aiCard = this.chooseAiCard(game, currentPlayer);
      if (!aiCard) {
        break;
      }

      this.playCardForPlayer(game, currentPlayer.token, aiCard.id);

      safetyCounter += 1;
    }

    return game;
  }

  async startOrJoinGame(
    startGameDto: StartCourtPieceRequestDto,
  ): Promise<{ game: CourtPieceGameDto; isNew: boolean }> {
    const token = startGameDto.token;
    let game = await this.findGameByToken(token);
    if (game) {
      const currentGame = game as CourtPieceGameDto;
      const afterAiTurns = await this.advanceAiTurns(currentGame);
      await this.courtPieceGameModel
        .findOneAndUpdate({ id: afterAiTurns.id }, afterAiTurns, { new: true })
        .exec();
      return { game: afterAiTurns, isNew: false };
    }

    const user = await this.userService.findByToken(token);
    const nickName = user?.nickName ?? 'Player';
    const newGame = this.createInitialGame(token, nickName);
    await newGame.save();

    if (newGame.players[0]?.token) {
      await this.userService.setGameId(newGame.players[0].token, newGame.id);
    }

    return { game: newGame as CourtPieceGameDto, isNew: true };
  }

  async getGameResponse(
    game: CourtPieceGameDto,
    token: string,
    message?: string,
  ): Promise<CourtPieceGameResponseDto> {
    return this.buildResponse(game, token, message);
  }

  async playCard(
    cardId: string,
    token: string,
  ): Promise<{ game: CourtPieceGameDto; user: any }> {
    const game = (await this.findGameByToken(token)) as CourtPieceGameDto | null;
    if (!game) {
      throw new HttpException('Game not found for this user', HttpStatus.NOT_FOUND);
    }

    if (game.status !== 'in-progress') {
      throw new HttpException('Game is not active', HttpStatus.BAD_REQUEST);
    }

    this.playCardForPlayer(game, token, cardId);
    await this.advanceAiTurns(game);

    game.updatedAt = new Date().toISOString();
    await this.courtPieceGameModel.findOneAndUpdate(
      { id: game.id },
      game,
      { new: true, upsert: true },
    ).exec();

    const user = await this.userService.findByToken(token);
    return { game, user };
  }

  async getGameStateForToken(token: string) {
    const game = (await this.findGameByToken(token)) as CourtPieceGameDto | null;
    if (!game) {
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }

    await this.advanceAiTurns(game);
    await this.courtPieceGameModel
      .findOneAndUpdate({ id: game.id }, game, { new: true, upsert: true })
      .exec();

    return this.getGameResponse(game, token);
  }
}
