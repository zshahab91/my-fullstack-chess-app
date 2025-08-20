import { useGetGameStatus } from "@/app/services/useGetGameStatus";
import { useSSE } from "@/app/context/SSEContext";
import SidebarClient from '../sidebar/sidebarClient';
import ChessBoard from '../chessboard/chessBoard';

export default function Chess() {
    const sseContext = useSSE();
    const message = sseContext?.message;
    console.log("SSE Message:", message);
    const { data: gameStatus, isLoading, isError } = useGetGameStatus(message?.isNew);

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