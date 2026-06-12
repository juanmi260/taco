# 04 — Reglamento (CE) nº 561/2006

Resumen operativo del **Reglamento (CE) nº 561/2006 del Parlamento Europeo y del Consejo, de 15 de marzo de 2006**, relativo a la armonización de determinadas disposiciones en materia social en el sector de los transportes por carretera.

> **Aviso.** Esta sección resume las disposiciones para uso interno de Taco. **No es asesoramiento legal**. La referencia legal vinculante es el texto consolidado oficial del Reglamento. Consultar [EUR-Lex](https://eur-lex.europa.eu/) para versiones actualizadas (con las modificaciones del Reglamento (UE) 2020/1054).

## Ámbito

El reglamento se aplica al transporte por carretera:

- De **mercancías** con vehículos cuya MMA (incluido remolque/semirremolque) supere las **3,5 toneladas**.
- De **viajeros** con vehículos de más de **9 plazas** (incluido conductor).

Quedan exentos ciertos servicios públicos, vehículos militares, de emergencia, etc. (Art. 3).

## Definiciones clave (Art. 4)

| Término | Definición operativa |
|---|---|
| **Conducción (tiempo de conducción)** | Duración de la actividad de conducción registrada por el tacógrafo. |
| **Pausa** | Período de no conducción durante el cual el conductor no realiza otros trabajos y se dedica exclusivamente a su descanso. |
| **Descanso diario** | Período diario durante el cual el conductor puede disponer libremente de su tiempo. |
| **Descanso semanal** | Período semanal durante el cual el conductor puede disponer libremente de su tiempo. |
| **Semana** | Período comprendido entre las **00:00 del lunes** y las **24:00 del domingo**. |
| **Conducción en equipo (multi-manning)** | Período durante el cual hay al menos dos conductores en el vehículo. |

## Tiempos de conducción

### Diario (Art. 6.1)

- **Máximo 9 horas** de conducción diaria.
- Puede ampliarse a **10 horas** un máximo de **2 veces por semana**.

### Semanal (Art. 6.2)

- Máximo **56 horas** de conducción a la semana (entendiendo semana como L 00:00 - D 24:00).

### Bisemanal (Art. 6.3)

- Máximo **90 horas** acumuladas en **dos semanas consecutivas**.

### Tiempo total acumulado de trabajo (Directiva 2002/15/CE, no en 561/2006 directamente)

Existe un límite adicional de **60 h semanales** de jornada total y media de **48 h** sobre 4 meses regulado por la Directiva 2002/15/CE. Taco lo trata como informativo, no como restricción dura del MVP.

## Pausas (Art. 7)

- Tras un máximo de **4 horas 30 minutos** de conducción, el conductor debe hacer una pausa **ininterrumpida de 45 minutos**.
- La pausa puede **fraccionarse** en dos partes: primero una de **al menos 15 minutos**, seguida de otra de **al menos 30 minutos** (el orden es importante: 15 antes de 30).
- Durante la pausa, no se puede conducir ni realizar otros trabajos.

## Descansos diarios (Art. 8.1 a 8.5)

- **Descanso diario regular**: al menos **11 horas** ininterrumpidas. Puede tomarse como un periodo único o partido en **3 h + 9 h** (12 h totales, primero el de 3 h).
- **Descanso diario reducido**: al menos **9 horas** ininterrumpidas. **Máximo 3 veces** entre dos descansos semanales.
- Debe iniciarse en un plazo máximo de **24 horas** desde el final del descanso diario anterior.

### Conducción en equipo

En conducción en equipo, el conductor debe tomar un descanso diario de **al menos 9 horas** dentro de un **período de 30 horas** desde el final del descanso diario o semanal anterior.

## Descansos semanales (Art. 8.6)

- **Descanso semanal regular**: al menos **45 horas** ininterrumpidas.
- **Descanso semanal reducido**: al menos **24 horas** ininterrumpidas.
- En **dos semanas consecutivas**, el conductor debe tomar al menos:
  - **Dos descansos semanales regulares**, o
  - **Un descanso regular + un descanso reducido** (la reducción debe compensarse antes del final de la tercera semana siguiente, en bloque, unida a otro descanso de al menos 9 h).
- El descanso semanal debe comenzar como muy tarde tras **seis períodos de 24 horas** desde el final del descanso semanal anterior.
- **Excepción para transporte internacional de mercancías** (Reglamento 2020/1054): pueden tomarse **dos descansos semanales reducidos consecutivos**, fuera del Estado de establecimiento, con compensación posterior.

## Actividades registradas por el tacógrafo

El tacógrafo digital distingue cuatro modos:

| Símbolo | Actividad | Descripción |
|---|---|---|
| 🚛 | **Conducción** | Vehículo en movimiento o con motor activo en operación. |
| 🔧 | **Otros trabajos** | Carga, descarga, papeleo, mantenimiento, formación. |
| ⌛ | **Disponibilidad** | Tiempo en el que el conductor está disponible pero no trabaja activamente (espera, acompañante en multi-manning durante la marcha). |
| 🛏 | **Descanso / Pausa** | Tiempo libre del conductor. |

Taco modela estas mismas cuatro categorías.

## Tabla resumen para Taco

| Límite | Valor | Artículo | Indicador en Taco |
|---|---|---|---|
| Conducción diaria estándar | 9 h | 6.1 | Conducción disponible hoy (hacia 9 h) |
| Conducción diaria ampliada | 10 h (máx. 2/sem) | 6.1 | Disponible hoy hacia 10 h si bandera ampliada y aún quedan ampliaciones |
| Conducción semanal | 56 h | 6.2 | Acumulado semanal (suma de minutos por jornada) |
| Conducción bisemanal | 90 h | 6.3 | Acumulado bisemanal |
| Pausa tras conducción continua | 45 min tras 4 h 30 | 7 | **Fuera del MVP** — no se trackean pausas intra-jornada |
| Pausa partida | 15 + 30 (orden estricto) | 7 | **Fuera del MVP** |
| Descanso diario regular | 11 h ininterrumpidas | 8.2 | Hora mínima de próxima apertura (cierre + 11 h) |
| Descanso diario partido | 3 h + 9 h | 8.2 | **Fuera del MVP** (caso poco común para este modelo) |
| Descanso diario reducido | 9 h, máx. 3/sem | 8.4 | Bandera al cerrar; hora mínima alternativa (cierre + 9 h) si quedan reducidos |
| Descanso semanal regular | 45 h | 8.6 | Implícito en huecos entre jornadas; informativo |
| Descanso semanal reducido | 24 h (compensar) | 8.6 | Bandera al cerrar; plazo de compensación calculado |

> **Nota sobre el alcance del MVP.** Taco mide cómputos a nivel de día (conducción total, banderas) y deriva disponibilidad y horas mínimas. **No** valida el cumplimiento de la pausa de 45 min tras 4 h 30 dentro de la jornada porque no registra cuándo se conduce y cuándo se pausa — esa responsabilidad sigue siendo del tacógrafo oficial del vehículo y del conductor.

## Casos límite que Taco debe contemplar

1. **Jornada que cruza medianoche.** Asociar la jornada al **día calendario de apertura**; el cierre puede caer al día siguiente y los minutos de conducción se imputan a esa misma jornada.
2. **Cambio de semana entre jornadas.** Cada jornada se imputa a su semana ISO (la del día de apertura); el acumulado semanal corta limpiamente lunes 00:00.
3. **Cambio de hora oficial (DST).** Instantes en UTC; presentación en hora local. Los cómputos en minutos no se ven afectados.
4. **Jornada huérfana sin cerrar.** Si al abrir una nueva jornada existe otra abierta del día anterior, la app obliga a cerrarla manualmente (con apertura, cierre y minutos editables) antes de continuar.
5. **Minutos conducidos > intervalo abierto/cerrado.** Puede ocurrir con olvidos. La app avisa pero permite guardar — el dato declarado por el conductor manda.
6. **Reducido marcado cuando ya se usaron 3.** La app avisa antes de guardar; permite continuar (es responsabilidad del conductor) y deja constancia.

## Referencias

- Reglamento (CE) nº 561/2006 — texto consolidado.
- Reglamento (UE) 2020/1054 — modificaciones (mobility package).
- Directiva 2002/15/CE — tiempo de trabajo de los trabajadores móviles.
- Guías de la Comisión Europea sobre aplicación del 561/2006.
