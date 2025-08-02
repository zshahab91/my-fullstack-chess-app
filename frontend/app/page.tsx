"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/header/Header";
import { apiService } from "./services/apiService";
import Chess from "./components/chess/chess";


export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("chess_token");
    if (token) {
      apiService.setAuthToken(token);
      setIsAuthenticated(true);
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="items-center justify-items-center min-h-screen  pb-20 gap-16 grid grid-rows-[auto_1fr_auto]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {isAuthenticated ? (
          <Chess />
        ) : null}
      </main>
    </div>
  );
}