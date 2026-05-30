# DOSSIER CANI-APP — 2026-05-26

Proyecto: **CANI-APP** — Clasificador de pedidos manuscritos por foto para Canijo.
Objetivo: que cualquier IA pueda retomar el proyecto sin perder contexto.

---

## QUÉ ES

Una herramienta web privada (no APK) para fotografiar pedidos manuscritos de bebidas/restaurante y que el sistema los lea, clasifique y estructura automáticamente.

**Flujo:**
1. Canijo sube foto(s) del pedido desde el móvil
2. El sistema lee el texto manuscrito (OCR)
3. Clasifica cada línea: producto → categoría correcta
4. Devuelve texto estructurado listo para copiar/pegar

**Usuario principal:** Canijo (Camarero de bar Betis, jeito). Necesita algo que funcione en su móvil sin instalar nada.

---

## ARQUITECTURA

```
[Frontend: cani-web/]     →  HTML+JS/CSS estático
     │                           (sube fotos, muestra resultado)
     ↓ POST /api/read-order
[Backend: cani-ocr-standalone.js] → Servidor Node.js
     │
     ├─ Tesseract.js  (OCR local gratuito, pre-proceso)
     └─ OpenAI GPT    (reconstrucción y clasificación del texto)
     └─ Google Vision (OCR en la nube, activo en producción)
```

- **Repo:** `juraviza/compositor-express` en GitHub
- **Ramas:**
  - `main` — trabajo activo (mejoras OCR)
  - `deploy` — la que despliega Render a producción
- **Hosting producción:** Render (gratis tier, hiberna tras 15 min inactivo)

---

## FILE MAP — Archivos importantes

### Web frontend (la que usa Canijo)
```
compositor-express/cani-web/index.html   ← UI principal
compositor-express/cani-web/app.js      ← lógica frontend (subida fotos, OCR, clasificación)
compositor-express/cani-web/styles.css   ← estilos
compositor-express/cani-web/logo-betis.jpg
```

### Backend OCR (el que procesa las fotos)
```
compositor-express/scripts/cani-ocr-standalone.js  ← servidor production
compositor-express/src/main.ts                      ← servidor NestJS (para API completa)
```

### Config
```
compositor-express/package.json
compositor-express/.env.example
```

### Docs
```
CANI-APP-low-cost-plan.md       ← decisiones de coste y arquitectura
CANI-APP-phase1-ux-constraints.md ← UX que debe respetar Canijo
memory/2026-05-13.md            ← resumen de la última sesión activa
```

---

## URLs DE PRODUCCIÓN

- **App:** https://compositor-express-1.onrender.com/cani/
- **Health:** https://compositor-express-1.onrender.com/api/health
- **Vision health:** https://compositor-express-1.onrender.com/api/vision-health
- **Repo:** git@github.com:juraviza/compositor-express.git

---

## ESTADO ACTUAL ⚠️

**El atasco principal (persistente desde 2026-05-13):**

- `deploy` en local = commit `40cfb076` (2026-05-26, backup automático)
- Producción en Render sirve = commit `94e40908` (2026-05-13, 13 días desfasado)
- El deploy en Render no se ha refrescado con los commits nuevos
- La web `/cani/` funciona, pero con código viejo (sin las mejoras de `main`)

**Pasos para desbloquear:**
1. Desde local, hacer push de `main` → `origin/deploy`
2. Verificar que Render recompila (Logs en Render dashboard)
3. Forzar redeploy si no recompila solo

---

## PIPELINE OCR (cómo funciona)

### Flujo completo de una lectura de pedido:

```
1. Foto subida desde cani-web/index.html
         ↓
2. app.js → preprocesa imagen (sharp: contraste,bn,recortes)
         ↓
3. POST /api/read-order (rutas en main.ts o cani-ocr-standalone.js)
         ↓
4a. Tesseract.js → OCR local, texto "sucio"
         ↓
4b. Google Vision (production) → OCR nube, más preciso
         ↓
5. OpenAI GPT → reconstruye texto, clasifica por categorías
         (prompt con ejemplos de productos, cantidades, formatos)
         ↓
6. Respuesta: líneas estructuradas "2 cerveza barril" → categoría: Cervezas
```

### Categorías de productos (memorizadas en `app.js`):
- Bebidas alcohólicas (54 productos)
- Cervezas (12)
- Refrescos (17)
- Aguas y energéticas (8)
- Cocina y despensa (48)
- Limpieza e higiene (25)

### Vocabulario OCR (para corregir nombres):
```
beefeater, beefeter (→ Beefeater)
larios, larios 12
machaquito dulce, machaquito seco
castellana
coca cola zero
nestea, aquarius limon, etc.
```

---

## VARIABLES DE ENTORNO NECESARIAS

