import ChessBoard from "../chessboard/ChessBoard";
import SidebarClient from "../sidebar/SidebarClient";

export default function Chess() {
    return (
        <>
            <SidebarClient />
            <ChessBoard />
        </>
    );
}