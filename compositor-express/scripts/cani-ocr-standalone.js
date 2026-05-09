const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
const caniUser = process.env.CANI_USER || 'canijo';
const caniPass = process.env.CANI_PASS || 'cani1234';
const caniPublic = String(process.env.CANI_PUBLIC || 'true').toLowerCase() === 'true';

const webRootCandidates = [
  path.resolve(__dirname, '../cani-web'),
  path.resolve(__dirname, '../../cani-web'),
  path.resolve(__dirname, '../../compositor-express/cani-web'),
  path.resolve(process.cwd(), 'cani-web'),
  path.resolve(process.cwd(), 'compositor-express/cani-web'),
];
const webRoot = webRootCandidates.find((candidate) => fs.existsSync(path.join(candidate, 'index.html')));
const tessdataRootCandidates = [
  path.resolve(__dirname, '..'),
  path.resolve(process.cwd()),
  path.resolve(process.cwd(), 'compositor-express'),
];
const tessdataRoot = tessdataRootCandidates.find((candidate) => (
  fs.existsSync(path.join(candidate, 'spa.traineddata')) && fs.existsSync(path.join(candidate, 'eng.traineddata'))
));

if (!webRoot) {
  console.error('CANI web root not found. Checked:', webRootCandidates);
}

function caniAuth(req, res, next) {
  if (caniPublic) return next();
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="CANI-APP privada"');
    return res.status(401).send('Acceso restringido');
  }
  const raw = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  const idx = raw.indexOf(':');
  const user = idx >= 0 ? raw.slice(0, idx) : '';
  const pass = idx >= 0 ? raw.slice(idx + 1) : '';
  if (user !== caniUser || pass !== caniPass) {
    res.setHeader('WWW-Authenticate', 'Basic realm="CANI-APP privada"');
    return res.status(401).send('Acceso restringido');
  }
  next();
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/vision-health', (_req, res) => {
  res.json({ ok: true, vision: !!process.env.OPENAI_API_KEY, standalone: true });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, vision: !!process.env.OPENAI_API_KEY, standalone: true, service: 'cani-ocr' });
});

app.get(['/cani', '/cani/'], caniAuth, (_req, res) => {
  if (!webRoot) {
    return res.status(500).send('CANI web root not found on server');
  }
  res.type('html').send(fs.readFileSync(path.join(webRoot, 'index.html'), 'utf8'));
});

app.use('/cani', caniAuth, (req, res, next) => {
  if (!webRoot) {
    return res.status(500).send('CANI web root not found on server');
  }
  return express.static(webRoot, { index: false })(req, res, next);
});

app.post('/api/read-order', upload.array('images', 12), async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ ok: false, message: 'Falta configurar OPENAI_API_KEY en el servidor.' });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      return res.status(400).json({ ok: false, message: 'No se ha recibido ninguna imagen.' });
    }

    const ocrHints = await extractOrderOcrHints(files);
    const imageContent = files.map((file) => ({
      type: 'input_image',
      image_url: `data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`,
    }));

    const plainText = await transcribeOrderAsLines(process.env.OPENAI_API_KEY, imageContent, ocrHints);
    let parsed = {
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

    const lines = Array.isArray(parsed.lines) ? parsed.lines.map((x) => String(x).trim()).filter(Boolean) : [];
    const notes = Array.isArray(parsed.notes) ? parsed.notes.map((x) => String(x).trim()).filter(Boolean) : [];
    const uncertainLines = Array.isArray(parsed.uncertainLines) ? parsed.uncertainLines.map((x) => String(x).trim()).filter(Boolean) : [];

    return res.json({ ok: true, lines, notes, uncertainLines, raw: parsed.raw || '' });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'No se pudo leer la foto con IA.', error: String(error?.message || error) });
  }
});

async function extractOrderOcrHints(files) {
  const chunks = [];
  for (const file of files.slice(0, 6)) {
    try {
      const processed = await preprocessForDedicatedOcr(file.buffer);
      const text = await runDedicatedOcr(processed);
      const cleaned = normalizeOcrText(text);
      if (cleaned) chunks.push(cleaned);
    } catch (error) {
      console.error('Dedicated OCR failed for one image:', error?.message || error);
    }
  }
  return chunks.join('\n\n--- OCR IMAGE ---\n\n').trim();
}

