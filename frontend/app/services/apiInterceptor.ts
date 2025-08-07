import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

// Store token in memory (or use localStorage if you want persistence)
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
};

// Create a singleton QueryClient instance (if not already)
export const queryClient = new QueryClient();

// Axios interceptor for all API calls
axios.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        sessionStorage.clear(); // Clear session storage
        setAuthToken(""); // Clear auth token
        queryClient.clear(); // Clear React Query cache
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
