# Arquitectura y Diseño Técnico · Sprint 2 (DoorWay-App)
**Autora:** Michel Daniela Bayona Díaz (Product Owner & Backend Developer)  
**Semestre:** Ingeniería Informática VIII Semestre · UNIPAZ  
**Stack Oficial:** React Native + Expo + SQLite Local + Supabase (Cloud) | Patrón MVVM  

---

## 1. Tabla de Actores del Sistema (Sprint 2)

| Actor | Tipo | Qué hace en DoorWay-App (Sprint 2) | Qué espera |
| :--- | :--- | :--- | :--- |
| **Residente (Doña Martha)** | Primario, usa la app | Reserva Salón Social / Kiosco BBQ (HU-05), comparte su ticket por WhatsApp, cancela reservas con >24h (HU-06), consulta la cartelera (HU-08) y llama a emergencias (HU-11) incluso en Modo Avión. | Ver disponibilidad real por colores, que no le quiten su turno y poder llamar a portería o ver comunicados sin datos móviles. |
| **Administrador(a) del Conjunto** | Primario, usa la app | Publica anuncios oficiales (HU-08), concilia pagos (HU-04) y habilita o bloquea automáticamente el derecho a reservar según el estado de cartera (HU-02). | Que ningún residente en mora pueda apartar áreas comunes y que no existan choques de horarios. |
| **Motor de Reglas de Dominio (`reglasNegocio.ts`)** | Sistema (Dominio Puro) | Evalúa `evaluarDerechoAReservar(recibos)` (HU-02) y `puedeCancelarCon24h(fecha, bloque)` (HU-06) sin depender de la interfaz ni de red. | Garantizar decisiones deterministas y auditables mediante pruebas unitarias. |
| **SQLite Local (`expo-sqlite`)** | Sistema | Almacena `recibos_cache`, `anuncios_cache`, `directorio_emergencias` (con semillas de Barrancabermeja) y `sesion_activa` (Ley 1581). | Lectura instantánea en Modo Avión ✈️ (TEC-05). |
| **Supabase (PostgreSQL + RLS)** | Sistema | Almacena `reservas` y `anuncios`, aplicando restricción `UNIQUE` (código `23505`) para evitar reservas duplicadas del mismo bloque horario. | Consistencia transaccional entre todos los vecinos del conjunto. |
| **Servicios Nativos Android (`Share` y `Linking`)** | Sistema | Abre la hoja nativa para enviar el ticket de reserva a WhatsApp y el marcador telefónico (`tel:`) para llamar a Portería, Policía `123` o Bomberos `119`. | Comunicación inmediata con un solo toque (≥ 48dp). |

---

## 2. Eventos de Dominio (Sprint 2 · En orden cronológico)

