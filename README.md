# 🚪 DoorWay-App — Sistema Integral de Gestión para Condominios

**Equipo:** Condominios App  
**Integrantes:** Michel Daniela Bayona Díaz, Margit Dayanna Barrera Gutiérrez, Wilfran Leonardo Betancourt Ardila, Said Alexander Pacheco Moncada  
**Tecnología:** Aplicación Móvil Multiplataforma — React Native + Expo (TypeScript, Expo Router)  
**Arquitectura y Distribución:** Arquitectura Híbrida (Supabase Cloud + SQLite Local) · Patrón MVVM en 4 Capas · Distribución móvil nativa (Expo Go / APK con EAS Build · Presupuesto cero)  
**ODS:** ODS 11 (Ciudades y comunidades sostenibles) y ODS 16 (Paz, justicia e instituciones sólidas)

---

## 1. Visión y Objetivo del Producto

### Visión (Plantilla de Moore)
**Para** los residentes y administradores de conjuntos residenciales en Barrancabermeja **que** sufren pérdida de trazabilidad financiera, colisiones en la reserva de áreas comunes y falta de seguimiento a sus solicitudes por usar hojas de cálculo aisladas y grupos de WhatsApp, **DoorWay-App** **es una** aplicación móvil multiplataforma desarrollada en React Native y Expo **que** centraliza el control de cartera, la programación de zonas comunes, el anuncio de visitantes y el seguimiento de tickets PQRSD en tiempo real con respaldo offline. **A diferencia de** llevar la contabilidad en Excel, atender quejas por chats informales o exigir la descarga de aplicaciones comerciales pesadas, **nuestro producto** se ejecuta de manera optimizada en teléfonos Android de gama media o baja (360 dp de ancho y 2 GB de RAM), permite capturar y comprimir comprobantes de pago con la cámara del celular (< 300 KB), almacena datos en caché SQLite local para consulta sin conexión y cruza automáticamente el estado de cartera para bloquear reservas a residentes en mora.

### 🎯 Objetivo del Producto
> «Que cualquier residente o administrador de un conjunto residencial en Barrancabermeja pueda registrar y validar pagos de administración con foto, reservar un área común sin colisiones o gestionar una PQRSD en menos de 2 minutos desde un teléfono Android de gama media o baja, garantizando trazabilidad financiera y control de morosidad en tiempo real.»

---

## 2. Roles del Equipo (Scrum Team) y Responsabilidades

* **Product Owner (Fija todo el semestre):** Michel Daniela Bayona Díaz (`Bayonadi`). *Responsable de maximizar el valor del producto, gestionar el Product Backlog, diseñar e implementar la capa de datos híbrida (Contratos TypeScript, Supabase PostgreSQL/Storage y SQLite local con `expo-sqlite`), y liderar la validación con usuarios reales en Barrancabermeja (`INV-02`).*
* **Scrum Master (Hito 1 — Cierre Sprint 1):** Margit Dayanna Barrera Gutiérrez (`margitbarrera22`). *Responsable de velar por el marco Scrumban, gestionar el flujo del Doorway Tablero, diseñar el sistema visual accesible WCAG AA (`tema.ts`), programar componentes reutilizables (`TarjetaRecibo`, `EstadoPantalla`), revisar Pull Requests y ejecutar pruebas en dispositivo Android físico.*
* **Scrum Master (Hito 2 — Inicio Sprint 2) & Developer:** Wilfran Leonardo Betancourt Ardila (`wilfran0707`). *Responsable de la inicialización de arquitectura Expo Router (`TEC-01`), programación de ViewModels y contextos (`RecibosContext`, `ReservasContext`), vistas de detalle, panel de conciliación administrativa (`HU-04`) y calendario de reservas (`HU-05` / `HU-02`).*
* **Scrum Master (Hito 3) & Developer:** Said Alexander Pacheco Moncada (`Thepache`). *Responsable de la integración con hardware del dispositivo, servicio nativo de cámara y compresión automática (`TEC-04`), subida de comprobantes (`HU-01`), cancelación oportuna de reservas (`HU-06`), sincronización offline (`TEC-05`) y empaquetado APK.*
* **Interesados (Stakeholders):** Docente de la asignatura DAM y representantes de administración y residentes de propiedad horizontal en Barrancabermeja.

---

