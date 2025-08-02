"use client";
import { useEffect, useState } from "react";
import Header from "./components/header/Header";
import LoginForm from "./components/auth/LoginForm";
import { apiService } from "./services/apiService";
import Chess from "./components/chess/chess";


export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const token = sessionStorage.getItem("chess_token");
    if (token) {
      apiService.setAuthToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (_username: string, token?: string) => {
    if (token) {
      sessionStorage.setItem("chess_token", token);
      apiService.setAuthToken(token);
      setIsAuthenticated(true);
    }
  };

  // Separated login logic
  const handleLoginSubmit = async (username: string) => {
    try {
      const data = await apiService.login(username);
      handleLogin(username, data.token);
    } catch {
      // error handled in LoginForm
    }
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="items-center justify-items-center min-h-screen  pb-20 gap-16 grid grid-rows-[auto_1fr_auto]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {isAuthenticated ? (
          <Chess />
        ) : (
          <LoginForm onLogin={handleLoginSubmit} />
        )}
      </main>
    </div>
  );
}