# 🚪 DoorWay-App — Sistema Integral de Gestión para Condominios

**Equipo:** Condominios App  
**Integrantes:** Michel Daniela Bayona Díaz, Margit Dayanna Barrera Gutiérrez, Wilfran Leonardo Betancourt Ardila, Said Alexander Pacheco Moncada  
**Tecnología:** Aplicación Web Progresiva — PWA (React, JavaScript, HTML5, CSS)  
**Arquitectura y Distribución:** Cliente-Servidor en tiempo real · Distribución por enlace web (Presupuesto cero)  
**ODS:** ODS 11 (Ciudades y comunidades sostenibles) y ODS 16 (Paz, justicia e instituciones sólidas)

---

## 1. Visión y Objetivo del Producto

### Visión (Plantilla de Moore)
**Para** los residentes y administradores de conjuntos residenciales en Barrancabermeja **que** sufren pérdida de trazabilidad financiera, colisiones en la reserva de áreas comunes y falta de seguimiento a sus solicitudes por usar hojas de cálculo aisladas y grupos de WhatsApp, **DoorWay-App** **es una** aplicación web progresiva (PWA) orientada a dispositivos móviles **que** centraliza el control de cartera, la programación de zonas comunes, el anuncio de visitantes y el seguimiento de tickets PQRSD en tiempo real. **A diferencia de** llevar la contabilidad en Excel, atender quejas por chats informales o exigir la descarga de aplicaciones nativas pesadas, **nuestro producto** se ejecuta desde un enlace web sin consumir almacenamiento en teléfonos Android de gama media o baja, permite capturar comprobantes de pago con la cámara del celular y cruza automáticamente el estado de cartera para bloquear reservas a residentes en mora.

### 🎯 Objetivo del Producto
> «Que cualquier residente o administrador de un conjunto residencial en Barrancabermeja pueda registrar y validar pagos de administración con foto, reservar un área común sin colisiones o gestionar una PQRSD en menos de 2 minutos desde un teléfono Android de gama media o baja, garantizando trazabilidad financiera y control de morosidad en tiempo real.»

---

## 2. Roles del Equipo (Scrum Team)
* **Product Owner (Fijo todo el semestre):** Michel Daniela Bayona Díaz. *Responsable de maximizar el valor del producto, gestionar y ordenar el Product Backlog, y validar los incrementos con usuarios reales (administradores y residentes de conjuntos en Barrancabermeja).*
* **Scrum Master (Actual — Hito 1):** Margit Dayanna Barrera Gutiérrez. *Responsable de velar por el marco Scrumban, configurar y cuidar el flujo del tablero, facilitar los eventos respetando su timebox y eliminar impedimentos.*
* **Rotación de Scrum Master por Hitos:**
  * **Hito 1 (Exploración):** Margit Barrera
  * **Hito 2 (MVP Navegable):** Wilfran Leonardo Betancourt
  * **Hito 3 (API + Persistencia + Dispositivo):** Said Alexander Pacheco
  * **Hito 4 y Hito 5 (Estabilización y Cierre):** Rotación rotativa definida en retrospectiva según métricas de flujo.
* **Developers:** Michel Daniela Bayona Díaz, Margit Dayanna Barrera Gutiérrez, Wilfran Leonardo Betancourt Ardila y Said Alexander Pacheco Moncada. *(Todos los integrantes diseñan, programan, prueban en dispositivo y se hacen responsables de la calidad del incremento).*
* **Interesados (Stakeholders):** Docente de la asignatura DAM y representantes de administración/residentes de propiedad horizontal en Barrancabermeja.

---

## 3. Alcance del Producto (Matriz MoSCoW)

*(Nota: Los grupos Must y Should cubren la exigencia del Hito 3: consumo de API REST + persistencia en base de datos + funciones del dispositivo mediante API de cámara HTML5 y notificaciones vía Service Workers).*

| Must (Debe tener — ≤ 60 % del esfuerzo / MVP Hito 2) | Should (Debería tener — Hito 3) | Could (Podría tener — Si sobra tiempo) | Won't (Fuera del alcance este semestre) |
| :--- | :--- | :--- | :--- |
| • Autenticación y control de acceso por rol (Residente / Administrador)<br>• Consulta de estado de cuenta y cartera por unidad residencial<br>• Captura y carga de comprobantes de pago bancarios desde la cámara del celular (API HTML5)<br>• Calendario interactivo de reservas de áreas comunes con validación en tiempo real y bloqueo automático a residentes en mora<br>• Radicación y listado de tickets PQRSD con estados (`Abierto`, `En Revisión`, `Resuelto`) | • Cálculo automático de recargos por intereses de mora y generación mensual de cuotas<br>• Emisión y descarga de recibos de caja en formato PDF<br>• Anuncio anticipado de visitantes y monitoreo de cupos de parqueadero en tiempo real<br>• Repositorio de transparencia documental (estados financieros, actas de asamblea y manual de convivencia)<br>• Notificaciones Push en Android mediante Service Workers | • Envío de resumen de reserva o recibo por enlace a WhatsApp<br>• Modo oscuro en la interfaz de usuario<br>• Filtros avanzados de búsqueda histórica en cartera y PQRSD | • Publicación de aplicación nativa en Google Play Store o Apple App Store<br>• Pasarela de pagos en línea integrada con bancos (PSE / cobro con tarjetas)<br>• Integración con hardware físico en portería (Bluetooth, NFC, biometría o talanqueras)<br>• Chat de mensajería instantánea entre vecinos |

