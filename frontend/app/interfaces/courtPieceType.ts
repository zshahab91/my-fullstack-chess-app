export type CourtPieceSuit = "hearts" | "diamonds" | "clubs" | "spades";

export type CourtPieceRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export type CourtPieceCard = {
  id: string;
  suit: CourtPieceSuit;
  rank: CourtPieceRank;
  label: string;
};

export type CourtPiecePlayedCard = {
  token: string;
  nickName: string | null;
  card: CourtPieceCard;
};

export type CourtPieceScore = {
  white: number;
  black: number;
};

export type CourtPieceGameResponse = {
  color: "white" | "black";
  status: "waiting" | "in-progress" | "finished";
  trumpSuit: CourtPieceSuit;
  currentTurn: "white" | "black" | null;
  leadSuit: CourtPieceSuit | null;
  currentTrick: CourtPiecePlayedCard[];
  hand: CourtPieceCard[];
  scores: CourtPieceScore;
  trickWins: CourtPieceScore;
  opponent: string | null;
  winner: "white" | "black" | null;
  isNew: boolean;
  message?: string;
};

export type CourtPieceStartResponse = {
  game: CourtPieceGameResponse;
  isNew: boolean;
};
