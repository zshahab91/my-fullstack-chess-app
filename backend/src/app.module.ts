import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { SseController } from './sse/sse.controller';
import { SseModule } from './sse/sse.module';
import { UserMiddleware } from './user/user.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user/schemas/user.schema';

@Module({
  imports: [
    SseModule,
    UserModule,
    GameModule,
    MongooseModule.forRoot('mongodb://localhost:27017/chess-app'), // replace with your MongoDB URI
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AppController, SseController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes({ path: 'game/*', method: RequestMethod.ALL });
  }
}
