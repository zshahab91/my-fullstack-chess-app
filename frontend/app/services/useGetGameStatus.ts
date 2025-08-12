import { useState, useEffect } from "react";
import { apiService } from "./apiService";

export function useGetGameStatus(isNew: boolean= true) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setIsError(false);

    const fetchData = async () => {
      try {
        const res = isNew ? await apiService.startGame() : await apiService.getGameStatus();
        if (mounted) {
          setData(res);
          setIsLoading(false);
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