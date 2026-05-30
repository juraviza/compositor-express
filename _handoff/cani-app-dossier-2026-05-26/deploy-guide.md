# Guía de Despliegue — CANI-APP

## Entorno Local

### Requisitos
- Node.js 22.x
- npm
- Git
- Clave SSH configurada para GitHub

### Setup

```bash
# Clonar
git clone git@github.com:juraviza/compositor-express.git
cd compositor-express

# Instalar dependencias
npm install

# Crear .env
cp .env.example .env
```

### Variables de entorno (.env)

```env
# OpenAI (para GPT clasificación)
OPENAI_API_KEY=sk-...

# Google Cloud Vision (para OCR nube)
GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/google-vision-cani-vision.json

# Puerto
PORT=3000

# Entorno
NODE_ENV=development
```

### Arrancar

```bash
# Desarrollo (con hot reload)
npm run start:dev

# Producción local (standalone, sin NestJS)
node scripts/cani-ocr-standalone.js

# Tests
npm test
```

---

## Render (Producción)

### Configuración en Render Dashboard

1. **Servicio:** `compositor-express-1` (Node.js)
2. **Rama:** `deploy`
3. **Comando build:** `npm run build`
4. **Comando start:** `node scripts/cani-ocr-standalone.js`
5. **Variables de entorno:** las mismas que .env + `NODE_ENV=production`

### Desplegar

```bash
# Asegurarse de estar en deploy y tener los cambios
cd compositor-express
git checkout deploy
git pull origin deploy

# Push — Render detecta y despliega automáticamente
git push origin deploy

# Si no redeploya solo, forzar desde dashboard:
# Render → compositor-express-1 → Deploy → Trigger deploy
```

### Verificar despliegue

```bash
# Esperar ~30s y verificar
curl https://compositor-express-1.onrender.com/api/health

# Debe mostrar commit actual:
# {"ok":true,"vision":true,"standalone":true,
#  "commit":"<commit-de-deploy>","deployedAt":"<timestamp>"}
```

### ⚠️ Fallo común: producción stale

Render a veces no redeploya aunque haya push.
**Solución:**
1. Ir a Render Dashboard
2. Service → Deploys
3. Click "Trigger deploy" manually
4. Esperar 30-60s
5. Verificar `/api/health`

---

## GitHub Secrets (para CI/CD)

No configurado actualmente. Push a `deploy` es manual.

Si se quiere automatizar:
1. Añadir `RENDER_API_KEY` en GitHub repo → Settings → Secrets
2. Crear GitHub Action en `.github/workflows/deploy.yml`

---

## Rama de trabajo: `main`

- Aquí van los cambios nuevos (mejoras OCR, features)
- Cuando está listo para producción: merge o push a `deploy`
- NO desplegar `main` directamente

---

## Clave SSH para push

Si el push pide autenticación:

```bash
# Añadir clave SSH al ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/github_cani_ed25519

# Verificar
ssh -T git@github.com
```

La clave privada está en `/data/.openclaw/workspace/.keys/github_cani_ed25519`
(No compartir fuera del entorno)
