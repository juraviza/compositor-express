import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }));

  const swaggerPath = 'api-docs';
  app.use(`/${swaggerPath}`, (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Flamenquito Fusión API')
    .setDescription('API para generación, análisis y gestión de letras de flamenquito fusión')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'Flamenquito Fusión API',
    customCss: `
      .swagger-ui .topbar { display: none; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .swagger-ui .info .title { color: #b91c1c; }
      .swagger-ui .opblock.opblock-post { border-color: #16a34a; background: rgba(22,163,74,0.05); }
      .swagger-ui .opblock.opblock-get { border-color: #2563eb; background: rgba(37,99,235,0.05); }
    `,
    customfavIcon: 'https://abacus.ai/favicon.ico',
  });

  await app.listen(3000, '0.0.0.0');
  new Logger('Bootstrap').log('🎸 Flamenquito Fusión API running on port 3000');
}
bootstrap();
