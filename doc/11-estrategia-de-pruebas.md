# 11 — Estrategia de pruebas

La corrección del cálculo normativo es **crítica**: una alerta perdida puede ser una sanción. La estrategia de pruebas prioriza la capa de dominio.

## Pirámide de pruebas

```
              ┌──────┐
              │ E2E  │   pocos, lentos, flujos críticos
            ┌─┴──────┴─┐
            │  Integr. │   medios, repositorios + dominio
          ┌─┴──────────┴─┐
          │  Unitarias    │  muchos, rápidos, dominio puro
          └───────────────┘
```

Distribución objetivo: **70 % unitarias / 20 % integración / 10 % E2E**.

## Pruebas unitarias

**Framework:** Vitest.

### Cobertura mínima

| Módulo | Cobertura objetivo |
|---|---|
| `src/domain/regulation/*` | ≥ 90 % líneas, 100 % de ramas en cálculos clave |
| `src/domain/time.ts` | ≥ 90 % |
| `src/data/repositories/*` | ≥ 70 % (lo más con fake-indexeddb) |
| `src/store/*` | ≥ 60 % |
| Componentes UI | espontánea, no objetivo numérico |

### Casos de prueba de referencia (regulación)

Cada función de `domain/regulation` debe tener pruebas con **fixtures conocidos**, redactados como tablas. Los fixtures son listas de `DayLog`:

```ts
describe('sumWeeklyDriving', () => {
  it.each([
    {
      name: 'semana con 5 jornadas de 7h = 35h',
      logs: [
        log('2026-06-08', 420),
        log('2026-06-09', 420),
        log('2026-06-10', 420),
        log('2026-06-11', 420),
        log('2026-06-12', 420),
      ],
      week: weekOf('2026-06-08'),
      expected: minutes(35 * 60),
    },
    {
      name: 'jornada del domingo no cuenta en la semana siguiente',
      // ...
    },
  ])('$name', ({ logs, week, expected }) => {
    expect(sumWeeklyDriving(logs, week)).toEqual(expected);
  });
});
```

### Catálogo de fixtures a cubrir

- **Semana estándar 5 × 7 h = 35 h**.
- **Semana de 7 días con totales que superan 56 h** → indicador crítico.
- **Bisemana que suma exactamente 90 h** → atención.
- **Bisemana que suma 91 h** → superado.
- **Jornada ampliada (10 h)** consumida 1, 2 y 3 veces en la semana (la tercera debe avisar).
- **Reducidos diarios** 1/3, 2/3, 3/3 y 4/3 en la semana.
- **Próxima apertura mínima — regular (11 h)** y **reducido (9 h)** desde varios `closedAt`.
- **Reducido solicitado** cuando ya se usaron 3 → aviso pero permitido.
- **Jornada huérfana**: al abrir hay una sin cerrar → la app obliga a cerrarla con valores manuales.
- **Cruce de medianoche**: la jornada se imputa al día de apertura.
- **Cruce de semana**: las jornadas que abren un domingo se imputan a la semana del domingo; la siguiente jornada abierta el lunes ya cuenta en la semana siguiente.
- **DST**: cambio de hora otoño/primavera; las duraciones en minutos no se ven afectadas (UTC interno).
- **Descanso semanal reducido**: marcar bandera en la última jornada de la semana N; verificar que el plazo de compensación cae al final de la semana N+3.
- **Suma con jornadas no cerradas**: `drivingMinutes = null` no se suma.
- **Minutos > intervalo**: la app avisa pero permite guardar; el cómputo usa el valor declarado.

## Pruebas de integración

Repositorios contra **`fake-indexeddb`** (in-memory).

- `add → findRange` ronda completa sobre `dayLogRepo`.
- Apertura cuando ya hay jornada abierta es rechazada (invariante).
- Inserción con `date` duplicada es rechazada (índice único).
- `liveQuery` emite tras `add`, `update` y `delete`.
- Migración de esquema v1 → v2 (cuando aplique) preserva datos.

## Pruebas E2E

**Framework:** Playwright (Chromium + WebKit, vista móvil).

### Flujos críticos a cubrir

1. **Primer arranque y onboarding.** Skippable; queda marcado.
2. **Abrir jornada → cerrar con minutos.** Pantalla cambia a variante "cerrada" mostrando próxima apertura mínima.
3. **Abrir y cerrar varias jornadas en una semana.** Los acumulados semanal y bisemanal son correctos.
4. **Marcar descanso reducido** al cerrar y verificar que el contador X/3 incrementa.
5. **Editar una jornada pasada.** El histórico y los acumulados se recalculan.
6. **Exportar JSON, borrar todo, reimportar JSON.** Estado idéntico.
7. **Instalar PWA, abrir sin conexión, abrir/cerrar jornada.** Funciona offline.
8. **Actualización de versión.** Aparece prompt; al aceptar, recarga sin perder datos.
9. **Conflicto de apertura.** Intentar abrir cuando ya hay jornada abierta muestra mensaje claro.

### Datos de prueba

Usar `Date.now()` mockeado vía Playwright `clock` API para evitar tests no deterministas.

## Pruebas manuales

Checklist a ejecutar antes de cada release:

- [ ] Instalar en **Android Chrome** real y verificar splash, theme color, icono.
- [ ] Instalar en **iOS Safari** real ("Añadir a pantalla de inicio").
- [ ] Verificar **modo oscuro** automático.
- [ ] Verificar con **lector de pantalla** (TalkBack o VoiceOver) que el flujo principal es operable.
- [ ] Verificar **una sola mano** con un móvil de 6.5"+: todas las acciones principales alcanzables con el pulgar.
- [ ] Verificar **rotación**: no rompe la UI, aunque sea vertical principal.
- [ ] Verificar **persistencia** cerrando y reabriendo la app tras varios cambios.
- [ ] Lighthouse PWA audit: ≥ 95.
- [ ] Lighthouse Accesibilidad: ≥ 95.

## Datos sensibles en tests

- Ningún test debe contener nombres reales, matrículas, ni datos personales.
- Usar nombres ficticios y matrículas inventadas si fuese necesario.

## CI

GitHub Actions ejecuta en cada PR:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test --run --coverage`
5. `pnpm build`
6. (opcional) Playwright E2E en headed browsers (Chromium + WebKit).

Falla la PR si:

- Cobertura del módulo de regulación cae por debajo del umbral.
- Tipos fallan.
- Build falla.

## Performance budget (futuro)

Tras MVP, añadir comprobación automática:

- Tamaño del bundle inicial < 200 KB gzip.
- Lighthouse Performance ≥ 90 en mobile.
- Si se rompe, falla la CI.
