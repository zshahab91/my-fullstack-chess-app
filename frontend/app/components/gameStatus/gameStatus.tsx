import { capitalizeFirstChar } from "@/app/utils/global";
import { useQueryClient } from "@tanstack/react-query";

export default function GameStatus() {
  const queryClient = useQueryClient();
  const gameStatus = queryClient.getQueryData<{ color?: string; status?: string }>(["gameStatus"]);

  if (!gameStatus) {
    return (
      <div className="text-gray-300 text-center mb-4">
        Waiting for game status...
      </div>
    );
  }

  return (
    <div className="w-full p-2 bg-gray-800 rounded shadow-sm text-center font-mono">
      <div>
        <span className="font-semibold">Your Color:</span>{" "}
        <span className="capitalize">{capitalizeFirstChar(gameStatus.color || "unknown")}</span>
      </div>
      <div>
        <span className="font-semibold">Game Status:</span>{" "}
        <span className="capitalize">{capitalizeFirstChar(gameStatus.status || "unknown")}</span>
      </div>
    </div>
  );
}