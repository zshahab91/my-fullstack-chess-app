import { useEffect, useState } from "react";
import { capitalizeFirstChar } from "@/app/utils/global";
import { API_BASE_URL } from "@/app/services/apiService";

export default function GameStatus() {
  const [currentStatus, setCurrentStatus] = useState<{ color?: string; status?: string; message?: string } | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === "undefined") return;

    const token = sessionStorage.getItem("chess_token");
    if (!token) {
      console.warn("No chess_token found in sessionStorage");
      return;
    }

    const url = `${API_BASE_URL}/events/sse?token=${token}`;
    console.log("Connecting to SSE at:", url);

    const source = new window.EventSource(url);

    source.onopen = () => {
      console.log("SSE connection opened");
    };

    source.onmessage = (event) => {
      console.log("SSE message received:", event.data);
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        setCurrentStatus(data);
      } catch (e) {
        setCurrentStatus({ message: event.data });
      }
    };

    source.onerror = (err) => {
      console.error("SSE connection error:", err);
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