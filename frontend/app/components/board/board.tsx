"use client";
import { useState } from "react";
import { BoardPosition, boardSquares } from "@/app/interfaces/chessType";
import { getPieceSymbol } from "@/app/utils/global";
import { apiService } from "@/app/services/apiService";
import { toast } from "react-toastify";
import { useSSE } from "@/app/context/SSEContext";
import { initialSSEMessage, SSEMessage } from "@/app/interfaces/sseMessage";



export default function Board() {
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

  const getPieceGlyphStyle = (pieceColor: "white" | "black") => {
    if (pieceColor === "white") {
      return {
        color: "#f8f3e7",
        WebkitTextStroke: "0.6px rgba(18, 24, 34, 0.45)",
        textShadow: "none",
      };
    }

    return {
      color: "#000000",
      WebkitTextStroke: "0.7px rgba(255, 255, 255, 0.7)",
      textShadow: "none",
    };
  };

  return (
    <div className="grid aspect-square w-[min(94vw,42rem)] grid-cols-8 grid-rows-8 overflow-hidden rounded-xl border-4 border-[var(--board-frame)] shadow-[0_22px_48px_rgba(0,0,0,0.28)]">
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
            className="relative flex items-center justify-center border border-black/6 text-[clamp(1.4rem,5vw,3.25rem)] transition hover:cursor-pointer"
            style={{
              backgroundColor: isDark ? "var(--board-dark)" : "var(--board-light)",
              boxShadow: isSelected ? "inset 0 0 0 4px var(--square-selected)" : "none",
            }}
          >
            {piece ? (
              <span
                draggable
                onDragStart={(e) => handleDragStart(e, square)}
                className="inline-flex items-center justify-center"
                style={{
                  cursor: "grab",
                  ...getPieceGlyphStyle(piece.color as "white" | "black"),
                }}
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
