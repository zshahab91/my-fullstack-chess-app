"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "./components/header/Header";
import { apiService } from "./services/apiService";
import Chess from "./components/chess/chess";
import { SSEProvider } from "./context/SSEContext";
import LoadingTemplate from "./components/loading/LoadingTemplate";

function HomeContent() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const callbackToken = searchParams.get("token");
    const callbackNickName = searchParams.get("nickName");
    const error = searchParams.get("error");

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (callbackToken && callbackNickName) {
      sessionStorage.setItem("chess_token", callbackToken);
      sessionStorage.setItem("chess_nickName", callbackNickName);
      apiService.setAuthToken(callbackToken);
      setToken(callbackToken);
      router.replace("/");
      return;
    }

    const storedToken =
      typeof window !== "undefined" ? sessionStorage.getItem("chess_token") : null;
    if (storedToken) {
      apiService.setAuthToken(storedToken);
      setToken(storedToken);
    } else {
      router.replace("/login");
    }
  }, [router, searchParams]);

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

export default function Home() {
  return (
    <Suspense fallback={<LoadingTemplate message="Opening your game..." />}>
      <HomeContent />
    </Suspense>
  );
}