"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/header/Header";
import LoadingTemplate from "../components/loading/LoadingTemplate";
import { apiService } from "../services/apiService";
import { getAuthToken } from "../utils/session";

const games = [
  {
    title: "Chess",
    description: "Open the current chess table and continue your match.",
    href: "/chess",
    accent: "from-[var(--accent)] to-[var(--accent-strong)]",
  },
  {
    title: "Court Piece",
    description: "Enter the Court Piece room and start a new session.",
    href: "/court-piece",
    accent: "from-[#8d5f2f] to-[#b07d43]",
  },
];

function LobbyContent() {
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Header title="Game Lobby" />

        <main className="grid flex-1 gap-6 py-6 md:grid-cols-2">
          {games.map((game) => (
            <button
              key={game.title}
              type="button"
              onClick={() => router.push(game.href)}
              className="group relative overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface)] p-6 text-left shadow-[0_24px_80px_rgba(0,0,0,0.12)] transition duration-300 hover:-translate-y-1 hover:bg-[var(--surface-hover)] hover:shadow-[0_30px_90px_rgba(0,0,0,0.18)]"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${game.accent}`}
              />
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--text-secondary)]">
                    Select game
                  </p>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">
                    {game.title}
                  </h2>
                  <p className="mt-4 max-w-md text-base leading-7 text-[var(--text-secondary)]">
                    {game.description}
                  </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white hover:cursor-pointer">
                  Enter {game.title}
                  <span aria-hidden="true">→</span>
                </div>
              </div>
            </button>
          ))}
        </main>
      </div>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={<LoadingTemplate message="Loading lobby..." />}>
      <LobbyContent />
    </Suspense>
  );
}
