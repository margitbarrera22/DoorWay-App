# Arquitectura y Diseño Técnico · Sprint 3 Final y Empaquetado APK (DoorWay-App)
**Equipo:** Michel Daniela Bayona Díaz (PO), Margit Dayanna Barrera Gutiérrez (SM), Wilfran Leonardo Betancourt Ardila (Dev/SM) y Said Alexander Pacheco Moncada (Dev/SM)  
**Institución:** Instituto Universitario de la Paz (UNIPAZ) · Ingeniería Informática VIII Semestre  
**Stack Final:** React Native `0.88.1` + Expo SDK `58` + Expo Router + SQLite Local (`expo-sqlite`) + Supabase Cloud (PostgreSQL + Storage) + EAS Build (`.apk`)  
**Fecha de Cierre:** 18 de noviembre de 2026

---

## 1. Actores del Sistema Actualizados (Sprint 3 Final)

| Actor | Tipo | Qué hace en DoorWay-App (Versión Final v1.2.0) | Qué espera del sistema |
| :--- | :--- | :--- | :--- |
| **Residente Autenticado / Nuevo** | Primario, usa la app | Inicia sesión o se registra en BD (`login.tsx`), acepta el aviso Ley 1581, consulta su estado personal en `inicio.tsx` y su Tarjeta Hero en `cartera.tsx`, ve su factura electrónica DIAN (`FE-2026-...`), sube comprobante obligatorio (`recibo/subir.tsx`), reserva áreas comunes sin colisiones, edita su perfil/foto/PIN (`perfil.tsx`) y consulta avisos en `0 ms` sin conexión. | Que su cartera y sus reservas no se mezclen con las de otros vecinos, poder ver la pantalla completa sin que la barra de 3 botones o el teclado la tapen y recuperar su PIN con administración si lo olvida. |
| **Administrador Único (`Carlos Mendoza`)** | Primario, usa la app | Visualiza el *Resumen del Conjunto* en `inicio.tsx`, filtra la cartera por cliente con acordeón de meses anteriores en `cartera.tsx`, inspecciona fotos de soporte en `recibo/[id].tsx`, aprueba o rechaza pagos, publica comunicados oficiales en `comunidad.tsx` y audita todas las reservas sin bloqueo por mora. | Control centralizado por apartamento, cero saturación visual con historiales antiguos y consistencia inmediata entre la nube y los teléfonos de los residentes. |
| **Guardia de Seguridad y Rutas (`_layout.tsx` + `AuthContext.tsx`)** | Sistema | Restaura la sesión desde `sesion_activa` en SQLite al abrir la app, protege las rutas privadas redirigiendo a `/login` y provee `SafeAreaProvider` a todas las pantallas. | Arrancar sin crashes incluso tras actualizaciones de esquema local y garantizar acceso restringido por rol. |
| **Motor de Dominio y Aislamiento (`reglasNegocio.ts`)** | Sistema (Dominio Puro) | Ejecuta `filtrarRecibosPorUsuario(recibos, usuario)`, `evaluarDerechoAReservar(misRecibos)` y `puedeCancelarCon24h()`. | Evitar que la mora de un residente bloquee a vecinos al día y mantener reglas 100 % verificables por pruebas unitarias. |
| **Base Local SQLite (`dbLocalSqlite.ts`)** | Sistema | Administra `doorway_local.db` con 7 tablas (`recibos_local`, `sesion_activa`, `usuarios_registrados`, `preferencias_app`, `anuncios_cache`, `directorio_emergencias`, `reservas_local`) con migraciones autosanables. | Carga instantánea (`0 ms`) *Cache-First* en Modo Avión y cero fallos por columnas faltantes entre versiones. |
| **Supabase Cloud (Postgres + Storage Bucket `soportes`)** | Sistema | Aloja tablas `recibos`, `reservas`, `anuncios` y `usuarios`, almacena binariamente las fotos de comprobantes en el bucket público `soportes` y garantiza concurrencia en vivo en reservas. | Trazabilidad real multi-dispositivo: el primer residente en confirmar una franja horaria bloquea el turno para los demás. |

---

## 2. Nuevos Eventos de Dominio del Sprint Final (#16 al #22)

