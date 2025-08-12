import { useState, useEffect } from "react";
import { apiService } from "./apiService";

export function useGetGameStatus() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setIsError(false);

    apiService.getGameStatus()
      .then((res) => {
        if (mounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => { mounted = false; };
  }, []);

  return { data, isLoading, isError };
}