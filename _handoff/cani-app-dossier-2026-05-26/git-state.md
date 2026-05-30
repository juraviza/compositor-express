# Estado Git — compositor-express

## Ramas locales
```
* deploy       → la que despliega a producción (HEAD)
  main         → trabajo activo / mejoras
  master       → (no usar)
```

## Commits recientes en deploy (producción)
```
40cfb076  Backup automático 2026-05-26
bc39b8e8  Trigger CANI web deploy
97ab35c1  Backup automático 2026-05-21
7091f9c8  Backup automático 2026-05-17
32b6668f  Add Freebeat skill
e9b8cb62  Backup automático 2026-05-14
94e40908  Add @google-cloud/vision dependency  ← PRODUCCIÓN ACTUAL
```

## Commits importantes en main (NO en producción aún)
```
11bc4c61  Add Google Vision OCR as fallback for CANI handwritten orders
89c0dad4  Simplify APP MOZART WEB to single HTML file
acd69058  Create APP MOZART WEB prototype
5ed1f833  Make OCR native deps optional at startup
7e52b076  Ship sharp in production dependencies
db532d99  Use OCR fallback pipeline in CANI API
b799f7ce  Make Prisma optional during startup
3a231241  Allow more CANI OCR image variants
333be686  Add CANI deploy fingerprint endpoints
0b473cfe  Add CANI app handoff dossier
66be4a5e  Tune CANI OCR for real order samples
871c7f92  Improve CANI OCR with column crops
f8723159  Use plain-text vision transcription for CANI orders
```

## Estado actual (2026-05-26 09:41 UTC)
```
HEAD               = deploy
origin/deploy      = 40cfb076cb3aa71b2c56559d4faf83003076fe27
producción Render  = 94e4090806a43582a6a4c93a4a27e19a5aada364 ⚠️ STALE
main               = 11bc4c61 (commits de main NO están en producción)
```

## Remote
```
origin  git@github.com:juraviza/compositor-express.git
         (fetch + push, usando GHP token)
```

## Para poner producción al día
```bash
git checkout deploy
git merge main        # trae los cambios de main a deploy
git push origin deploy  # dispara redeploy en Render
# Si Render no redeploya solo → forzar manualmente desde dashboard
```

## Commit con Google Vision funcionando
- `94e40908` → Add @google-cloud/vision dependency (Google Vision activo en producción)
- `11bc4c61` → Add Google Vision OCR as fallback (en main, pendiente de deploy)

## Nota sobre commits de OCR (están en main, no en deploy)
```
66be4a5e  Tune CANI OCR for real order samples
871c7f92  Improve CANI OCR with column crops
f8723159  Use plain-text vision transcription
a0cc2f9b  Bundle local tessdata for CANI OCR
1bb3f8a7  Recover CANI lines from OCR hints more aggressively
448aa918  Add dedicated OCR pre-pass for CANI photos
86111089  Send OCR page crops for CANI photos
983ddd68  Add plain-text OCR fallback for CANI
e43004af  Add strong black-and-white OCR variant for CANI
ba0fdaa6  Strengthen CANI OCR image prep and prompt
b683d9cd  Auto-run OCR when CANI photos are uploaded
```
