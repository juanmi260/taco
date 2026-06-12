# 08 — Diseño UI/UX

> **Principio rector único:** la interfaz debe ser **muy sencilla y fácil de usar**. El conductor debería **abrir la app, mirar y entender** sin pensar. Mantener la jornada exige un único toque al empezar y un único toque al terminar (más la cifra de minutos).

## Filosofía de diseño

1. **Una sola acción principal visible.** El botón grande dice o "Abrir jornada" o "Cerrar jornada". Nada más compite por el centro.
2. **Mostrar el ahora, ocultar el resto.** Histórico, ajustes y opciones avanzadas son secundarios.
3. **Botón grande > formulario.** Tres botones de 100×100 px valen más que un selector compacto.
4. **Color y forma comunican estado** antes que el texto. El conductor capta el rojo antes que la cifra.
5. **Sin sorpresas.** Animaciones suaves y cortas (≤ 200 ms). Nada se mueve sin razón.
6. **Tipografía clara.** Una sola fuente sans-serif del sistema (`-apple-system`, `Segoe UI`, `Roboto`).

## Mapa de pantallas

```
┌──────────────────┐
│   Onboarding     │  (solo primera vez, 3 pantallas)
└────────┬─────────┘
         ▼
┌──────────────────┐      ┌────────────────┐
│   Inicio (Hub)   │ ──── │   Histórico    │
│  - Estado actual │      │ Día/Semana/    │
│  - Botón grande  │      │ Bisemana       │
│  - Resumen       │      └────────────────┘
└────────┬─────────┘
         │              ┌────────────────┐
         ├───────────── │   Ajustes      │
         │              └────────────────┘
         │
         │              ┌────────────────┐
         └───────────── │ Editar jornada │
                        │ (modal/sheet)  │
                        └────────────────┘
```

Total: **4 vistas** principales + onboarding. Cualquier expansión se justifica.

## Pantalla 1 — Inicio (Hub)

La pantalla más importante. Tiene **dos variantes** según el estado de la jornada.

### Variante A — Jornada abierta

```
┌─────────────────────────────┐
│  09:42       Lun 9 Jun      │
├─────────────────────────────┤
│                             │
│   🟢 JORNADA ABIERTA        │
│   desde 06:12 (han pasado   │
│           3 h 30 min)       │
│                             │
├─────────────────────────────┤
│  Hasta qué hora puedo       │
│  conducir hoy:              │
│                             │
│      ➜  15:12               │  ← número grande
│                             │
│  Conducción disponible:     │
│      04:30 / 09:00          │
│  ████████░░░░░░░░░░  50 %   │
├─────────────────────────────┤
│  Semana:    18:15 / 56:00   │
│  ██░░░░░░░░░░░░░░░░░  33 %  │
│                             │
│  Bisemana:  31:40 / 90:00   │
│  ████░░░░░░░░░░░░░░░  35 %  │
│                             │
│  Reducidos: 1 / 3           │
│  Ampliadas: 0 / 2           │
├─────────────────────────────┤
│                             │
│    ┌─────────────────────┐  │
│    │  ⏹  CERRAR JORNADA  │  │  ← botón ancho, grande
│    └─────────────────────┘  │
│                             │
└─────────────────────────────┘
   [Inicio] [Histórico] [⚙]
```

### Variante B — Jornada cerrada

```
┌─────────────────────────────┐
│  21:05       Lun 9 Jun      │
├─────────────────────────────┤
│                             │
│   ⚪ JORNADA CERRADA        │
│   Hoy: 06:12 → 16:40        │
│   Conducción: 07:00         │
│                             │
├─────────────────────────────┤
│  Próxima apertura mínima:   │
│                             │
│  ⏰ Regular  (11 h)  03:40   │
│  ⚡ Reducido (9 h)   01:40   │
│      quedan 2 / 3 esta sem. │
│                             │
├─────────────────────────────┤
│  Semana:    25:15 / 56:00   │
│  ████░░░░░░░░░░░░░░░  45 %  │
│                             │
│  Bisemana:  38:40 / 90:00   │
│  █████░░░░░░░░░░░░░░  43 %  │
│                             │
├─────────────────────────────┤
│                             │
│    ┌─────────────────────┐  │
│    │  ▶  ABRIR JORNADA   │  │
│    └─────────────────────┘  │
│                             │
└─────────────────────────────┘
   [Inicio] [Histórico] [⚙]
```

