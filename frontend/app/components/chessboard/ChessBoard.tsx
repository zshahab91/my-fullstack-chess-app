"use client";
import { useState } from "react";
import { BoardPosition, boardSquares } from "@/app/interfaces/chessType";
import { getPieceSymbol } from "@/app/utils/global";
import { apiService } from "@/app/services/apiService";
import { toast } from "react-toastify";
import { useSSE } from "@/app/context/SSEContext";
import { initialSSEMessage, SSEMessage } from "@/app/interfaces/sseMessage";



export default function ChessBoard() {
  const sse = useSSE();
  const safeMessages: SSEMessage = sse?.message ?? initialSSEMessage;
  const boardPositions: BoardPosition[] = safeMessages.board as unknown as BoardPosition[];
  const userColor = safeMessages.color;
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // Flip the boardSquares if user is black
  const squaresToRender = userColor === "black" ? [...boardSquares].reverse() : boardSquares;

  // Find piece at a given square
  const getPieceAt = (square: string): BoardPosition | undefined =>
    boardPositions.find((p: BoardPosition) => p.position === square);

  // Handle square click
  const handleSquareClick = async (square: string) => {
    const selectedPiece = selectedSquare ? getPieceAt(selectedSquare) : null;
    const targetPiece = getPieceAt(square);

    if (!selectedSquare && targetPiece) {
      setSelectedSquare(square);
      return;
    }
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }
    if (selectedSquare && !targetPiece && selectedPiece) {
      const move = {
        from: selectedSquare,
        to: square,
        piece: selectedPiece.piece,
        color: selectedPiece.color as "white" | "black",
      };
      try {
        const data = await apiService.movePiece(move);
        if (data.error) {
          toast.error(data.error.message || 'Move failed');
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Network error");
        } else {
          toast.error("Network error");
        }
      }
      setSelectedSquare(null);
      return;
    }
    if (selectedSquare && targetPiece) {
      setSelectedSquare(square);
      return;
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, square: string) => {
    setSelectedSquare(square);
    e.dataTransfer.setData("text/plain", square);
  };

  const handleDrop = async (e: React.DragEvent, square: string) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData("text/plain");
    if (fromSquare && fromSquare !== square) {
      const fromPiece = getPieceAt(fromSquare);
      const targetPiece = getPieceAt(square);

      if (
        fromPiece &&
        targetPiece &&
        fromPiece.color !== targetPiece.color
      ) {
        const move = {
          from: fromSquare,
          to: square,
          piece: fromPiece.piece,
          color: fromPiece.color as "white" | "black",
        };
        try {
          const data = await apiService.movePiece(move);
          if (data.error) {
            toast.error(data.error.message || "Move failed");
          }
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message || "Network error");
          } else {
            toast.error("Network error");
          }
        }
        setSelectedSquare(null);
        return;
      }
      if (fromPiece && !targetPiece) {
        await handleSquareClick(square);
        setSelectedSquare(null);
        return;
      }
    }
    setSelectedSquare(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-8 grid-rows-8 border-2 border-gray-700 w-160 h-160">
      {squaresToRender.map((square, idx) => {
        const piece = getPieceAt(square);
        const isDark = (Math.floor(idx / 8) + (idx % 8)) % 2 === 1;
        const isSelected = selectedSquare === square;
        return (
          <div
            key={square}
            onClick={() => handleSquareClick(square)}
            onDrop={(e) => handleDrop(e, square)}
            onDragOver={handleDragOver}
            className={`flex items-center justify-center w-20 h-20 text-8xl cursor-pointer hover:border-3 hover:border-green-500
              ${isDark ? "bg-gray-900" : "bg-gray-500"}
              ${isSelected ? "border-4 border-yellow-400" : ""}
            `}
          >
            {piece ? (
              <span
                draggable
                onDragStart={(e) => handleDragStart(e, square)}
                style={{ cursor: "grab" }}
              >
                {getPieceSymbol(piece.piece, piece.color)}
              </span>
            ) : (
              ""
            )}
          </div>
        );
      })}
    </div>
  );
};
