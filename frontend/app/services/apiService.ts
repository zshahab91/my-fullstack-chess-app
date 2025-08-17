import axios from "axios";
import { isAxiosErrorWithBackendError, setAuthToken as setInterceptorAuthToken } from "./apiInterceptor";
import type { GameResponse, Move, StartGameResponse } from "../interfaces/chessType";
import { cleanErrorMessage } from "../utils/global";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3200/api"; // adjust port if needed

const setAuthToken = (token: string) => {
  setInterceptorAuthToken(token);
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
};
