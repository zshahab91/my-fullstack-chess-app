import { useGetGameStatus } from "@/app/services/useGetGameStatus";
import SidebarClient from "../sidebar/sidebarClient";
import ChessBoard from "../chessboard/chessBoard";
export default function Chess() {
    const { data: gameStatus, isLoading, isError } = useGetGameStatus();
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