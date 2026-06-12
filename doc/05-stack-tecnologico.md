# 05 — Stack tecnológico

Selección razonada de tecnologías. Cada elección sigue tres criterios: **adecuación a PWA móvil**, **tamaño/rendimiento**, y **madurez/ecosistema**.

## Resumen ejecutivo

| Capa | Tecnología | Versión objetivo |
|---|---|---|
| Lenguaje | TypeScript | ≥ 5.3 |
| Framework UI | React | ≥ 18.3 |
| Bundler / dev server | Vite | ≥ 5.0 |
| PWA / Service Worker | `vite-plugin-pwa` + Workbox | últimas |
| Estilos | Tailwind CSS | ≥ 3.4 |
| Estado global | Zustand | ≥ 4.5 |
| Persistencia local | IndexedDB vía Dexie.js | ≥ 4.0 |
| Fechas y duraciones | date-fns + date-fns-tz | ≥ 3.0 |
| Routing | React Router | ≥ 6.20 |
| Iconos | lucide-react | últimas |
| Tests unitarios | Vitest | ≥ 1.0 |
| Tests E2E | Playwright | ≥ 1.40 |
| Linter / formato | ESLint + Prettier | últimas |
| Gestor de paquetes | pnpm | ≥ 9 |

## Lenguaje: TypeScript

`strict: true`. El dominio normativo es propenso a errores de tipo (`Date` vs `number`, `Duration` vs `Instant`); TypeScript previene clases enteras de bugs.

## Framework UI: React

**Por qué React (y no Svelte, Vue, Solid):**

- Ecosistema más maduro para PWA y testing.
- Hooks encajan bien con el modelo reactivo de Zustand y Dexie's live queries.
- El usuario probablemente lo conozca o pueda encontrar ayuda más fácilmente.

**Alternativa considerada:** Svelte/SvelteKit (bundle más pequeño). Se descarta para el MVP porque la ganancia de bundle es marginal en una app con UI mínima como Taco, y el ecosistema React reduce el riesgo.

## Bundler: Vite

Build rápido, dev server con HMR instantáneo. Excelente integración con TS, React, y PWA via `vite-plugin-pwa`.

## PWA: vite-plugin-pwa + Workbox

- Manifest generado a partir de configuración.
- Service Worker generado por **Workbox** con estrategias declarativas.
- **Estrategia general**: `precache` de assets estáticos, `NetworkFirst` para HTML, `CacheFirst` para imágenes/fuentes.
- Auto-update con notificación al usuario antes de aplicar la nueva versión.

## Estilos: Tailwind CSS

- Utility-first reduce CSS no usado.
- Configuración móvil-first nativa.
- Plugin `@tailwindcss/forms` y `@tailwindcss/typography` opcionales (no en MVP).
- Tokens de diseño (colores por estado de jornada/límite, tamaños) definidos en `tailwind.config.ts`.

**Alternativa considerada:** CSS modules + variables. Se descarta porque la velocidad de iteración con Tailwind es notablemente mayor para un proyecto con un único maintainer.

## Estado global: Zustand

- API minimalista, sin boilerplate.
- ~1 KB gzip.
- Selectors evitan re-renders innecesarios.
- Compatible con persistencia y middlewares (devtools, immer).

**Por qué no Redux Toolkit:** sobredimensionado para esta app.
**Por qué no solo Context:** los selectors de Zustand permiten suscribirse a porciones derivadas (hora límite, disponibles) sin propagar re-renders a la mitad del árbol; con Context todo lo que toque el store re-renderiza.

## Persistencia local: IndexedDB vía Dexie.js

**Por qué IndexedDB y no localStorage:**

- **Estructura.** Tenemos colecciones (jornadas, ajustes, exportaciones) con índices por fecha. localStorage es key-value plano.
- **Volumen.** Una actividad cada pocos minutos genera miles de registros al año. IndexedDB escala; localStorage no.
- **Asincronía.** IndexedDB no bloquea el hilo principal.
- **Tipos.** IndexedDB acepta objetos estructurados; localStorage solo strings (con `JSON.parse/stringify` constante).

**Por qué Dexie.js y no IDB nativo:**

- API basada en promesas y mucho más legible.
- Versionado de esquema explícito.
- `liveQuery` integra con React vía `useLiveQuery` para reactividad automática.
- ~25 KB gzip; vale ampliamente la pena.

## Fechas y duraciones: date-fns

- Funciones puras, tree-shakable (solo importas lo que usas).
- `date-fns-tz` para manejo correcto de zona horaria.
- Almacenamos siempre **UTC en epoch milliseconds**; convertimos a local solo al renderizar.

**Por qué no Day.js:** API mutable por defecto, más propenso a errores.
**Por qué no Luxon:** más pesado, sin ventaja relevante aquí.
**Por qué no `Temporal`:** aún no soportado de forma estable en navegadores objetivo (junio 2026).

## Routing: React Router

Pocas vistas (≤ 6 rutas). React Router v6 con `lazy` para code-splitting de pantallas secundarias (histórico, ajustes, exportación).

## Iconos: lucide-react

Iconos SVG tree-shakables, estilo consistente, licencia MIT.

## Testing

- **Unitarios:** Vitest. Foco en el módulo de cálculos del Reglamento 561/2006 — debe estar al 90 %+ de cobertura.
- **Componentes:** Testing Library + Vitest.
- **E2E:** Playwright en flujos críticos (registrar actividad, ver alerta, exportar).

## Calidad

- **ESLint** con reglas TS estrictas + reglas accesibilidad (`eslint-plugin-jsx-a11y`).
- **Prettier**.
- **Husky** + **lint-staged** para pre-commit hooks.
- **Conventional Commits** vía `commitlint` (opcional).

## Gestor de paquetes: pnpm

Más rápido, ahorra espacio, lockfile determinista.

## Lo que NO usamos (decisiones explícitas)

- **No Next.js / SSR.** No tiene sentido para una app offline-first sin contenido público SEO.
- **No backend / API.** Toda la lógica en cliente. Una potencial sync a la nube se contempla post-MVP.
- **No analítica externa.** Privacidad por defecto.
- **No autenticación.** El dispositivo es la identidad.
- **No bibliotecas de componentes pesadas (MUI, Ant Design).** Aumentan el bundle y dificultan la simplicidad visual deseada. Construimos componentes a medida sobre Tailwind.
- **No moment.js.** Deprecada.

## Estructura del repositorio (preliminar)

```
taco/
├── doc/                    # esta carpeta
├── public/                 # iconos, manifest assets
├── src/
│   ├── app/                # rutas / shell
│   ├── components/         # componentes UI
│   ├── features/
│   │   ├── dayLog/         # abrir/cerrar/editar jornada
│   │   ├── dashboard/      # pantalla principal (Hub)
│   │   ├── history/        # vista histórica
│   │   └── settings/       # ajustes
│   ├── domain/
│   │   ├── regulation/     # cálculos 561/2006 (puro, sin UI)
│   │   ├── dayLog.ts       # tipos y modelo de jornada
│   │   └── time.ts         # utilidades de tiempo
│   ├── data/
│   │   ├── db.ts           # Dexie schema
│   │   └── repositories/   # capa de acceso
│   ├── store/              # Zustand stores
│   ├── ui/                 # primitivos UI (Button, Sheet, etc.)
│   └── main.tsx
├── tests/
│   ├── unit/
│   └── e2e/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