| # | Evento de Dominio | Lo dispara | Qué cambia en el estado / datos | Issue / Historia |
| :-: | :--- | :--- | :--- | :--- |
| **1** | Derecho a reservar evaluado | Residente al abrir `/reservas` | Cruza recibos con `evaluarDerechoAReservar()`; si hay mora activa, despliega `BannerMora` y bloquea confirmación. | HU-02 (#2) |
| **2** | Disponibilidad de bloques consultada | Residente al elegir área y fecha | Consulta `reservas` en Supabase y pinta bloques en Verde (libre), Rojo (ocupado) o Azul (seleccionado). | HU-05 (#5) |
| **3** | Reserva confirmada sin colisión | Residente al día | Inserta en Supabase validando colisiones `UNIQUE` (`23505`) y despliega `ModalTicketReserva`. | HU-05 (#5) |
| **4** | Ticket compartido por WhatsApp | Residente desde el modal | Invoca `Share.share()` con el resumen verificado de la reserva para enviar a Portería. | HU-05 (#5) |
| **5** | Cancelación evaluada por regla de 24h | Residente con reserva activa | `puedeCancelarCon24h()` verifica si faltan ≥ 24h; si cumple, cambia estado a `'Cancelada'` y libera el bloque. | HU-06 (#6) |
| **6** | Cartelera y directorio sincronizados en SQLite | Residente al abrir `/comunidad` | Descarga anuncios de Supabase a `anuncios_cache` o sirve `anuncios_cache` + `directorio_emergencias` en Modo Avión. | HU-08 (#8), HU-11 (#11), TEC-05 (#17) |
| **7** | Llamada de emergencia iniciada | Residente en `/comunidad` | Dispara `Linking.openURL('tel:...')` hacia Portería, Policía, Bomberos o ESSA/Aguas de Barrancabermeja. | HU-11 (#11) |
| **8** | Aviso de privacidad aceptado (Ley 1581) | Residente en su 1.ª sesión (`aceptoLey1581 = false`) | Despliega `ModalPrivacidadLey1581` y actualiza `acepto_ley1581 = true` en Supabase (`usuarios`) y en `sesion_activa` (SQLite). | HU-01 (#1), Ley 1581 |
| **9** | Comunicado oficial publicado por Admin | Administrador desde `/comunidad` | Invoca `crearAnuncioAdmin()`, inserta en tabla `anuncios` de Supabase y actualiza `anuncios_cache` en SQLite. | HU-08 (#8) |


---

## 3. Criterios de Aceptación Gherkin Validados (Product Owner)

### HU-05 (#5) y HU-02 (#2) — Reserva de Áreas Comunes y Bloqueo por Mora
```gherkin
# language: es
Escenario: Reserva exitosa de área común sin colisión cuando el residente está al día
  Dado que no tengo recibos en estado «En mora» en mi estado de cuenta
  Cuando selecciono «Salón Social», una fecha disponible y un bloque horario en verde
  Entonces el sistema registra la reserva en Supabase sin colisión y me muestra el Ticket Digital con opción de compartir por WhatsApp

Escenario: Bloqueo automático de reserva por mora financiera activa
  Dado que tengo al menos un recibo de administración en estado «En mora»
  Cuando abro la pantalla «Reservar Área Común»
  Entonces veo el banner rojo de alerta indicando el monto total en mora, el botón para ir a Cartera y la confirmación deshabilitada

Escenario: Rechazo por colisión de horario tomado por otro vecino
  Dado que dos residentes intentan reservar el mismo bloque horario simultáneamente
  Cuando el segundo intento llega a Supabase
  Entonces el repositorio captura la colisión UNIQUE y muestra «Este horario acaba de ser tomado por otro residente»
```

### HU-06 (#6) — Cancelación de Reserva con Regla de 24 Horas
```gherkin
# language: es
Escenario: Cancelación permitida con más de 24 horas de anticipación
  Dado que tengo una reserva confirmada cuyo bloque inicia en más de 24 horas
  Cuando pulso el botón «Cancelar turno (>24h)»
  Entonces la reserva pasa a estado «Cancelada» y el bloque vuelve a mostrarse disponible en verde

Escenario: Cancelación rechazada por faltar menos de 24 horas
  Dado que faltan menos de 24 horas para el inicio del bloque reservado
  Cuando intento cancelar la reserva
  Entonces veo el aviso «Solo puedes cancelar una reserva con al menos 24 horas de anticipación al inicio del turno»
```

### HU-08 (#8), HU-11 (#11) y TEC-05 (#17) — Cartelera y Directorio de Emergencias Offline
```gherkin
# language: es
Escenario: Consulta de cartelera y directorio en Modo Avión desde SQLite local
  Dado que mi teléfono Android está en Modo Avión sin conexión a Internet
  Cuando abro la pantalla «Cartelera y Emergencias»
  Entonces veo el aviso de modo sin conexión, los comunicados guardados en anuncios_cache y el directorio de emergencias de Barrancabermeja desde directorio_emergencias

Escenario: Llamada directa en un toque a entidades de emergencia de Barrancabermeja
  Dado que visualizo el Directorio de Emergencias en mi teléfono Android
  Cuando toco el botón de llamada de Portería (3158894021) o Policía (123)
  Entonces se abre el marcador telefónico nativo con el número listo para marcar
```
