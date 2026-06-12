# 01 — Visión y objetivos

## Visión

Taco es una **PWA móvil instalable** que sirve al conductor profesional como **cuaderno digital de jornada**: con dos toques al día (apertura y cierre) y una cifra al final (minutos conducidos), la app le dice **cuánto puede conducir aún, hasta qué hora del día y a qué hora más pronto puede empezar mañana**, manteniendo los cómputos semanales y bisemanales según el **Reglamento (CE) nº 561/2006**.

> "Que el conductor, en cualquier momento del día, mire el móvil y sepa de un vistazo: cuánta conducción le queda, hasta qué hora y cuándo podrá retomar mañana."

## Filosofía: control a grandes rasgos, no tracker granular

El tacógrafo oficial del vehículo registra cada cambio de actividad. **Taco no duplica ese trabajo.** Taco:

- **No** registra cada pausa, otro trabajo o intervalo de disponibilidad.
- **Sí** registra los hitos del día (apertura, cierre, total conducido) y unas pocas banderas (ampliada, reducido).
- A partir de ese registro mínimo, calcula y muestra todos los indicadores normativos relevantes.

Esto reduce el esfuerzo del conductor a **un puñado de toques al día** y permite mantener un cómputo fiable a lo largo de semanas.

## Problema que resuelve

- El tacógrafo del vehículo cumple la ley, pero **no es ergonómico para que el conductor planifique**: no resume rápido cuántas horas le quedan ni hasta qué hora puede conducir.
- Los conductores suelen llevar el control mentalmente o en libreta de papel; esto es **propenso a errores** y poco práctico en una pausa breve.
- Las apps de tracker minuto-a-minuto exigen disciplina constante y son redundantes; muchas se abandonan en pocas semanas.
- Taco apuesta por un **registro mínimo + cálculo automático**: bajo esfuerzo, alta utilidad.

## Público objetivo

- **Conductores profesionales** de camión, autobús y vehículos comerciales sujetos al Reglamento (CE) 561/2006.
- **Conductores autónomos** que organizan su propia jornada.
- Secundario: **flotistas individuales** que quieran un control rápido de su propio tiempo.

Características del usuario:

- Adulto, no necesariamente familiarizado con apps complejas.
- Usa el móvil con una sola mano, a menudo en cabina o en pausa rápida.
- Necesita información clara, sin jerga técnica.
- Quiere **introducir poco y leer mucho**.

## Objetivos del MVP

1. **Abrir jornada** con un toque (registra timestamp).
2. **Cerrar jornada** con un toque + introducir minutos totales conducidos del día.
3. Marcar opcionalmente: **jornada ampliada** (10 h vs 9 h), **descanso diario reducido** al cerrar (9 h vs 11 h), **descanso semanal reducido** (24 h vs 45 h).
4. Mostrar en cualquier momento, con jornada abierta:
   - Tiempo transcurrido desde apertura.
   - **Hora límite hasta la cual puede conducir** hoy.
   - Conducción disponible hoy (restante hacia 9 h o 10 h).
   - Conducción acumulada **semanal** (hacia 56 h).
   - Conducción acumulada **bisemanal** (hacia 90 h).
   - Reducidos diarios usados esta semana (X/3) y conducciones ampliadas (X/2).
5. Mostrar en cualquier momento, con jornada cerrada:
   - **Hora mínima de próxima apertura** (regular 11 h y reducido 9 h, indicando si quedan reducidos disponibles).
   - Resúmenes semanal y bisemanal.
   - Descansos semanales reducidos pendientes de compensación.
6. **Histórico** consultable por día/semana/bisemana con los totales del periodo.
7. **Edición manual** de jornadas pasadas (rectificar errores en apertura, cierre o minutos).
8. **Exportación** de datos en CSV/JSON para respaldo o impresión.
9. Funcionar **100 % offline** tras la primera carga.
10. Ser **instalable** como app en pantalla de inicio (Android e iOS).

## Objetivos explícitamente fuera del MVP

- Tracker minuto-a-minuto de actividades intermedias.
- Sincronización entre dispositivos.
- Cuentas de usuario o login.
- Integración con tacógrafo real (NFC, lectura de tarjeta).
- Conducción en equipo (multi-manning) con descanso 9 h en 30 h.
- Excepción internacional de mercancías (dos reducidos consecutivos fuera del Estado).
- Planificador de rutas con mapas.
- Notificaciones push remotas.

## Criterios de éxito

- Mantenimiento diario: **≤ 3 toques + 1 cifra** (abrir, cerrar, minutos).
- Consulta del estado: **0 toques** (toda la información clave visible en pantalla principal al abrir la app).
- Tiempo de carga inicial en móvil 4G **< 3 segundos**; recargas posteriores **< 1 segundo** (caché PWA).
- **Nunca pierde datos** ante cierre brusco, sin conexión o reinicio del navegador.
- Cálculos de límites del Reglamento 561/2006 verificados por **tests automatizados** contra casos de referencia.
