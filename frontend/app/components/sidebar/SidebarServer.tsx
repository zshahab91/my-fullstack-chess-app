
import { apiService } from "@/app/services/apiService";
import { Board } from "@/app/interfaces/chessType";
import BoardButton from "../boardButton/BoardButton";
export default async function SidebarServer() {
    const boards: Board[] = await apiService.getAllBoards();

    // This function will be called on the client, so we use a client component for the button

    return (
        <aside className="w-full bg-gray-900 text-white p-4 rounded shadow h-full">
            {boards.length === 0 ? (
                <div className="text-center">No games found.</div>
            ) : (
                <div className="grid grid-cols-4 gap-2">
                    {boards.map((board) => (
                       <BoardButton key={board.id} id={board.id} />
                    ))}
                </div>
            )}
        </aside>
    );
}