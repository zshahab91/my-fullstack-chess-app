import axios from "axios";
import {
  isAxiosErrorWithBackendError,
  setAuthToken as setInterceptorAuthToken,
} from "./apiInterceptor";
import type {
  GameResponse,
  Move,
  StartGameResponse,
} from "../interfaces/chessType";
import { cleanErrorMessage } from "../utils/global";

type CourtPieceSuit = "hearts" | "diamonds" | "clubs" | "spades";

type CourtPieceRank =
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

type CourtPieceCard = {
  id: string;
  suit: CourtPieceSuit;
  rank: CourtPieceRank;
  label: string;
};

type CourtPiecePlayer = {
  token: string;
  nickName: string;
  isAI: boolean;
  isHuman: boolean;
  seatIndex: number;
  handCount: number;
  score: number;
  tricksWon: number;
};

type CourtPiecePlayedCard = {
  token: string;
  nickName: string;
  seatIndex: number;
  card: CourtPieceCard;
};

type CourtPieceGameResponse = {
  status: "in-progress" | "finished";
  trumpSuit: CourtPieceSuit;
  currentTurn: CourtPiecePlayer | null;
  leadSuit: CourtPieceSuit | null;
  currentTrick: CourtPiecePlayedCard[];
  players: CourtPiecePlayer[];
  hand: CourtPieceCard[];
  winner: CourtPiecePlayer | null;
  isNew: boolean;
  message?: string;
};

type CourtPieceStartResponse = {
  game: CourtPieceGameResponse;
  isNew: boolean;
};

const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3200/api"
    : "/api";

// Use NEXT_PUBLIC_API_URL when provided; otherwise use a safe environment-based fallback.
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
const setAuthToken = (token: string) => {
  setInterceptorAuthToken(token);
};

const getOidcStartUrl = (returnTo: string) => {
  return `${API_BASE_URL}/user/login/oidc/start?returnTo=${encodeURIComponent(returnTo)}`;
};

export const apiService = {
  getAllBoards: async () => {
    const res = await axios.get(`${API_BASE_URL}/boards`);
    return res.data;
  },
  getBoardByID: async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/boards/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithBackendError(error)) {
        const backendError = error.response.data.error;
        if (backendError) {
          throw new Error(cleanErrorMessage(backendError));
        }
      }
      throw new Error(
        cleanErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "An error occurred while fetching the board"
        )
      );
    }
  },
  login: async (nickName: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/login`, {
        nickName,
      });
      const { token } = response.data;
      if (!token) throw new Error("No token received from login");
      setAuthToken(token);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithBackendError(error)) {
        const backendError = error.response.data.error;
        if (backendError) {
          throw new Error(cleanErrorMessage(backendError));
        }
      }
      throw new Error(
        cleanErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "An error occurred while fetching the board"
        )
      );
    }
  },
  startGame: async (): Promise<StartGameResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/game/start`);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithBackendError(error)) {
        const backendError = error.response.data.error;
        if (backendError) {
          throw new Error(cleanErrorMessage(backendError));
        }
      }
      throw new Error(
        cleanErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "An error occurred while fetching the board"
        )
      );
    }
  },
  setAuthToken,
  getGameStatus: async (): Promise<GameResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/game/status`);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithBackendError(error)) {
        const backendError = error.response.data.error;
        if (backendError) {
          throw new Error(cleanErrorMessage(backendError));
        }
      }
      throw new Error(
        cleanErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "An error occurred while fetching the board"
        )
      );
    }
  },
  movePiece: async (move: Move) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/game/move`, { move });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithBackendError(error)) {
        const backendError = error.response.data.error;
        if (backendError) {
          throw new Error(cleanErrorMessage(backendError));
        }
      }
      throw new Error(
        cleanErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "An error occurred while fetching the board"
        )
      );
    }
  },
  startCourtPiece: async (): Promise<CourtPieceStartResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/court-piece/start`);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithBackendError(error)) {
        const backendError = error.response.data.error;
        if (backendError) {
          throw new Error(cleanErrorMessage(backendError));
        }
      }
      throw new Error(
        cleanErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "An error occurred while starting Court Piece"
        )
      );
    }
  },
  getCourtPieceStatus: async (): Promise<CourtPieceGameResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/court-piece/status`);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithBackendError(error)) {
        const backendError = error.response.data.error;
        if (backendError) {
          throw new Error(cleanErrorMessage(backendError));
        }
      }
      throw new Error(
        cleanErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "An error occurred while fetching Court Piece status"
        )
      );
    }
  },
  playCourtPieceCard: async (cardId: string): Promise<CourtPieceGameResponse> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/court-piece/play`, {
        cardId,
      });
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithBackendError(error)) {
        const backendError = error.response.data.error;
        if (backendError) {
          throw new Error(cleanErrorMessage(backendError));
        }
      }
      throw new Error(
        cleanErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "An error occurred while playing Court Piece"
        )
      );
    }
  },
  getOidcStartUrl,
};
