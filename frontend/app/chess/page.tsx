"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/header/Header";
import Chess from "../components/chess/chess";
import LoadingTemplate from "../components/loading/LoadingTemplate";
import { SSEProvider } from "../context/SSEContext";
import { apiService } from "../services/apiService";
import { getAuthToken } from "../utils/session";

function ChessPageContent() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getAuthToken();

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    apiService.setAuthToken(storedToken);
    setToken(storedToken);
  }, [router]);

  if (!token) {
    return null;
  }

  return (
    <SSEProvider token={token}>
      <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <Header title="Chess" />
          <main className="flex flex-1 items-start justify-center py-4">
            <Chess />
          </main>
        </div>
      </div>
    </SSEProvider>
  );
}

export default function ChessPage() {
  return (
    <Suspense fallback={<LoadingTemplate message="Opening chess..." />}>
      <ChessPageContent />
    </Suspense>
  );
}
