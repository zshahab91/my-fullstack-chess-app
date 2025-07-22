import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "http://localhost:4000", // or "*" for all origins (not recommended for production)
    credentials: true,
  });
  await app.listen(3001); // or your backend port
}
bootstrap();
