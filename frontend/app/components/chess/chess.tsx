import { useEffect } from "react";
import { apiService } from "@/app/services/apiService";
import { useQueryClient } from "@tanstack/react-query";
import SidebarClient from "../sidebar/sidebarClient";
import ChessBoard from "../chessboard/chessBoard";
import { toast } from "react-toastify";
import { ApiError } from "../../interfaces/apiError";

export default function Chess() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Call startGame when Chess component mounts
        const startGame = async () => {
            const res = await apiService.startGame();
            try {
                queryClient.setQueryData(["gameStatus"], res);
            } catch (error: unknown) {
                if (typeof error === "object" && error !== null && "message" in error) {
                    toast.error((error as { message?: string }).message || 'Failed to start game');
                } else {
                    toast.error('Failed to start game');
                }
            }
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