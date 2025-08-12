export interface SSEMessage {
  color?: 'white' | 'black';
  message: string;
  status: string;
  board: any[];
  opponent?: string | null;
  turn?: 'white' | 'black';
}
export type SSEContextType = {
  message: SSEMessage | null;
  connected: boolean;
};
export const initialSSEMessage: SSEMessage = {
  message: "",
  status: "",
  board: [],
  opponent: null,
  color: undefined,
  turn: undefined,
};