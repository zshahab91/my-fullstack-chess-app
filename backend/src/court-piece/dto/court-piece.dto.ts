export type CourtPieceSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type CourtPieceRank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export interface CourtPieceCardDto {
  id: string;
  suit: CourtPieceSuit;
  rank: CourtPieceRank;
  label: string;
}

export interface CourtPiecePlayerDto {
  token: string;
  nickName: string;
  isAI: boolean;
  seatIndex: number;
  hand: CourtPieceCardDto[];
  score: number;
  tricksWon: number;
}

export interface CourtPiecePlayedCardDto {
  token: string;
  nickName: string;
  seatIndex: number;
  card: CourtPieceCardDto;
}

export interface CourtPieceGameDto {
  id: string;
  createdAt: string;
  updatedAt?: string;
  status: 'in-progress' | 'finished';
  trumpSuit: CourtPieceSuit;
  currentTurnToken: string | null;
  currentTurnIndex: number;
  leadSuit: CourtPieceSuit | null;
  currentTrick: CourtPiecePlayedCardDto[];
  players: CourtPiecePlayerDto[];
  winnerToken: string | null;
}

export interface CourtPiecePlayerViewDto {
  token: string;
  nickName: string;
  isAI: boolean;
  isHuman: boolean;
  seatIndex: number;
  handCount: number;
  score: number;
  tricksWon: number;
}

export interface CourtPieceGameResponseDto {
  status: 'in-progress' | 'finished';
  trumpSuit: CourtPieceSuit;
  currentTurn: CourtPiecePlayerViewDto | null;
  leadSuit: CourtPieceSuit | null;
  currentTrick: CourtPiecePlayedCardDto[];
  players: CourtPiecePlayerViewDto[];
  hand: CourtPieceCardDto[];
  winner: CourtPiecePlayerViewDto | null;
  isNew: boolean;
  message?: string;
}
