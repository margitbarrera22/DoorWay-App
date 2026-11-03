# 🚪 DoorWay-App — Sistema Integral de Gestión para Condominios

**Equipo:** Condominios App  
**Integrantes:** Michel Daniela Bayona Díaz, Margit Dayanna Barrera Gutiérrez, Wilfran Leonardo Betancourt Ardila, Said Alexander Pacheco Moncada  
**Tecnología:** Aplicación Móvil Multiplataforma — React Native + Expo (TypeScript, Expo Router)  
**Arquitectura y Distribución:** Arquitectura Híbrida (Supabase Cloud + SQLite Local) · Distribución móvil nativa (Expo Go / APK con EAS Build · Presupuesto cero)  
**ODS:** ODS 11 (Ciudades y comunidades sostenibles) y ODS 16 (Paz, justicia e instituciones sólidas)

---

## 1. Visión y Objetivo del Producto

### Visión (Plantilla de Moore)
**Para** los residentes y administradores de conjuntos residenciales en Barrancabermeja **que** sufren pérdida de trazabilidad financiera, colisiones en la reserva de áreas comunes y falta de seguimiento a sus solicitudes por usar hojas de cálculo aisladas y grupos de WhatsApp, **DoorWay-App** **es una** aplicación móvil multiplataforma desarrollada en React Native y Expo **que** centraliza el control de cartera, la programación de zonas comunes, el anuncio de visitantes y el seguimiento de tickets PQRSD en tiempo real con respaldo offline. **A diferencia de** llevar la contabilidad en Excel, atender quejas por chats informales o exigir la descarga de aplicaciones comerciales pesadas, **nuestro producto** se ejecuta de manera optimizada en teléfonos Android de gama media o baja (360 dp de ancho y 2 GB de RAM), permite capturar y comprimir comprobantes de pago con la cámara del celular (< 300 KB), almacena datos en caché SQLite local para consulta sin conexión y cruza automáticamente el estado de cartera para bloquear reservas a residentes en mora.

### 🎯 Objetivo del Producto
> «Que cualquier residente o administrador de un conjunto residencial en Barrancabermeja pueda registrar y validar pagos de administración con foto, reservar un área común sin colisiones o gestionar una PQRSD en menos de 2 minutos desde un teléfono Android de gama media o baja, garantizando trazabilidad financiera y control de morosidad en tiempo real.»

---

## 2. Roles del Equipo (Scrum Team)
* **Product Owner (Fijo todo el semestre):** Michel Daniela Bayona Díaz. *Responsable de maximizar el valor del producto, gestionar y ordenar el Product Backlog, diseñar e implementar la capa de datos híbrida (Supabase + SQLite), y validar los incrementos con usuarios reales (administradores y residentes de conjuntos en Barrancabermeja).*
* **Scrum Master (Actual — Hito 1):** Margit Dayanna Barrera Gutiérrez. *Responsable de velar por el marco Scrumban, configurar y cuidar el flujo del tablero, diseñar los componentes de interfaz accesibles WCAG AA, facilitar los eventos respetando su timebox, revisar Pull Requests y liderar las pruebas en dispositivo Android físico.*
* **Rotación de Scrum Master por Hitos:**
  * **Hito 1 (Exploración y UI Base):** Margit Barrera
  * **Hito 2 (MVP Navegable y ViewModels):** Wilfran Leonardo Betancourt
  * **Hito 3 (API + Persistencia + Dispositivo):** Said Alexander Pacheco
  * **Hito 4 y Hito 5 (Estabilización y Cierre):** Rotación definida en retrospectiva según métricas de flujo.
* **Developers:** Michel Daniela Bayona Díaz, Margit Dayanna Barrera Gutiérrez, Wilfran Leonardo Betancourt Ardila y Said Alexander Pacheco Moncada. *(Todos los integrantes diseñan, programan, prueban en dispositivo y se hacen responsables de la calidad del incremento).*
* **Interesados (Stakeholders):** Docente de la asignatura DAM y representantes de administración/residentes de propiedad horizontal en Barrancabermeja.

---

## 3. Alcance del Producto (Matriz MoSCoW)

