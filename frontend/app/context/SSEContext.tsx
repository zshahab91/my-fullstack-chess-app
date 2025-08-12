import React, { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/services/apiService";
import { SSEContextType, SSEMessage } from "@/app/interfaces/sseMessage";

const SSEContext = createContext<SSEContextType | null>(null);

export const SSEProvider = ({ token, children }: { token: string; children: React.ReactNode }) => {
  const [message, setMessage] = useState<SSEMessage | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/sse/stream?token=${token}`);
    eventSource.onopen = () => setConnected(true);
    eventSource.onmessage = (event) => setMessage(JSON.parse(event.data));
    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
    };
    return () => eventSource.close();
  }, [token]);

  return (
    <SSEContext.Provider value={{ message, connected }}>
      {children}
    </SSEContext.Provider>
  );
};

export const useSSE = () => useContext(SSEContext);