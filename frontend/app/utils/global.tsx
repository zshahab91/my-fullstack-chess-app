export const getPieceSymbol = (piece: string, color: string) => {
  const isWhite = color === "w" || color === "white";
    const symbols: Record<string, string> = {
    k: isWhite ? "♔" : "♚",
    q: isWhite ? "♕" : "♛",
    r: isWhite ? "♖" : "♜",
    b: isWhite ? "♗" : "♝",
    n: isWhite ? "♘" : "♞",
    p: isWhite ? "♙" : "♟",
    };

  const symbol = symbols[piece?.toLowerCase()];
    if (!symbol) return null;

  return symbol;
};

export const capitalizeFirstChar = (str: string)  =>{
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const cleanErrorMessage = (message: string): string => {
  // Remove curly braces, quotes, and excessive whitespace
  return message.replace(/[{}"]/g, '').replace(/\s+/g, ' ').trim();
}
