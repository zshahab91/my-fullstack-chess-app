import { BoardDto } from './game.dto';

export class GameResponseDto {
  color: 'white' | 'black';
  status: string;
  board?: BoardDto[];
  message?: string;
  opponent?: string | null;
}