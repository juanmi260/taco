# 02 — Requisitos funcionales

Cada requisito tiene un identificador `RF-XX` para trazabilidad.

> **Modelo central.** La unidad de datos es la **jornada (DayLog)**: apertura, cierre, minutos conducidos, banderas. No se registran actividades intermedias.

## Registro de jornada

- **RF-01.** El usuario puede **abrir la jornada del día** con un toque. Se muestra un sheet con la **hora de apertura** ajustable (`TimeInput`, paso 1 h y 1 min, edición manual). Por defecto = ahora.
- **RF-02.** Solo puede haber una jornada abierta a la vez. Si ya hay una abierta, el botón principal muestra "Cerrar jornada".
- **RF-03.** El usuario puede **cerrar la jornada** con un toque. Se abre un sheet para introducir:
  - **Hora de cierre** ajustable (`TimeInput`, por defecto = ahora).
  - **Minutos totales de conducción del día** (`DurationInput`: stepper de horas ±1 y stepper de minutos `[−5][−1][+1][+5]`, edición manual).
  - Nota libre (opcional, ≤ 280 caracteres).
- **RF-04.** El usuario puede **editar cualquier jornada pasada**: hora de apertura, hora de cierre, conducción, nota.
- **RF-05.** El usuario puede **eliminar una jornada** con confirmación inline (segundo tap confirma).
- **RF-06.** El usuario puede **cancelar la apertura o el cierre** desde su respectivo sheet.
- **RF-07.** Si ya existe una jornada con la fecha de hoy, la app **rechaza la apertura** con mensaje de error.
- **RF-08.** El usuario puede **actualizar la conducción de hoy en tiempo real** desde la pantalla principal mediante el `DurationInput` del bloque "Conducción de hoy". Cada cambio se persiste inmediatamente.

> **Banderas eliminadas (v2 del esquema).** Las banderas `extendedDriving`, `reducedDailyRest`, `reducedWeeklyRest` ya no se almacenan ni se piden al usuario: se **derivan automáticamente** del valor de `drivingMinutes` y del hueco con la siguiente jornada. Ver `04-reglamento-561-2006.md` y `07-modelo-de-datos.md`.

## Visualización en tiempo real

### Con jornada **abierta**

- **RF-10.** Pantalla principal muestra:
  - Hora de apertura del día (ej.: "Abierta desde 06:12").
  - Tiempo transcurrido desde apertura.
  - **Hora límite para cerrar la jornada** = `openedAt + 15 h` (ventana de actividad del Art. 8.2; deadline duro).
  - **Conducción de hoy** editable + gauge `X / 9 h` + tiempo que queda.
  - Conducción semanal acumulada con "Quedan HH:MM" (hacia 56 h).
  - Conducción bisemanal acumulada con "Quedan HH:MM" (hacia 90 h).
  - Reducidos diarios detectados esta semana (X / 3).
  - Conducciones ampliadas detectadas esta semana (X / 2).

### Con jornada **cerrada**

- **RF-11.** Pantalla principal muestra:
  - **Hora mínima de próxima apertura — descanso regular (11 h)**.
  - **Hora mínima de próxima apertura — descanso reducido (9 h)**, junto con cuántos reducidos quedan disponibles (X / 3 restantes esta semana).
  - Conducción semanal acumulada (hacia 56 h).
  - Conducción bisemanal acumulada (hacia 90 h).
  - Si hay un descanso semanal reducido sin compensar: aviso con plazo límite de compensación.

### Indicadores visuales

- **RF-12.** Cada contador tiene un **indicador visual** (color/barra) por estado: normal, cerca del límite, superado.
- **RF-13.** Cualquier indicador es **explicable**: pulsándolo, el usuario ve el cálculo aplicado y la referencia al artículo del Reglamento.

## Cálculos clave (referencia)

- **RF-20.** **Conducción disponible hoy** = `min(limiteDiario, 56h − conducciónSemanal, 90h − conducciónBisemanal)` − `minutosYaConducidosHoy` (este último, si la jornada está abierta, es 0 hasta cerrar; si está cerrada, es el valor introducido).
  - `limiteDiario` = 9 h (10 h si ampliada y aún quedan ampliaciones esta semana).
