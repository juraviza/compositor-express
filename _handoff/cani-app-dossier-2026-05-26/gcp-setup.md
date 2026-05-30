# Google Cloud Vision — Setup

## Proyecto
- **Nombre:** cani-vision
- **ID proyecto:** cani-vision
- **Número proyecto:** cani-vision-590

## Service Account
- **Email:** `cani-vision-590@cani-vision.iam.gserviceaccount.com`
- **Rol:** Project → Owner (o Editor con APIs relevantes)
- **Key JSON:** en `/data/.openclaw/workspace/.keys/google-vision-cani-vision.json`

## API Habilitada
- **Cloud Vision API** ✅ (habilitada desde 2026-05-13)

## Cómo verificar

### Local
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/data/.openclaw/workspace/.keys/google-vision-cani-vision.json

# Test rápido con node
node -e "
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
client.textDetection({image: {source: {filename: 'test.jpg'}}})
  .then(r => console.log(r[0].textAnnotations[0].description))
  .catch(e => console.error(e));
"
```

### Producción (Render)
- Variable de entorno: `GOOGLE_APPLICATION_CREDENTIALS`
- Debe apuntar al path donde está el JSON en el container de Render
- El JSON se sube a Render en Settings → Environment → Variables

## Si se pierde la clave
1. Google Cloud Console → IAM → Service Accounts
2. Seleccionar `cani-vision-590`
3. Keys → Add Key → JSON
4. Descargar y guardar en `.keys/google-vision-cani-vision.json`
5. Subir a Render si cambia
