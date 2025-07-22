import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"; // adjust port if needed

// Store token in memory (or use localStorage if you want persistence)
let authToken: string | null = null;

// Store QueryClient instance internally
let queryClient: QueryClient | null = null;

// Set token in axios default headers
const setAuthToken = (token: string) => {
  authToken = token;
};

// Set QueryClient instance
const setQueryClient = (client: QueryClient) => {
  queryClient = client;
};

// Add a flag to prevent double call
axios.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
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
      console.error("API error:", error);
      throw error;
    }
  },
  login: async (username: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
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
  setQueryClient,

  // Call /game/start and store response in React Query (if queryClient is set)
  startGame: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/game/start`);
      if (queryClient) {
        queryClient.setQueryData(["gameStatus"], response.data);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
