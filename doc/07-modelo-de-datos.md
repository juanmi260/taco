# 07 — Modelo de datos

Persistencia en **IndexedDB** vía **Dexie.js**. La entidad central es la **jornada (DayLog)**: una fila por día trabajado, no una secuencia de actividades.

## Principios

1. **Una jornada, un registro.** Cada día que el conductor abre el tacógrafo es exactamente un `DayLog`. Su clave natural es la **fecha calendario de apertura**.
2. **Instantes en UTC (epoch milliseconds).** `openedAt` y `closedAt` son `number`. La conversión a hora local es de presentación.
3. **Banderas explícitas, no inferidas.** El usuario marca si la jornada es ampliada y si el descanso es reducido. No intentamos adivinarlo.
4. **Sin actividades intermedias.** El total de conducción es un número introducido por el conductor al cerrar.
5. **Inmutable por intención.** Editar = `update` directo en MVP. Si en el futuro se necesita auditoría, se añade `previousVersions` sin migración mayor.

## Entidades

### DayLog

Representa una jornada de trabajo.

```ts
interface DayLog {
  id: string;                 // UUID v4
  date: string;               // "YYYY-MM-DD" (fecha local de apertura) — UNIQUE
  openedAt: number;           // UTC ms
  closedAt: number | null;    // null = jornada abierta en curso
  drivingMinutes: number | null;  // null mientras no se haya registrado conducción
  note?: string;              // ≤ 280 chars
  source: 'manual' | 'imported';
  createdAt: number;          // UTC ms
  updatedAt: number;          // UTC ms
}
```

> **Sin banderas manuales.** A partir de la versión 2 del esquema, los campos `extendedDriving`, `reducedDailyRest` y `reducedWeeklyRest` desaparecen del modelo. Las clasificaciones se derivan automáticamente — ver "Detección automática" más abajo.

**Índices Dexie:**

- `id` (primary)
- `date` (único; permite mostrar/editar por fecha)
- `openedAt`
- `closedAt`

**Invariantes:**

- Solo puede existir **una `DayLog` con `closedAt = null`** en toda la BD.
- `closedAt > openedAt` cuando ambos están definidos.
- `drivingMinutes ≥ 0` y `drivingMinutes ≤ 24 * 60` cuando está definido.
- `drivingMinutes` **puede no ser null** en jornadas abiertas (el conductor lo va actualizando durante el día desde la pantalla principal).
- `date` es único: no se permiten dos jornadas en la misma fecha (si se necesita corregir, se edita la existente).

### Detección automática (derivado, no almacenado)

| Propiedad | Cómo se deriva |
|---|---|
| **Ampliada (⚡)** | `drivingMinutes > 9 h` |
| **Descanso siguiente** | Hueco entre `closedAt` de esta jornada y `openedAt` de la siguiente cronológica |
| **Tipo de descanso** | `≥ 45 h` → semanal regular · `24-45 h` → semanal reducido (🛌) · `11-24 h` → diario regular · `9-11 h` → diario reducido (🌙) · `< 9 h` → insuficiente (⚠) |

Las funciones `isExtendedDriving(log)`, `findNextLog(logs, log)`, `restMinutesAfter(log, next)` y `restKindAfter(log, next)` en `src/domain/regulation/` aplican estas reglas. Son puras y no leen IndexedDB.

### Settings

Clave-valor único.

```ts
interface Settings {
  id: 'singleton';
  driverName?: string;
  timezone: string;           // IANA, p.ej. "Europe/Madrid"
  weekStartsOn: 1;            // lunes (fijo por Reglamento)
  alerts: {
    nearDailyLimit: boolean;
    dailyLimitReached: boolean;
    weeklyLimitNear: boolean;
    weeklyLimitReached: boolean;
    biWeeklyLimitNear: boolean;
    weeklyRestCompensationDue: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  onboardingCompleted: boolean;
  storagePersistGranted: boolean;
  schemaVersion: number;
}
```

### WeekMeta (opcional, post-MVP)

Para marcar manualmente compensaciones cuando la detección por banderas no sea suficiente.

```ts
interface WeekMeta {
  id: string;                          // ISO week, p.ej. "2026-W23"
  reducedWeeklyRestCompensated: boolean;
  compensatedAtDayLogId?: string;
  notes?: string;
}
```

En el MVP la información de descanso semanal reducido vive directamente en el `DayLog` del día que lo origina, y el cálculo de plazo de compensación es automático.

### ExportLog (opcional, post-MVP)

