import { IsString } from 'class-validator';

export class StartCourtPieceRequestDto {
  @IsString()
  token: string;
}
