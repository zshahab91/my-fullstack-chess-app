"use client";
import { apiService } from "@/app/services/apiService";
import { capitalizeFirstChar } from "@/app/utils/global";
export default function BoardButton({ id }: { id: string }) {
  return (
    <button
      onClick={() => apiService.getBoardByID(id)}
      className="w-full p-2 bg-gray-800 rounded shadow-sm text-center font-mono hover:bg-green-700 cursor-pointer transition"
    >
      {capitalizeFirstChar(id)}
    </button>
  );
}