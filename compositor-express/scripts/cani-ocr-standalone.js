const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
const webRoot = path.resolve(__dirname, '../cani-web');
const caniUser = process.env.CANI_USER || 'canijo';
const caniPass = process.env.CANI_PASS || 'cani1234';

function caniAuth(req, res, next) {
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
  res.type('html').send(fs.readFileSync(path.join(webRoot, 'index.html'), 'utf8'));
});

app.use('/cani', caniAuth, express.static(webRoot, { index: false }));

app.post('/api/read-order', upload.array('images', 6), async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ ok: false, message: 'Falta configurar OPENAI_API_KEY en el servidor.' });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      return res.status(400).json({ ok: false, message: 'No se ha recibido ninguna imagen.' });
    }

    const content = [
      {
        type: 'input_text',
        text: 'Lee estas fotos de un pedido manuscrito de bebidas. A veces recibirás dos versiones de la misma hoja: una foto original y otra pasada por modo escáner. Úsalas como ayuda visual, pero NO dupliques líneas si ves la misma hoja dos veces. MUY IMPORTANTE: estas hojas suelen tener productos escritos en la columna izquierda y cantidades o formatos en la columna derecha, emparejados por filas. Debes relacionar cada producto con la cantidad de su misma altura aunque haya flechas o la hoja esté inclinada. Devuelve SOLO JSON válido con esta forma exacta: {"lines":["2 coca cola","1 larios"],"notes":["texto dudoso si hace falta"],"uncertainLines":["línea que no se entiende bien"]}. Reglas: 1) una línea por producto, 2) intenta corregir nombres evidentes de bebidas, 3) si la cantidad no está clara, asume 1 y añádelo en notes, 4) interpreta correctamente formatos como "Beefeater 1 caja", "Beefeater ---- 1 caja", "Beefeater 1 und", "Larios 1 ud", "Brugal 1 unidad" y devuelve siempre la cantidad al principio, 5) cuando aparezca UND, UD o UNIDAD significa unidad, 6) cuando aparezca CAJA o CAJAS significa caja, 7) no uses la x como formato de cantidad porque este cliente no la usa así, 8) si una línea no se entiende bien o dudas del texto, añádela también en uncertainLines para que quede marcada, 9) junta todas las fotos en un solo pedido, 10) si puedes leer al menos parte de la hoja, devuelve esas líneas útiles aunque no estén todas perfectas, 11) ejemplo válido de salida: ["1 beefeater caja","2 larios unidad","10 coca cola caja","4 barriles"], 12) no expliques nada fuera del JSON.'
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

    const lines = Array.isArray(parsed.lines) ? parsed.lines.map((x) => String(x).trim()).filter(Boolean) : [];
    const notes = Array.isArray(parsed.notes) ? parsed.notes.map((x) => String(x).trim()).filter(Boolean) : [];
    const uncertainLines = Array.isArray(parsed.uncertainLines) ? parsed.uncertainLines.map((x) => String(x).trim()).filter(Boolean) : [];

    return res.json({ ok: true, lines, notes, uncertainLines, raw: parsed.raw || '' });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'No se pudo leer la foto con IA.', error: String(error?.message || error) });
  }
});

async function readOrderWithOpenAI(apiKey, content) {
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
  if (!response.ok) throw new Error(json?.error?.message || 'OpenAI error');

  const text = String(json?.output_text || '').trim();
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
  const parsed = safeParseOrderJson(cleaned);
  return { ...parsed, raw: cleaned };
}

function safeParseOrderJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { lines: [], notes: ['La IA no pudo devolver una lectura limpia.'], uncertainLines: ['Foto difícil de interpretar'] };
    try {
      return JSON.parse(match[0]);
    } catch {
      return { lines: [], notes: ['La IA devolvió una lectura incompleta.'], uncertainLines: ['Foto difícil de interpretar'] };
    }
  }
}

const port = Number(process.env.PORT || 3001);
app.listen(port, '0.0.0.0', () => {
  console.log(`CANI OCR standalone listening on ${port}`);
});