Registro de exportaciones realizadas para recordar al usuario.

```ts
interface ExportLog {
  id: string;
  at: number;
  format: 'csv' | 'json';
  fromDate: string;
  toDate: string;
  itemCount: number;
}
```

## Esquema Dexie (versión 2)

```ts
import Dexie, { Table } from 'dexie';

export class TacoDB extends Dexie {
  dayLogs!: Table<DayLog, string>;
  settings!: Table<Settings, 'singleton'>;

  constructor() {
    super('taco');
    this.version(1).stores({
      dayLogs: 'id, &date, openedAt, closedAt',
      settings: 'id',
    });
    this.version(2)
      .stores({
        dayLogs: 'id, &date, openedAt, closedAt',
        settings: 'id',
      })
      .upgrade((tx) =>
        tx.table('dayLogs').toCollection().modify((log) => {
          delete log.extendedDriving;
          delete log.reducedDailyRest;
          delete log.reducedWeeklyRest;
        }),
      );
  }
}

export const db = new TacoDB();
```

> `&date` declara `date` como índice único. La migración a v2 elimina las banderas manuales obsoletas de registros existentes.

## Migraciones

Cualquier cambio de esquema futuro = nuevo `db.version(N).stores({...}).upgrade(tx => ...)`. Las migraciones nunca borran datos del usuario sin confirmación.

## Cálculos derivados (no almacenados)

| Derivado | Cómo se calcula |
|---|---|
| **Jornada actual abierta** | `dayLogs.where('closedAt').equals(null).first()` |
| **Conducción de la semana ISO** | Suma de `drivingMinutes` de `dayLogs` cuya `date` cae en la semana lunes-domingo |
| **Conducción bisemanal** | Suma sobre dos semanas consecutivas (actual + anterior) |
| **Reducidos diarios consumidos** | `count(dayLogs en la semana con reducedDailyRest = true)` |
| **Conducciones ampliadas usadas** | `count(dayLogs en la semana con extendedDriving = true)` |
| **Conducción disponible hoy** | `dailyLimit − drivingHoyYaConsumida`, acotado por restantes semanal y bisemanal. Si la jornada está abierta y aún no se ha cerrado, `drivingHoyYaConsumida = 0` (todavía sin reportar). |
| **Hora límite de conducción hoy** | `openedAt + maxJornada` (15 h, periodo de actividad implícito), acotado adicionalmente por la conducción restante interpretada como tiempo límite "desde ahora". Detalle en `src/domain/regulation/`. |
| **Hora mínima de próxima apertura (regular)** | `closedAt + 11 h` |
| **Hora mínima de próxima apertura (reducido)** | `closedAt + 9 h`, solo si reducidos consumidos en la semana < 3 |
| **Plazo de compensación de descanso semanal reducido** | fin de la semana N+3 desde la semana N en la que se usó el reducido |

Detalles algorítmicos en `04-reglamento-561-2006.md` y en `src/domain/regulation/` (cuando se implemente).

## Volumen estimado

- Una `DayLog` por día trabajado. ~250 al año.
- Tamaño medio: ~250 bytes JSON serializado.
- **< 100 KB al año**. IndexedDB lo maneja con holgura para décadas.

## Persistencia ante purgas

- Solicitar `navigator.storage.persist()` tras el onboarding.
- Si se concede, registrar en `Settings.storagePersistGranted = true`.
- Banner en ajustes: "Almacenamiento persistente: activado/no activado — exporta regularmente si no".

## Exportación: formatos

### JSON (formato canónico)

```json
{
  "schemaVersion": 2,
  "exportedAt": 1733756400000,
  "driver": "Juan Pérez",
  "timezone": "Europe/Madrid",
  "dayLogs": [
    {
      "id": "abcd1234-...",
      "date": "2026-06-09",
      "openedAt": 1733715120000,
      "closedAt": 1733752800000,
      "drivingMinutes": 420,
      "note": null,
      "source": "manual"
    }
  ],
  "settings": { ... }
}
```

La importación tolera el formato de v1 (con las banderas) y simplemente las descarta.

### CSV (tabular)

```
fecha,hora_apertura,hora_cierre,minutos_conduccion,nota
2026-06-09,06:12,16:40,420,
```

## Reglas de borrado

- Una `DayLog` borrada se elimina realmente (no soft delete en MVP). La exportación previa es la red de seguridad.
- "Limpiar todo" requiere doble confirmación y se ofrece exportar antes.
