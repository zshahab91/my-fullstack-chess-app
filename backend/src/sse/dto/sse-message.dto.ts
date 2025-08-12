export class SseMessageDto {
  color?: 'white' | 'black';
  message: string;
  status: string;
  board: any[];
  opponent?: string | null;
  turn?: 'white' | 'black';
  isNew: boolean;
}