import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

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

  const publicDir = path.join(__dirname, 'public');
  expressApp.use(express.static(publicDir));

  // Catch-all for non-API routes
  expressApp.get(/^(?!\/api).*/, (req, res) => {
    const cleanPath = req.path.replace(/\/+$/, '').replace(/^\//, '');
    const candidates = cleanPath
      ? [
          path.join(publicDir, `${cleanPath}.html`),
          path.join(publicDir, cleanPath, 'index.html'),
        ]
      : [path.join(publicDir, 'index.html')];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return res.sendFile(candidate);
      }
    }

    return res.sendFile(path.join(publicDir, 'index.html'));
  });

  await app.listen(port);
}
bootstrap();
