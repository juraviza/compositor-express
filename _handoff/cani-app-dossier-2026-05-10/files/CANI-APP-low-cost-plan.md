# CANI-APP, plan de coste muy bajo

## Objetivo
Ayudar a Canijo con una herramienta privada para leer pedidos manuscritos, con el menor coste posible y sin depender de una APK.

## Recomendación principal
Pasar CANI-APP de app Android a **web privada responsive**.

Esto permite:
- usarla en móvil, tablet y PC
- evitar builds APK, reinstalaciones y mantenimiento de app
- actualizar una sola vez para todos
- reducir mucho el coste técnico

## Lo que ya tenemos y podemos reutilizar
- La interfaz actual ya va embebida en una WebView, así que buena parte puede reciclarse como web.
- Ya existe backend OCR con rutas útiles:
  - `GET /api/health`
  - `POST /api/read-order`
- La lógica del pedido manuscrito ya está bastante definida.

## Arquitectura barata recomendada
### Opción A, la mejor para este caso
- **Frontend web privado**: una sola página responsive
- **Backend pequeño**: solo para subir fotos y devolver lectura
- **Acceso privado**: enlace secreto + contraseña simple
- **Sin base de datos al principio**
- **Sin guardar imágenes permanentemente**
- **Sin APK**

### Flujo
1. Canijo abre la web desde móvil/tablet/PC
2. Sube foto o fotos del pedido
3. El sistema devuelve texto clasificado
4. Copia y pega el resultado

## Qué quitar para abaratar
- APK nativa
- despliegues duplicados
- varias instancias
- panel admin complejo
- base de datos si no hace falta
- almacenamiento histórico salvo necesidad real

## Costes
### Coste fijo mínimo ideal
- dominio opcional: 10 a 15 €/año
- hosting/VPS pequeño: 24 a 60 €/año aprox

### Coste variable
- IA OCR

## Escenarios
### Escenario 1, ultra barato
- web privada
- VPS pequeño
- OCR gratuito o freemium
- coste fijo anual: **25 a 75 €/año**
- riesgo: menos precisión

### Escenario 2, barato pero sensato
- web privada
- VPS pequeño
- IA de pago muy controlada solo cuando haga falta
- coste fijo anual infraestructura: **25 a 75 €/año**
- bolsa IA estimada: **20 a 80 €/año**
- total orientativo: **45 a 155 €/año**

### Escenario 3, más estable
- web privada
- proveedor algo más sólido
- IA mejor y más uso
- total orientativo: **120 a 300 €/año**

## Recomendación real
Para ayudarle de verdad y no vender humo:
- elegir **Escenario 2**
- cobrarle algo fijo anual pequeño
- dejar la IA muy controlada
- si el uso se dispara, ya se revisa más adelante

## Sobre “IA gratuita”
Se puede intentar, pero con esta advertencia:
- OCR gratis suele leer peor manuscritos difíciles
- los planes gratis cambian o tienen límites
- lo más honesto es diseñar una solución que **casi siempre sea barata**, no prometer gratis total si luego falla

## Plan de ejecución
### Fase 1
- convertir la interfaz actual en web responsive real
- dejar acceso privado
- conectar a un único backend

### Fase 2
- simplificar despliegue
- un solo servicio
- una sola URL
- control de costes

### Fase 3
- probar OCR barato o híbrido
- gratis/freemium primero
- IA mejor solo cuando sea necesario

## Decisiones recomendadas
- Sí a web privada
- No a APK por ahora
- Sí a coste anual bajo
- Sí a infraestructura mínima
- Sí a OCR híbrido si hace falta
- No a prometer 0 coste si queremos buena precisión

## Siguiente propuesta concreta
### Versión que yo montaría
- web privada responsive
- login simple
- 1 VPS pequeño o hosting muy básico
- backend ligero
- sin base de datos al principio
- sin guardar fotos salvo necesidad
- OCR con prioridad al coste bajo, pero con opción de IA buena cuando falle

## Números sencillos para explicárselo
- muy barato: **50 a 100 €/año** si el uso es bajo y apretamos mucho costes
- razonable y más seguro: **100 a 180 €/año**
- ya más serio: **200 €+ al año**

## Mi recomendación final
Si Juan quiere ayudar a Canijo y mantenerlo asequible:
**hacer web privada en vez de app, con objetivo de 100 a 150 €/año totales como techo deseable al empezar.**
