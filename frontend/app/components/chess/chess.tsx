import { useEffect } from "react";
import { apiService } from "@/app/services/apiService";
import { useQueryClient } from "@tanstack/react-query";
import SidebarClient from "../sidebar/sidebarClient";
import ChessBoard from "../chessboard/chessBoard";

export default function Chess() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Call startGame when Chess component mounts
        const startGame = async () => {
            const res = await apiService.startGame();
            // Save response data in React Query
            queryClient.setQueryData(["gameStatus"], res);
            queryClient.setQueryData(["selectedBoard"], {
                id: 'initial',
                positions: res.board,
            });
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