import { Controller, Sse } from '@nestjs/common';
import { SseService } from './sse.service';

@Controller('events')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('sse')
  sendEvents() {
    return this.sseService.stream$;
  }
}
