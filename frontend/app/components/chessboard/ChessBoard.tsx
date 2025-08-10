"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { boardSquares, ChessBoardProps } from "@/app/interfaces/chessType";
import { getPieceSymbol } from "@/app/utils/global";
import { apiService } from "@/app/services/apiService";
import { toast } from "react-toastify";


export default function ChessBoard() {
  const queryClient = useQueryClient();
  const { data: selectedBoard = { positions: [] } } = useQuery<ChessBoardProps>({
    queryKey: ["selectedBoard"],
    queryFn: async () => ({ positions: [] }), // ← dummy fetcher
    enabled: false,
    initialData: { positions: [] },
  });


  const boardPositions = selectedBoard?.positions || [];
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // Find piece at a given square
  const getPieceAt = (square: string) =>
    boardPositions.find((p: any) => p.position === square);

  // Handle square click (for fallback or tap)
  const handleSquareClick = async (square: string) => {
    const selectedPiece = selectedSquare ? getPieceAt(selectedSquare) : null;
    const targetPiece = getPieceAt(square);

    // If no piece is selected and clicked square has a piece, select it
    if (!selectedSquare && targetPiece) {
      setSelectedSquare(square);
      return;
    }

    // If a piece is selected and user clicks the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // If a piece is selected and user clicks an empty square, try to move
    if (selectedSquare && !targetPiece && selectedPiece) {
      // Prepare move object
      const move = {
        from: selectedSquare,
        to: square,
        piece: selectedPiece.piece,
        color: selectedPiece.color as "white" | "black",
      };
      try {
        const data = await apiService.movePiece(move);
        if (data.board) {
          queryClient.setQueryData(["selectedBoard"], { positions: data.board });
        } else if (data.error) {
          toast.error(data.error.message || 'Move failed');
        }
      } catch (error: any) {
        toast.error(error.message || "Network error");
      }
      setSelectedSquare(null);
      return;
    }

    // If a piece is selected and user clicks another piece, select new piece
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

      // If destination has a piece of different color, allow capture
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
          if (data.board) {
            queryClient.setQueryData(["selectedBoard"], { positions: data.board });
          } else if (data.error) {
            toast.error(data.error.message || "Move failed");
          }
        } catch (error: any) {
          toast.error(error.message || "Network error");
        }
        setSelectedSquare(null);
        return;
      }

      // If destination is empty, allow normal move
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

  // Add this at the top of your component, after hooks
  const userColor = queryClient.getQueryData<{ color: string }>(["gameStatus"])?.color;
  // Flip the boardSquares if user is black
  const squaresToRender = userColor === "black" ? [...boardSquares].reverse() : boardSquares;

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
}