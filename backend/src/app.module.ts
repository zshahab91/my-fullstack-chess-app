import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { SseController } from './sse/sse.controller';
import { SseModule } from './sse/sse.module';
import { UserMiddleware } from './user/user.middleware';

@Module({
  imports: [SseModule, UserModule, GameModule],
  controllers: [AppController, SseController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes({ path: 'game/*', method: RequestMethod.ALL });
  }
}
