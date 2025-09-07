import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3500;

  app.enableCors({
    origin: '*', // or narrow this down in production
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.setGlobalPrefix('api');

  // ✅ Use raw Express instance for static + catch-all
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.use(express.static(path.join(__dirname, 'public')));
  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });

  await app.listen(port);
}
bootstrap();
