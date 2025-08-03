import { IsString } from 'class-validator';

export class StartGameRequestDto {
  @IsString()
  token: string;
}