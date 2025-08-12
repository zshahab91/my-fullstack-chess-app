"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [nickName, setNickName] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      setNickName(sessionStorage.getItem("chess_nickName"));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    router.replace("/login");
  };

  return (
    <header className="w-full py-4 text-center bg-gray-900 text-white font-bold text-2xl shadow flex justify-between items-center px-8">
      <span>
        Chess Game {nickName ? `- ${nickName}` : ""}
      </span>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
      >
        Logout
      </button>
    </header>
  );
}