import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MoveDto } from './game.dto';

export class MoveRequestDto {
  @IsObject()
  @ValidateNested()
  @Type(() => MoveDto)
  move: MoveDto;
}