- **RF-21.** **Hora límite de conducción hoy** = hora actual + conducción disponible hoy, acotada por **15 h desde apertura** (ventana de actividad diaria implícita en el Reglamento) **y** por la hora a la que debe iniciarse el descanso para que el descanso diario quepa.
- **RF-22.** **Hora mínima de próxima apertura**:
  - Regular: `horaCierre + 11h`.
  - Reducido: `horaCierre + 9h`, solo disponible si quedan reducidos en la semana actual (≤ 2 ya usados).
- **RF-23.** **Conducción semanal** = suma de `minutosConducidos` de las jornadas cerradas en la semana ISO actual (lunes 00:00 — domingo 24:00, conforme al Reglamento).
- **RF-24.** **Conducción bisemanal** = suma de `minutosConducidos` de las jornadas cerradas en la semana actual + semana anterior.
- **RF-25.** **Reducidos diarios usados** = nº de jornadas en la semana actual con `descansoDiarioReducido = true`.
- **RF-26.** **Conducciones ampliadas usadas** = nº de jornadas en la semana actual con `jornadaAmpliada = true`.
- **RF-27.** **Compensación de descanso semanal reducido**: si la semana N tuvo descanso semanal reducido, debe sumarse a otro descanso de ≥ 9 h **antes del final de la semana N+3**. Taco registra y avisa.

## Alertas y avisos

- **RF-30.** La app **avisa** (vibración + indicador visual; sin sonido por defecto) cuando:
  - Faltan **30 minutos** para el límite diario de conducción.
  - Se ha alcanzado el límite diario.
  - Se está cerca del límite semanal (≥ 90 %).
  - Se ha superado un límite (semanal o bisemanal).
  - El descanso semanal reducido se acerca a su plazo de compensación.
- **RF-31.** Las notificaciones son **locales** (Web Notifications API si están permitidas), no requieren servidor.
- **RF-32.** El usuario puede **desactivar** alertas individualmente en ajustes.

## Histórico y consulta

- **RF-40.** Vista de **día**: detalle de la jornada (apertura, cierre, minutos, banderas, nota).
- **RF-41.** Vista de **semana**: 7 días con totales (conducción, nº reducidos, nº ampliadas, conducción total semanal).
- **RF-42.** Vista de **bisemana**: las dos semanas consecutivas con su total para verificar 90 h.
- **RF-43.** Navegación entre días/semanas con gestos (swipe) o flechas.
- **RF-44.** Filtro por rango de fechas (post-MVP si añade complejidad UI).

## Configuración

- **RF-50.** El usuario puede configurar:
  - Nombre del conductor (opcional, solo para exportación).
  - Zona horaria (auto-detectada, editable).
  - Activación/desactivación de cada alerta.
  - Tema claro/oscuro/auto.
- **RF-51.** Toda configuración se persiste localmente.

## Exportación e importación

- **RF-60.** Exportar datos a **CSV** (una fila por jornada).
- **RF-61.** Exportar datos a **JSON** (formato completo para respaldo).
- **RF-62.** Importar un **JSON** previamente exportado, con validación y aviso de conflictos.
- **RF-63.** Limpieza total de datos (con doble confirmación y exportación previa sugerida).

## Instalación y onboarding

- **RF-70.** En primer arranque, breve **tutorial** (≤ 3 pantallas) explicando el modelo: abrir, cerrar, cifra de conducción, leer la disponibilidad.
- **RF-71.** El usuario puede **omitir** el tutorial y revisarlo después desde ajustes.
- **RF-72.** La app sugiere instalarse en pantalla de inicio si el navegador lo permite (Android, iOS Safari).

## Multilenguaje

- **RF-80.** Idioma inicial: **español**. La arquitectura debe permitir añadir traducciones (i18n) sin refactor mayor, aunque otros idiomas quedan fuera del MVP.

## Casos especiales

- **RF-90.** **Jornada que cruza medianoche**: el `DayLog` se asocia al **día calendario de apertura**. El cierre puede caer en el día siguiente; los minutos de conducción se imputan a la jornada de apertura.
- **RF-91.** **Cambio de hora oficial (DST)** durante una jornada: cálculos en UTC internamente; al mostrar, se respeta la zona local.
- **RF-92.** Si el usuario introduce un valor de `minutosConducidos` que supera la duración real entre apertura y cierre, la app **avisa** pero permite continuar (puede haber error o jornada ampliada con conducción reportada mayor que el intervalo abierto, p. ej. olvido de cerrar).
