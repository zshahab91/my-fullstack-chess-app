import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3500;
  app.enableCors({
    origin: "*", // or "*" for all origins (not recommended for production)
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.setGlobalPrefix('api');
   // Serve frontend build
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('*', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  }); // Optional: set a global prefix for your API routes
  await app.listen(port);
}
bootstrap();
