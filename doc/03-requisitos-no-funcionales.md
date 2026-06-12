# 03 — Requisitos no funcionales

Cada requisito tiene un identificador `RNF-XX`.

## Rendimiento

- **RNF-01.** **Time to Interactive (TTI)** en móvil de gama media (≈ Moto G Power) sobre 4G: **< 3 s** en primera carga, **< 1 s** en recargas.
- **RNF-02.** El cambio de actividad debe registrarse y reflejarse en pantalla en **< 200 ms** desde el toque.
- **RNF-03.** Tamaño total del bundle inicial (JS+CSS) **< 200 KB** comprimido (gzip/brotli). Lazy-loading para vistas secundarias (histórico, ajustes).
- **RNF-04.** Operaciones de lectura sobre IndexedDB para un mes de datos: **< 100 ms**.

## Offline y disponibilidad

- **RNF-10.** **100 % funcional sin conexión** tras la primera carga.
- **RNF-11.** Los datos se persisten ante cierre del navegador, reinicio del dispositivo, fallo de batería, etc.
- **RNF-12.** Actualizaciones de la app vía service worker se aplican **sin pérdida de datos** locales y notifican al usuario antes de recargar.

## Usabilidad (principio rector: simplicidad)

- **RNF-20.** Mantener la jornada del día debe exigir, en el caso por defecto, **un único toque para abrir + un único toque para cerrar + introducir los minutos conducidos**. Cero pasos adicionales obligatorios.
- **RNF-21.** Botones y áreas táctiles **≥ 44 × 44 px** (recomendación WCAG / Apple HIG).
- **RNF-22.** Texto principal **≥ 16 px**; ratios de contraste **AA** mínimo (4.5:1 para texto normal).
- **RNF-23.** **Toda la información clave visible sin scroll** en la pantalla principal en un móvil de 5" o más (hora límite, disponibles, acumulado semanal/bisemanal, botón principal).
- **RNF-24.** Funciona en orientación **vertical**; horizontal admitida pero no requerida.
- **RNF-25.** Operable **con una sola mano** en móviles de hasta 6,7"; acciones principales en la mitad inferior de la pantalla.

## Accesibilidad

- **RNF-30.** Cumple **WCAG 2.1 AA** en los flujos principales.
- **RNF-31.** Soporte de lectores de pantalla (TalkBack, VoiceOver): roles ARIA, etiquetas claras.
- **RNF-32.** Soporte de **modo oscuro** y respeto a `prefers-color-scheme`.
- **RNF-33.** Respeta `prefers-reduced-motion` (sin animaciones bruscas).

## Privacidad y seguridad

- **RNF-40.** **Ningún dato del usuario sale del dispositivo** sin acción explícita (exportación).
- **RNF-41.** Sin telemetría, sin analítica de terceros, sin cookies de seguimiento.
- **RNF-42.** Sin recolección de datos personales más allá del nombre opcional del conductor (solo para exportación).
- **RNF-43.** Distribución exclusivamente sobre **HTTPS** (requisito de PWA).
- **RNF-44.** Política de Seguridad de Contenido (CSP) estricta: sin `eval`, sin `inline scripts` salvo necesarios y con `nonce`.

## Mantenibilidad

- **RNF-50.** Código en **TypeScript** con `strict: true`.
- **RNF-51.** Cobertura de pruebas unitarias del módulo de cálculos normativos: **≥ 90 %**.
- **RNF-52.** Linter (ESLint) y formateador (Prettier) configurados; CI bloquea merge si fallan.
- **RNF-53.** Convenciones de commits **Conventional Commits**.

## Compatibilidad

- **RNF-60.** Navegadores objetivo: **Chrome 110+, Edge 110+, Firefox 110+, Safari 16+** (móvil y escritorio).
- **RNF-61.** Android **10+** y iOS **16+** como sistemas mínimos.
- **RNF-62.** En navegadores que no soporten Service Worker, la app debe **funcionar sin crashear**, aunque sin capacidades offline (degradación elegante).

## Internacionalización

- **RNF-70.** Cadenas externalizadas (preparado para i18n) aunque solo se entregue español en MVP.
- **RNF-71.** Fechas y horas en formato local según `Intl` API.

## Limitaciones conocidas y aceptadas

- **RNF-80.** El almacenamiento del navegador es finito y puede ser **borrado por el sistema** (especialmente iOS). La app debe:
  - Avisar de la conveniencia de **exportar periódicamente**.
  - Marcar el origen IndexedDB como persistente vía `navigator.storage.persist()` cuando sea posible.
- **RNF-81.** El reloj del dispositivo es la fuente de verdad temporal; el usuario es responsable de tenerlo correcto.
