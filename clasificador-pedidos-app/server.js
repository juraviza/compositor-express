import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
const port = process.env.PORT || 4190;

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, vision: !!openai });
});

app.post('/api/read-order', upload.array('images', 6), async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ ok: false, message: 'Falta configurar OPENAI_API_KEY en el servidor.' });
    }
    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      return res.status(400).json({ ok: false, message: 'No se ha recibido ninguna imagen.' });
    }

    const content = [
      {
        type: 'input_text',
        text: `Lee estas fotos de un pedido manuscrito de bebidas. A veces recibirás dos versiones de la misma hoja: una foto original y otra pasada por modo escáner. Úsalas como ayuda visual, pero NO dupliques líneas si ves la misma hoja dos veces. MUY IMPORTANTE: estas hojas suelen tener productos escritos en la columna izquierda y cantidades o formatos en la columna derecha, emparejados por filas. Debes relacionar cada producto con la cantidad de su misma altura aunque haya flechas o la hoja esté inclinada. Devuelve SOLO JSON válido con esta forma exacta: {"lines":["2 coca cola","1 larios"],"notes":["texto dudoso si hace falta"],"uncertainLines":["línea que no se entiende bien"]}. Reglas: 1) una línea por producto, 2) intenta corregir nombres evidentes de bebidas, 3) si la cantidad no está clara, asume 1 y añádelo en notes, 4) interpreta correctamente formatos como "Beefeater 1 caja", "Beefeater ---- 1 caja", "Beefeater 1 und", "Larios 1 ud", "Brugal 1 unidad" y devuelve siempre la cantidad al principio, 5) cuando aparezca UND, UD o UNIDAD significa unidad, 6) cuando aparezca CAJA o CAJAS significa caja, 7) no uses la x como formato de cantidad porque este cliente no la usa así, 8) si una línea no se entiende bien o dudas del texto, añádela también en uncertainLines para que quede marcada, 9) junta todas las fotos en un solo pedido, 10) si puedes leer al menos parte de la hoja, devuelve esas líneas útiles aunque no estén todas perfectas, 11) ejemplo válido de salida: ["1 beefeater caja","2 larios unidad","10 coca cola caja","4 barriles"], 12) no expliques nada fuera del JSON.`
      },
      ...files.map((file) => ({
        type: 'input_image',
        image_url: `data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`
      }))
    ];

    let response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: [{ role: 'user', content }]
    });

    let text = (response.output_text || '').trim();
    let cleaned = text.replace(/^```json\s*/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
    let parsed = safeParseOrderJson(cleaned);

    const firstLines = Array.isArray(parsed.lines) ? parsed.lines.filter(Boolean) : [];
    if (!firstLines.length) {
      response = await openai.responses.create({
        model: 'gpt-4.1-mini',
        input: [{
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Reintenta la lectura del pedido manuscrito. Piensa en una lista con productos a la izquierda y cantidades a la derecha, emparejadas por filas. Prioriza sacar líneas útiles aunque sean aproximadas. No devuelvas lines vacío si puedes leer aunque sea parte de la hoja. Si dudas, usa uncertainLines. Devuelve solo JSON válido.'
            },
            ...content,
          ]
        }]
      });
      text = (response.output_text || '').trim();
      cleaned = text.replace(/^```json\s*/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
      parsed = safeParseOrderJson(cleaned);
    }
    const lines = Array.isArray(parsed.lines) ? parsed.lines.map((x) => String(x).trim()).filter(Boolean) : [];
    const notes = Array.isArray(parsed.notes) ? parsed.notes.map((x) => String(x).trim()).filter(Boolean) : [];
    const uncertainLines = Array.isArray(parsed.uncertainLines) ? parsed.uncertainLines.map((x) => String(x).trim()).filter(Boolean) : [];

    res.json({ ok: true, lines, notes, uncertainLines, raw: cleaned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'No se pudo leer la foto con IA.', error: String(error?.message || error) });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function safeParseOrderJson(text) {
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

app.listen(port, () => {
  console.log(`CANI-APP escuchando en http://0.0.0.0:${port}`);
});
