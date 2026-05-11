# APP MOZART WEB - Wireframes y estructura

## Objetivo
Bajar el concepto a pantallas claras y ejecutables.

---

# 1. HOME / LOBBY DEL ESTUDIO

## Objetivo de esta pantalla
- explicar el valor en 5 segundos
- inspirar
- llevar a crear sin fricción

## Wireframe

```text
┌─────────────────────────────────────────────────────────────────────┐
│ LOGO APP MOZART WEB                            Entrar | Proyectos   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   TITULAR GRANDE                                                    │
│   Escribe canciones con alma, estilo y dirección real               │
│                                                                     │
│   Subtítulo                                                         │
│   Tu estudio creativo para generar, reescribir y pulir letras       │
│   en distintos estilos musicales                                    │
│                                                                     │
│   [ Empezar canción ]   [ Mejorar una letra ]                       │
│                                                                     │
│   Tarjetas rápidas                                                  │
│   [ Pop ] [ Reggaetón ] [ Flamenco pop ] [ Trap ] [ Balada ]        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Accesos directos                                                   │
│  [ Estribillo ] [ Verso ] [ Canción completa ] [ Reescribir ]       │
├─────────────────────────────────────────────────────────────────────┤
│  Muestras                                                          │
│  Tarjeta 1   Tarjeta 2   Tarjeta 3                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Proyectos recientes / Biblioteca                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Claves UX
- solo 2 CTAs principales
- impacto visual fuerte arriba
- accesos rápidos debajo
- cero sensación de panel técnico

---

# 2. NUEVA CANCIÓN

## Objetivo
Que el usuario pase de una idea a una dirección creativa en menos de 1 minuto.

## Wireframe

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ← Volver                       Nueva canción                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ¿Qué quieres contar hoy?                                           │
│  [______________________________________________________________]   │
│                                                                     │
│  Elige estilo                                                       │
│  [ Pop ] [ Reggaetón ] [ Trap ] [ Flamenco pop ] [ Bachata ]        │
│  [ Balada ] [ Afrobeats ] [ Urbano melódico ]                       │
│                                                                     │
│  Emoción                                                            │
│  [ Romántica ] [ Triste ] [ Calle ] [ Sensual ] [ Eufórica ]        │
│                                                                     │
│  Referencia artística                                               │
│  [______________________________________________________________]   │
│                                                                     │
│  Tipo de resultado                                                  │
│  ( ) Canción completa                                               │
│  ( ) Solo estribillo                                                │
│  ( ) Solo verso                                                     │
│  ( ) Mejorar una letra                                              │
│                                                                     │
│  Intensidad comercial                                               │
│  [ Poética ----●------ Comercial ]                                  │
│                                                                     │
│                            [ Entrar al estudio ]                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Claves UX
- usar chips y botones grandes
- lenguaje humano
- no meter demasiadas opciones avanzadas al principio

---

# 3. ESTUDIO CREATIVO

## Objetivo
Ser la pantalla principal y la que más valor da.

## Estructura general
3 columnas en desktop.

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ LOGO | Proyecto: Nueva canción                  Guardar | Exportar | Nueva versión         │
├───────────────────────┬─────────────────────────────────────────────┬──────────────────────┤
│ PRODUCCIÓN            │ LETRA                                       │ ASISTENTE MOZART     │
│                       │                                             │                      │
│ Estilo                │ Título                                      │ [ 5 títulos ]        │
│ Emoción               │ [______________________________]            │ [ Más pegadizo ]     │
│ Referencia            │                                             │ [ Más poesía ]       │
│ Energía               │ Verso 1                                     │ [ Más calle ]        │
│ Comercialidad         │ Lorem ipsum...                              │ [ Más fino ]         │
│ Estructura            │                                             │ [ Mejorar rimas ]    │
│ Idioma                │ Pre-estribillo                              │ [ Otra versión ]     │
│                       │ Lorem ipsum...                              │ [ Mejor estribillo ] │
│ [ Regenerar canción ] │                                             │ [ Adlibs ]           │
│ [ Regenerar sección ] │ Estribillo                                  │                      │
│                       │ Lorem ipsum...                              │ Notas / ideas        │
│                       │                                             │ [_________________]  │
│                       │ Puente                                      │                      │
│                       │ Lorem ipsum...                              │                      │
│                       │                                             │                      │
├───────────────────────┴─────────────────────────────────────────────┴──────────────────────┤
│ Barra inferior: [Estructura] [Vista continua] [Comparar versiones] [Historial]            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Qué debe sentirse
- la izquierda es la mesa del productor
- el centro es el cuaderno de composición
- la derecha es el coproductor IA

## Funciones críticas
- regenerar solo sección
- fijar líneas buenas
- comparar dos versiones
- editar directamente sin fricción
- guardar proyecto en cualquier momento

---

# 4. MODO REESCRITURA

## Objetivo
Pegar una letra existente y mejorarla.

## Wireframe

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Reescribir letra                                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Pega aquí tu letra                                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │                                                               │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Qué quieres mejorar                                                │
│  [ Más comercial ] [ Más poética ] [ Más calle ] [ Mejor rima ]    │
│  [ Más flamenco ] [ Más moderna ] [ Más elegante ]                 │
│                                                                     │
│                       [ Reescribir ]                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

# 5. BIBLIOTECA / PROYECTOS

## Objetivo
Que no sea solo un generador, sino una herramienta de trabajo real.

## Wireframe

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Proyectos                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ Buscar proyecto... [____________________________]                   │
│                                                                     │
│ [ Todos ] [ Favoritos ] [ Pop ] [ Reggaetón ] [ Flamenco pop ]     │
│                                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                     │
│ │ Proyecto 1  │ │ Proyecto 2  │ │ Proyecto 3  │                     │
│ │ estilo      │ │ estilo      │ │ estilo      │                     │
│ │ fecha       │ │ fecha       │ │ fecha       │                     │
│ └─────────────┘ └─────────────┘ └─────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

# 6. SISTEMA DE NAVEGACIÓN

## Sidebar ideal
- Inicio
- Nueva canción
- Reescribir
- Biblioteca
- Estilos
- Favoritos
- Ajustes

## Topbar ideal
- nombre del proyecto
- guardar
- exportar
- crear nueva versión
- avatar / cuenta

---

# 7. COMPORTAMIENTO RESPONSIVE

## Mobile
- no mantener 3 columnas
- usar tabs:
  - Producción
  - Letra
  - Mozart

## Tablet
- 2 columnas
- asistente como panel deslizable

## Desktop
- experiencia completa con 3 columnas

---

# 8. PRIORIZACIÓN MVP

## Pantallas imprescindibles para primera versión
1. Home
2. Nueva canción
3. Estudio creativo
4. Reescritura
5. Biblioteca básica

## Lo que puede esperar
- comparación avanzada
- colaboración
- audio demo
- toplines
- branding ultra premium animado

---

# 9. SENSACIÓN FINAL

APP MOZART WEB debe sentirse como:
- un estudio elegante
- un cuaderno vivo
- una máquina de ideas musicales
- una herramienta pro pero fácil

No debe sentirse como:
- un chat genérico
- un panel de administración
- un formulario largo de IA
