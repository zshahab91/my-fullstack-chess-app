import axios from "axios";
import { setAuthToken as setInterceptorAuthToken } from "./apiInterceptor";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"; // adjust port if needed


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
    } catch (error) {
      throw error;
    }
  },
  login: async (nickName: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        nickName,
      });
      const { token } = response.data;
      if (!token) {
        throw new Error("No token received from login");
      }
      setAuthToken(token);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  setAuthToken,
  startGame: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/game/start`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
