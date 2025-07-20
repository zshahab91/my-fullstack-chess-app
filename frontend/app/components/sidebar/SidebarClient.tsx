"use client";
import { useEffect, useState } from "react";
import { apiService } from "@/app/services/apiService";
import { Board } from "@/app/interfaces/chessType";

export default function SidebarClient() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getAllBoards().then((data) => {
      setBoards(data);
      setLoading(false);
    });
  }, []);

  const handleClick = async (id: string) => {
    const board = await apiService.getBoardByID(id);
    alert(`Fetched board: ${JSON.stringify(board)}`);
    // You can update state here to show the board on the ChessBoard component
  };

  return (
    <aside className="w-full bg-gray-900 text-white p-4 rounded shadow h-full">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : boards.length === 0 ? (
        <div className="text-center">No games found.</div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => handleClick(board.id)}
              className="w-full p-2 bg-gray-800 rounded shadow-sm text-center font-mono hover:bg-green-700 transition"
            >
              {board.id}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}