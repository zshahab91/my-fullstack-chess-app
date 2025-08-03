import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  private dbDir = path.join(__dirname, '..', 'db');
  private usersPath = path.join(this.dbDir, 'users.json');

  private ensureDbDir() {
    if (!fs.existsSync(this.dbDir)) {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }
  }

  private readUsers(): any[] {
    this.ensureDbDir();
    if (!fs.existsSync(this.usersPath)) return [];
    try {
      const usersRaw = fs.readFileSync(this.usersPath, 'utf8');
      return JSON.parse(usersRaw) || [];
    } catch {
      return [];
    }
  }

  private writeUsers(users: any[]) {
    this.ensureDbDir();
    fs.writeFileSync(this.usersPath, JSON.stringify(users, null, 2), 'utf8');
  }

  login(userDto: UserDto): { token: string } | { error: string } {
    const nickName = userDto.nickName;
    if (!nickName) {
      return { error: 'Nick Name is required' };
    }

    let users = this.readUsers();

    // Try to find existing user by nickname
    let user = users.find((u) => u.nickName === nickName);

    if (!user) {
      // If not found, create new user
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
      user = { nickName, token, expiresAt };
      users.push(user);
      this.writeUsers(users);
    }

    // Now use findUserByToken to get the user and return their token
    const foundUser = this.findUserByToken(user.token);
    if (foundUser) {
      return { token: foundUser.token ?? '' };
    } else {
      return { error: 'User not found after creation' };
    }
  }

  findUserByToken(token: string | null): UserDto | null {
    const users = this.readUsers();
    return users.find((u: any) => u.token === token) || null;
  }
}
