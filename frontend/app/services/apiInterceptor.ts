import axios from "axios";

// Store token in memory (or use localStorage if you want persistence)
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
};

// Axios interceptor for all API calls
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

axios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
