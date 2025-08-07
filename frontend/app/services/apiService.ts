import axios from "axios";
import { setAuthToken as setInterceptorAuthToken } from "./apiInterceptor";
import type { GameResponse, Move } from '../interfaces/chessType';
import { cleanErrorMessage } from "../utils/global";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100/api"; // adjust port if needed


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
      // Axios wraps backend errors in error.response
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response.data &&
        (error as any).response.data.error
      ) {
        // This is the backend error message
        throw new Error(cleanErrorMessage((error as any).response.data.error));
      }
      // Otherwise, throw the generic error
      throw new Error(
        cleanErrorMessage(
          (typeof error === "object" && error !== null && "message" in error)
            ? (error as any).message
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
      if (!token) {
        throw new Error("No token received from login");
      }
      setAuthToken(token);
      return response.data;
    } catch (error: unknown) {
      // Axios wraps backend errors in error.response
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response.data &&
        (error as any).response.data.error
      ) {
        // This is the backend error message
        throw new Error(cleanErrorMessage((error as any).response.data.error));
      }
      // Otherwise, throw the generic error
      throw new Error(
        cleanErrorMessage(
          (typeof error === "object" && error !== null && "message" in error)
            ? (error as any).message
            : "An error occurred while logging in"
        )
      );
    }
  },
  setAuthToken,
  startGame: async (): Promise<GameResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/game/start`);
      return response.data;
    } catch (error: unknown) {
      // Axios wraps backend errors in error.response
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response.data &&
        (error as any).response.data.error
      ) {
        // This is the backend error message
        throw new Error(cleanErrorMessage((error as any).response.data.error));
      }
      // Otherwise, throw the generic error
      throw new Error(
        cleanErrorMessage(
          (typeof error === "object" && error !== null && "message" in error)
            ? (error as any).message
            : "An error occurred while starting the game"
        )
      );
    }
  },
  movePiece: async (move: Move) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/game/move`, { move });
      return response.data;
    } catch (error: unknown) {
      // Axios wraps backend errors in error.response
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response.data &&
        (error as any).response.data.error
      ) {
        // This is the backend error message
        throw new Error(cleanErrorMessage((error as any).response.data.error));
      }
      // Otherwise, throw the generic error
      throw new Error(
        cleanErrorMessage(
          (typeof error === "object" && error !== null && "message" in error)
            ? (error as any).message
            : "An error occurred while moving the piece"
        )
      );
    }
  },
  getGameByToken: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/game/status`);
      return response.data;
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response.data &&
        (error as any).response.data.error
      ) {
        throw new Error(cleanErrorMessage((error as any).response.data.error));
      }
      throw new Error(
        cleanErrorMessage(
          (typeof error === "object" && error !== null && "message" in error)
            ? (error as any).message
            : "An error occurred while fetching the game by token"
        )
      );
    }
  },
  getHello: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/game/test`);
      return response.data;
    } catch (error: unknown) {
      
    }
  }
};

