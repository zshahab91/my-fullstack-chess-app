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
console.log('NODE_ENV:', NODE_ENV);

const candidateEnvPaths = [
  path.resolve(process.cwd(), `dist/env/.env.${NODE_ENV}`), // production build
  path.resolve(process.cwd(), `src/env/.env.${NODE_ENV}`),  // local dev
];
console.log('candidateEnvPaths:', candidateEnvPaths);

const envFileExists = fs.existsSync(candidateEnvPaths[0]);
console.log('envFileExists:', envFileExists);

const envFilePath = envFileExists ? [candidateEnvPaths[0]] : undefined;
console.log('envFilePath:', envFilePath);



const existingPaths = candidateEnvPaths.filter((p) => fs.existsSync(p));
console.log('envFilePaths:', existingPaths);

@Module({
  imports: [
    UserModule,
    GameModule,
    // load the env file that matches NODE_ENV (default to development)
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'production'
        ? 'dist/env/.env.production'
        : 'src/env/.env.development',
      isGlobal: true,
      ignoreEnvFile: false, // This allows loading from file
    }),
    // read MONGO_URI from the current env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('DB Config Host:', config.get<string>('DB_HOST'));
        console.log('DB Config pass:', config.get<string>('DB_PASS'));

        // Build from components
        const protocol = config.get<string>('DB_PROTOCOL') ?? 'mongodb';
        let host = config.get<string>('DB_HOST') ?? 'localhost';
        const port = config.get<string>('DB_PORT') ?? '27017';
        const name = config.get<string>('DB_NAME') ?? 'chess-app';

        // remove any accidental leading @ from host
        host = host.replace(/^@+/, '');

        const user = config.get<string>('DB_USER');
        const pass = config.get<string>('DB_PASS');

        const credentials =
          user && pass
            ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
            : '';
        console.log('DB Credentials:', credentials);
        // mongodb+srv must not include port and uses host only
        const isSrv = protocol.includes('+srv');
        console.log('isSrv:', isSrv);
        const dbUrl = isSrv
          ? `${protocol}://${credentials}${host}/${name}?retryWrites=true&w=majority`
          : `${protocol}://${credentials}${host}:${port}/${name}?retryWrites=true&w=majority`;
        console.log('dbUrl:', dbUrl);

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
