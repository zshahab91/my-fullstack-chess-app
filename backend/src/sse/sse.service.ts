// sse.service.ts
import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GameDto } from 'src/game/dto/game.dto';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class SseService {
  private subjects: Record<string, Subject<MessageEvent>> = {};

  getStream(token: string): Observable<MessageEvent> {
    if (!this.subjects[token]) {
      this.subjects[token] = new Subject<MessageEvent>();
    }
    return this.subjects[token].asObservable();
  }
  getTurn(game: GameDto): 'white' | 'black' {
    return (game.moves?.length ?? 0) % 2 === 0 ? 'white' : 'black';
  }

  sendToClient(token: string, data: any) {
    const subject = this.subjects[token];
    const messageEvent: MessageEvent = {
      data: JSON.stringify(data),
      type: 'message',
    };

    if (subject) {
      subject.next(messageEvent);
    }
  }

  async sendMoveMessages(
    game: GameDto,
    movingUser: UserDto,
    userService: UserService,
  ) {
    const whiteUser = game.white
      ? await userService.findByToken(game.white)
      : null;
    const blackUser = game.black
      ? await userService.findByToken(game.black)
      : null;
    const turn = this.getTurn(game);
    // Notify both players about the move
    if (movingUser && movingUser.token === game.white && game.black) {
      this.sendToClient(game.white, {
        color: 'white',
        message: 'Please wait for your opponent to move',
        status: game.status,
        board: game.board,
        opponent: blackUser ? blackUser.nickName : null,
        turn,
        isNew: false,
      });
      this.sendToClient(game.black, {
        color: 'black',
        message: `Move made by ${whiteUser?.nickName || 'opponent'}, it's your turn!`,
        status: game.status,
        board: game.board,
        opponent: whiteUser ? whiteUser.nickName : null,
        turn,
        isNew: false,
      });
    } else if (movingUser && movingUser.token === game.black && game.white) {
      this.sendToClient(game.black, {
        color: 'black',
        message: 'Please wait for your opponent to move',
        status: game.status,
        board: game.board,
        opponent: whiteUser ? whiteUser.nickName : null,
        turn,
        isNew: false,
      });
      this.sendToClient(game.white, {
        color: 'white',
        message: `Move made by ${blackUser?.nickName || 'opponent'}, it's your turn!`,
        status: game.status,
        board: game.board,
        opponent: blackUser ? blackUser.nickName : null,
        turn,
        isNew: false,
      });
    }
  }

  async sendGameStartMessages(game: GameDto, userService: UserService) {
    const whiteUser = game.white
      ? await userService.findByToken(game.white)
      : null;
    const blackUser = game.black
      ? await userService.findByToken(game.black)
      : null;
    // Notify white player if present
    if (whiteUser?.token) {
      this.sendToClient(whiteUser.token, {
        message: game.black
          ? `A new game has started!,Start playing!`
          : 'Waiting for a Black player to join...',
        status: game.status,
        color: 'white',
        opponent: blackUser ? blackUser.nickName : null,
        board: game.board,
        isNew: false, // <-- set false for existing game
      });
    }

    // Notify black player if present
    if (blackUser?.token) {
      this.sendToClient(blackUser.token, {
        message: `A new game has started! please wait for the white player to make the first move.`,
        status: game.status,
        color: 'black',
        opponent: whiteUser ? whiteUser.nickName : null,
        board: game.board,
        isNew: false, // <-- set false for existing game
      });
    }
  }
}
