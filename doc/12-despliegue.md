# 12 — Despliegue

Taco se distribuye como **PWA estática** servida por HTTPS. Sin backend.

## Hosting

Cualquier proveedor de estáticos sobre HTTPS funciona. Recomendados, por orden de simplicidad para un único desarrollador:

| Proveedor | Pro | Contra |
|---|---|---|
| **Vercel** | Deploy automático desde GitHub, dominios y HTTPS gratis, configuración mínima. | Cuota gratuita generosa pero con límites. |
| **Netlify** | Igual de simple, buen panel. | — |
| **Cloudflare Pages** | Excelente CDN, ilimitado en plan gratuito. | Configuración inicial ligeramente menos pulida. |
| **GitHub Pages** | Gratis con repo público, integrado. | Sin headers personalizados → CSP y service-worker scope cuidadosos. |

Recomendación inicial: **Vercel** o **Cloudflare Pages**.

## Configuración recomendada

### Headers HTTP

Servir con headers seguros:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  manifest-src 'self';
  worker-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

Notas:

- `style-src 'unsafe-inline'` es habitual con Tailwind (estilos inyectados). Si se prefiere evitar, configurar CSP con nonce.
- Sin `connect-src` externo, ya que la app no llama a ningún servicio.

### Caché HTTP

- `index.html`: `cache-control: no-cache` (permite que el SW siempre vea cambios en HTML).
- Assets con hash (`*.js`, `*.css` generados por Vite): `cache-control: public, max-age=31536000, immutable`.

### Redirecciones SPA

Todas las rutas no encontradas redirigen a `/index.html`:

- **Vercel**: `vercel.json` con `rewrites` o auto-detectado para Vite.
- **Netlify**: `_redirects` con `/*  /index.html  200`.
- **Cloudflare Pages**: `_redirects` igual que Netlify.

## Dominio

- **Personalizado**: configurar un dominio (p. ej. `taco.tudominio.es`).
- HTTPS automático (Let's Encrypt) en cualquiera de los proveedores listados.
- HTTP debe redirigir a HTTPS.

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]

jobs:
  lint-test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test --run --coverage
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
```

Deploy: Vercel/Cloudflare auto-deploya en cada push a `main`. No necesita workflow adicional.

## Versionado

- **SemVer** (`MAJOR.MINOR.PATCH`).
- Versión visible en pantalla **Ajustes → Acerca de**.
- Etiquetar releases con `vX.Y.Z` en git.
- `CHANGELOG.md` opcional (recomendado a partir de v1.0).

## Variables de entorno

Taco no requiere secretos en cliente (no hay APIs externas). Lo único configurable a build-time:

```
VITE_APP_VERSION=1.0.0
VITE_BUILD_DATE=2026-06-09
```

Inyectado por Vite vía `define` o leído de `package.json` automáticamente.

## Estrategia de versiones de service worker

- Cada despliegue genera un SW nuevo con hash de assets.
- `registerType: 'prompt'` ya descrito en `09-configuracion-pwa.md`.
- En caso de **rollback**, publicar la versión anterior; los clientes detectarán y actualizarán al recargar.

## Monitorización (sin sacrificar privacidad)

Por defecto, **ninguna**. La privacidad por defecto es un principio del proyecto.

Si en el futuro se desea telemetría:

- **Plausible** o **Counter** (analytics privacy-friendly, sin cookies).
- Sólo tras opt-in explícito del usuario.
- Sin recopilar contenidos de actividades.

## Plan de incidencias

Sin servidor, las incidencias se reducen a:

1. **Build falla** → revertir merge ofensivo.
2. **Service worker rompe** la app en clientes → publicar versión con `unregister` automático del SW corrupto + nueva versión sana.
3. **Bug crítico en cálculo normativo** → publicar fix, comunicar a usuarios (vía banner in-app si se implementa una "nota de versión").

## Distribución a app stores (opcional, post-MVP)

Una PWA puede empaquetarse para tiendas:

- **Google Play**: vía [Trusted Web Activity (TWA)](https://developer.chrome.com/docs/android/trusted-web-activity) con Bubblewrap.
- **Microsoft Store**: PWAs nativamente soportadas.
- **App Store (iOS)**: requiere wrap (PWABuilder o Capacitor) y revisión Apple. Esfuerzo significativo; no compensa en MVP.

## Backups

- El usuario es responsable de sus datos (exportar JSON periódico).
- La app sugiere exportación tras N días sin hacerlo (post-MVP).
- Sin backup remoto en MVP por diseño.