**Patrones:**

- El botón principal **ocupa la parte inferior accesible con el pulgar**.
- Toque corto en el botón = acción inmediata (con confirmación solo al cerrar para introducir minutos).
- Toque largo en el botón = abrir/cerrar **con hora manual** (caso de olvido).
- Toque en cualquier cifra/gauge = popup "¿qué significa esto?" con cálculo y artículo del Reglamento.

## Bottom sheet de cierre

Al cerrar jornada, sheet inferior con:

```
┌─────────────────────────────┐
│  Cerrar jornada              │
│  06:12 → ahora (16:40)       │
├─────────────────────────────┤
│                              │
│  Minutos de conducción hoy:  │
│  ┌──────────────────────┐   │
│  │   420  (07:00)       │   │
│  └──────────────────────┘   │
│   [-15] [-5] [+5] [+15]      │  ← ajustes rápidos
│                              │
│  ☐ Jornada ampliada (10 h)   │
│  ☐ Descanso diario reducido  │
│  ☐ Descanso semanal reducido │
│                              │
│  Nota (opcional):            │
│  [________________]          │
│                              │
│  [ Cancelar ]  [ Cerrar ]    │
└─────────────────────────────┘
```

El input acepta tanto minutos (entero) como formato `HH:MM` y muestra la otra forma debajo.

## Pantalla 2 — Histórico

Tres pestañas: **Día**, **Semana**, **Bisemana**.

### Pestaña Día

```
┌─────────────────────────────┐
│  ◀  Lun 9 Jun 2026  ▶       │
├─────────────────────────────┤
│  Apertura:    06:12          │
│  Cierre:      16:40          │
│  Conducción:  07:00          │
│                              │
│  Ampliada:        No         │
│  Desc. reducido:  No         │
│  Desc. sem. red.: No         │
│                              │
│  Nota: —                     │
│                              │
│       [ Editar jornada ]     │
└─────────────────────────────┘
```

### Pestaña Semana

Lista de los 7 días con resumen por fila y totales abajo.

```
┌─────────────────────────────┐
│  ◀  Semana 23 · 2026  ▶     │
├─────────────────────────────┤
│  L  06:12 → 16:40   07:00   │
│  M  05:45 → 17:20   08:30 ⚡│  ← ⚡ ampliada
│  X  06:00 → 16:30   06:45 🌙│  ← 🌙 reducido
│  J  06:30 → 17:00   07:15   │
│  V  07:00 → 15:00   05:00   │
│  S  —                 —     │
│  D  —                 —     │
├─────────────────────────────┤
│  TOTAL semana    34:30 / 56h│
│  Reducidos       1 / 3      │
│  Ampliadas       1 / 2      │
└─────────────────────────────┘
```

### Pestaña Bisemana

Dos semanas con su total y la suma.

- Toque en una fila → vista Día.
- Swipe horizontal para navegar entre semanas/bisemanas.

## Pantalla 3 — Editar jornada

```
┌─────────────────────────────┐
│  ◀  Editar Lun 9 Jun         │
├─────────────────────────────┤
│  Apertura:                   │
│  [ 9 jun 2026  06:12 ]       │
│                              │
│  Cierre:                     │
│  [ 9 jun 2026  16:40 ]       │
│                              │
│  Minutos conducción:         │
│  [ 420  (07:00) ]            │
│                              │
│  ☐ Jornada ampliada (10 h)   │
│  ☐ Descanso diario reducido  │
│  ☐ Descanso semanal reducido │
│                              │
│  Nota:                       │
│  [________________]          │
│                              │
│  [ Guardar ]    [ Eliminar ] │
└─────────────────────────────┘
```

