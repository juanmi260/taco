# 10 — Roadmap

Plan de entrega por fases. Cada fase tiene **objetivo claro**, **alcance acotado** y **criterio de "hecho"**. Fechas relativas porque el proyecto es de un solo desarrollador.

## Fase 0 — Cimientos ✅

- [x] Inicializar Vite + React + TS.
- [x] Configurar ESLint, Prettier.
- [x] Tailwind CSS + tokens de diseño.
- [x] Estructura de carpetas según `05-stack-tecnologico.md`.
- [x] Dexie + esquema (v1 + migración a v2) + repositorios.
- [x] React Router con rutas: `/`, `/history`, `/settings`.
- [ ] CI básico (GitHub Actions): lint + build + tests. *(pendiente)*
- [ ] Despliegue en hosting estático (Vercel/Netlify). *(pendiente)*

## Fase 1 — Núcleo del MVP: abrir y cerrar ✅

- [x] Dominio: tipo `DayLog`, validaciones de invariantes.
- [x] Repositorio `dayLogRepo` con `liveQuery` (jornada abierta, jornadas de la semana).
- [x] Store `useDayLogStore` (abrir, cerrar, editar, eliminar).
- [x] Bottom sheet de apertura con `TimeInput`, de cierre con `TimeInput` + `DurationInput`.
- [x] Pantalla **Inicio** con dos variantes (abierta / cerrada).
- [x] Contador editable de conducción del día en la pantalla principal.
- [x] Persistencia verificada tras recarga / cierre de navegador.
- [x] Pantalla **Histórico** con pestañas Día / Semana / Bisemana / Mes.
- [x] Edición y eliminación de jornadas.
- [x] Navegación entre periodos (← →).

## Fase 2 — Cálculos normativos ✅

- [x] Módulo `src/domain/regulation/` con funciones puras.
- [x] **Detección automática** (sin banderas manuales) de jornada ampliada y tipo de descanso.
- [x] Tests unitarios con casos de referencia (49+ tests).
- [x] Cálculos:
  - Suma semanal y bisemanal de conducción.
  - Conducción disponible hoy (con `drivingToday` actual).
  - Hora límite **de cierre** (15 h desde apertura).
  - Hora mínima de próxima apertura (regular 11 h y reducido 9 h).
  - Conteo de reducidos diarios y ampliadas en la semana (auto-detectados).
  - Plazo de compensación de descanso semanal reducido (auto-detectado por gap).
- [x] Componente `LimitGauge` con estados (normal/atención/crítico/excedido) y "Quedan HH:MM".
- [x] Integración en pantalla Inicio (ambas variantes).
- [x] Pantalla **Histórico** completa (Día / Semana / Bisemana / Mes).

## Fase 3 — Alertas, ajustes, PWA completa ✅ (mayoría)

- [x] Manifest auto-generado, iconos SVG, service worker producción (Workbox).
- [x] Toast de actualización de versión + estrategia `NetworkFirst`/`StaleWhileRevalidate`/`CacheFirst`.
- [ ] Notificaciones locales (Web Notifications API). *(pendiente — gauges + warnings inline ya cubren el feedback)*
- [x] Pantalla **Ajustes** completa.
- [x] Onboarding (3 pantallas).
- [x] Tema claro/oscuro/auto.
- [x] Exportación CSV y JSON.
- [x] Importación JSON con validación.
- [ ] "¿Por qué se muestra esto?" en gauges e indicadores. *(pendiente)*
- [x] Solicitud `navigator.storage.persist()` desde ajustes.
- [x] Banner offline.
- [x] Manejo de errores de IndexedDB con banner.
- [x] Botón temporal de **carga de datos de prueba**.

## Fase 4 — Pulido y release v1.0 — *en curso*

- [ ] Lighthouse PWA ≥ 95.
- [ ] WCAG 2.1 AA verificado en flujos principales.
- [ ] Tests E2E con Playwright en flujos críticos.
- [ ] Pruebas reales en Android (Chrome) y iOS (Safari).
- [ ] Documentación de usuario corta (1 página).
- [ ] Política de privacidad mínima.
- [ ] Versión 1.0.0 etiquetada y desplegada.

## Post-MVP — Ideas para iteraciones futuras

Orden tentativo, sin compromiso de entrega:

### v1.1 — Calidad de vida

- Widget de "hora límite de conducción hoy" en pantalla bloqueada (donde el SO lo permita).
- Resumen mensual exportable.
- Múltiples conductores en el mismo dispositivo (perfiles).
- Recordatorio "no has cerrado la jornada de ayer" cuando se abre la app por la mañana.
- Plantilla por defecto al abrir (presunción "hoy será como ayer") modificable.

### v1.2 — Casos avanzados del Reglamento

- Marcado de jornada en **multi-manning** (descanso 9 h en 30 h).
- Excepción **transporte internacional** (2020/1054): dos reducidos consecutivos con compensación.
- Marcado manual de **compensación efectuada** sobre un descanso pendiente.
- Diferenciar **conducción ininterrumpida** (>4 h 30) si el conductor quiere registrar pausas como sub-eventos opcionales (sin convertirse en tracker, mantenerlo opcional).

### v1.3 — Histórico avanzado

- Gráficas de conducción por mes.
- Detección de patrones (días largos consecutivos).
- Buscador por nota.
- Exportación PDF mensual lista para imprimir.

### v2.0 — Sincronización (gran salto)

- Sync end-to-end-encrypted entre dispositivos (sin cuenta o con cuenta opcional).
- Posible backend mínimo (Cloudflare Workers / Supabase) con datos cifrados en cliente.
- Mantiene principio: el servidor nunca puede leer los datos del conductor.

### Ideas exploratorias (no compromiso)

- Lectura de tarjeta del conductor vía NFC para auto-rellenar minutos de conducción.
- Integración con Google Calendar / Apple Calendar para planificación de descansos.
- Modo administrador para empresas de transporte (probablemente se aleja del público objetivo).

## Hitos de revisión

Al final de cada fase, revisar:

1. ¿Lo entregado cumple el criterio de "hecho"?
2. ¿La UI sigue siendo **muy sencilla y fácil de usar**? Si se ha añadido complejidad, simplificar antes de seguir.
3. ¿Mantener una jornada sigue siendo **2 toques + 1 cifra al día**? Si no, reconsiderar.
4. ¿Los tests cubren el código nuevo?
5. ¿La documentación está actualizada respecto a lo construido?

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| iOS purga IndexedDB tras 7 días sin uso | Insistir en `storage.persist()`, recordar exportar, mostrar fecha de última exportación. |
| Bugs en cálculos normativos pasan desapercibidos | Tests con casos de referencia documentados; auditar contra ejemplos oficiales de la Comisión. |
| Scope creep hacia tracker granular | Re-leer el modelo en `01-vision-y-objetivos.md` antes de aceptar features de "registrar X actividad". |
| Complejidad visual creciente | Principio rector recordado en cada fase + revisión específica al final. |
| El conductor olvida cerrar la jornada | Detección de jornada huérfana al abrir nueva (RF-07) + recordatorio nocturno opcional. |
