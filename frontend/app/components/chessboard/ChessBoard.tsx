"use client";
import { useQuery } from "@tanstack/react-query";
import { boardSquares, ChessBoardProps } from "@/app/interfaces/chessType";
import { getPieceSymbol } from "@/app/utils/global";



export default function ChessBoard() {
  const { data: selectedBoard } = useQuery<ChessBoardProps>({
    queryKey: ["selectedBoard"],
    enabled: true, // ensures the query is active
  });

  const boardPositions = selectedBoard?.positions || [];

  return (
    <div className="grid grid-cols-8 grid-rows-8 border-2 border-gray-700 w-160 h-160">
      {boardSquares.map((square, idx) => {
        const piece = boardPositions.find((p: any) => p.position === square);
        const isDark = (Math.floor(idx / 8) + (idx % 8)) % 2 === 1;
        return (
          <div
            key={square}
            className={`flex items-center justify-center w-20 h-20 text-8xl cursor-pointer hover:border-3 hover:border-green-500 ${isDark ? "bg-gray-900" : "bg-gray-500"
              }`}
          >
            {piece ? getPieceSymbol(piece.piece, piece.color) : ""}
          </div>
        );
      })}
    </div>
  );
}