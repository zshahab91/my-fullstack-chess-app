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
    console.log('Getting stream for token:', token);
    console.log('subject:', this.subjects[token]);
    return this.subjects[token].asObservable();
  }

  sendToClient(token: string, data: any) {
    // if (!this.subjects[token]) {
    //   this.subjects[token] = new Subject<MessageEvent>();
    // }
    console.log('Sending to client:', token);
    const subject = this.subjects[token];
    console.log('subjects:', this.subjects[token]);
    const messageEvent: MessageEvent = {
      data: JSON.stringify(data),
      type: 'message',
    };
    if (subject) {
      console.log('subject is defined  ', messageEvent);
      subject.next(messageEvent);
      console.log('Message sent to client finally');

    }
  }
}