*(Nota: Los grupos Must y Should cubren la exigencia de la asignatura: consumo de base de datos relacional en Supabase + persistencia local en SQLite (`expo-sqlite`) + funciones nativas del dispositivo mediante API de cámara (`expo-image-picker`) y compresión automática (`expo-image-manipulator`)).*

| Must (Debe tener — ≤ 60 % del esfuerzo / MVP Hito 2) | Should (Debería tener — Hito 3) | Could (Podría tener — Si sobra tiempo) | Won't (Fuera del alcance este semestre) |
| :--- | :--- | :--- | :--- |
| • Autenticación y control de acceso por rol (Residente / Administrador)<br>• Consulta de estado de cuenta y cartera por unidad residencial con los 4 estados de pantalla (`cargando`, `vacio`, `error`, `conDatos`) (`HU-03`)<br>• Captura y carga de comprobantes de pago bancarios desde la cámara del celular y galería con compresión < 300 KB (`HU-01` / `TEC-04`)<br>• Panel de conciliación del Administrador para aprobar o rechazar comprobantes (`HU-04`)<br>• Calendario interactivo de reservas de áreas comunes con validación en tiempo real y bloqueo automático a residentes en mora (`HU-02` / `HU-05`)<br>• Persistencia en SQLite local para consulta de recibos en Modo Avión sin conexión (`TEC-03` / `TEC-05`) | • Cálculo automático de recargos por intereses de mora y generación mensual de cuotas<br>• Emisión y descarga de recibos de caja en formato PDF<br>• Anuncio anticipado de visitantes y monitoreo de cupos de parqueadero en tiempo real<br>• Radicación y listado de tickets PQRSD con fotografía adjunta (`Abierto`, `En Revisión`, `Resuelto`) (`HU-07`)<br>• Cartelera virtual y directorio telefónico de emergencias con soporte offline (`HU-08` / `HU-11`)<br>• Generación de paquete instalable Android (.apk) vía EAS Build (`TEC-02`) | • Envío de resumen de reserva o recibo por enlace a WhatsApp mediante Menú Compartir (`Linking / Share`)<br>• Modo oscuro en la interfaz de usuario respetando el tema del sistema<br>• Filtros avanzados de búsqueda histórica en cartera y PQRSD | • Publicación de aplicación en tiendas comerciales (Google Play Store o Apple App Store)<br>• Pasarela de pagos en línea integrada con débito bancario automático (PSE / cobro con tarjetas)<br>• Integración con hardware físico en portería (sensores vehiculares, Bluetooth, NFC o talanqueras)<br>• Chat de mensajería instantánea abierta entre vecinos (se prioriza PQRSD formal) |

### 🚫 Lista explícita «Fuera del Alcance»
1. **Tiendas comerciales de aplicaciones (Play Store / App Store):** Por decisión tecnológica y presupuesto cero, durante el semestre académico la aplicación se distribuye e instala directamente mediante Expo Go y paquetes de prueba APK generados con EAS Build.
2. **Pagos electrónicos en vivo (PSE):** El módulo financiero registra y audita pagos mediante la captura fotográfica del soporte bancario; no procesa dinero real ni conecta con pasarelas bancarias de pago.
3. **Reservas en modo Offline:** Dado que el sistema debe evitar colisiones de horario y verificar al instante que el residente no tenga deudas activas, la reserva requiere validación centralizada en Supabase y no permitirá confirmar turnos sin conexión a internet.
4. **Hardware de control de acceso:** El módulo de parqueaderos gestiona cupos y anuncios desde el software, sin conexión física a lectores NFC o sensores vehiculares.

---

## 4. Definición del Flujo de Trabajo (Kanban) y Calidad (DoD)

