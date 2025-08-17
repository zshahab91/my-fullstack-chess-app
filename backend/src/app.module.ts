import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  NestModule,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { UserMiddleware } from './user/user.middleware';
import { User, UserSchema } from './user/schemas/user.schema';

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const candidateEnvPath = path.resolve(process.cwd(), `src/env/.env.${NODE_ENV}`);
const envFileExists = fs.existsSync(candidateEnvPath);
const envFilePath = envFileExists ? [candidateEnvPath] : undefined;

@Module({
  imports: [
    UserModule,
    GameModule,
    // load the env file that matches NODE_ENV (default to development)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      // if no env file found, ignoreEnvFile true so ConfigModule only uses process.env
      ignoreEnvFile: !envFileExists,
    }),
    // read MONGO_URI from the current env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // prefer values from ConfigService (which wraps process.env), fallback to raw process.env
        const dbUrl = config.get<string>('MONGO_URI') ?? process.env.MONGO_URI;
        if (!dbUrl) {
          throw new Error(`MONGO_URI is not set in environment (NODE_ENV=${NODE_ENV})`);
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
