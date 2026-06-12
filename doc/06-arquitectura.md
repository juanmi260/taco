# 06 — Arquitectura

Taco es una **SPA cliente-única con persistencia local**. No hay servidor. Toda la lógica vive en el navegador.

La unidad de datos es la **jornada (DayLog)**; toda la app gira en torno a leer, escribir y derivar cálculos sobre una colección de jornadas.

## Vista general

```
┌─────────────────────────────────────────────────────────┐
│                    Navegador / PWA                       │
│                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │     UI      │   │   Estado     │   │   Dominio    │ │
│  │  (React)    │◄──┤  (Zustand)   │◄──┤  (puro TS)   │ │
│  └──────┬──────┘   └──────┬───────┘   └──────┬───────┘ │
│         │                 │                  │          │
│         ▼                 ▼                  ▼          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Capa de Datos                       │   │
│  │      (repositorios sobre Dexie.js)               │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │                  IndexedDB                       │   │
│  │            (tabla: dayLogs, settings)            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │             Service Worker (Workbox)             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Capas

### 1. Capa de Dominio (`src/domain/`)

**Funciones puras de TypeScript**, sin dependencias de React ni de Dexie. Toda la lógica normativa del Reglamento 561/2006 vive aquí.

Tipos principales:

- `DayLog`, `DayLogId`, `WeekRef`, `BiWeekRef`.
- `LimitState` (`OK` | `WARN` | `CRITICAL` | `EXCEEDED`).
- `DayStatus` (estado derivado de una jornada en relación a los límites).

Funciones puras clave:

```ts
// Acumulados a partir de jornadas
sumWeeklyDriving(logs, week): Minutes
sumBiWeeklyDriving(logs, week): Minutes
countReducedDailyRestsInWeek(logs, week): number
countExtendedDrivingsInWeek(logs, week): number

// Cálculos derivados de la jornada abierta
availableDailyDriving(logs, openLog, now): Minutes
latestDrivingTime(logs, openLog, now): Instant
earliestNextStart(closedLog, regularRest, reducedRestAvailable): { regular: Instant, reduced: Instant | null }

// Cumplimiento
weeklyRestReducedCompensationDeadline(weekRef, logs): Instant | null
evaluateLimits(state): LimitStatus[]
```

**Reglas:**

- Cero efectos secundarios.
- Cero dependencias de React, Dexie, DOM.
- 100 % testeable con Vitest.

### 2. Capa de Datos (`src/data/`)

Acceso a IndexedDB vía **Dexie.js**.

- `db.ts` — definición del esquema y versiones.
- `repositories/dayLogRepo.ts` — CRUD y queries sobre `DayLog`.
- `repositories/settingsRepo.ts` — leer/escribir el singleton de ajustes.
- Live queries de Dexie para reactividad automática hacia la UI.

Las funciones del dominio nunca llaman a la BD. La capa de datos llama al dominio cuando necesita validar antes de guardar (p. ej. evitar dos jornadas abiertas simultáneamente).

### 3. Capa de Estado (`src/store/`)

**Zustand stores** delgados. Coordinan UI ↔ datos ↔ dominio.

- `useDayLogStore` — jornada abierta actual, abrir/cerrar/editar.
- `useDerivedStore` — selectores que aplican funciones de dominio sobre los logs cargados (disponibilidad, hora límite, próximas aperturas, acumulados semanales).
- `useSettingsStore` — preferencias.

**Sin reloj global a 1 Hz**. La pantalla principal se refresca:

- En cada apertura/cambio de visibilidad.
- Cada **30-60 segundos** mientras está en primer plano (suficiente: la hora límite cambia al cerrar jornada y se mide en horas, no segundos).
- Al recibir eventos de IndexedDB (live query).

### 4. Capa de UI (`src/components/`, `src/features/`, `src/ui/`)

- `src/ui/` — primitivos sin lógica (Button, Sheet, Card).
- `src/components/` — compuestos reutilizables (BigActionButton, AvailabilityCard, NextStartCard).
- `src/features/` — pantallas y flujos completos.

### 5. Service Worker

Generado por `vite-plugin-pwa`. Estrategias y configuración detalladas en `09-configuracion-pwa.md`.

## Flujo de datos: abrir una jornada

```
Usuario toca "Abrir jornada"
        │
        ▼
useDayLogStore.openDay() llama a domain.canOpenNow(logs, now)
        │              ├─ si false → mostrar motivo (descanso insuficiente)
        │              └─ si true → continuar
        ▼
dayLogRepo.create({ date: today, openedAt: now })
        │
        ▼
Dexie commit → IndexedDB
        │
        ▼
liveQuery emite → useDerivedStore recalcula → UI re-renderiza
```

## Flujo de datos: cerrar una jornada

```
Usuario toca "Cerrar jornada"
        │
        ▼
Bottom Sheet pide: minutos conducidos + banderas (ampliada / reducidos)
        │
        ▼
useDayLogStore.closeDay({ minutes, flags, note })
   - valida coherencia (minutos ≤ 24h, no negativos)
   - si flags marcan reducido pero ya se usaron 3 → avisa antes de guardar
        │
        ▼
dayLogRepo.update(openLog.id, { closedAt: now, minutes, ...flags })
        │
        ▼
liveQuery → recalcular derivados → UI muestra "Próxima apertura: HH:MM"
```

## Reactividad mínima

Sin reloj de un segundo: las cifras no son cronómetros, son **horas de referencia** (hora límite, hora mínima próxima apertura) que cambian al editar datos. El único caso con tiempo "vivo" es:

- **Jornada abierta**: el texto "Abierta desde HH:MM (han pasado X h Y min)" se refresca cada minuto, no cada segundo.

## Concurrencia y consistencia

- Una sola pestaña activa esperada. Dexie soporta `Storage Events` para detectar cambios de otra pestaña y refrescar.
- Validación atómica al abrir: si ya existe jornada abierta, rechazar.
- Edición de jornadas pasadas: transacción de actualización; live query propaga.

## Estrategia de errores

- Errores de IndexedDB → banner no bloqueante + opción de exportar antes de actuar destructivamente.
- Errores de validación de dominio → mensajes inline claros ("Ya hay una jornada abierta. Ciérrala antes de abrir otra").
- Errores inesperados → fallar de forma visible, nunca silenciosa.

## Internacionalización (preparada, no entregada en MVP)

- Strings en módulo `src/i18n/es.ts` desde el día uno.
- Función `t(key)` envolviendo cualquier texto visible.

## Limitaciones arquitectónicas conocidas

- **No multi-usuario en el mismo dispositivo.** Documentado; post-MVP se podrá añadir "perfil activo".
- **No sincronización entre dispositivos.** Cambio de móvil = exportar/importar manualmente.
- **Almacenamiento puede ser purgado** por el sistema; mitigado con `navigator.storage.persist()` y avisos de exportación periódica.
- **El reloj del dispositivo es la fuente de verdad temporal.** Si está mal, los cálculos están mal.
