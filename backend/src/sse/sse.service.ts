import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class SseService {
  // Store subjects per token
  private subjects: { [token: string]: Subject<MessageEvent> } = {};

  getSubject(token: string): Subject<MessageEvent> {
    if (!this.subjects[token]) {
      this.subjects[token] = new Subject<MessageEvent>();
    }
    return this.subjects[token];
  }

  removeSubject(token: string) {
    if (this.subjects[token]) {
      this.subjects[token].complete();
      delete this.subjects[token];
    }
  }

  sendEvent(token: string, data: any) {
    console.log(`Sending event to token in SSE service with subjecrs: ${token}`, data, this.subjects);

    if (this.subjects[token]) {
      console.log(`Sending data to subject for token in if service: ${token}`, data);
      this.subjects[token].next({ data });
    }
  }
}