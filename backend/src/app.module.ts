import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  NestModule,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { UserMiddleware } from './user/user.middleware';
import { User, UserSchema } from './user/schemas/user.schema';


@Module({
  imports: [
    UserModule,
    GameModule,
    // load the env file that matches NODE_ENV (default to development)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        // resolve from project root to the src/env folder where your .env files live
        path.resolve(process.cwd(), `src/env/.env.${process.env.NODE_ENV ?? 'development'}`),
      ],
    }),
    // read DATABASE_URL from the current env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('Connecting to database...', config.get('DATABASE_URL'));
        const dbUrl = config.get<string>('DATABASE_URL') ?? process.env.DATABASE_URL;
        if (!dbUrl) {
          throw new Error('DATABASE_URL is not set in environment');
        }
        return { uri: dbUrl };
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor() {
    console.log('AppModule initialized', process.env.NODE_ENV);
  }
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes({ path: 'game/*', method: RequestMethod.ALL });
  }
}
