import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

const multer = require('multer');
const fs = require('fs');
const path = require('path');

let sharp: any = null;
let Tesseract: any = null;
try {
  sharp = require('sharp');
} catch {}
try {
  Tesseract = require('tesseract.js');
} catch {}
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
const MAX_READ_ORDER_IMAGES = 24;
const tessdataRootCandidates = [
  path.resolve(__dirname, '..'),
  path.resolve(process.cwd()),
  path.resolve(process.cwd(), 'compositor-express'),
];
const tessdataRoot = tessdataRootCandidates.find((candidate: string) => (
  fs.existsSync(path.join(candidate, 'spa.traineddata')) && fs.existsSync(path.join(candidate, 'eng.traineddata'))
));

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

  app.use('/api/read-order', upload.array('images', MAX_READ_ORDER_IMAGES), async (req: Request, res: Response) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ ok: false, message: 'Falta configurar OPENAI_API_KEY en el servidor.' });
      }

      const files = (Array.isArray((req as any).files) ? (req as any).files : []) as Array<{ mimetype?: string; buffer: Buffer }>;
      const usableFiles = files.slice(0, MAX_READ_ORDER_IMAGES);
      if (!usableFiles.length) {
        return res.status(400).json({ ok: false, message: 'No se ha recibido ninguna imagen.' });
      }

      const ocrHints = await extractOrderOcrHints(usableFiles);
      const imageContent = usableFiles.map((file) => ({
        type: 'input_image',
        image_url: `data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`,
      }));

      const plainText = await transcribeOrderAsLines(process.env.OPENAI_API_KEY, imageContent, ocrHints);
      let parsed: { lines: string[]; notes: string[]; uncertainLines: string[]; raw: string } = {
        lines: extractUsefulLinesFromRawText(plainText),
        notes: [],
        uncertainLines: [],
        raw: plainText,
      };

      if (!parsed.lines.length && ocrHints) {
        const hintLines = extractUsefulLinesFromRawText(ocrHints);
        if (hintLines.length) {
          parsed = {
            lines: hintLines,
            notes: ['Lectura recuperada desde OCR dedicado previo. Revísala.'],
            uncertainLines: hintLines,
            raw: ocrHints,
          };
        } else {
          const textOnlyRecovery = await recoverOrderFromOcrHints(process.env.OPENAI_API_KEY, ocrHints);
          const recoveredLines = extractUsefulLinesFromRawText(textOnlyRecovery);
          if (recoveredLines.length) {
            parsed = {
              lines: recoveredLines,
              notes: ['Lectura recuperada a partir del OCR dedicado previo. Revísala.'],
              uncertainLines: recoveredLines,
              raw: textOnlyRecovery,
            };
          } else {
            parsed = {
              lines: [],
              notes: ['El OCR dedicado sacó texto parcial, pero no pude estructurarlo bien.'],
              uncertainLines: [],
              raw: ocrHints,
            };
          }
        }
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

async function extractOrderOcrHints(files: Array<{ buffer: Buffer }>) {
  if (!sharp || !Tesseract) return '';

  const chunks: string[] = [];
  for (const file of files.slice(0, MAX_READ_ORDER_IMAGES)) {
    try {
      const processed = await preprocessForDedicatedOcr(file.buffer);
      const text = await runDedicatedOcr(processed);
      const cleaned = normalizeOcrText(text);
      if (cleaned) chunks.push(cleaned);
    } catch (error: any) {
      console.error('Dedicated OCR failed for one image:', error?.message || error);
    }
  }
  return chunks.join('\n\n--- OCR IMAGE ---\n\n').trim();
}

async function preprocessForDedicatedOcr(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .grayscale()
    .normalize()
    .linear(1.4, -12)
    .sharpen()
    .png()
    .toBuffer();
}

async function runDedicatedOcr(buffer: Buffer) {
  const options: Record<string, unknown> = { logger: () => {} };
  if (tessdataRoot) {
    options.langPath = `file://${tessdataRoot}`;
    options.gzip = false;
  }
  const result = await Tesseract.recognize(buffer, 'spa+eng', options);
  return String(result?.data?.text || '').trim();
}

function normalizeOcrText(text: string) {
  return String(text || '')
    .replace(/[|]/g, '1')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function transcribeOrderAsLines(apiKey: string, imageContent: any[], ocrHints: string) {
  return callOpenAIText(apiKey, [
    {
      type: 'input_text',
      text: `Lee estas fotos de un pedido manuscrito de bebidas y devuelve SOLO texto plano, una línea final de pedido por fila. No devuelvas JSON ni explicaciones. Reglas: 1) si hay varias versiones o recortes de la misma hoja, úsalos como apoyo pero no dupliques líneas, 2) los productos suelen ir a la izquierda y las cantidades o formatos a la derecha, 3) si recibes recortes de la mitad izquierda o derecha de la hoja, úsalos para alinear mejor cada fila entre producto y cantidad, 4) devuelve la cantidad al principio cuando puedas, 5) si la cantidad no está clara usa 1, 6) piensa fila por fila, 7) corrige nombres evidentes de bebidas, 8) si ves "bot.", "ud", "uds", "caja", "cajas", "barriles", "tercios" o similar, consérvalo al final de la línea, 9) ejemplos válidos: "2 cerveza barril jarras", "1 bot machaquito dulce", "3 tercios", "10 lata atun", "1 caja beefeater", "2 ud larios", "3 botellas vino tinto rioja", "2 cajas castellana". 10) si una línea está tachada, ignórala.${ocrHints ? `\n\nPISTAS OCR PREVIAS:\n${ocrHints}` : ''}`,
    },
    ...imageContent,
  ]);
}

async function recoverOrderFromOcrHints(apiKey: string, ocrHints: string) {
  return callOpenAIText(apiKey, [
    {
      type: 'input_text',
      text: `A partir de este texto OCR imperfecto de una hoja de pedido manuscrita, reconstruye una lista simple de pedido. Devuelve solo líneas de pedido, una por línea, con la cantidad al principio cuando se pueda inferir. Si una cantidad no está clara, usa 1. No devuelvas JSON ni explicaciones.\n\nTEXTO OCR:\n${ocrHints}`,
    },
  ]);
}

async function callOpenAIText(apiKey: string, content: any[]) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1',
      input: [{ role: 'user', content }],
    }),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json?.error?.message || 'OpenAI error');
  return String(json?.output_text || '').trim();
}

function extractUsefulLinesFromRawText(text: string) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean)
    .filter((line) => !/^```/.test(line))
    .filter((line) => !/^(json|lines|notes|uncertainLines)\b[:\s]*$/i.test(line))
    .filter((line) => !/^[\[{()}\],]+$/.test(line))
    .filter((line) => /[a-záéíóúñü]/i.test(line))
    .filter((line) => line.length >= 3)
    .slice(0, 40);
}

bootstrap();
