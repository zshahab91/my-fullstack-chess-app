"use client";
import GameStatus from "../gameStatus/gameStatus";

export default function SidebarClient() {
  return (
    <aside className="w-full bg-gray-900 text-white p-4 rounded shadow h-full">
      <GameStatus />
    </aside>
  );
}