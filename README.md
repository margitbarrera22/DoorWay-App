# 🚪 DoorWay-App — Sistema Integral de Gestión para Condominios

**Institución:** Instituto Universitario de la Paz (UNIPAZ) · Ingeniería Informática VIII Semestre · Desarrollo de Aplicaciones Móviles (DAM)  
**Equipo:** Condominios App (*Los Diurnos*)  
**Integrantes:** Michel Daniela Bayona Díaz, Margit Dayanna Barrera Gutiérrez, Wilfran Leonardo Betancourt Ardila, Said Alexander Pacheco Moncada  
**Stack Tecnológico:** React Native `0.88.1` · Expo SDK `58` · Expo Router · TypeScript · SQLite Local (`expo-sqlite`) · Supabase Cloud (PostgreSQL + Storage) · EAS Build (`.apk`)  
**Versión Final:** `v1.2.0` (`com.unipaz.doorwayapp`)  
**ODS Alineados:** ODS 11 (*Ciudades y comunidades sostenibles*) y ODS 16 (*Paz, justicia e instituciones sólidas*)

---

## 📦 Descarga del APK Oficial y Enlaces del Proyecto

| Recurso | Enlace Oficial |
|---|---|
| 🤖 **Instalador Android (.apk · v1.2.0)** | [Descargar DoorWay-App (.apk) desde EAS Build](https://expo.dev/artifacts/eas/z7pi28r1p9qzvWzZ69YcdTbgY2WEKfay5QQfP0q9wPY.apk) |
| 🛠️ **Bitácora de Compilación en la Nube** | [Ver Build ID `d1f4b15e-7cdb-4d49-b4e7-8b30093d88e6` en Expo](https://expo.dev/accounts/wilfranb/projects/doorway-app/builds/d1f4b15e-7cdb-4d49-b4e7-8b30093d88e6) |
| 📋 **Tablero Scrumban (GitHub Projects)** | [Doorway Tablero](https://github.com/users/margitbarrera22/projects/2) |
| 📄 **Informe Maestro Completo en PDF (3 Sprints)** | [`docs/Informe_Desarrollo_Completo_DoorWay_App_3_Sprints.pdf`](docs/Informe_Desarrollo_Completo_DoorWay_App_3_Sprints.pdf) |

---

## 1. Visión y Objetivo del Producto

### Visión (Plantilla de Moore)
**Para** los residentes y administradores de conjuntos residenciales en Barrancabermeja **que** sufren pérdida de trazabilidad financiera, colisiones en la reserva de áreas comunes y falta de seguimiento a sus solicitudes por depender de hojas de cálculo aisladas y grupos informales de WhatsApp, **DoorWay-App** **es una** aplicación móvil nativa multiplataforma desarrollada con React Native y Expo **que** centraliza la gestión de cartera y facturación electrónica, el calendario de áreas comunes sin colisiones, el registro de residentes y la comunicación comunitaria con respaldo offline. **A diferencia de** llevar la contabilidad en Excel o atender trámites por chats informales, **nuestro producto** funciona fluidamente en teléfonos Android de gama media o baja, comprime comprobantes fotográficos (`< 300 KB`), opera sin conexión desde SQLite local en Modo Avión, aísla estrictamente la información financiera por unidad residencial y cruza en tiempo real el estado de mora para habilitar o bloquear reservas.

### 🎯 Objetivo del Producto
> «Que cualquier residente o administrador de un conjunto residencial en Barrancabermeja pueda autenticarse, registrar y conciliar pagos de administración con soporte fotográfico, reservar un área común sin colisiones o consultar comunicados y emergencias offline en menos de 2 minutos desde un teléfono móvil, garantizando trazabilidad financiera y control de morosidad en tiempo real.»

---

## 2. Equipo de Trabajo, Roles Scrumban y Aportes por Sprint

| Integrante | GitHub | Rol Scrum / Scrumban | Responsabilidades y Aportes Reales (Sprints 1, 2 y 3 Final) |
| :--- | :--- | :--- | :--- |
| **Michel Daniela Bayona Díaz** | `Bayonadi` | **Product Owner (Fija todo el semestre)** & Backend / Persistencia Híbrida | • **Sprint 1:** Diseño de entidades (`modelos.ts`) y contratos (`contratos.ts`), tablas PostgreSQL y bucket `soportes` en Supabase, motor `dbLocalSqlite.ts`, `RepositorioRecibos.ts` y validación con usuarios reales (`INV-02 #18`).<br>• **Sprint 2:** Reglas puras en `reglasNegocio.ts` (`evaluarDerechoAReservar`, `puedeCancelarCon24h`), `RepositorioReservas.ts` con captura de colisión `UNIQUE (23505)`, directorio de emergencias de Barrancabermeja en SQLite y pruebas unitarias (`reglasNegocio.test.ts`).<br>• **Sprint 3:** Subida binaria real al bucket `soportes`, creación automática de recibo inicial por pagar al registrarse un residente nuevo (`fcf4707`) y validación obligatoria de comprobante. |
| **Margit Dayanna Barrera Gutiérrez** | `margitbarrera22` | **Scrum Master Oficial (Hito 1 y Cierre)** & UX/UI Accesible WCAG 2.2 AA | • **Sprint 1:** Prototipos en Figma, sistema de diseño `src/theme/tema.ts`, componentes `TarjetaRecibo.tsx` y `EstadoPantalla.tsx` (≥ 48 dp), gestión del *Doorway Tablero* y Code Review.<br>• **Sprint 2:** Componentes `BannerMora.tsx`, `SelectorBloques.tsx`, `ModalTicketReserva.tsx` y pantalla `comunidad.tsx` (`HU-08` y `HU-11`).<br>• **Sprint 3:** Módulo dedicado de facturación `src/app/cartera.tsx` (`dfae23c`), `ModalPrivacidadLey1581.tsx`, factura electrónica DIAN y visor en `recibo/[id].tsx`, más Auditoría Heurística de Nielsen y prueba SUS (**84.5/100 · Grado A**). |
| **Wilfran Leonardo Betancourt Ardila** | `wilfran0707` | **Developer Principal Frontend / ViewModels**, Co-Scrum Master (Hito 2) & Líder APK | • **Sprint 1:** Arquitectura Expo Router (`TEC-01 #13`, `_layout.tsx`), `RecibosContext.tsx` (4 estados + cerrojo `useRef`), `index.tsx` (`HU-03`) y conciliación administrativa en `recibo/[id].tsx` (`HU-04`).<br>• **Sprint 2:** `ReservasContext.tsx`, pantalla `reservas.tsx` (`HU-05` / `HU-02`) y pruebas de campo en celular físico (Online y Modo Avión).<br>• **Sprint 3:** Unificación visual, `AuthContext.tsx`, dashboard por rol `inicio.tsx`, `perfil.tsx`, `filtrarRecibosPorUsuario()`, acordeón de meses anteriores en cartera admin, `SafeAreaInsets` para barra de 3 botones, carga `0 ms` en avisos, ayuda PIN olvidado, fix crash Android y compilación del `.apk` en EAS Build. |
| **Said Alexander Pacheco Moncada** | `Thepache` | **Developer de Dispositivo, Servicios Nativos** & Co-Scrum Master (Hito 3) | • **Sprint 1:** Servicio nativo `ServicioCamaraExpo.ts` con permisos Android y compresión JPEG al 60 % (`< 300 KB`, `TEC-04 #16`), `useSubirComprobante.ts` y `recibo/subir.tsx` (`HU-01 #1`).<br>• **Sprint 2:** `compartirTicketWhatsApp.ts` (API `Share`), `useCancelarReserva.ts` (`> 24h`, `HU-06 #6`) y sincronizador `RepositorioComunidadHibrido.ts` (`TEC-05 #17`).<br>• **Sprint 3:** Configuración de empaquetado nativo en `eas.json`/`app.json`, hook `useLoginFormulario.ts` y validación de cámara, almacenamiento y modo offline sobre el APK. |

---

## 3. Alcance Final del Producto (Matriz MoSCoW)

| Categoría | Funcionalidades Implementadas |
| :--- | :--- |
| **Must (Debe tener)** | • Autenticación híbrida real por rol (Administrador único y Residentes) + Registro exclusivo para nuevos clientes en Supabase y SQLite (`AuthContext`, `RepositorioAuth`).<br>• Aviso de Privacidad Ley 1581 de 2012 persistido localmente (`ModalPrivacidadLey1581.tsx`).<br>• Consulta de cartera por unidad residencial con Tarjeta Hero del mes actual, desglose de factura electrónica (`FE-2026-...`), los 4 estados de vista y lectura en Modo Avión (`HU-03`).<br>• Captura y carga de comprobantes bancarios desde cámara/galería con compresión `< 300 KB` y subida binaria al bucket `soportes` de Supabase (`HU-01`, `TEC-04`).<br>• Panel de conciliación administrativa con visor de voucher y acordeón histórico para meses anteriores (`HU-04`).<br>• Calendario interactivo de áreas comunes con concurrencia en tiempo real (`UNIQUE 23505`) y bloqueo automático individual por mora financiera (`HU-02`, `HU-05`). |
| **Should (Debería tener)** | • Cancelación oportuna de reservas con validación de antelación mayor a 24 horas (`HU-06`).<br>• Cartelera virtual de anuncios (carga instantánea `0 ms` *Cache-First*) + Switch de notificaciones + Directorio de emergencias 24h de Barrancabermeja 100 % offline (`HU-08`, `HU-11`, `TEC-05`).<br>• Perfil de usuario con cambio de foto de avatar, cambio de PIN y asistencia por olvido de PIN.<br>• Generación de paquete instalable Android (`.apk`) vía EAS Build (`com.unipaz.doorwayapp`). |
| **Could (Valor Agregado)** | • Ticket digital de reserva confirmada con envío directo a WhatsApp mediante menú nativo `Share`.<br>• Dashboard ejecutivo diferenciado: *Resumen del Conjunto* exclusivo para el Administrador y *Mi Estado de Cuenta* para el Residente (`inicio.tsx`).<br>• Adaptación ergonómica a dispositivos Android con barra de navegación de 3 botones (`SafeAreaProvider`) y teclado adaptativo (`softwareKeyboardLayoutMode: "pan"`). |
| **Won't (Fuera del Alcance)** | • Publicación en Google Play Store / Apple App Store (distribución directa gratuita vía `.apk` de EAS Build y Expo Go).<br>• Pasarela de pagos en línea con débito bancario real (PSE).<br>• Integración física con hardware de portería (NFC, Bluetooth, biometría o talanqueras). |

---

## 4. Arquitectura en 4 Capas (MVVM con Contratos) y Estructura del Repositorio

El código está organizado bajo separación estricta de responsabilidades para mantener las reglas financieras independientes de React Native y permitir la conmutación transparente entre **Supabase Cloud** y **SQLite Local**:

```text
DoorWay-App/
├── app.json                                 # Configuración Expo SDK 58, ícono adaptativo, teclado "pan" y projectId EAS
├── eas.json                                 # Perfiles de compilación Android (.apk en preview y production)
├── package.json                             # Dependencias SDK 58 y script "build:apk"
├── docs/                                    # Documentación técnica, auditorías y evidencias
│   ├── Informe_Desarrollo_Completo_DoorWay_App_3_Sprints.pdf  # Informe maestro consolidado (8 páginas)
│   ├── arquitectura-sprint1.md              # Actores, eventos (#1-#8) y arquitectura base Sprint 1
│   ├── arquitectura-sprint2.md              # Actores, eventos y criterios Gherkin Sprint 2
│   ├── arquitectura-sprint3-final.md        # Arquitectura final, tablas SQLite/Supabase, SUS y ficha APK
│   ├── auditoria-ux-sprint2.md              # Auditoría Heurística Nielsen (6 hallazgos) + SUS 84.5/100
│   ├── auditoria-heuristica.json            # Matriz estructurada de hallazgos UX/A11y
│   └── examen-sprint1.md                    # Entregable técnico de validación Sprint 1
└── src/
    ├── domain/                              # CAPA 3 · DOMINIO PURO (TypeScript sin dependencias UI)
    │   ├── modelos.ts                       # Entidades (Recibo, Reserva, Anuncio, UsuarioSesion) y semillas multi-cliente
    │   ├── reglasNegocio.ts                 # evaluarDerechoAReservar, puedeCancelarCon24h y filtrarRecibosPorUsuario
    │   └── reglasNegocio.test.ts            # Pruebas unitarias de reglas de mora y cancelación >24h
    ├── data/                                # CAPA 4 · DATOS HÍBRIDOS Y SERVICIOS NATIVOS
    │   ├── contratos.ts                     # Interfaces IRecibosRepository, IReservasRepository, IComunidadRepository, IAuthRepository, IServicioCamara
    │   ├── dbLocalSqlite.ts                 # Base SQLite local (doorway_local.db): 7 tablas con migraciones autosanables
    │   ├── RepositorioRecibos.ts            # Sincronización SQLite <-> Supabase + subida binaria a bucket "soportes"
    │   ├── RepositorioAuth.ts               # Login híbrido, registro con recibo inicial automático, cambio PIN/Avatar
    │   ├── RepositorioReservas.ts           # Consulta y registro en Supabase con captura de colisiones UNIQUE (23505)
    │   ├── RepositorioComunidadHibrido.ts   # Descarga de comunicados Supabase -> SQLite y lectura offline
    │   ├── ServicioCamaraExpo.ts            # Captura de cámara/galería y compresión JPEG al 60 % (< 300 KB)
    │   └── compartirTicketWhatsApp.ts       # Envío nativo del ticket digital de reserva por Share/WhatsApp
    ├── hooks/                               # CAPA 2 · VIEWMODELS Y CONTEXTOS REACTIVOS
    │   ├── AuthContext.tsx                  # Estado global de sesión SQLite, registro, avatar, PIN y Ley 1581
    │   ├── RecibosContext.tsx               # 4 estados de vista (cargando, vacio, error, conDatos) + cerrojo useRef
    │   ├── ReservasContext.tsx              # Estado reactivo de calendario y reservas
    │   ├── useSubirComprobante.ts           # Validación de referencia (>= 4 chars) y foto sin perder datos digitados
    │   ├── useCancelarReserva.ts            # Hook de cancelación validando regla > 24 horas
    │   └── useLoginFormulario.ts            # Estado y validación del formulario de acceso
    ├── theme/
    │   └── tema.ts                          # Sistema de diseño accesible WCAG 2.2 AA/AAA (#0F2540, #0D9488)
    ├── components/                          # CAPA 1A · COMPONENTES UI REUTILIZABLES (>= 48 dp)
    │   ├── BarraNavegacionModulos.tsx       # Barra inferior de 5 pestañas con useSafeAreaInsets (3 botones Android)
    │   ├── TarjetaRecibo.tsx                # Tarjeta de recibo con badge semáforo y soporte TalkBack
    │   ├── EstadoPantalla.tsx               # Estados visuales de cargando, vacío y error con reintento
    │   ├── BannerMora.tsx                   # Alerta roja persistente con redirección directa a Cartera
    │   ├── SelectorBloques.tsx              # Franjas horarias cromáticas (verde libre, rojo ocupado, azul seleccionado)
    │   ├── ModalTicketReserva.tsx           # Comprobante digital tras reserva confirmada + botón WhatsApp
    │   └── ModalPrivacidadLey1581.tsx       # Aviso Ley 1581 de 2012 con rol nativo accessibilityRole="alert"
    └── app/                                 # CAPA 1B · PANTALLAS Y RUTAS EXPO ROUTER
        ├── _layout.tsx                      # SafeAreaProvider, AuthProvider, RecibosProvider y NavegacionProtegida
        ├── index.tsx                        # Punto de entrada que redirige limpiamente a inicio.tsx
        ├── login.tsx                        # Login corporativo, Registro de Cliente, teclado adaptativo y Ayuda PIN
        ├── inicio.tsx                       # Dashboard condicional: Resumen del Conjunto (Admin) vs Mi Estado (Residente)
        ├── cartera.tsx                      # Módulo financiero multi-cliente con acordeón de meses anteriores y Tarjeta Hero
        ├── reservas.tsx                     # Calendario interactivo, concurrencia en tiempo real y "Mis reservas" aislado
        ├── comunidad.tsx                    # Avisos Cache-First 0 ms, switch notificaciones y directorio 24h offline
        ├── perfil.tsx                       # Cambio de foto/avatar, cambio de PIN, ayuda olvido de PIN y cerrar sesión
        └── recibo/
            ├── [id].tsx                     # Factura electrónica DIAN (FE-2026), visor de soporte y conciliación Admin
            └── subir.tsx                    # Captura/selección de voucher obligatorio y referencia bancaria
```

---

## 5. Evolución Cronológica por Sprints (Sprints 1, 2 y 3 Final)

### ✅ Sprint 1 (Semana 1: 29 Oct – 4 Nov 2026) — Cimientos MVVM y Cartera Base
* **Logro:** Se implementó el núcleo financiero híbrido (`TEC-01`, `TEC-03`, `TEC-04`, `HU-03`, `HU-01`, `HU-04`, `INV-02`).
* **Aspectos clave:** Esquema relacional en Supabase, caché local `expo-sqlite` para Modo Avión, compresión fotográfica al 60 % JPEG (`~180 KB`), cerrojo anti-doble toque con `useRef`, validación sin pérdida de datos digitados y panel de conciliación administrativa.

### ✅ Sprint 2 (Semana 2: 5 Nov – 11 Nov 2026) — Reservas sin Colisiones y Comunidad Offline-First
* **Logro:** Se completaron todos los flujos de zonas comunes y comunidad sin conexión (`HU-02`, `HU-05`, `HU-06`, `HU-08`, `HU-11`, `TEC-05`).
* **Aspectos clave:** Motor de reglas puras en `reglasNegocio.ts`, captura atómica de colisiones `UNIQUE (23505)` en Supabase, calendario cromático (`SelectorBloques.tsx`), ticket digital compartible por WhatsApp, cancelación con regla `> 24h`, directorio telefónico de Barrancabermeja en SQLite y pruebas unitarias.

### ✅ Sprint 3 · Sprint Final (Semana 3: 12 Nov – 18 Nov 2026) — Autenticación Real, Aislamiento, Auditoría UX y APK
* **Autenticación y Registro en BD (`aecfe3b`, `fcf4707`):** Login corporativo con un único Administrador y registro exclusivo para clientes nuevos guardados en Supabase y SQLite, generando automáticamente su primer recibo pendiente por pagar y exigiendo soporte obligatorio al reportar el pago.
* **Cartera Multi-Cliente con Acordeón (`8d42b2c`, `dfae23c`, `2a070de`):** Se sembraron 5 clientes reales de prueba, se desacopló `cartera.tsx` y se agregó un acordeón colapsable en la vista del Administrador para minimizar recibos de meses pasados (como los 7 meses de Doña Martha) debajo del mes actual. En `inicio.tsx`, el *Resumen del Conjunto* quedó restringido exclusivamente al Administrador.
* **Aislamiento de Datos y Concurrencia Real (`006b1b7`, `2a070de`):** Se implementó `filtrarRecibosPorUsuario()` para que la mora de un vecino no bloquee a residentes al día, se aisló la sección *«Mis reservas»* a la sesión activa y se validó la concurrencia contra Supabase en tiempo real para que el primer cliente en confirmar se quede con el turno.
* **Rendimiento 0 ms, Ergonomía Móvil y Fix Android (`8d42b2c`, `b6f2c1c`):** Carga instantánea *Cache-First* en `comunidad.tsx`, pantalla `perfil.tsx` para foto/PIN, ayuda por olvido de PIN en Login y Perfil, corrección del crash nativo `alertdialog` &rarr; `alert` en `ModalPrivacidadLey1581.tsx`, `SafeAreaProvider` para evitar recortes con la barra Android de 3 botones y teclado adaptativo `pan`.
* **Auditoría UX/SUS y Empaquetado Oficial APK (`fab15f8`):** Validación heurística (6 hallazgos resueltos), contraste WCAG 2.2 AA/AAA (`13.9:1`), puntuación **SUS de 84.5 / 100 (Grado A)** y generación exitosa del instalador `.apk` vía **EAS Build**.

---

## 6. Usuarios y Escenarios de Prueba (Base Local y Supabase)

| Usuario | Rol | Correo / Alias de Acceso | Apartamento | PIN | Estado Inicial Semilla |
|---|---|---|---|---|---|
| **Carlos Mendoza** | Administrador | `admin@doorway.com` / `admin` | Administración General | `1234` | Acceso total (Resumen del Conjunto, Conciliación y Auditoría) |
| **Doña Martha Gómez** | Residente | `martha@doorway.com` / `302` | Torre B - Apto 302 | `3020` | Nov 2026 `En mora` + 6 meses históricos `Pagado` |
| **Andrés Felipe Ruiz** | Residente | `andres.ruiz@doorway.com` / `101` | Torre A - Apto 101 | `1010` | Nov 2026 `En mora` (listo para prueba de pago) |
| **Claudia Patricia Morales** | Residente | `claudia.morales@doorway.com` / `204` | Torre A - Apto 204 | `2040` | Nov 2026 `En validación` (soporte pendiente de aprobar) |
| **Javier Eduardo Castro** | Residente | `javier.castro@doorway.com` / `405` | Torre B - Apto 405 | `4050` | Nov 2026 `En mora` (bloqueo de reservas activo `HU-02`) |
| **Sandra Milena Ortiz** | Residente | `sandra.ortiz@doorway.com` / `102` | Torre C - Apto 102 | `1020` | Nov 2026 `Pagado` (reservas habilitadas) |

---

## 7. Guía de Ejecución Local, Validación y Generación de APK

### Requisitos Previos
* Node.js 18+ (recomendado v22 LTS) y npm.
* App **Expo Go** en Android/iOS (para desarrollo) o descarga directa del **APK** generado en Android.

### Comandos Principales

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/margitbarrera22/DoorWay-App.git
cd DoorWay-App
npm install

# 2. Verificar compilación TypeScript estricta (0 errores)
npx tsc --noEmit

# 3. Iniciar servidor de desarrollo (modo túnel recomendado para evitar bloqueos de firewall/VPN)
npx expo start -c --tunnel

# 4. Generar nuevo instalador Android (.apk) en la nube con EAS Build
npm run build:apk
```

---

## 8. Índice de Documentación en `docs/`

* [`docs/Informe_Desarrollo_Completo_DoorWay_App_3_Sprints.pdf`](docs/Informe_Desarrollo_Completo_DoorWay_App_3_Sprints.pdf) — Informe maestro completo en PDF (8 páginas) con los 3 Sprints, roles y radiografía del repositorio.
* [`docs/arquitectura-sprint1.md`](docs/arquitectura-sprint1.md) — Actores, eventos de dominio (#1–#8) y arquitectura MVVM del Sprint 1.
* [`docs/arquitectura-sprint2.md`](docs/arquitectura-sprint2.md) — Actores, eventos, criterios Gherkin y pruebas del Sprint 2.
* [`docs/arquitectura-sprint3-final.md`](docs/arquitectura-sprint3-final.md) — Arquitectura consolidada del Sprint 3 Final, tablas SQLite/Supabase, criterios Gherkin finales y ficha de compilación APK.
* [`docs/auditoria-ux-sprint2.md`](docs/auditoria-ux-sprint2.md) — Auditoría Heurística de Nielsen, contraste WCAG 2.2 AA/AAA y prueba SUS (84.5/100).
* [`docs/auditoria-heuristica.json`](docs/auditoria-heuristica.json) — Datos estructurados de la auditoría heurística.
* [`docs/examen-sprint1.md`](docs/examen-sprint1.md) — Evidencia técnica de validación de la historia HU-03 y plan de entrevistas (`INV-02`).
