import { useEffect } from "react";
import ChessBoard from "../chessboard/ChessBoard";
import SidebarClient from "../sidebar/SidebarClient";
import { apiService } from "@/app/services/apiService";

export default function Chess() {
    useEffect(() => {
        // Call startGame when Chess component mounts
        apiService.startGame();
    }, []);

    return (
        <>
            <SidebarClient />
            <ChessBoard />
        </>
    );
}