import React from 'react';
import { useSSE } from '@/app/context/SSEContext';
import { initialSSEMessage, SSEMessage } from '@/app/interfaces/sseMessage';

const GameStatus: React.FC = () => {
   const sse = useSSE();
   const connected = sse?.connected ?? false;
   const safeMessages: SSEMessage = sse?.message ?? initialSSEMessage;
   const excludeKeys = ["color", "board", "isNew"];
  return (
    <div className="p-4 border rounded">
      <div className="flex items-center justify-between">
        {/* Status on the left */}
        <span>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</span>
        {/* Player color with a colored circle on the right */}
        {"color" in safeMessages && (
          <div className="flex items-center">
            <span className="capitalize text-sm mr-2">Your color:</span>
            <span
              className={`inline-block w-5 h-5 rounded-full  ${safeMessages.color === "white"
                ? "bg-white border border-gray-800 border-solid"
                : "bg-black border border-gray-100 border-solid"
                }`}
            ></span>
          </div>
        )}
      </div>

      <ul className="mt-4 list-disc pl-5 space-y-1">
        {Object.entries(safeMessages).map(([key, msg], idx) =>
          !excludeKeys.includes(key) ? (
            <li key={idx} className="text-sm">
              <strong>{key}:</strong> {msg ? msg.toString() : '-'}
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export default GameStatus;
