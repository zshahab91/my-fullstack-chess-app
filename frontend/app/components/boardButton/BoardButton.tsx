"use client";
import { apiService } from "@/app/services/apiService";
import { capitalizeFirstChar } from "@/app/utils/global";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function BoardButton({ id }: { id: string }) {
  const queryClient = useQueryClient();

  const fetchBoardMutation = useMutation({
    mutationFn: (id: string) => apiService.getBoardByID(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["selectedBoard"], data);
    },
  });

  return (
    <button
      onClick={() => fetchBoardMutation.mutate(id)}
      className="w-full p-2 bg-gray-800 rounded shadow-sm text-center font-mono hover:bg-green-700 cursor-pointer transition"
    >
      {capitalizeFirstChar(id)}
    </button>
  );
}