*(Complementan los Eventos #1 al #15 documentados en los Sprints 1 y 2).*

| # | Evento de Dominio | Lo dispara | Qué cambia en el estado / datos | Commit / Archivo Clave |
| :-: | :--- | :--- | :--- | :--- |
| **16** | Residente registrado con recibo inicial | Nuevo usuario en `login.tsx` | Crea registro en `usuarios_registrados` (SQLite) y Supabase (`usuarios`), inicia sesión y genera automáticamente su primer recibo del mes en estado `'En mora'` (por pagar). | `fcf4707` · `RepositorioAuth.ts`, `dbLocalSqlite.ts` |
| **17** | Cartera filtrada estrictamente por sesión | `cartera.tsx` / `inicio.tsx` / `reservas.tsx` | `filtrarRecibosPorUsuario()` aísla únicamente los recibos del apartamento autenticado; en `inicio.tsx` oculta el *Resumen del Conjunto* a residentes y muestra *Mi Estado de Cuenta*. | `006b1b7` · `reglasNegocio.ts` |
| **18** | Soporte fotográfico subido al bucket `soportes` | Residente en `recibo/subir.tsx` | Convierte la fotografía comprimida a `ArrayBuffer` (base64), la sube a Supabase Storage y persiste la URL pública en el recibo pasando a `'En validación'`. | `4e2c1ba` · `RepositorioRecibos.ts` |
| **19** | Historial pasado minimizado en acordeón | Admin en `cartera.tsx` | Agrupa los recibos por cliente: destaca el mes actual y colapsa los meses anteriores bajo `Ver N recibos anteriores`. | `2a070de` / `dfae23c` · `cartera.tsx` |
| **20** | Reserva confirmada con concurrencia real | Residente en `reservas.tsx` | Consulta en vivo a Supabase antes de insertar: el primero en confirmar reserva el turno (`OCUPADO · Torre X - Apto Y`); en *«Mis reservas»* cada cliente ve solo sus propios turnos. | `006b1b7` / `2a070de` · `reservas.tsx` |
| **21** | Avisos cargados en `0 ms` (*Cache-First*) | Usuario abre `comunidad.tsx` | Lee `anuncios_cache` y `directorio_emergencias` síncronamente al montar (`0 ms`) y sincroniza con Supabase en segundo plano; persiste preferencia de notificaciones en `preferencias_app`. | `006b1b7` · `comunidad.tsx` |
| **22** | Perfil actualizado y APK compilada | Usuario en `perfil.tsx` / EAS CLI | Actualiza foto de avatar o PIN de acceso con ayuda de contacto al Administrador; `eas build` genera el paquete instalable Android `.apk` (`v1.2.0`). | `aecfe3b`, `fab15f8` · `perfil.tsx`, `app.json` |

---

## 3. Esquema Consolidado de Persistencia Local (`doorway_local.db`)

1. **`recibos_local`**: Recibos sincronizados de la copropiedad y semillas multi-cliente (`Doña Martha`, `Andrés Ruiz`, `Claudia Morales`, `Javier Castro`, `Sandra Ortiz`).
2. **`sesion_activa`**: Sesión persistida del usuario autenticado (`id`, `nombre`, `correo`, `rol`, `apartamento`, `acepto_ley1581`, `avatarUrl`).
3. **`usuarios_registrados`**: Cuentas registradas desde la aplicación con su `pin_acceso` y `avatarUrl`.
4. **`preferencias_app`**: Pares clave/valor para preferencias del dispositivo (`notificaciones_activadas`).
5. **`anuncios_cache`**: Caché local de comunicados administrativos para lectura instantánea en Modo Avión.
6. **`directorio_emergencias`**: Semillas verificadas de Barrancabermeja (`3158894021`, `123`, `119`, `115`).
7. **`reservas_local`**: Respaldo local de reservas sincronizado con la tabla `reservas` de Supabase.

---

## 4. Criterios de Aceptación Gherkin del Sprint 3 Final

### Registro de Nuevo Residente con Recibo Inicial por Pagar
```gherkin
# language: es
Escenario: Registro exitoso de nuevo residente y generación automática de recibo inicial
  Dado que estoy en la pestaña «Registro de Cliente» de la pantalla de inicio de sesión
  Cuando ingreso mi nombre completo, apartamento, correo válido y PIN de 4 dígitos confirmado
  Entonces mi cuenta se guarda en Supabase y SQLite, inicio sesión automáticamente y en Cartera aparece mi primer recibo pendiente por pagar
```

### Aislamiento de Mora y Reservas por Cliente
```gherkin
# language: es
Escenario: Un residente al día puede reservar aunque otro apartamento del conjunto tenga mora
  Dado que inicié sesión como un residente cuyo recibo está en estado «Pagado» y otro vecino tiene su recibo «En mora»
  Cuando abro el módulo de Reservas
  Entonces el sistema filtra únicamente mis recibos, no muestra ningún bloqueo y me permite confirmar un horario disponible en verde
```

### Ergonomía Móvil y Compatibilidad Android
```gherkin
# language: es
Escenario: Navegación inferior visible sobre teléfonos con barra de 3 botones
  Dado que utilizo la aplicación en un dispositivo Android con barra de navegación clásica de 3 botones
  Cuando navego entre Inicio, Cartera, Reservas, Avisos y Perfil
  Entonces la barra inferior ajusta su margen inferior con useSafeAreaInsets y ningún texto ni botón queda recortado
```

---

## 5. Calidad UX/A11y y Ficha Oficial del Artefacto `.apk`

* **Auditoría Heurística (Nielsen) & WCAG 2.2 AA/AAA:** 6 hallazgos resueltos en código (`docs/auditoria-ux-sprint2.md`), contraste `13.9:1` en encabezados/tarjetas principales y áreas táctiles $\ge 48 \times 48\text{ dp}$.
* **Evaluación SUS (System Usability Scale):** **84.5 / 100 (Grado A · Excelente)** sobre 5 participantes representativos.
* **Artefacto Compilado en EAS Build:**
  * **Paquete Android:** `com.unipaz.doorwayapp` (`v1.2.0` · Expo SDK `58.0.0`)
  * **Perfil:** `preview` (`"buildType": "apk"` en `eas.json`)
  * **Project ID EAS:** `c266b1bf-5d33-434a-ac7c-cce9f7d8fdf1` (Owner: `wilfranb`)
  * **Build ID:** `d1f4b15e-7cdb-4d49-b4e7-8b30093d88e6`
  * **Enlace directo de descarga:** https://expo.dev/artifacts/eas/z7pi28r1p9qzvWzZ69YcdTbgY2WEKfay5QQfP0q9wPY.apk
