import { BoardPosition } from "./chessType";

export interface SSEMessage {
  color?: 'white' | 'black';
  message: string;
  status: string;
  board: BoardPosition[];
  opponent?: string | null;
  turn?: 'white' | 'black';
  isNew: boolean;
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
  isNew: false,
};