async function preprocessForDedicatedOcr(buffer) {
  return sharp(buffer)
    .rotate()
    .grayscale()
    .normalize()
    .linear(1.4, -12)
    .sharpen()
    .png()
    .toBuffer();
}

async function runDedicatedOcr(buffer) {
  const options = {
    logger: () => {},
  };

  if (tessdataRoot) {
    options.langPath = `file://${tessdataRoot}`;
    options.gzip = false;
  }

  const result = await Tesseract.recognize(buffer, 'spa+eng', options);
  return String(result?.data?.text || '').trim();
}

function normalizeOcrText(text) {
  return String(text || '')
    .replace(/[|]/g, '1')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function transcribeOrderAsLines(apiKey, imageContent, ocrHints) {
  return callOpenAIText(apiKey, [
    {
      type: 'input_text',
      text: `Lee estas fotos de un pedido manuscrito de bebidas y devuelve SOLO texto plano, una línea final de pedido por fila. No devuelvas JSON ni explicaciones. Reglas: 1) si hay varias versiones o recortes de la misma hoja, úsalos como apoyo pero no dupliques líneas, 2) los productos suelen ir a la izquierda y las cantidades o formatos a la derecha, 3) devuelve la cantidad al principio cuando puedas, 4) si la cantidad no está clara usa 1, 5) piensa fila por fila, 6) corrige nombres evidentes de bebidas, 7) si ves "bot.", "ud", "uds", "caja", "cajas", "barriles", "tercios" o similar, consérvalo al final de la línea, 8) ejemplos válidos: "2 cerveza barril jarras", "1 bot machaquito dulce", "3 tercios", "10 lata atun".${ocrHints ? `\n\nPISTAS OCR PREVIAS:\n${ocrHints}` : ''}`,
    },
    ...imageContent,
  ]);
}

async function transcribeOrderText(apiKey, content) {
  return callOpenAIText(apiKey, [
    {
      type: 'input_text',
      text: 'Transcribe esta hoja manuscrita como texto plano, línea por línea. No devuelvas JSON. No expliques nada. Solo escribe las líneas de productos con sus cantidades tal como las entiendas, una por línea. Si dudas en una línea, escríbela igual de la forma más probable.',
    },
    ...content,
  ]);
}

async function recoverOrderFromOcrHints(apiKey, ocrHints) {
  return callOpenAIText(apiKey, [
    {
      type: 'input_text',
      text: `A partir de este texto OCR imperfecto de una hoja de pedido manuscrita, reconstruye una lista simple de pedido. Devuelve solo líneas de pedido, una por línea, con la cantidad al principio cuando se pueda inferir. Si una cantidad no está clara, usa 1. No devuelvas JSON ni explicaciones.\n\nTEXTO OCR:\n${ocrHints}`,
    },
  ]);
}

async function callOpenAIText(apiKey, content) {
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

function safeParseOrderJson(text) {
  try {
    return normalizeParsedOrderJson(JSON.parse(text));
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return normalizeParsedOrderJson(JSON.parse(match[0]));
      } catch {
        // sigue a fallback de texto libre
      }
    }

    const fallbackLines = extractUsefulLinesFromRawText(text);
    if (fallbackLines.length) {
      return {
        lines: fallbackLines,
        notes: ['Lectura recuperada desde texto libre de la IA. Conviene revisarla.'],
        uncertainLines: fallbackLines,
      };
    }

    return { lines: [], notes: ['La IA no pudo devolver una lectura limpia.'], uncertainLines: ['Foto difícil de interpretar'] };
  }
}

function normalizeParsedOrderJson(parsed) {
  return {
    lines: Array.isArray(parsed?.lines) ? parsed.lines : [],
    notes: Array.isArray(parsed?.notes) ? parsed.notes : [],
    uncertainLines: Array.isArray(parsed?.uncertainLines) ? parsed.uncertainLines : [],
  };
}

function extractUsefulLinesFromRawText(text) {
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

const port = Number(process.env.PORT || 3001);
app.listen(port, '0.0.0.0', () => {
  console.log(`CANI OCR standalone listening on ${port}`);
});
