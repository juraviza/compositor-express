# Arquitectura CANI-APP — Pipeline OCR

## Visión General

El sistema lee fotos de pedidos manuscritos y devuelve texto estructurado clasificado por categorías de producto.

---

## Stack Tecnológico

| Capa | Tecnología | Uso |
|------|-----------|-----|
| Frontend | HTML/CSS/JS vanilla | Sube fotos, muestra resultado |
| Pre-proceso imagen | `sharp` (Node.js) | Contraste, B/N, recortes |
| OCR local | `tesseract.js` v7 | Lectura manuscrito gratuita |
| OCR nube | Google Vision API | Lectura manuscrito avanzada |
| IA clasificación | OpenAI GPT (GPT-4o mini) | Reconstruye texto y clasifica |
| Servidor | Node.js + Express / NestJS | Expone endpoints |
| Hosting | Render.com | Producción |

---

## Flujo de datos

```
[1] cani-web/index.html
    Foto seleccionaada → app.js
           ↓
[2] Preproceso (app.js: enhanceImageForOCR)
    - Conversión JPEG
    - Reescala a 1500px máx
    - Contraste +40
    - Filtro B/N con threshold
    - Recortes: top, bottom, left, right (12 imágenes totales)
           ↓
[3] app.js: runOCRFromSelectedImage()
    POST multipart/form-data → /api/read-order
           ↓
[4] Backend: main.ts → handleOrderRead()
    Recibe array de imágenes (MAX 12)
           ↓
[5] OCR paralelo: Tesseract.js + Google Vision
    Tesseract: OCR-local-standalone (gratis)
    Vision:    Google Cloud Vision API (preciso)
           ↓
[6] OpenAI GPT clasifica y reconstruye
    Prompt en main.ts línea ~242
    Reglas: cantidad al principio, corregir nombres,
    ignorar tachados, formatos: bot/ud/caja/tercios
           ↓
[7] Respuesta JSON → app.js
    Muestra líneas clasificadas
    Clasificaciones: Bebidas alcohólicas, Cervezas,
    Refrescos, Aguas, Cocina, Limpieza
```

---

## Archivos clave del pipeline

### Frontend (preproceso + subida)
```
compositor-express/cani-web/app.js
  - enhanceImageForOCR(file)       → preproceso de imagen
  - runOCRFromSelectedImage()      → orchestration
  - buildOrderFromLines(lines)     → clasificación

compositor-express/cani-web/index.html
  - UI con: subir foto, resultado, copiar
```

### Backend (OCR + IA)
```
compositor-express/src/main.ts
  - handleOrderRead()              → endpoint POST /api/read-order
  - visionOCR()                    → Google Vision
  - buildOrderPrompt()             → prompt GPT

compositor-express/scripts/cani-ocr-standalone.js
  - Servidor standalone (producción)
  - Mismas funciones que main.ts pero sin NestJS
  - Puerto 3000
```

### Vocabulario de clasificación (en app.js)
```
PRODUCT_KEYWORDS: {
  "Bebidas alcohólicas": [...54 productos...],
  "Cervezas": [...12...],
  "Refrescos": [...17...],
  "Aguas y energéticas": [...8...],
  "Cocina y despensa": [...48...],
  "Limpieza e higiene": [...25...]
}
```

---

## Prompts GPT clave

### Prompt de lectura (main.ts:242)
```
"Lee estas fotos de un pedido manuscrito de bebidas y devuelve SOLO texto plano,
una línea final de pedido por fila. No devuelvas JSON ni explicaciones.
Reglas:
1) si hay varias versiones de la misma hoja, no dupliques líneas
2) productos a la izquierda, cantidades a la derecha
3) devuelve la cantidad al principio
4) si no está clara usa 1
5) corrige nombres evidentes de bebidas
6) formatos al final: bot., ud, caja, cajas, barriles, tercios
7) ejemplos: "2 cerveza barril jarras", "1 bot machaquito dulce"
8) si tachada, ignora"
```

### Prompt de reconstrucción (main.ts:252)
```
"A partir de este texto OCR imperfecto de una hoja de pedido manuscrita,
reconstruye una lista simple de pedido.
Devuelve solo líneas, cantidad al principio."
```

---

## Dependencias clave (package.json)

```json
{
  "@google-cloud/vision": "^5.3.6",  // OCR nube
  "tesseract.js": "^7.0.0",          // OCR local
  "sharp": "^0.34.2",                // Preproceso imagen
  "@nestjs/common": "^11.0.1",      // Servidor
  "openai": "...",                   // GPT (en main.ts)
  "class-transformer": "^0.5.1",
  "class-validator": "^0.15.1"
}
```

---

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check con commit y deployedAt |
| GET | `/api/vision-health` | Verify Google Vision connectivity |
| POST | `/api/read-order` | Lee pedido de fotos (multipart) |
| GET | `/cani/` | Frontend web (static files) |
