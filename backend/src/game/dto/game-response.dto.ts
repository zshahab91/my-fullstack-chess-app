import { BoardPositionDto } from './game.dto';

export class GameResponseDto {
  color: 'white' | 'black';
  status: string;
  board?: BoardPositionDto[];
  message?: string;
  opponent?: string | null;
  isNew?: boolean;
}