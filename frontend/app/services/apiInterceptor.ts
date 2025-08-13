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
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const isAxiosError = (
  error: unknown
): error is { response: { data: { error?: string } } } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: unknown } }).response !== null &&
    "data" in (error as { response: { data?: unknown } }).response!
  );
}

export function isAxiosErrorWithBackendError(
  error: unknown
): error is { response: { data: { error?: string }; }; } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: unknown } }).response !== null &&
    "data" in (error as { response: { data?: unknown } }).response!
  );
}
