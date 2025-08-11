import { useEffect, useState } from "react";
import { apiService } from "@/app/services/apiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SidebarClient from "../sidebar/sidebarClient";
import ChessBoard from "../chessboard/chessBoard";
import { toast } from "react-toastify";

export default function Chess() {
    const queryClient = useQueryClient();
    const [isNew, setIsNew] = useState<boolean | undefined>(undefined);

    // Use useQuery to get gameStatus
    const { data: gameStatus, isLoading, isError } = useQuery({
        queryKey: ["gameStatus"],
        queryFn: apiService.getGameByToken,
        staleTime: 0,
    });

    // Set isNew when gameStatus changes
    useEffect(() => {
        console.log("Game status changed:", gameStatus);
        setIsNew(gameStatus?.isNew);
    }, [gameStatus]);

    // UseMutation for starting a game
    const startGameMutation = useMutation({
        mutationFn: apiService.startGame,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["gameStatus"] });
            setIsNew(data?.isNew);
        },
        onError: () => {
            toast.error('Failed to start game');
        }
    });

    useEffect(() => {
        // Only call startGame if isNew is true or undefined
        if (isNew === true || isNew === undefined) {
            startGameMutation.mutate();
        }
    }, [isNew]);

    if (isLoading) {
        return <div>Loading game...</div>;
    }
    if (isError) {
        return <div>Error loading game.</div>;
    }
    if (!gameStatus) {
        return <div>No game found.</div>;
    }

    return (
        <>
            <SidebarClient />
            <ChessBoard />
        </>
    );
}