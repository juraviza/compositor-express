# Troubleshooting — CANI-APP

## Problema: Producción sirve commit viejo

**Síntoma:**
```bash
curl https://compositor-express-1.onrender.com/api/health
# → commit: 94e4090806a43582a6a4c93a4a27e19a5aada364 (mayo 13!)
# pero origin/deploy = 40cfb076cb3aa71b2c56559d4faf83003076fe27
```

**Causa:** Render no redeployó después del push.

**Solución (por orden):**
1. `git push origin deploy --force` (forzar push)
2. Ir a Render Dashboard → compositor-express-1 → Deploys → Trigger deploy
3. Esperar 30-60s
4. Volver a verificar `/api/health`

---

## Problema: Google Vision devuelve error 403

**Síntoma:**
```json
{"ok":true,"vision":false,"standalone":true,...}
```

**Causas posibles:**
- API no habilitada en Google Cloud Console
- Service account key mal configurada
- Variable de entorno `GOOGLE_APPLICATION_CREDENTIALS` no apunta al JSON

**Solución:**
1. Ir a https://console.cloud.google.com/apis/library/vision.googleapis.com
2. Verificar que "cani-vision" tiene la API habilitada
3. Verificar que el JSON de service account es correcto:
   ```bash
   cat /data/.openclaw/workspace/.keys/google-vision-cani-vision.json
   ```
4. Verificar que `GOOGLE_APPLICATION_CREDENTIALS` en Render apunta al archivo

---

## Problema: Tesseract no encuentra tessdata

**Síntoma:**
```
Error: ENOENT: no such file or directory, open './tessdata/eng.traineddata'
```

**Solución:**
- Asegurarse de que el directorio `tessdata/` existe en el root del proyecto
- Los archivos `*.traineddata` están en `compositor-express/tessdata/`

---

## Problema: App lenta o no responde en producción

**Causa:** Render gratis hiberna tras 15 min de inactividad. El primer request wake-up tarda ~30s.

**Solución:** No es un bug, es comportamiento esperado del tier gratis.
- Hacer ping periódico si se necesita instantaneidad
- Considerar tier de pago para producción activa

---

## Problema: OCR clasifica mal productos

**Causa:** El nombre manuscrito no está en el vocabulario keywords.

**Solución:**
1. Añadir el producto fallido a `PRODUCT_KEYWORDS` en `app.js`
2. Push a `deploy`
3. Verificar que producción se actualiza (si no, forzar redeploy)

**Ejemplo de productos ya conocidos:**
```
Bebidas: beefeater, larios, machaquito, castellana, nordes, jager...
Cervezas: cruzcampo, mahou, estrella, heineken, san miguel...
Cocina: arroz, pasta, aceite, tomate frito, lentejas, garbanzos...
```

---

## Problema: Render build falla

**Síntoma:** Deploy rojo en Render dashboard.

**Solución:**
1. Ver logs de build en Render → Deploys → Latest → Logs
2. Errores comunes:
   - Falta `npm install` → revisar `package.json` y `package-lock.json`
   - Errores TypeScript → `npm run build` en local
   - Variables de entorno faltantes → añadir en Render Dashboard

---

## Comandos de diagnóstico

```bash
# Ver qué commit sirve producción
curl https://compositor-express-1.onrender.com/api/health

# Ver qué commit tiene deploy
cd compositor-express && git rev-parse origin/deploy

# Ver estado git
cd compositor-express && git status && git log --oneline -5

# Test local
node scripts/cani-ocr-standalone.js
# luego: curl -X POST http://localhost:3000/api/read-order ...

# Ver tessdata
ls compositor-express/tessdata/
```

---

## Contacto / Acceso

- **Render Dashboard:** https://dashboard.render.com
- **Repo:** git@github.com:juraviza/compositor-express.git
- **Rama producción:** `deploy`
- **Rama desarrollo:** `main`
