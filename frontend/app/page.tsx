"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/header/Header";
import { apiService } from "./services/apiService";
import Chess from "./components/chess/chess";
import { SSEProvider } from "./context/SSEContext";


export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Only runs in browser
    const storedToken = typeof window !== "undefined" ? sessionStorage.getItem("chess_token") : null;
    if (storedToken) {
      apiService.setAuthToken(storedToken);
      setToken(storedToken);
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    token ? (
      <SSEProvider token={token}>
        <div className="items-center justify-items-center min-h-screen pb-20 gap-16 grid grid-rows-[auto_1fr_auto]">
          <Header />
          <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <Chess />
          </main>
        </div>
      </SSEProvider>
    ) : null
  );
}