# 13 — Glosario

Términos del dominio normativo y técnico utilizados en el proyecto.

## Dominio (Reglamento 561/2006)

- **Tacógrafo.** Dispositivo a bordo del vehículo que registra automáticamente los tiempos de conducción, descanso y otros trabajos del conductor.
- **Conducción.** Tiempo durante el cual el conductor está al volante con el vehículo en movimiento.
- **Otros trabajos.** Actividades laborales del conductor distintas de la conducción: carga, descarga, papeleo, mantenimiento, formación.
- **Disponibilidad.** Período en el que el conductor está disponible pero no realiza trabajo activo (espera, segundo conductor durante la marcha).
- **Descanso / Pausa.** Período libre del conductor. La diferencia clave:
  - **Pausa**: dentro de la jornada, normalmente de 45 min (o 15+30) tras conducir 4 h 30 min.
  - **Descanso diario**: entre jornadas, al menos 9 h reducido o 11 h regular.
  - **Descanso semanal**: al menos 24 h reducido o 45 h regular.
- **Jornada.** Periodo continuo entre dos descansos diarios.
- **Semana.** Conforme al reglamento: de **lunes 00:00 a domingo 24:00**.
- **Bisemana.** Dos semanas consecutivas; el límite de 90 h de conducción se aplica sobre ellas.
- **Conducción en equipo (multi-manning).** Operación con dos o más conductores en el vehículo, con reglas específicas de descanso.
- **Descanso reducido.** Versión más corta del descanso permitida un número limitado de veces. Diario: 9 h (máx. 3/sem). Semanal: 24 h (debe compensarse).
- **Compensación.** Tiempo extra de descanso que el conductor debe tomarse tras un descanso semanal reducido. Debe agregarse en bloque a otro descanso de ≥ 9 h, antes del final de la tercera semana siguiente.
- **MMA.** Masa Máxima Autorizada del vehículo.

## Dominio (Taco)

- **Jornada (DayLog).** Unidad básica de Taco. Representa un día de trabajo con: hora de apertura, hora de cierre, minutos totales de conducción declarados y banderas (ampliada, reducido diario, reducido semanal). Una jornada por día calendario.
- **Apertura de jornada.** Momento en que el conductor pulsa "Abrir jornada" (típicamente al empezar el día, equivalente a "abrir el tacógrafo"). Queda registrado como `openedAt`.
- **Cierre de jornada.** Momento en que el conductor pulsa "Cerrar jornada" e introduce los minutos de conducción del día. Queda registrado como `closedAt` + `drivingMinutes`.
- **Jornada abierta.** `DayLog` con `closedAt = null`. Solo puede existir una en todo momento.
- **Jornada huérfana.** Jornada abierta de un día anterior cuyo cierre se olvidó. Al detectarse, la app exige cerrarla manualmente antes de abrir una nueva.
- **Bandera de ampliada.** Marcador en la jornada que indica que se ha hecho uso del límite ampliado a 10 h de conducción (máx. 2 / semana).
- **Bandera de reducido diario.** Marcador que indica que el conductor inicia un descanso diario reducido (9 h en lugar de 11 h), válido máx. 3 entre dos descansos semanales.
- **Bandera de reducido semanal.** Marcador que indica que el descanso semanal será reducido (24 h en lugar de 45 h), exigiendo compensación antes del final de la semana N+3.
- **Disponibilidad de conducción.** Minutos de conducción que aún se pueden hacer hoy según los tres límites (diario, semanal, bisemanal).
- **Hora límite de conducción.** Hora del día hasta la cual el conductor puede aún conducir sin superar ningún límite.
- **Próxima apertura mínima.** Hora más temprana a la que el conductor puede abrir la siguiente jornada según el descanso (regular 11 h o reducido 9 h).
- **Gauge.** Barra visual que indica cuán cerca está un contador de su límite, con código de color (verde/ámbar/rojo).
- **Onboarding.** Tres pantallas mostradas al primer arranque que presentan la app.
- **Hub.** Pantalla principal (Inicio).

## Técnico

- **PWA (Progressive Web App).** Aplicación web que adopta capacidades de app nativa: instalable, offline, integrada en el SO.
- **Service Worker.** Script en segundo plano que intermedia las peticiones de red, permite caché y funcionamiento offline.
- **Manifest (Web App Manifest).** Archivo JSON que describe la PWA al navegador (nombre, iconos, colores, ámbito).
- **IndexedDB.** Base de datos NoSQL del navegador, transaccional, asíncrona, con índices. Almacenamiento principal de Taco.
- **localStorage.** Almacén key-value síncrono del navegador. No usado por Taco por sus limitaciones.
- **Dexie.js.** Biblioteca que envuelve IndexedDB con una API basada en promesas.
- **liveQuery.** Suscripción reactiva en Dexie: cualquier cambio en los datos consultados emite a los oyentes.
- **Workbox.** Biblioteca de Google para construir Service Workers con estrategias de caché preconfiguradas.
- **TWA (Trusted Web Activity).** Mecanismo de Chrome para empaquetar una PWA como app de Google Play.
- **CSP (Content Security Policy).** Cabecera HTTP que restringe los orígenes permitidos para scripts, estilos, etc., mitigando XSS.
- **WCAG 2.1 AA.** Estándar de accesibilidad web; AA es el nivel objetivo legal habitual.
- **ULID.** Identificador único alternativo a UUID que ordena lexicográficamente por tiempo. Útil para identificadores de actividades.
- **HMR (Hot Module Replacement).** Recarga parcial del módulo cambiado durante desarrollo sin perder estado.
- **SemVer (Semantic Versioning).** Convención de versionado MAJOR.MINOR.PATCH.
- **SPA (Single Page Application).** App que carga una vez y navega sin recargas completas.

## Acrónimos breves

| Sigla | Significado |
|---|---|
| PWA | Progressive Web App |
| SW | Service Worker |
| MVP | Minimum Viable Product |
| RF / RNF | Requisito Funcional / Requisito No Funcional |
| CSV | Comma-Separated Values |
| JSON | JavaScript Object Notation |
| TS | TypeScript |
| IDB | IndexedDB |
| DST | Daylight Saving Time (cambio horario) |
| MMA | Masa Máxima Autorizada |
| UTC | Coordinated Universal Time |
