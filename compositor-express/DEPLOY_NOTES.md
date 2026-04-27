# Deploy Notes - Backend

## Render URL (when ready)
Backend URL will be something like: `https://compositor-api.onrender.com`

## After Render deploys:
1. Copy the Render URL
2. Update React Native API: `EXPO_PUBLIC_API_URL=https://tu-servicio.onrender.com/`
3. Build app with EAS

## For now - what's ready:
- ✅ Groq API configured (LLM)
- ✅ Neon PostgreSQL (database)
- ✅ Backblaze B2 (storage)
- ✅ Pixabay API (video search)
- ✅ Pexels API (video search)
- ✅ Database tables created
- ⏳ Backend deploying on Render

## Frontend needs:
- Update API URL to new Render URL
- Build with EAS or locally
