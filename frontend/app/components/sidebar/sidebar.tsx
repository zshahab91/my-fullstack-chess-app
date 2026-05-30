"use client";
import GameStatus from "../gameStatus/gameStatus";

export default function Sidebar() {
  return (
    <aside className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-[var(--text-primary)] shadow-md backdrop-blur-sm">
      <GameStatus />
    </aside>
  );
}