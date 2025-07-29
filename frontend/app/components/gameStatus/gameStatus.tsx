import { useEffect, useState } from "react";
import { capitalizeFirstChar } from "@/app/utils/global";
import { API_BASE_URL } from "@/app/services/apiService";

export default function GameStatus() {
  const [currentStatus, setCurrentStatus] = useState<{ color?: string; status?: string; message?: string } | null>(null);

  useEffect(() => {
    // Log to verify effect runs
    console.log("Setting up SSE connection to", `${API_BASE_URL}/events/sse`);
    const source = new EventSource(`${API_BASE_URL}/events/sse`);
    source.onopen = () => {
      console.log("SSE connection opened");
    };
    source.onerror = (err) => {
      console.error("SSE connection error:", err);
    };
    source.onmessage = (event) => {
      console.log("SSE message received:", event.data);
      try {
        const data = JSON.parse(event.data);
        setCurrentStatus(data);
      } catch (e) {
        console.log('SSE message (non-JSON):', event.data);
      }
    };
    return () => {
      console.log("Closing SSE connection");
      source.close();
    };
  }, []);

  if (!currentStatus) {
    return (
      <div className="text-gray-300 text-center mb-4">
        Waiting for game status...
      </div>
    );
  }

  return (
    <div className="w-full p-2 bg-gray-800 rounded shadow-sm text-center font-mono">
      <div>
        <span className="font-semibold">Your Color:</span>{" "}
        <span className="capitalize">{capitalizeFirstChar(currentStatus.color || "unknown")}</span>
      </div>
      <div>
        <span className="font-semibold">Game Status:</span>{" "}
        <span className="capitalize">{capitalizeFirstChar(currentStatus.status || "unknown")}</span>
      </div>
      {currentStatus.message && (
        <div className="mt-2 text-sm text-gray-400">
          <span className="font-semibold">Message:</span> {currentStatus.message}
        </div>
      )}
    </div>
  );
}