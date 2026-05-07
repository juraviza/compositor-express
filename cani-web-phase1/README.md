# CANI web phase 1

Primera versión privada y mínima de CANI-APP en formato web.

## Qué conserva
- Misma base visual de la app ya presentada
- Mismo branding CANI-APP
- Mismo flujo principal de subir fotos, leer pedido y copiar resultado

## Qué cambia
- Ya no depende de APK
- Se abre en navegador
- Se protege con usuario y contraseña
- Reenvía `/api/*` al backend OCR ya existente

## Archivos clave
- `index.html`: interfaz extraída de la app
- `server.js`: servidor privado simple con Basic Auth y proxy API
- `start.sh`: arranque rápido

## Arranque rápido
```sh
cd /data/.openclaw/workspace/cani-web-phase1
chmod +x start.sh
CANI_USER='usuario' CANI_PASS='clave-segura' CANI_API_TARGET='http://187.127.72.117:3000' ./start.sh
```

## Acceso
Abrir en navegador:
- `http://TU_IP_O_DOMINIO:3187`

## Nota
La interfaz ahora usa mismo origen para `/api`, así que el navegador habla con este servidor privado y este hace proxy al backend real.

Por defecto `start.sh` apunta al backend actual del VPS `http://187.127.72.117:3000`.
