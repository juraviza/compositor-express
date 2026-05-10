# DOSSIER CANI-APP - 2026-05-10

Este dossier deja el proyecto listo para retomarlo más adelante sin reconstruir el contexto desde cero.

## 1. Qué es cada cosa

### A. Implementación web usada para despliegue
- Carpeta: `compositor-express/cani-web/`
- Entrada UI: `compositor-express/cani-web/index.html`
- Lógica principal frontend: `compositor-express/cani-web/app.js`
- Estilos: `compositor-express/cani-web/styles.css`
- Backend OCR y servidor de producción: `compositor-express/scripts/cani-ocr-standalone.js`
- Package principal: `compositor-express/package.json`

### B. Base funcional original y referencia fuerte
- Carpeta: `clasificador-pedidos-app/`
- Servidor base: `clasificador-pedidos-app/server.js`
- UI original: `clasificador-pedidos-app/index.html`
- Lógica original: `clasificador-pedidos-app/app.js`
- Estilos: `clasificador-pedidos-app/styles.css`
- Memoria/documentación visual: `clasificador-pedidos-app/memoria-caniapp.html`
- PDF relacionado: `clasificador-pedidos-app/memoria-caniapp.pdf`

### C. APK / experimento móvil
- Carpeta: `cani-app-apk/`
- Estado: secundario. La preferencia final de Juan fue centrar la entrega en web.

## 2. URLs y despliegue
- URL pública objetivo: `https://compositor-express-1.onrender.com/cani/`
- Health general: `https://compositor-express-1.onrender.com/api/health`
- Vision health: `https://compositor-express-1.onrender.com/api/vision-health`
- Repo de despliegue: `juraviza/compositor-express`
- Remote git configurado en local: `git@github.com:juraviza/compositor-express.git`
- Rama que despliega Render: `deploy`
- Rama de trabajo local donde quedaron las mejoras OCR: `main`

## 3. Estado real al cerrar esta etapa
- El backend seguía respondiendo OK en `/api/health`.
- El problema principal dejó de ser disponibilidad y pasó a ser entrega final estable y lectura fiable.
- Se hicieron mejoras OCR reales orientadas a fotos manuscritas.
- El atasco serio fue que la web pública siguió sirviendo una versión vieja durante horas después de empujar cambios a `deploy`.
- Conclusión operativa: al retomar, lo primero es validar qué commit está sirviendo Render antes de seguir afinando OCR.

## 4. Cambios OCR importantes ya hechos

### En `compositor-express/cani-web/app.js`
- Se amplió memoria de productos con vocabulario real:
  - `machaquito dulce`
  - `machaquito seco`
  - `castellana`
  - `larios 12`
  - `nestea`
  - `coca cola zero`
- Se reforzó clasificación por keywords para bebidas, cervezas y refrescos.
- Se añadió lógica de recortes por columnas izquierda/derecha para OCR, en lugar de solo recortes top/bottom.
- Los recortes auxiliares quedaron del tipo `crop-left` y `crop-right`.

### En `compositor-express/scripts/cani-ocr-standalone.js`
- Se amplió el procesamiento hasta 12 imágenes por petición.
- `extractOrderOcrHints(files)` también quedó alineado a 12 archivos.
- El prompt se afinó para pedidos manuscritos reales:
  - producto a la izquierda
  - cantidad o formato a la derecha
  - ejemplos reales de salida
  - ignorar líneas tachadas
- Hay OCR dedicado previo con Tesseract y paso de reconstrucción textual con OpenAI.

## 5. Commits importantes a revisar
En `compositor-express`:
- `66be4a5e` - `Tune CANI OCR for real order samples`
- `871c7f92` - `Improve CANI OCR with column crops`
- `f8723159` - `Use plain-text vision transcription for CANI orders`
- `a0cc2f9b` - `Bundle local tessdata for CANI OCR`
- `1bb3f8a7` - `Recover CANI lines from OCR hints more aggressively`
- `448aa918` - `Add dedicated OCR pre-pass for CANI photos`
- `86111089` - `Send OCR page crops for CANI photos`
- `983ddd68` - `Add plain-text OCR fallback for CANI`
- `e43004af` - `Add strong black-and-white OCR variant for CANI`
- `789d65ea` - `Make CANI web public by default`
- `ba0fdaa6` - `Strengthen CANI OCR image prep and prompt`
- `b683d9cd` - `Auto-run OCR when CANI photos are uploaded`

## 6. Bloqueos y lecciones importantes
- No basta con que `deploy` tenga los commits, hay que verificar que Render sirva realmente esa versión.
- No compartir enlace sin revisar antes:
  - `/cani/`
  - `/cani/styles.css`
  - `/api/health`
- Juan no quería desvíos hacia APK si la salida principal ya era web.
- Si vuelve a haber bloqueo real, hay que escalarlo pronto y no quedarse solo monitorizando.

## 7. Dónde está la información útil
- Resumen operativo del día: `memory/2026-05-09.md`
- Memoria consolidada: `MEMORY.md`
- Plan/ideas de coste: `CANI-APP-low-cost-plan.md`
- Restricciones UX: `CANI-APP-phase1-ux-constraints.md`
- Este dossier incluye copia de los archivos clave dentro de `files/`

## 8. Secretos y acceso sensible
No he metido secretos dentro de este dossier comprimido.
Pero conviene recordar estas ubicaciones sensibles para cuando se retome:
- Clave SSH de despliegue GitHub: `.keys/github_cani_ed25519`
- Clave pública asociada: `.keys/github_cani_ed25519.pub`

No compartir esos archivos fuera del entorno.

## 9. Reanudación recomendada, por orden
1. Verificar qué commit está sirviendo realmente Render en la URL pública.
2. Confirmar si `deploy` y producción coinciden o no.
3. Si producción sigue vieja, forzar o revisar redeploy antes de tocar OCR.
4. Solo después, probar otra vez con las fotos reales de Juan.
5. Si falla lectura en ejemplos reales, seguir afinando sobre `app.js` y `cani-ocr-standalone.js`.

## 10. Contenido del comprimido
- `README.md` - resumen humano para retomar rápido
- `file-map.txt` - mapa de rutas
- `compositor-express-git.txt` - estado git y commits recientes
- `workspace-root.txt` - vista rápida del workspace
- `files/` - copias de archivos fuente y docs relevantes