## 3. Alcance del Producto (Matriz MoSCoW)

*(Nota: Los grupos Must y Should cubren la exigencia de la asignatura: consumo de base de datos relacional en Supabase + persistencia local en SQLite (`expo-sqlite`) + funciones nativas del dispositivo mediante API de cámara (`expo-image-picker`) y compresión automática (`expo-image-manipulator`)).*

| Must (Debe tener — ≤ 60 % del esfuerzo / MVP) | Should (Debería tener) | Could (Podría tener — Valor Agregado) | Won't (Fuera del alcance este semestre) |
| :--- | :--- | :--- | :--- |
| • Autenticación y control de acceso por rol (Residente / Administrador)<br>• Consulta de estado de cuenta y cartera por unidad residencial con los 4 estados de pantalla (`cargando`, `vacio`, `error`, `conDatos`) (`HU-03`)<br>• Captura y carga de comprobantes de pago bancarios desde cámara y galería con compresión < 300 KB (`HU-01` / `TEC-04`)<br>• Panel de conciliación del Administrador para aprobar o rechazar comprobantes (`HU-04`)<br>• Calendario interactivo de reservas de áreas comunes con validación en tiempo real y bloqueo automático a residentes en mora (`HU-02` / `HU-05`)<br>• Persistencia en SQLite local para consulta en Modo Avión sin conexión (`TEC-03` / `TEC-05`) | • Cancelación oportuna de reservas con validación de antelación (> 24 horas) (`HU-06`)<br>• Cartelera virtual de anuncios y directorio telefónico de emergencias con soporte 100 % offline (`HU-08` / `HU-11`)<br>• Radicación, listado y respuesta de tickets PQRSD con fotografía adjunta (`Abierto`, `En Revisión`, `Resuelto`) (`HU-07` / `HU-09` / `HU-12`)<br>• Generación de paquete instalable Android (.apk) vía EAS Build (`TEC-02`) | • Ticket digital de reserva confirmada con envío directo a WhatsApp mediante Menú Compartir (`Linking / Share`)<br>• Modo oscuro en la interfaz de usuario respetando el tema del sistema<br>• Filtros rápidos de búsqueda en cartera y PQRSD | • Publicación en tiendas comerciales (Google Play Store o Apple App Store)<br>• Pasarela de pagos en línea integrada con débito bancario automático (PSE / cobro con tarjetas)<br>• Integración con hardware físico en portería (sensores vehiculares, Bluetooth, NFC o talanqueras)<br>• Chat de mensajería instantánea abierta entre vecinos (se prioriza PQRSD formal) |

### 🚫 Lista explícita «Fuera del Alcance»
1. **Tiendas comerciales de aplicaciones (Play Store / App Store):** Por decisión tecnológica y presupuesto cero, durante el semestre académico la aplicación se distribuye e instala directamente mediante Expo Go y paquetes de prueba APK generados con EAS Build.
2. **Pagos electrónicos en vivo (PSE):** El módulo financiero registra y audita pagos mediante la captura fotográfica del soporte bancario; no procesa dinero real ni conecta con pasarelas bancarias.
3. **Reservas en modo Offline:** Dado que el sistema debe evitar colisiones de horario y verificar al instante que el residente no tenga deudas activas, la reserva requiere validación centralizada en Supabase y no permite confirmar turnos sin conexión a internet.
4. **Hardware de control de acceso:** El módulo de zonas comunes y parqueaderos gestiona cupos y anuncios desde el software, sin conexión física a lectores NFC o sensores vehiculares.

---

## 4. Arquitectura del Sistema (Patrón MVVM en 4 Capas)

El proyecto aplica separación estricta de responsabilidades (ver detalle completo en `docs/arquitectura-sprint1.md`):

* **1. Capa de Presentación (`src/app/` y `src/components/`):** Pantallas JSX, navegación con Expo Router, tema accesible WCAG AA (`src/theme/tema.ts`) y componentes con áreas de toque mínimas de 48x48 dp.
* **2. Capa de ViewModels (`src/hooks/`):** Gestión de estado (`RecibosContext`, `useSubirComprobante`), manejo explícito de los 4 estados de vista (`cargando`, `vacio`, `error`, `conDatos`), cerrojo anti-doble toque (`peticionEnCurso`) y validación de formularios sin pérdida de datos digitados.
* **3. Capa de Dominio (`src/domain/`):** Entidades TypeScript puras (`modelos.ts`) y reglas de negocio (`tieneMoraActiva`, `puedeReservar`, `puedeCancelarCon24h`) libres de dependencias externas.
* **4. Capa de Datos (`src/data/`):** Contratos e interfaces (`contratos.ts`), persistencia local en SQLite (`dbLocalSqlite.ts`), repositorio híbrido (`RepositorioRecibos.ts`) y servicio nativo de cámara/compresión (`ServicioCamaraExpo.ts`).

