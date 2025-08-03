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