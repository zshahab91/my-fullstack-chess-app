import { IsString, Length } from 'class-validator';

export class UserDto {
  @IsString()
  @Length(2, 32)
  nickName: string;

  @IsString()
  token?: string;
}