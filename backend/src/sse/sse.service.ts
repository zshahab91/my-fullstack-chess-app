import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseService {
  private eventStream = new Subject<{ data: any }>();

  get stream$() {
    return this.eventStream.asObservable();
  }
  sendEvent(data: any) {
    console.log('Sending SSE event:', data);
    this.eventStream.next({ data });
  }
  closeStream() {
    this.eventStream.complete();
  }
}
