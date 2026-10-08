# 🚪 Doorway - Gestión Condominial

**Equipo:** Condominios App  
**Integrantes:** Said Pacheco, Wilfran Betancourt, Daniela Bayona, Margit Barrera  
**Tecnología:** PWA (React, JavaScript, HTML5, CSS)  
**ODS:** 11 (Ciudades y comunidades sostenibles) y 16 (Paz, justicia e instituciones sólidas)

---

## 1. Visión y Objetivo del Producto
**Visión (Plantilla de Moore):**  
Para los residentes y administradores de conjuntos residenciales en Barrancabermeja que sufren la desorganización de pagos, reservas y PQRSD en WhatsApp, **Doorway** es una aplicación web progresiva (PWA) de gestión condominial que centraliza la información y garantiza la trazabilidad financiera en tiempo real. A diferencia de las hojas de cálculo dispersas y los chats grupales, nuestro producto funciona sin conexión, es ligero para dispositivos de gama baja y ofrece transparencia total sin costos de instalación.

**Objetivo del Producto:**  
"Que los administradores y residentes de condominios en Barrancabermeja puedan gestionar PQRSD, reservas y cartera en menos de 2 minutos desde un dispositivo de gama baja, eliminando la pérdida de trazabilidad financiera y las colisiones en reservas."

---

## 2. Roles del Equipo (Scrum)
- **Product Owner (Fijo):** [Nombre del PO, ej: Daniela Bayona]. *Responsable de maximizar el valor, ordenar el backlog y validar con el usuario real (Administradores/Residentes de conjuntos en Barrancabermeja).*
- **Scrum Master (Hito 1):** [Nombre del SM, ej: Said Pacheco]. *Responsable de facilitar los eventos, cuidar el tiempo y eliminar impedimentos.*
- **Rotación del Scrum Master:** Hito 1: Said | Hito 2: Leonardo | Hito 3: Daniela | Hito 4: Margit.
- **Developers:** Said, Leonardo, Daniela, Margit. *(Todos programan, prueban y se autoasignan tareas).*

---

## 3. Alcance (MoSCoW)
| Must (Debe tener - MVP) | Should (Debería tener) | Could (Podría tener) | Won't (Fuera del alcance este semestre) |
| :--- | :--- | :--- | :--- |
| Registro de PQRSD con foto | Calendario visual de reservas | Notificaciones push nativas | App nativa en Google Play Store |
| Listado de PQRSD por estado | Exportar reporte de cartera a PDF | Modo oscuro | Chat en tiempo real entre vecinos |
| Registro de pagos de cuotas | Sincronización en la nube al recuperar datos | Gamificación o puntos | Versión para iOS o escritorio |
| Funcionamiento offline (Service Workers) | | | Panel web complejo para la empresa de aseo |

---

## 4. Definición del Flujo de Trabajo (Kanban)
| Columna | Política de Entrada | Límite WIP |
| :--- | :--- | :--- |
| **Backlog** | Idea con título claro. El PO decide el orden. | Sin límite |
| **Listo** | Cumple INVEST, tiene criterios de aceptación, puntos y el equipo la entiende. | 5 |
| **En desarrollo** | Alguien se la asigna y crea su rama (`hu-XX-nombre`). Máx. 1 tarea por persona. | 4 |
| **En revisión** | Hay un PR abierto que enlaza el issue y el código no tiene errores de linting. | 2 |
| **En dispositivo** | PR aprobado por otra persona; PWA probada en un Android físico real (no solo emulador). | 2 |
| **Hecho** | Cumple la DoD, el PR está fusionado en `main` y la tarjeta se cerró automáticamente. | Sin límite |

**Definición de Terminado (DoD) - Fase de Exploración (Semanas 3-5):**  
1. La historia tiene criterios de aceptación verificables en formato *Dado / Cuando / Entonces*.  
2. Su pantalla existe en el prototipo de Figma (baja fidelidad mínimo).  
3. El PO la validó con al menos un usuario real y anotó su retroalimentación en el issue.  
*(A partir de la semana 6, regirá la DoD base del curso con APK/PWA probada en dispositivo).*

---

## 5. Objetivo del Sprint 1
**Objetivo:** "Las historias de usuario Must (PQRSD y Cartera) tienen criterios de aceptación redactados, prototipo en Figma y validados con al menos un administrador real de un conjunto en Barrancabermeja."
