import ChessBoard from "./components/chessboard/ChessBoard";
import Header from "./components/header/Header";
import SidebarServer from "./components/sidebar/SidebarServer";


export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen  pb-20 gap-16 grid grid-rows-[auto_1fr_auto]">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <SidebarServer />
        <ChessBoard />
      </main>
    </div>
  );
}