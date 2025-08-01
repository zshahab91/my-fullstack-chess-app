import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  private usersFilePath = path.join(__dirname, '..', 'db', 'users.json');

  findUserByToken(token: string): any | null {
    if (!fs.existsSync(this.usersFilePath)) return null;
    const usersRaw = fs.readFileSync(this.usersFilePath, 'utf8');
    const users = JSON.parse(usersRaw);
    return users.find((user: any) => user.token === token) || null;
  }
}
