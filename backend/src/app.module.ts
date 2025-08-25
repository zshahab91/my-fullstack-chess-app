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


const candidateEnvPaths = [
  path.resolve(process.cwd(), `backend/dist/env/.env.${NODE_ENV}`), // production build
  path.resolve(process.cwd(), `src/env/.env.${NODE_ENV}`),  // local dev
];
const existingPaths = candidateEnvPaths.filter((p) => fs.existsSync(p));

@Module({
  imports: [
    UserModule,
    GameModule,
    // load the env file that matches NODE_ENV (default to development)
    ConfigModule.forRoot({
      envFilePath: existingPaths,
      isGlobal: true,
      ignoreEnvFile: !existingPaths
    }),
    // read MONGO_URI from the current env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('process.env in useFactory:', process.env);
console.log('Available env vars:', Object.keys(process.env));
console.log('config new:', config);
        // Build from components
        const protocol = config.get<string>('DB_PROTOCOL');
        let host = config.get<string>('DB_HOST');
        const port = config.get<string>('DB_PORT');
        const name = config.get<string>('DB_NAME');
        
        // remove any accidental leading @ from host
        host = (host ?? '').replace(/^@+/, '');
        
        const user = config.get<string>('DB_USER') ?? process.env.DB_USER;
        const pass = config.get<string>('DB_PASS') ?? process.env.DB_PASS;
        
        // console.log('DB Config Host:', config.get<string>('DB_HOST'));
        console.log('DB Config pass:', config.get<string>('DB_PASS'));
        console.log('process.env.DB_USER:', process.env.DB_USER);
        console.log('DB Config User:', config.get<string>('DB_USER'));

        const credentials =
          user && pass
            ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
            : '';
        // console.log('DB Credentials:', credentials);
        // mongodb+srv must not include port and uses host only
        const isSrv = protocol?.includes('+srv') ?? false;
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


