// src/components/SseClient.tsx
import { API_BASE_URL } from '@/app/services/apiService';
import React, { useEffect, useState } from 'react';

interface Message {
  message?: string;
  update?: string;
  [key: string]: any;
}

interface Props {
  token: string;
}

const GameStatus: React.FC<Props> = ({ token }) => {
  const [messages, setMessages] = useState<Message>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/sse/stream?token=${token}`);

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      console.log('Received SSE message:', event.data);

      // Try to parse JSON, otherwise treat as string
      try {
        const data: Message = JSON.parse(event.data);
        console.log('Parsed SSE 8 message:', event.data, data);
        setMessages((prev) => ({ ...prev, ...data }));
      } catch (err) {
        setMessages((prev) => ({ ...prev, message: event.data }));
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [token]);

  return (
    <div className="p-4 border rounded">
      <p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <ul className="mt-4 list-disc pl-5 space-y-1">
        {Object.entries(messages).map(([key, msg], idx) => (
          <li key={idx} className="text-sm">
            <strong>{key}:</strong> {msg}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameStatus;
