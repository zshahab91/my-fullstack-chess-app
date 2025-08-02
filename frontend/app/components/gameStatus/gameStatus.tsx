// src/components/SseClient.tsx
import { API_BASE_URL } from '@/app/services/apiService';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface Message {
  message?: string;
  update?: string;
  board?: any;
  [key: string]: any;
}

interface Props {
  token: string;
}

const GameStatus: React.FC<Props> = ({ token }) => {
  const [messages, setMessages] = useState<Message>({});
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/sse/stream?token=${token}`);

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: Message = JSON.parse(event.data);
        // Save board in React Query if present
        if (data.board) {
          queryClient.setQueryData(['selectedBoard'], { positions: data.board });
        }

        // Replace all data in messages except board
        const { board, ...rest } = data;
        setMessages(rest);
      } catch (err) {
        setMessages({ message: event.data });
      }
    };

    eventSource.onerror = (err) => {
      eventSource.close();
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [token, queryClient]);

  return (
    <div className="p-4 border rounded">
      <p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <ul className="mt-4 list-disc pl-5 space-y-1">
        {Object.entries(messages).map(([key, msg], idx) => (
          <li key={idx} className="text-sm">
            <strong>{key}:</strong> {msg ? msg.toString() : '-'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameStatus;