---

## 5. Definición del Flujo de Trabajo (Kanban) y Calidad (DoD)

### Políticas explícitas por columna
| Columna | Política de Entrada (¿Qué debe cumplir la tarjeta para entrar aquí?) | Límite WIP |
| :--- | :--- | :---: |
| **Backlog** | Cualquier elemento con título claro. La Product Owner (Daniela Bayona) decide su orden según valor y dependencias. | — |
| **Listo** | Cumple criterios INVEST, tiene criterios de aceptación verificables en formato **Dado / Cuando / Entonces**, puntos estimados y el equipo la entiende. | 5 |
| **En desarrollo** | Un Developer se la autoasigna y crea su rama en Git (`feat/hu-XX-descripcion`). Máximo 1 tarjeta activa por integrante. | 4 |
| **En revisión** | Existe un Pull Request (PR) abierto que enlaza el issue (`Closes #N`) sin errores de compilación (`npx tsc --noEmit`). | 2 |
| **En dispositivo** | PR revisado y aprobado por otro compañero; código fusionado en `main` y probado en un teléfono Android físico real mediante Expo Go / APK. | 2 |
| **Hecho** | Cumple íntegramente la Definición de Terminado (DoD), capturas del celular y de base de datos adjuntas en el issue y PR fusionado en `main`. | — |

### ✅ Definición de Terminado (DoD) Unificada
Ningún elemento pasa a la columna `Hecho` a menos que cumpla:
1. Criterios de aceptación verificables redactados en formato **Dado / Cuando / Entonces** y boceto correspondiente en **Figma**.
2. Ingreso a `main` mediante Pull Request revisado y aprobado por otro integrante, sin errores de compilación TypeScript.
3. Implementación de los 4 estados de pantalla (`cargando`, `vacio`, `error`, `conDatos`), botones accesibles (≥ 48 dp) y cerrojo anti-doble clic.
4. Prueba verificada en un dispositivo Android físico real (tanto con red activa hacia Supabase como en **Modo Avión ✈️** leyendo desde `expo-sqlite`) con capturas de evidencia en el issue.
5. Validación con usuarios reales en Barrancabermeja documentada por la Product Owner (`INV-02 #18`).

---

## 6. Estado de Sprints y Hoja de Ruta

### ✅ Sprint 1 (Semana 1 — Completado al 100 %): Cartera, Conciliación y Núcleo Híbrido
* **Objetivo alcanzado:** Implementar y validar de extremo a extremo el módulo financiero de cartera con persistencia híbrida (Supabase + SQLite local), captura fotográfica comprimida y conciliación administrativa en teléfonos Android físicos.
* **Entregables finalizados en la columna «Hecho»:**
  * `TEC-01 (#13)`: Inicialización del proyecto React Native + Expo Router, configuración de TypeScript y estructura MVVM en 4 capas.
  * `TEC-03 (#15)`: Creación de esquema relacional en Supabase PostgreSQL, bucket `soportes`, base de datos local `expo-sqlite` (`recibos_cache`), contratos (`contratos.ts`) y `RepositorioRecibosHibrido`.
  * `TEC-04 (#16)`: Implementación de `ServicioCamaraExpo.ts` con permisos en Android, alternativa de galería y compresión JPEG al 60 % (< 300 KB).
  * `HU-03 (#3)`: Pantalla de estado de cuenta con los 4 estados visuales, tarjetas accesibles (`TarjetaRecibo.tsx`), navegación dinámica a `/recibo/[id]` y lectura offline en Modo Avión.
  * `HU-01 (#1)`: Flujo de subida de comprobante de pago con previsualización y validación de campos faltantes sin borrar lo ya digitado.
  * `HU-04 (#4)`: Panel de conciliación del Administrador con aprobación/rechazo en tiempo real reflejado en Supabase y SQLite.
  * `INV-02 (#18)`: Ejecución y documentación de entrevistas con usuarios reales (administrador y residente) en Barrancabermeja.

