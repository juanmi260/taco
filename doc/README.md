# Taco — Documentación

PWA móvil para el control horario del tacógrafo según el **Reglamento (CE) nº 561/2006**.

Esta carpeta contiene toda la especificación funcional, técnica y de diseño del proyecto. Léase de arriba abajo en una primera lectura; en uso diario, sírvase de índice.

## Índice

| # | Documento | Propósito |
|---|-----------|-----------|
| 01 | [Visión y objetivos](01-vision-y-objetivos.md) | Qué es Taco, para quién y por qué |
| 02 | [Requisitos funcionales](02-requisitos-funcionales.md) | Lo que la app debe hacer |
| 03 | [Requisitos no funcionales](03-requisitos-no-funcionales.md) | Cómo debe comportarse (rendimiento, offline, accesibilidad) |
| 04 | [Reglamento (CE) 561/2006](04-reglamento-561-2006.md) | Resumen normativo de referencia con todos los límites |
| 05 | [Stack tecnológico](05-stack-tecnologico.md) | Tecnologías elegidas y por qué |
| 06 | [Arquitectura](06-arquitectura.md) | Capas, módulos y flujo de datos |
| 07 | [Modelo de datos](07-modelo-de-datos.md) | Esquema IndexedDB, entidades y relaciones |
| 08 | [Diseño UI/UX](08-diseno-ui-ux.md) | Principios de interfaz, pantallas y patrones |
| 09 | [Configuración PWA](09-configuracion-pwa.md) | Manifest, service worker, estrategias de caché |
| 10 | [Roadmap](10-roadmap.md) | Fases de desarrollo y entregables |
| 11 | [Estrategia de pruebas](11-estrategia-de-pruebas.md) | Tests unitarios, integración y manuales |
| 12 | [Despliegue](12-despliegue.md) | Hosting, CI/CD, HTTPS |
| 13 | [Glosario](13-glosario.md) | Términos del dominio y técnicos |

## Principios rectores (resumen)

1. **Control a grandes rasgos, no tracker granular.** El usuario registra solo apertura y cierre de jornada + minutos totales conducidos. Taco no duplica el tacógrafo oficial: lo complementa con cómputo y disponibilidad.
2. **Simplicidad ante todo.** Mantener la jornada exige **un toque al abrir + un toque al cerrar + una cifra**. Sin menús anidados ni formularios largos.
3. **Offline-first.** La app funciona sin conexión. Los datos viven en el dispositivo (IndexedDB).
4. **Mobile-first.** Se diseña para móvil; cualquier vista de escritorio es secundaria.
5. **Cumplimiento normativo.** Los cálculos de disponibilidad, hora límite y descanso mínimo siguen estrictamente el Reglamento (CE) 561/2006.
6. **Privacidad por defecto.** Los datos del conductor nunca salen del dispositivo salvo exportación manual.

## Estado del proyecto

Fase: **planificación / pre-MVP**. Sin código fuente todavía; la documentación define el alcance del MVP.