### Políticas explícitas por columna
| Columna | Política de Entrada (¿Qué debe cumplir la tarjeta para entrar aquí?) | Límite WIP |
| :--- | :--- | :---: |
| **Backlog** | Cualquier elemento con título claro. La Product Owner (Daniela Bayona) decide su orden según valor y dependencias. | — |
| **Listo** | Cumple criterios INVEST, tiene criterios de aceptación verificables en formato **Dado / Cuando / Entonces**, puntos estimados en Planning Poker y el equipo la entiende. | 5 |
| **En desarrollo** | Un Developer se la autoasigna y crea su rama en Git (`feat/hu-XX-descripcion`). Máximo 1 tarjeta activa por integrante. | 4 |
| **En revisión** | Existe un Pull Request (PR) abierto que enlaza el issue (`Refs #N`) sin errores de compilación (`npx tsc --noEmit`) ni avisos de linter. | 2 |
| **En dispositivo** | PR revisado y aprobado con comentarios técnicos por otro compañero; código fusionado en `main` y probado en un teléfono Android físico real mediante Expo Go / APK. | 2 |
| **Hecho** | Cumple íntegramente la Definición de Terminado (DoD) de la fase actual, capturas del celular adjuntas en el issue y PR fusionado en la rama `main`. | — |

### Reglas del Flujo y Métricas (Guía Kanban)
* **Elemento de trabajo:** Un *issue* del repositorio clasificado como `Historia`, `Técnica`, `Defecto` o `Investigación`.
* **Límites del Cycle Time:** El trabajo **empieza** cuando la tarjeta entra en la columna `En desarrollo` y **termina** cuando ingresa en `Hecho`. Entre ambos puntos se mide el *Cycle Time*.
* **Expectativa de Nivel de Servicio (SLE provisional):** «La mayoría (85 %) de nuestros elementos de trabajo se terminan en **4 días o menos** una vez iniciados». Esta métrica se revisará con datos reales en el Sprint 4.
* **Gestión de Bloqueos:** Toda tarjeta detenida por un impedimento externo o dependencia debe marcarse con la etiqueta `bloqueada` y comunicarse en el siguiente Daily Scrum. Si permanece bloqueada por **2 días**, la Scrum Master (Margit Barrera) interviene directamente para resolver el obstáculo.

### ✅ Definición de Terminado (DoD) — Fase de Exploración (Semanas 3 a 5)
Durante los Sprints 0, 1 y 2, ningún elemento pasa a `Hecho` a menos que cumpla:
1. La historia tiene criterios de aceptación verificables redactados en formato **Dado / Cuando / Entonces**.
2. Su pantalla o flujo correspondiente existe en el prototipo de **Figma** (como mínimo en baja fidelidad).
3. La Product Owner (Daniela Bayona) validó la historia con al menos un usuario real (administrador o residente en Barrancabermeja) y dejó documentada su retroalimentación en los comentarios del issue (`INV-02 #18`).

*(A partir de la Semana 6 entra en vigor la DoD base de código del curso: ingreso a `main` mediante PR revisado por otro integrante, cero errores de análisis estático con `npx tsc --noEmit`, manejo de los 4 estados de toda lista —cargando, vacío, error y con datos—, áreas táctiles de mínimo 48 dp, cerrojo anti-doble clic en envíos, manejo de permisos de cámara y prueba verificada en un dispositivo Android físico tanto con red como en Modo Avión).*

---

## 5. Planificación de Sprints

### 🏁 Sprint 1 (Semana 4 — Requisitos, Criterios de Aceptación y MVP Móvil)
* **Objetivo del Sprint 1:** «Dejar las historias Must de cartera (HU-03), subida de comprobante fotográfico (HU-01), conciliación del administrador (HU-04) y base de datos híbrida (TEC-03) con sus criterios de aceptación en formato Dado/Cuando/Entonces y componentes accesibles en React Native + Expo, validados con al menos un administrador y un residente real en Barrancabermeja».
* **Elementos comprometidos (movidos a la columna «Listo» con iteración `Sprint 1`):**
  * `TEC-01`: Inicializar proyecto React Native + Expo Router y configurar ramas de trabajo.
  * `TEC-03`: Diseñar e implementar el modelo de base de datos relacional híbrido (Supabase Cloud + SQLite Local).
  * `TEC-04`: Implementar servicio nativo de cámara y compresión de imágenes (< 300 KB) con `expo-image-manipulator`.
  * `HU-01`: Subida de comprobante de pago mediante cámara del celular y galería con validación sin pérdida de datos.
  * `HU-03`: Consulta de estado de cuenta y recibos de pago con los 4 estados visuales de pantalla.
  * `HU-04`: Aprobación y conciliación de comprobantes por parte de la Administración.
  * `INV-02`: Plan de validación y entrevistas presenciales con 2 usuarios reales en Barrancabermeja.