---

### 🚀 Sprint 2 (Semana 2 — Jueves 5 al Miércoles 11 de Noviembre): Áreas Comunes, Bloqueo por Mora y Comunidad Offline

* **Objetivo del Sprint 2:** Habilitar la programación de áreas comunes sin colisiones de horario cruzando en vivo el estado de cartera para bloquear reservas a residentes en mora, permitir cancelaciones oportunas (> 24 h) y garantizar acceso offline permanente a la cartelera de anuncios y al directorio de emergencias de Barrancabermeja.

#### 📌 Alcance Base del Sprint 2
* **HU-05 (#5):** Consulta de fechas disponibles/ocupadas en Supabase y reserva de áreas comunes (Salón Social y Kiosco BBQ).
* **HU-02 (#2):** Regla de negocio pura (`tieneMoraActiva` / `puedeReservar`) que bloquea automáticamente la reserva si el residente registra al menos un recibo en estado `'En mora'`.
* **HU-06 (#6):** Cancelación oportuna de reservas validando una antelación mínima mayor a 24 horas y liberando el turno en Supabase.
* **HU-08 (#8) y HU-11 (#11):** Cartelera digital de anuncios de la administración y Directorio telefónico de emergencias con soporte offline en SQLite.
* **TEC-05 (#17):** Motor de sincronización híbrida *offline-first* para lectura local inmediata sin conexión a internet.

#### 🌟 Valor Agregado y Estándar de Nivel Superior para el Sprint 2
Para garantizar una experiencia de producto comercial, robusta y visualmente sobresaliente durante la sustentación, el equipo incorpora tres pilares técnicos adicionales en esta iteración:

1. **A. Experiencia Visual y Feedback de Usuario (UI/UX):**
   * **Calendario interactivo por código de colores:** Reemplazo de selectores planos por un componente visual intuitivo con estados cromáticos accesibles (verde para turnos disponibles, rojo/bloqueado para horarios ocupados y gris para fechas pasadas).
   * **Feedback inmediato y Ticket Digital tras reservar:** Al confirmar un turno, se despliega un modal accesible de éxito en formato de ticket digital con acción directa de **«Compartir comprobante por WhatsApp»** (`Linking` / `Share`), facilitando el aviso inmediato a portería.
   * **Banner persistente de mora con acción directa:** Si el residente presenta mora activa, en lugar de un texto de error simple se renderiza una tarjeta de advertencia destacada (`BannerMora.tsx`): *"Tienes 1 recibo en mora · Ponerse al día aquí"*, con navegación directa hacia su estado de cuenta en Cartera.
2. **B. Robustez Técnica y Concurrencia (Backend / Base de Datos):**
   * **Validación de colisiones a doble nivel:** Además de la restricción `UNIQUE(area_comun, fecha, bloque_horario)` en PostgreSQL, el ViewModel valida la disponibilidad antes del envío y captura cualquier colisión concurrente entre vecinos devolviendo un mensaje claro: *"Este horario acaba de ser tomado por otro residente"*.
   * **Datos Semilla Contextualizados en SQLite:** La tabla local `directorio_emergencias` se inicializa con contactos reales y verificables de Barrancabermeja (Policía Cuadrante, Bomberos Voluntarios, Gasoriente / ESSA y Portería Barrio Nueva Esperanza), asegurando utilidad real desde el primer arranque sin red.
3. **C. Flujo de Demostración en Vivo sin Conexión (Offline-First Demo Flow):**
   * Preparación de un flujo de prueba auditable en teléfono Android físico: activación de **Modo Avión ✈️**, apertura inmediata de Cartelera (`HU-08`) y Directorio (`HU-11`) cargando al 100 % desde `expo-sqlite`, marcación telefónica directa y reconexión automática transparente con Supabase.

#### 📋 Cronograma y Matriz de Ejecución de la Semana 2

| Días y Fechas | Integrante | Rol | Tareas Técnicas y Mejoras de Nivel Superior | Entregable en GitHub |
| :--- | :--- | :--- | :--- | :--- |
| **Días 8 y 9**<br>*(Jue 5 – Vie 6 Nov)* | **Daniela Bayona** | PO & Backend | • Programar en `src/domain/reglasNegocio.ts` las funciones puras `puedeReservar(recibos)` y `puedeCancelarCon24h()`.<br>• Crear `src/data/RepositorioReservas.ts` en Supabase con manejo atómico de excepciones ante colisiones `UNIQUE(area_comun, fecha, bloque_horario)`. | Contratos y repositorio de reservas en `main` con control de concurrencia. |
| **Días 8 y 9**<br>*(Jue 5 – Vie 6 Nov)* | **Margit Barrera** | UX/UI & Componentes | • Diseñar las tarjetas de Áreas Comunes y el **calendario visual interactivo** (verde libre, rojo ocupado, gris pasado).<br>• Crear el componente `BannerMora.tsx` con botón de redirección a Cartera y el modal de **Ticket Digital** de reserva. | PR de componentes visuales de reservas con contraste WCAG AA y áreas ≥ 48 dp. |
| **Días 8 y 9**<br>*(Jue 5 – Vie 6 Nov)* | **Wilfran Betancourt** | Dev Frontend & SM | • Crear `src/hooks/ReservasContext.tsx` validando disponibilidad previa.<br>• Programar la pantalla `src/app/(tabs)/reservas.tsx` integrando las franjas horarias de Supabase (`HU-05`). | PR de `HU-05 (#5)` abierto y enlazado al tablero. |
| **Días 8 y 9**<br>*(Jue 5 – Vie 6 Nov)* | **Said Pacheco** | Dev Dispositivo | • Programar la lógica de cancelación oportuna con validación de > 24 h de anticipación (`HU-06`) liberando el turno en Supabase.<br>• Integrar el botón de **«Compartir comprobante por WhatsApp»** (`Linking / Share`) en el ticket de reserva confirmada. | PR de `HU-06 (#6)` con función de compartir integrada. |
| **Días 10 y 11**<br>*(Sáb 7 – Dom 8 Nov)* | **Daniela Bayona** | PO & Backend | • Ampliar `src/data/dbLocalSqlite.ts` creando las tablas `anuncios_cache` y `directorio_emergencias`.<br>• Insertar datos semilla reales de Barrancabermeja (Policía, Bomberos, Portería Nueva Esperanza). | Persistencia SQLite para comunidad lista y probada. |
| **Días 10 y 11**<br>*(Sáb 7 – Dom 8 Nov)* | **Margit Barrera** | UX/UI & Componentes | • Maquetar la pantalla `src/app/(tabs)/comunidad.tsx` mostrando la Cartelera de anuncios (`HU-08`) y las tarjetas de llamada rápida a Portería y Emergencias (`HU-11`). | PR de vistas de Comunidad (`HU-08 #8` y `HU-11 #11`). |
| **Días 10 y 11**<br>*(Sáb 7 – Dom 8 Nov)* | **Wilfran Betancourt** | Dev Frontend & SM | • Implementar el cruce en vivo de `HU-02`: si el usuario tiene 1 recibo `'En mora'`, bloquea la confirmación en el calendario, despliega el `BannerMora` y redirige a Cartera. | Prueba cruzada con Daniela: cambio a `'En mora'` en Supabase bloquea reserva al instante. |
| **Días 10 y 11**<br>*(Sáb 7 – Dom 8 Nov)* | **Said Pacheco** | Dev Dispositivo | • Conectar el sincronizador offline (`TEC-05 #17`): con red descarga anuncios de Supabase a SQLite; sin red sirve Cartelera y Directorio al 100 % desde SQLite local. | PR de `TEC-05 (#17)` fusionado y verificado. |
| **Días 12 a 14**<br>*(Lun 9 – Mié 11 Nov)* | **Equipo Completo** | Cierre y QA en Dispositivo | • **Daniela:** Pruebas unitarias de dominio (`reglasNegocio.test.ts`).<br>• **Margit y Said:** Ejecución del *Demo Flow* en Android físico en **Modo Avión ✈️** (`HU-03`, `HU-08`, `HU-11`).<br>• **Wilfran:** Verificación de colisiones entre dos vecinos intentando tomar el mismo turno. | **Entregable Semana 2 Listo:** Tarjetas `HU-05`, `HU-02`, `HU-06`, `HU-08`, `HU-11` y `TEC-05` en columna «Hecho». |

