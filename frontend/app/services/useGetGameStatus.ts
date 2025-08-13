import { useState, useEffect } from "react";
import { apiService } from "./apiService";
import { GameResponse, StartGameResponse } from "@/app/interfaces/chessType";

export function useGetGameStatus(isNew: boolean = true) {
  const [data, setData] = useState<GameResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setIsError(false);

    const fetchData = async () => {
      try {
        if (isNew) {
          const res: StartGameResponse = await apiService.startGame();
          // If you want to use the game object as GameResponse:
          if (mounted) {
            setData(res.game);
            setIsLoading(false);
          }
        } else {
          const res: GameResponse = await apiService.getGameStatus();
          if (mounted) {
            setData(res);
            setIsLoading(false);
          }
        }
      } catch {
        if (mounted) {
          setIsError(true);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, [isNew]);

  return { data, isLoading, isError };
}