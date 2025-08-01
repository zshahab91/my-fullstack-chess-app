import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { SseController } from './sse/sse.controller';
import { SseModule } from './sse/sse.module';

@Module({
  imports: [SseModule, AuthModule, GameModule],
  controllers: [AppController, SseController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'game/*', method: RequestMethod.ALL });
  }
}
