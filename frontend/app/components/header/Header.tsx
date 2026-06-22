"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../theme/ThemeToggle";

export default function Header({ title = "Chess Game" }: { title?: string }) {
  const [nickName, setNickName] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      setNickName(sessionStorage.getItem("chess_nickName"));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    router.replace("/login");
  };

  const handleBackToLobby = () => {
    router.push("/lobby");
  };

  return (
    <header className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 shadow-md backdrop-blur-sm sm:px-6">
      <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
        {title} {nickName ? `- ${nickName}` : ""}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={handleBackToLobby}
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] transition hover:cursor-pointer hover:bg-[var(--surface-hover)] sm:px-4 sm:py-2"
        >
          Back to lobby
        </button>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="rounded-lg bg-[var(--danger)] px-3 py-1.5 text-sm font-semibold text-white transition hover:cursor-pointer hover:bg-[var(--danger-strong)] sm:px-4 sm:py-2"
        >
          Logout
        </button>
      </div>
    </header>
  );
}