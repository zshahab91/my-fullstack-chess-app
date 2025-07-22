import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"; // adjust port if needed

// Store token in memory (or use localStorage if you want persistence)
let authToken: string | null = null;

// Set token in axios default headers
const setAuthToken = (token: string) => {
  authToken = token;
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
      console.error("API error:", error);
      throw error;
    }
  },
  login: async (username: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { username });
      const { token } = response.data;
      if (token) {
        setAuthToken(token);
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  setAuthToken,
};
