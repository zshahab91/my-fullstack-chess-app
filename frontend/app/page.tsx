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
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      apiService.setAuthToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (_username: string, token?: string) => {
    if (token) {
      localStorage.setItem("token", token);
      apiService.setAuthToken(token);
      setIsAuthenticated(true);
    }
  };

  if (!hasMounted) {
    // Prevent hydration mismatch by not rendering until client is ready
    return null;
  }

  return (
    <div className="items-center justify-items-center min-h-screen  pb-20 gap-16 grid grid-rows-[auto_1fr_auto]">
      <Header />
     <p>isAuthenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {isAuthenticated ? (
          <Chess/>
        ) : (
          <LoginForm
            onLogin={async (username) => {
              try {
                const data = await apiService.login(username);
                handleLogin(username, data.token);
              } catch {
                // error handled in LoginForm
              }
            }}
          />
        )}
      </main>
    </div>
  );
}