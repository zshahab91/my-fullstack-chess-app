import { IsString } from 'class-validator';

export class MoveDto {
  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsString()
  piece: string;

  @IsString()
  color: string;
}
export class BoardPositionDto {
    piece: string;
    position: string;
    color: string;
}
export class BoardDto {
    id: string;
    positions: BoardPositionDto[];
}

export class GameDto {
  id: string;
  white: string | null;
  black: string | null;
  createdAt: string;
  updatedAt?: string;
  moves: MoveDto[];
  board: BoardDto[];
  status: 'waiting' | 'in-progress' | 'finished';
}
