import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

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

  const commit = process.env.RENDER_GIT_COMMIT || process.env.COMMIT_SHA || process.env.GIT_COMMIT || 'unknown';
  const deployedAt = new Date().toISOString();
  const healthPayload = { ok: true, vision: !!process.env.OPENAI_API_KEY, service: 'cani-ocr', commit, deployedAt };

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-CANI-Commit', commit);
    next();
  });

  app.use('/api/vision-health', (_req: Request, res: Response) => {
    res.json(healthPayload);
  });

  app.use('/api/health', (_req: Request, res: Response) => {
    res.json(healthPayload);
  });

  app.use('/api/version', (_req: Request, res: Response) => {
    res.json(healthPayload);
  });

  app.use('/api/read-order', upload.array('images', 6), async (req: Request, res: Response) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ ok: false, message: 'Falta configurar OPENAI_API_KEY en el servidor.' });
      }

      const files = (Array.isArray((req as any).files) ? (req as any).files : []) as Array<{ mimetype?: string; buffer: Buffer }>;
      if (!files.length) {
        return res.status(400).json({ ok: false, message: 'No se ha recibido ninguna imagen.' });
      }

      const content = [
        {
          type: 'input_text',
          text: 'Lee estas fotos de un pedido manuscrito de bebidas. A veces recibirás dos versiones de la misma hoja: una foto original y otra pasada por modo escáner. Úsalas como ayuda visual, pero NO dupliques líneas si ves la misma hoja dos veces. MUY IMPORTANTE: estas hojas suelen tener productos escritos en la columna izquierda y cantidades o formatos en la columna derecha, emparejados por filas. Debes relacionar cada producto con la cantidad de su misma altura aunque haya flechas o la hoja esté inclinada. Devuelve SOLO JSON válido con esta forma exacta: {"lines":["2 coca cola","1 larios"],"notes":["texto dudoso si hace falta"],"uncertainLines":["línea que no se entiende bien"]}. Reglas: 1) una línea por producto, 2) intenta corregir nombres evidentes de bebidas, 3) si la cantidad no está clara, asume 1 y añádelo en notes, 4) interpreta correctamente formatos como "Beefeater 1 caja", "Beefeater ---- 1 caja", "Beefeater 1 und", "Larios 1 ud", "Brugal 1 unidad" y devuelve siempre la cantidad al principio, 5) cuando aparezca UND, UD o UNIDAD significa unidad, 6) cuando aparezca CAJA o CAJAS significa caja, 7) no uses la x como formato de cantidad porque este cliente no la usa así, 8) si una línea no se entiende bien o dudas del texto, añádela también en uncertainLines para que quede marcada, 9) junta todas las fotos en un solo pedido, 10) si puedes leer al menos parte de la hoja, devuelve esas líneas útiles aunque no estén todas perfectas, 11) ejemplo válido de salida: ["1 beefeater caja","2 larios unidad","10 coca cola caja","4 barriles"], 12) no expliques nada fuera del JSON.',
        },
        ...files.map((file) => ({
          type: 'input_image',
          image_url: `data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`,
        })),
      ];

      let parsed = await readOrderWithOpenAI(process.env.OPENAI_API_KEY, content);
      const firstLines = Array.isArray(parsed.lines) ? parsed.lines.filter(Boolean) : [];

      if (!firstLines.length) {
        parsed = await readOrderWithOpenAI(process.env.OPENAI_API_KEY, [
          {
            type: 'input_text',
            text: 'Reintenta la lectura del pedido manuscrito. Piensa en una lista con productos a la izquierda y cantidades a la derecha, emparejadas por filas. Prioriza sacar líneas útiles aunque sean aproximadas. No devuelvas lines vacío si puedes leer aunque sea parte de la hoja. Si dudas, usa uncertainLines. Devuelve solo JSON válido.',
          },
          ...content,
        ]);
      }

      const lines = Array.isArray(parsed.lines) ? parsed.lines.map((x: unknown) => String(x).trim()).filter(Boolean) : [];
      const notes = Array.isArray(parsed.notes) ? parsed.notes.map((x: unknown) => String(x).trim()).filter(Boolean) : [];
      const uncertainLines = Array.isArray(parsed.uncertainLines) ? parsed.uncertainLines.map((x: unknown) => String(x).trim()).filter(Boolean) : [];

      return res.json({ ok: true, lines, notes, uncertainLines, raw: parsed.raw || '' });
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: 'No se pudo leer la foto con IA.', error: String(error?.message || error) });
    }
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

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`🎸 Flamenquito Fusión API running on port ${port}`);
}

async function readOrderWithOpenAI(apiKey: string, content: any[]) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [{ role: 'user', content }],
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message || 'OpenAI error');
  }

  const text = String(json?.output_text || '').trim();
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
  const parsed = safeParseOrderJson(cleaned);
  return { ...parsed, raw: cleaned };
}

function safeParseOrderJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return { lines: [], notes: ['La IA no pudo devolver una lectura limpia.'], uncertainLines: ['Foto difícil de interpretar'] };
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return { lines: [], notes: ['La IA devolvió una lectura incompleta.'], uncertainLines: ['Foto difícil de interpretar'] };
    }
  }
}

bootstrap();