```env
OPENAI_API_KEY=sk-...                    # OpenAI para GPT
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-vision-key.json
PORT=3000
NODE_ENV=production
```

### Clave Google Cloud Vision
- Fichero: `/data/.openclaw/workspace/.keys/google-vision-cani-vision.json`
- Proyecto GCP: **cani-vision**
- Service Account: `cani-vision-590@cani-vision.iam.gserviceaccount.com`
- API Vision habilitada en Google Cloud ✅ (verificado 2026-05-13)

### Clave SSH para push a GitHub
- `.keys/github_cani_ed25519` (privada)
- `.keys/github_cani_ed25519.pub` (pública)

---

## CMO ARRANCAR LOCAL

```bash
# Clonar repo
git clone git@github.com:juraviza/compositor-express.git
cd compositor-express

# Instalar
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tus claves

# Arrancar en local
npm run start:dev

# O solo el servidor OCR standalone (suficiente para test):
node scripts/cani-ocr-standalone.js
# (escucha en http://localhost:3000/cani/)

# Tests con fotos reales:
# POST a http://localhost:3000/api/read-order
# Content-Type: multipart/form-data
# campo: files[] (imágenes)
```

---

## CMO DESPLEGAR A RENDER

```bash
# 1. Asegurarse de que deploy tiene los cambios deseados
cd compositor-express
git checkout deploy
git merge main  # o cherry-pick de commits concretos

# 2. Push a GitHub
git push origin deploy

# 3. Render detecta el push y recompila automáticamente
#    (pero no siempre — puede que haga falta forzar redeploy)

# 4. Verificar en Render Dashboard:
#    - Logs de build
#    - /api/health después de deploy
```

**⚠️ IMPORTANTE:** Después de cada push a `deploy`, VERIFICAR que producción sirve el commit nuevo:
```bash
curl https://compositor-express-1.onrender.com/api/health
# Buscar el campo "commit" y comparar con git rev-parse origin/deploy
```

Si no coincide, forzar redeploy desde Render Dashboard → manually deploy.

---

## ERRORES CONOCIDOS Y SOLUCIONES

### Error: producción sirve commit viejo
**Síntoma:** `/api/health` devuelve commit antiguo (94e40908).
**Solución:**
1. `git push origin deploy` (push forzado si hace falta)
2. Ir a Render Dashboard → Services → compositor-express-1 → Deploy → manually deploy
3. Esperar ~30s y recheckear `/api/health`

### Error: Tesseract no encuentra tessdata
**Síntoma:** `Error: tessdata not found`
**Solución:** Asegurarse de que `tessdata/` está en el working directory del script

### Error: Google Vision 403
**Síntoma:** Vision health devuelve error
**Solución:** Revisar que `GOOGLE_APPLICATION_CREDENTIALS` apunta al JSON de service account y que la API está habilitada en GCP

---

## MEMORIA DE PRODUCTOS

Lista completa de productos conocidos por la clasificación (copia en `files/memoria-caniapp.html`):

- **Bebidas alcohólicas:** 100 pipers, absolut, anís del mono, arehucas, bacardi, baileys, ballantine, barceló, beefeater, black label, bombay, bombay sapphire, brugal, cacique, ciroc, cutty sark, dyc, gordon, havana club, j&b, jager, jameson, johnnie walker, lambrusco, larios, larios 12, legendario, licor 43, martini, miura, nordes, passport, puerto de indias, red label, ribera, rioja, rives, santa teresa, seagram, smirnoff, tanqueray, tequila, vermut, white label...
- **Cervezas:** aguila, alhambra, amstel, cruzcampo, estrella, estrella galicia, heineken, mahou, radler, san miguel, victoria...
- **Refrescos:** aquarius, coca cola, cocacola, fanta, kas, nestea, sprite, tónica...
- **Cocina:** aceite, arroz, atún, caldo, garbanzos, harina, huevos, lentejas, pasta, patatas, tomate frito...
- **Limpieza:** fairy, detergente, lejía, lavavajillas, papel higiénico, gel hidroalcohólico...

---

## PARA QUÉ OTRA IA NECESITA SABER

- El proyecto se llama CANI-APP internamente, pero es una web clasificador de pedidos manuscritos de un bar/restaurante.
- **No es una APK.** Es una web responsive que Canijo usa desde el móvil.
- **El deploy en Render está stale.** Necesita empujar código fresco o forzar redeploy.
- **La rama `main` tiene los cambios nuevos** que aún no están en producción.
- Si se van a tocar fotos o预处理 de imagen → revisar `app.js` y `cani-ocr-standalone.js`.
- Si se va a cambiar el motor OCR → el pipeline es Tesseract → Google Vision → OpenAI.
- El branding visual debe mantener "Betis" y los colores que Canijo reconoce.
