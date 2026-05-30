import { useGetGameStatus } from "@/app/services/useGetGameStatus";
import { useSSE } from "@/app/context/SSEContext";
import Sidebar from '../sidebar/sidebar';
import Board from '../board/board';

export default function Chess() {
    const sseContext = useSSE();
    const message = sseContext?.message;
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
        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 px-4 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
            <Sidebar />
            <Board />
        </div>
    );
}