// sse.service.ts
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class SseService {
  private subjects: { [token: string]: Subject<MessageEvent> } = {};

  getStream(token: string) {
    if (!this.subjects[token]) {
      this.subjects[token] = new Subject<MessageEvent>();
    }
    return this.subjects[token].asObservable();
  }

  sendToClient(token: string, data: any) {
    console.log(`Sending SSE to client with token: ${token}`, data);
    const subject = this.subjects[token];
    const messageEvent: MessageEvent = {
      data: JSON.stringify(data),
      type: 'message',
    };
    if (subject) {
      subject.next(messageEvent);
    }
  }
}
