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

app.post('/api/read-order', upload.single('image'), async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ ok: false, message: 'Falta configurar OPENAI_API_KEY en el servidor.' });
    }
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No se ha recibido ninguna imagen.' });
    }

    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Lee esta foto de un pedido manuscrito de bebidas. Devuelve SOLO JSON válido con esta forma exacta: {"lines":["2 coca cola","1 larios"],"notes":["texto dudoso si hace falta"]}. Reglas: 1) una línea por producto, 2) intenta corregir nombres evidentes de bebidas, 3) si la cantidad no está clara, asume 1 y añádelo en notes, 4) interpreta correctamente formatos como "Beefeater 1 caja", "Beefeater ---- 1 caja", "Beefeater 1 und", "Coca Cola x 2" y devuelve siempre la cantidad al principio, 5) ignora palabras de unidad como caja, und, ud, unidad, botellas si no aportan categoría, 6) no expliques nada fuera del JSON.`
            },
            {
              type: 'input_image',
              image_url: `data:${mimeType};base64,${base64}`
            }
          ]
        }
      ]
    });

    const text = (response.output_text || '').trim();
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    const lines = Array.isArray(parsed.lines) ? parsed.lines.map((x) => String(x).trim()).filter(Boolean) : [];
    const notes = Array.isArray(parsed.notes) ? parsed.notes.map((x) => String(x).trim()).filter(Boolean) : [];

    res.json({ ok: true, lines, notes, raw: cleaned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'No se pudo leer la foto con IA.', error: String(error?.message || error) });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`CANI-APP escuchando en http://0.0.0.0:${port}`);
});
