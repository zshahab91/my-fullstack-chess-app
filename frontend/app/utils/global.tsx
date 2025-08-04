export const getPieceSymbol = (piece: string, color: string) => {
    const symbols: Record<string, string> = {
        k: color !== "w" ? "♔" : "♚",
        q: color !== "w" ? "♕" : "♛",
        r: color !== "w" ? "♖" : "♜",
        b: color !== "w" ? "♗" : "♝",
        n: color !== "w" ? "♘" : "♞",
        p: color !== "w" ? "♙" : "♟",
    };

    const symbol = symbols[piece];
    if (!symbol) return null;

    return <span className="chess-piece">{symbol}</span>;
};

export const capitalizeFirstChar = (str: string)  =>{
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const cleanErrorMessage = (message: string): string => {
  // Remove curly braces, quotes, and excessive whitespace
  return message.replace(/[{}"]/g, '').replace(/\s+/g, ' ').trim();
}
