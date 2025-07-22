import { useEffect } from "react";
import ChessBoard from "../chessboard/ChessBoard";
import SidebarClient from "../sidebar/SidebarClient";
import { apiService } from "@/app/services/apiService";
import { useQueryClient } from "@tanstack/react-query";

export default function Chess() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Call startGame when Chess component mounts
        const startGame = async () => {
            const res = await apiService.startGame();
            // Save response data in React Query
            queryClient.setQueryData(["gameStatus"], res);
        };
        startGame();
    }, [queryClient]);

    return (
        <>
            <SidebarClient />
            <ChessBoard />
        </>
    );
}