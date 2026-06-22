import { IsString } from 'class-validator';

export class PlayCardRequestDto {
  @IsString()
  cardId: string;
}
