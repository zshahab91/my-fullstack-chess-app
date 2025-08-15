import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { UserMiddleware } from './user/user.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user/schemas/user.schema';

@Module({
  imports: [
    UserModule,
    GameModule,
    MongooseModule.forRoot('mongodb+srv://zshahab91:eDruVMTooU8bX7ox@cluster0.guwdfvk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'), // replace with your MongoDB URI
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AppController], // <-- Remove SseController here
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes({ path: 'game/*', method: RequestMethod.ALL });
  }
}
