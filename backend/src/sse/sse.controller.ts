import { Controller, Sse, Req, MessageEvent } from '@nestjs/common';
import { Request } from 'express';
import { Observable, Subject } from 'rxjs';

@Controller('events')
export class SseController {
  // Store subjects per token
  private subjects: { [token: string]: Subject<MessageEvent> } = {};

  @Sse('sse')
  sse(@Req() req: Request): Observable<MessageEvent> {
    const token = req.query.token as string;
    if (!token) {
      // If no token, emit an error event and complete
      const errorSubject = new Subject<MessageEvent>();
      errorSubject.next({ data: { error: 'Token required as query param' } });
      errorSubject.complete();
      return errorSubject.asObservable();
    }

    // Create a subject for this connection if not exists
    if (!this.subjects[token]) {
      this.subjects[token] = new Subject<MessageEvent>();
    }

    // Optionally: send a welcome event
    this.subjects[token].next({ data: { message: 'SSE connected', token } });

    // Clean up when connection closes
    req.on('close', () => {
      this.subjects[token].complete();
      delete this.subjects[token];
    });

    return this.subjects[token].asObservable();
  }

  // Example: method to send event to a specific token
  sendEvent(token: string, data: any) {
    console.log(`Sending event to token in SSE controller: ${token}`, data);
    if (this.subjects[token]) {
            console.log(`Sending data to subject for token in if controller: ${token}`, data);

      this.subjects[token].next({ data });
    }
  }
}
