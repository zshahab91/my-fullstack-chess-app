import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { API_BASE_URL, apiService } from "@/app/services/apiService";
import { initialSSEMessage, SSEContextType, SSEMessage } from "@/app/interfaces/sseMessage";

const SSEContext = createContext<SSEContextType | null>(null);

export const SSEProvider = ({ token, children }: { token: string; children: React.ReactNode }) => {
  const [message, setMessage] = useState<SSEMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const retryAttemptRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const clearReconnectTimeout = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const closeEventSource = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };

    const connect = () => {
      if (cancelled) {
        return;
      }

      clearReconnectTimeout();
      closeEventSource();

      const eventSource = new EventSource(`${API_BASE_URL}/sse/stream?token=${token}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (cancelled) {
          return;
        }
        retryAttemptRef.current = 0;
        setConnected(true);

        void apiService
          .getGameStatus()
          .then((latestStatus) => {
            if (cancelled) {
              return;
            }
            setMessage((prev): SSEMessage => {
              const base = prev ?? initialSSEMessage;
              return {
                ...base,
                color: latestStatus.color ?? base.color,
                status: latestStatus.status ?? base.status,
                board: latestStatus.board ?? base.board,
                message: latestStatus.message ?? base.message,
                opponent: latestStatus.opponent ?? base.opponent,
                isNew: latestStatus.isNew ?? base.isNew,
              };
            });
          })
          .catch(() => {
            // Ignore snapshot failures and keep live SSE updates flowing.
          });
      };

      eventSource.onmessage = (event) => {
        if (cancelled) {
          return;
        }

        try {
          const incoming = JSON.parse(event.data) as Partial<SSEMessage>;
          setMessage((prev) => ({
            ...(prev ?? initialSSEMessage),
            ...incoming,
          }));
        } catch {
          // Ignore malformed SSE payloads without breaking the stream.
        }
      };

      eventSource.onerror = () => {
        if (cancelled) {
          return;
        }

        setConnected(false);
        closeEventSource();

        const delay = Math.min(1000 * 2 ** retryAttemptRef.current, 30000);
        retryAttemptRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearReconnectTimeout();
      closeEventSource();
      setConnected(false);
    };
  }, [token]);

  return (
    <SSEContext.Provider value={{ message, connected }}>
      {children}
    </SSEContext.Provider>
  );
};

export const useSSE = () => useContext(SSEContext);