### 🚫 Lista explícita «Fuera del Alcance»
1. **Tiendas de aplicaciones (Play Store / App Store):** Por decisión tecnológica (ADR-0001), la aplicación se distribuye exclusivamente como PWA mediante enlace web para evitar consumo de espacio en celulares Android de gama baja y mantener presupuesto cero.
2. **Pagos electrónicos en vivo (PSE):** El módulo financiero registra y audita pagos mediante la captura fotográfica del soporte bancario; no procesa dinero real ni conecta con pasarelas bancarias de pago.
3. **Reservas en modo Offline:** Dado que el sistema debe evitar colisiones de horario y verificar al instante que el residente no tenga deudas activas, la arquitectura es estrictamente Cliente-Servidor y no permitirá confirmar reservas sin conexión a internet.
4. **Hardware de control de acceso:** El módulo de parqueaderos gestiona cupos y anuncios desde el software, sin conexión física a lectores NFC o sensores vehiculares.

---

## 4. Definición del Flujo de Trabajo (Kanban) y Calidad (DoD)

### Políticas explícitas por columna
| Columna | Política de Entrada (¿Qué debe cumplir la tarjeta para entrar aquí?) | Límite WIP |
| :--- | :--- | :---: |
| **Backlog** | Cualquier elemento con título claro. La Product Owner (Daniela Bayona) decide su orden según valor y dependencias. | — |
| **Listo** | Cumple criterios INVEST, tiene criterios de aceptación, puntos estimados en Planning Poker y el equipo la entiende. | 5 |
| **En desarrollo** | Un Developer se la autoasigna y crea su rama en Git (`hu-XX-descripcion`). Máximo 1 tarjeta activa por integrante. | 4 |
| **En revisión** | Existe un Pull Request (PR) abierto que enlaza el issue (`Closes #N`) sin errores de compilación ni avisos de linter. | 2 |
| **En dispositivo** | PR revisado y aprobado por otro compañero; la PWA está desplegada y probada en un teléfono Android físico real. | 2 |
| **Hecho** | Cumple íntegramente la Definición de Terminado (DoD) de la fase actual y el PR fue fusionado en la rama `main`. | — |

### Reglas del Flujo y Métricas (Guía Kanban)
* **Elemento de trabajo:** Un *issue* del repositorio clasificado como `Historia`, `Técnica`, `Defecto` o `Investigación`.
* **Límites del Cycle Time:** El trabajo **empieza** cuando la tarjeta entra en la columna `En desarrollo` y **termina** cuando ingresa en `Hecho`. Entre ambos puntos se mide el *Cycle Time*.
* **Expectativa de Nivel de Servicio (SLE provisional):** «La mayoría (85 %) de nuestros elementos de trabajo se terminan en **4 días o menos** una vez iniciados». Esta métrica se revisará con datos reales en el Sprint 4.
* **Gestión de Bloqueos:** Toda tarjeta detenida por un impedimento externo o dependencia debe marcarse con la etiqueta `bloqueada` y comunicarse en el siguiente Daily Scrum. Si permanece bloqueada por **2 días**, la Scrum Master (Margit Barrera) interviene directamente para resolver el obstáculo.

### ✅ Definición de Terminado (DoD) — Fase de Exploración (Semanas 3 a 5)
Durante los Sprints 0, 1 y 2, ningún elemento pasa a `Hecho` a menos que cumpla:
1. La historia tiene criterios de aceptación verificables redactados en formato **Dado / Cuando / Entonces**.
2. Su pantalla o flujo correspondiente existe en el prototipo de **Figma** (como mínimo en baja fidelidad).
3. La Product Owner (Daniela Bayona) validó la historia con al menos un usuario real (administrador o residente en Barrancabermeja) y dejó documentada su retroalimentación en los comentarios del issue.

*(A partir de la Semana 6 entra en vigor la DoD base de código del curso: ingreso a `main` mediante PR revisado por otro integrante, cero errores de análisis estático, manejo de los 4 estados de toda lista —cargando, vacío, error y con datos—, áreas táctiles de mínimo 48 dp, manejo de permisos denegados de cámara/notificaciones y prueba verificada en un dispositivo Android físico).*

---

## 5. Planificación de Sprints

### 🏁 Sprint 1 (Semana 4 — Requisitos, Criterios de Aceptación y UX Móvil)
* **Objetivo del Sprint 1:** «Dejar las historias Must de autenticación, cartera, reservas con bloqueo por mora y PQRSD con sus criterios de aceptación en formato Dado/Cuando/Entonces y bocetos base en Figma, validados con al menos un administrador y un residente real en Barrancabermeja».
* **Elementos comprometidos (movidos a la columna «Listo» con iteración `Sprint 1`):**
  * `TEC-01`: Configurar estructura base del repositorio, plantilla de issues y protección de rama `main`.
  * `HU-01`: Inicio de sesión diferenciado por perfil (Residente / Administrador).
  * `HU-02`: Consulta de estado de cuenta y saldo de administración.
  * `HU-03`: Captura y envío de comprobante de pago mediante cámara del dispositivo (API HTML5).
  * `HU-05`: Reserva de área común en calendario con bloqueo automático por morosidad.
