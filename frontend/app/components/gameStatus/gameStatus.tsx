import React from 'react';
import { useSSE } from '@/app/context/SSEContext';
import { initialSSEMessage, SSEMessage } from '@/app/interfaces/sseMessage';

const GameStatus: React.FC = () => {
   const sse = useSSE();
   const connected = sse?.connected ?? false;
   const safeMessages: SSEMessage = sse?.message ?? initialSSEMessage;
   const excludeKeys = ["color", "board", "isNew"];
  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-4 text-[var(--text-primary)]">
      <div className="flex items-center justify-between">
        <span className="font-medium text-[var(--text-primary)]">
          Status: {connected ? 'Connected' : 'Disconnected'}
        </span>
        {"color" in safeMessages && (
          <div className="flex items-center">
            <span className="mr-2 text-sm capitalize text-[var(--text-secondary)]">Your color:</span>
            <span
              className={`inline-block w-5 h-5 rounded-full  ${safeMessages.color === "white"
                ? "border-2 border-[var(--board-frame)] bg-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.95),0_0_0_1px_rgba(0,0,0,0.2)]"
                : "border border-gray-100 bg-black"
                }`}
            ></span>
          </div>
        )}
      </div>

      <ul className="mt-4 space-y-1 text-[var(--text-secondary)]">
        {Object.entries(safeMessages).map(([key, msg], idx) =>
          !excludeKeys.includes(key) ? (
            <li key={idx} className="text-sm">
              <strong className="capitalize text-[var(--text-primary)]">{key}:</strong> {msg ? msg.toString() : '-'}
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export default GameStatus;
