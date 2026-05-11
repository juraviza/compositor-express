# APP MOZART WEB - Stack y MVP

## Objetivo técnico
Montar rápido una web premium, intuitiva y fácil de iterar para creación de letras y canciones con IA.

## Stack recomendado

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui para componentes base
- Framer Motion para microanimaciones

## Por qué
- rápido de construir
- elegante para UI premium
- buen SEO si hace falta landing pública
- fácil de escalar

### Backend
- Next.js API routes o NestJS si quieres separar
- para MVP, mejor empezar simple con backend integrado

### Base de datos
- PostgreSQL
- Prisma ORM

### Auth
- Clerk o Auth.js
- para MVP incluso se puede empezar sin auth compleja si es privado

### IA
- modelo principal para escritura
- sistema de estilos / referencias
- más adelante RAG para corpus de letras y recursos estilísticos

### Almacenamiento
- proyectos
- versiones de letras
- estilos guardados
- favoritos
- referencias

## MVP funcional

### Fase 1
- landing/home
- crear canción
- reescribir letra
- editor principal
- guardado de proyectos
- variaciones de letras
- selector de estilo y emoción

### Fase 2
- biblioteca de referencias
- memoria por proyecto
- comparación entre versiones
- favoritos de líneas
- exportación mejorada

### Fase 3
- audio demo
- topline suggestions
- colaboración
- branding premium avanzado

## Modelo de navegación recomendado
- sidebar fija
- topbar simple
- panel central dominante
- experiencia DAW-lite

## Componentes clave
- style chips
- emotion chips
- large text editor
- assistant actions panel
- version cards
- project cards
- comparison view

## Prioridad de producto
La calidad no va a venir solo del modelo.
Va a venir de:
1. buena UX
2. buena estructura de prompts
3. buen sistema de referencias
4. reescritura rápida
5. sensación de estudio de trabajo serio

## Riesgo principal
Convertir esto en un simple chat de IA.

## Protección contra ese riesgo
- interfaz de estudio
- acciones musicales concretas
- estructura por secciones
- versiones comparables
- memoria de estilo

## Primer sprint ideal
1. landing
2. pantalla nueva canción
3. estudio creativo con editor
4. guardar proyectos
5. 4 o 5 acciones rápidas de mejora

## Resultado esperado del MVP
Una persona entra, elige estilo, genera una canción, toca el estribillo, mejora un verso, guarda el proyecto y siente que ha trabajado en un estudio creativo, no en un chat.
