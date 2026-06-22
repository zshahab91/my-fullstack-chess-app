export const AUTH_TOKEN_KEY = "chess_token";
export const AUTH_NICKNAME_KEY = "chess_nickName";

export function saveAuthSession(nickName: string, token: string) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(AUTH_NICKNAME_KEY, nickName);
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}
