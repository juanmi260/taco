# 09 — Configuración PWA

Taco es una **Progressive Web App** instalable. Esta sección describe el manifest, el service worker y las estrategias de caché.

## Requisitos para que el navegador ofrezca instalar

- Servida sobre **HTTPS** (o `localhost` en dev).
- **Web App Manifest** válido y enlazado en `index.html`.
- **Service Worker** registrado y que responda a la solicitud de navegación.
- Iconos en al menos `192×192` y `512×512` px.
- `start_url` válida.

## Web App Manifest (`public/manifest.webmanifest`)

```json
{
  "name": "Taco — Control de tacógrafo",
  "short_name": "Taco",
  "description": "Control horario del tacógrafo según Reglamento (CE) 561/2006",
  "lang": "es-ES",
  "dir": "ltr",
  "scope": "/",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0B1220",
  "theme_color": "#0B1220",
  "categories": ["productivity", "utilities", "business"],
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    {
      "name": "Iniciar conducción",
      "short_name": "Conducir",
      "url": "/?action=start&kind=DRIVING",
      "icons": [{ "src": "/icons/shortcut-drive.png", "sizes": "96x96" }]
    },
    {
      "name": "Iniciar descanso",
      "short_name": "Descansar",
      "url": "/?action=start&kind=REST",
      "icons": [{ "src": "/icons/shortcut-rest.png", "sizes": "96x96" }]
    }
  ]
}
```

**Notas:**

- `display: standalone` da apariencia de app nativa (sin barra del navegador).
- `theme_color` y `background_color` controlan splash y barra de estado.
- `shortcuts` añade accesos directos al pulsar largo el icono (Android).
- Iconos **maskable** evitan el "círculo blanco" en Android adaptativo.

## `vite-plugin-pwa` (configuración en `vite.config.ts`)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',          // pedir confirmación al usuario antes de actualizar
      injectRegister: 'auto',
      includeAssets: ['icons/*.png', 'favicon.ico'],
      manifest: false,                  // usamos manifest.webmanifest manual
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'taco-html',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ request }) =>
              ['style', 'script', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'taco-assets' },
          },
          {
            urlPattern: ({ request }) =>
              ['image', 'font'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'taco-media',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
        ],
      },
    }),
  ],
});
```

## Estrategias de caché

| Recurso | Estrategia | Justificación |
|---|---|---|
| HTML (`/`, `/index.html`) | `NetworkFirst` (timeout 3 s) | Permite recibir actualizaciones; cae a caché offline. |
| JS / CSS con hash | `StaleWhileRevalidate` | Hash en nombre garantiza inmutabilidad; sirve rápido y refresca en background. |
| Iconos, fuentes | `CacheFirst` con expiración 90 d | Casi nunca cambian. |
| Manifest, favicon | `StaleWhileRevalidate` | — |

**Datos del usuario**: NO van por service worker. Viven en IndexedDB, completamente offline.

## Actualizaciones de la app

`registerType: 'prompt'`. Cuando hay una nueva versión disponible:

1. El SW descarga assets nuevos en background.
2. Aparece un **Toast** discreto: *"Nueva versión disponible · [Actualizar]"*.
3. Al tocar "Actualizar":
   - SW envía `SKIP_WAITING`.
   - La página recarga.
   - IndexedDB **no se toca**.

## Indicador online/offline

Mostrar un **pequeño badge** en la barra superior cuando `navigator.onLine === false`:

> ⚡ **Sin conexión** — la app sigue funcionando.

(Sin alarmismo: para Taco, offline es lo esperado.)

## `navigator.storage.persist()`

Tras completar onboarding, llamar a:

```ts
if (navigator.storage && navigator.storage.persist) {
  const granted = await navigator.storage.persist();
  await settingsRepo.update({ storagePersistGranted: granted });
}
```

Si **no** se concede (raro en navegadores modernos para PWAs instaladas):

- Mostrar banner sutil en ajustes: "Almacenamiento no garantizado · exporta tus datos regularmente".

## iOS Safari: particularidades

- A junio 2026, iOS sigue siendo el navegador con más limitaciones para PWAs:
  - Sin notificaciones push hasta instalar (Taco no las requiere en MVP).
  - Almacenamiento puede purgarse tras 7 días sin uso → **insistir en la exportación**.
  - `display: standalone` exige instalar vía "Añadir a pantalla de inicio".
- **Splash screens**: iOS requiere imágenes específicas por tamaño de dispositivo. Generar con `@vite-pwa/assets-generator` u opcionalmente posponer al post-MVP.
- Probar específicamente: **iPhone SE (pantalla pequeña)**, **iPhone 15 Pro**, **iPad** (vertical).

## Android: particularidades

- Chrome muestra prompt de "Instalar app" automáticamente si cumplimos criterios.
- WebAPK se instala (mejor que un acceso directo).
- Notificaciones locales disponibles tras permiso.
- `display: standalone` o `display: fullscreen`.

## Testing PWA

- **Lighthouse PWA audit**: objetivo ≥ 95.
- **Manual install test** en Android y iOS antes de cada release.
- Verificar **funcionamiento offline** (DevTools → Network → Offline).
- Verificar **actualización** (cambiar versión, ver prompt, actualizar).

## Iconografía a generar

A partir de un único SVG fuente:

- `192×192` (estándar y maskable)
- `512×512` (estándar y maskable)
- `180×180` (apple-touch-icon)
- `32×32` (favicon)
- `96×96` (shortcuts)
- Splash screens iOS (opcional fase 2)

Herramientas sugeridas: `@vite-pwa/assets-generator` o `pwa-asset-generator`.
