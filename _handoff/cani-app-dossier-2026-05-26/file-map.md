# File Map — CANI-APP

## Directorio raíz del proyecto
```
/data/.openclaw/workspace/
├── compositor-express/          ← Proyecto principal (Node.js/NestJS)
│   ├── cani-web/                ← Frontend web (lo que ve Canijo)
│   ├── src/                     ← Backend NestJS
│   ├── scripts/                 ← Scripts standalone (production)
│   ├── tessdata/                ← Datos Tesseract OCR
│   ├── package.json
│   ├── package-lock.json
│   └── ...
├── CANI-APP-low-cost-plan.md
├── CANI-APP-phase1-ux-constraints.md
├── memory/
│   ├── 2026-05-13.md           ← Última sesión activa
│   └── 2026-05-09.md
└── _handoff/
    ├── cani-app-dossier-2026-05-10/   ← Viejo (no usar)
    └── cani-app-dossier-2026-05-26/   ← ESTE DOSSIER
```

---

## cani-web/ — Frontend (para Canijo)

| Archivo | Qué es |
|---------|--------|
| `index.html` | UI principal: subir foto, resultado, copiar |
| `app.js` | Lógica: preproceso imagen, subida, OCR, clasificación |
| `styles.css` | Estilos CSS |
| `logo-betis.jpg` | Logo para la portada |
| `portada-referencia.jpg` | Referencia visual de la UI original |

---

## src/ — Backend NestJS

| Archivo | Qué es |
|---------|--------|
| `main.ts` | Server NestJS, endpoints `/api/read-order`, prompts GPT |
| `encyclopedia/` | Datos de productos y categorías |

---

## scripts/ — Production standalone

| Archivo | Qué es |
|---------|--------|
| `cani-ocr-standalone.js` | Servidor Express standalone (el que corre en Render) |

---

## tessdata/

| Archivo | Qué es |
|---------|--------|
| `eng.traineddata` | Modelo OCR inglés |
| `spa.traineddata` | Modelo OCR español |

---

## .keys/ — Secretos

| Archivo | Qué es |
|---------|--------|
| `google-vision-cani-vision.json` | Service account Google Cloud Vision |
| `github_cani_ed25519` | Clave SSH privada para GitHub push |
| `github_cani_ed25519.pub` | Clave SSH pública |

---

## memory/

| Archivo | Qué es |
|---------|--------|
| `2026-05-13.md` | Resumen sesión donde se configuró Google Vision |
| `2026-05-09.md` | Resumen sesión previa |

---

## Raíz workspace

| Archivo | Qué es |
|---------|--------|
| `CANI-APP-low-cost-plan.md` | Decisiones de arquitectura y coste |
| `CANI-APP-phase1-ux-constraints.md` | Requisitos UX que debe respetar Canijo |
