"use client";
import { useEffect, useState } from "react";
import { apiService } from "@/app/services/apiService";
import BoardButton from "../boardButton/BoardButton";

export default function SidebarClient() {
  const [boards, setBoards] = useState<any[]>([]);

  useEffect(() => {
    apiService.getAllBoards().then(setBoards);
  }, []);

  return (
    <aside className="w-full bg-gray-900 text-white p-4 rounded shadow h-full">
                {boards.length === 0 ? (
                    <div className="text-center">No games found.</div>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {boards.map((board) => (
                           <BoardButton key={board.id} id={board.id} />
                        ))}
                    </div>
                )}
            </aside>
  );
}