## Pantalla 4 — Ajustes

Lista plana, sin pestañas internas.

- Nombre del conductor.
- Zona horaria (auto-detectada, editable).
- Alertas (toggles, una por tipo).
- Tema claro/oscuro/auto.
- Almacenamiento persistente (botón "Solicitar").
- Exportar (CSV / JSON).
- Importar (JSON).
- Borrar todos los datos.
- Acerca de / versión / enlace a docs.

## Pantalla 5 — Onboarding

Tres pantallas full-screen, swipe entre ellas:

1. **"Lleva el control de tu jornada con dos toques al día."** + ilustración.
2. **"Abre al empezar, cierra al terminar y anota cuánto condujiste."** + animación corta del botón.
3. **"Tus datos viven en tu móvil. Exporta cuando quieras."** + botón "Empezar".

Skippable ("Saltar" arriba a la derecha).

## Paleta de colores

Por estado de la jornada y de los límites. Soporta modo claro y oscuro.

| Estado de jornada | Color (claro) | Color (oscuro) |
|---|---|---|
| Abierta | `#43A047` (verde) | `#81C784` |
| Cerrada | `#607D8B` (gris azulado) | `#90A4AE` |

| Estado de límite | Color |
|---|---|
| Normal (< 75 %) | verde |
| Atención (75–95 %) | ámbar |
| Crítico (> 95 % o superado) | rojo |

## Tipografía y tamaños

- Fuente: stack del sistema.
- Tamaños: `12, 14, 16, 20, 28, 40` px.
- Hora límite (número grande del Hub): `40 px` regular, peso 500.
- Texto base: `16 px`.
- No usar **negrita extrema** salvo en cifras grandes.

## Gestos

- **Tap**: acción principal.
- **Long press** (≥ 500 ms): acción secundaria (abrir/cerrar con hora manual).
- **Swipe horizontal en histórico**: navegar fechas.
- **Pull to refresh**: no usar.

## Componentes UI a construir

Lista exhaustiva (mínima):

- `Button` (variants: primary, secondary, ghost).
- `BigActionButton` (botón grande inferior de "Abrir/Cerrar jornada").
- `LimitGauge` (barra horizontal con color de estado).
- `BigClock` (cifra de hora grande, ej. "15:12").
- `Sheet` (modal inferior tipo bottom sheet).
- `TabBar` (navegación inferior, 3 ítems).
- `ListItem` (entrada de histórico).
- `Toast` / `Banner` (notificación no bloqueante).
- `Toggle` (switch para ajustes).
- `MinutesInput` (campo numérico con presets ±5 / ±15 y conversión a `HH:MM`).
- `DateTimePicker` (nativo del navegador `<input type="datetime-local">`).

## Animaciones

- Pulsar botón principal: pulse breve (150 ms).
- Aparición del bottom sheet de cierre: slide-up 200 ms.
- Respeta `prefers-reduced-motion`: sin transiciones.

## Errores y vacíos

- **Empty state** del histórico: ilustración mínima + "Aún no has registrado ninguna jornada".
- **Errores de validación**: inline bajo el campo, color rojo, ≤ 1 línea.
- **Errores del sistema** (BD): banner superior con "Reintentar" y "Exportar diagnóstico".
- **Conflicto al abrir** (ya hay jornada abierta): mensaje claro "Ya hay una jornada abierta del [fecha]. Ciérrala primero."

## Lo que no haremos

- **Sin** menús laterales (drawers).
- **Sin** pestañas dentro de pestañas.
- **Sin** modales encadenados.
- **Sin** wizards de más de 3 pasos.
- **Sin** publicidad, sin "pro features", sin upsell.
- **Sin** cronómetros precisos al segundo: las cifras de la app son horas y minutos, no segundos.
