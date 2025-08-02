export const getPieceSymbol = (piece: string, color: string) => {
    const symbols: Record<string, string> = {
        king: color !== "white" ? "♔" : "♚",
        queen: color !== "white" ? "♕" : "♛",
        rook: color !== "white" ? "♖" : "♜",
        bishop: color !== "white" ? "♗" : "♝",
        knight: color !== "white" ? "♘" : "♞",
        pawn: color !== "white" ? "♙" : "♟",
    };

    const symbol = symbols[piece];
    if (!symbol) return null;

    return <span className="chess-piece">{symbol}</span>;
};

export const capitalizeFirstChar = (str: string)  =>{
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
