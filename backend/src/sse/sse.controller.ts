import { BadRequestException, Controller, Query, Sse, MessageEvent } from "@nestjs/common";
import { SseService } from "./sse.service";
import { Observable } from "rxjs";

// sse.controller.ts
@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('stream')
  stream(@Query('token') token: string): Observable<MessageEvent> {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.sseService.getStream(token);
  }
  
}
