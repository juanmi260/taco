# Taco

PWA móvil para el control horario del tacógrafo según el **Reglamento (CE) nº 561/2006**.

🚛 **App en producción:** https://juanmi260.github.io/taco/

## Qué hace

Cuaderno digital de jornadas para conductores profesionales. Registra apertura, cierre y conducción del día; calcula automáticamente:

- Hora límite para cerrar la jornada (15 h desde apertura).
- Conducción disponible hoy y tiempo que queda.
- Acumulados semanal (56 h) y bisemanal (90 h).
- Clasificación automática de jornadas ampliadas (> 9 h) y descansos diarios/semanales reducidos a partir de los huecos entre jornadas.
- Hora mínima para abrir la siguiente jornada (descanso regular 11 h / reducido 9 h).
- Compensaciones pendientes de descansos semanales reducidos.

Toda la información se guarda **en local (IndexedDB)**. Sin cuentas, sin servidor, sin telemetría.

## Documentación

Toda la especificación funcional, técnica y de diseño está en [`doc/`](./doc/README.md).

## Desarrollo

```bash
npm install
npm run dev      # localhost:5173 (o 5174)
npm test         # 57 tests
npm run build    # build producción
npm run typecheck
npm run lint
```

Stack: React 18 + Vite 5 + TypeScript estricto + Tailwind + Dexie (IndexedDB) + Zustand + Workbox (PWA).

## Despliegue

El workflow `.github/workflows/deploy.yml` publica automáticamente en GitHub Pages en cada push a `main`.

La base path en producción se controla con la variable `VITE_BASE` (por defecto `/taco/`).
