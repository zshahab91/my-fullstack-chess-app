"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/header/Header";
import LoadingTemplate from "../components/loading/LoadingTemplate";
import { apiService } from "../services/apiService";
import { getAuthToken } from "../utils/session";

function CourtPiecePageContent() {
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
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Header title="Court Piece" />

        <main className="flex min-h-[65vh] items-center justify-center rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)] px-6 py-12 text-center shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
          <div className="max-w-xl space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--text-secondary)]">
              Game room
            </p>
            <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)] sm:text-5xl">
              Court Piece
            </h1>
            <p className="text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
              You are in the Court Piece route. Hook the game board here next, or
              keep this as the entry point for the Court Piece flow.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CourtPiecePage() {
  return (
    <Suspense fallback={<LoadingTemplate message="Opening Court Piece..." />}>
      <CourtPiecePageContent />
    </Suspense>
  );
}
