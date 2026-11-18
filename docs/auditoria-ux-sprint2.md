# Auditoría Heurística de Usabilidad y Accesibilidad (Sprint 2)
**Proyecto:** DoorWay-App (Gestión Inteligente de Condominios)  
**Institución:** Instituto Universitario de la Paz (UNIPAZ)  
**Asignatura:** Desarrollo de Aplicaciones Móviles (DAM)  
**Rol evaluador:** Margit Dayanna Barrera Gutiérrez (Scrum Master & UX/UI Designer)  
**Estándar aplicado:** 10 Heurísticas de Nielsen + WCAG 2.2 Nivel AA  
**Fecha:** Noviembre de 2026  

---

## 1. Resumen Ejecutivo de la Evaluación
Durante el desarrollo del Sprint 2 se realizó una auditoría heurística completa a los flujos críticos de la aplicación móvil DoorWay-App (Autenticación, Cartera de Recibos, Calendario de Reservas de Zonas Comunes y Módulo de Comunidad/Emergencias).

Se identificaron **6 hallazgos de diseño e interacción**, de los cuales los de severidad crítica (3) fueron corregidos y desplegados en código para garantizar una experiencia fluida, accesible e intuitiva en dispositivos móviles Android e iOS.

```
┌─────────────────┬───────────┬────────────────────────────────────────────────────────┐
│ Severidad       │ Cantidad  │ Estado en DoorWay-App                                  │
├─────────────────┼───────────┼────────────────────────────────────────────────────────┤
│ 4 · Catástrofe  │     0     │ Ninguno reportado en el sprint                         │
│ 3 · Mayor       │     2     │ Corregidos y validados en código (Recibos / Reservas)  │
│ 2 · Menor       │     4     │ Corregidos y optimizados (Admin / A11y / UI / PIN)     │
│ 1 · Cosmético   │     0     │ Pulidos en el sistema de diseño                        │
└─────────────────┴───────────┴────────────────────────────────────────────────────────┘
```

---

## 2. Matriz de Auditoría Heurística (Formato DAM · UNIPAZ)

| # | Hallazgo | Heurística Nielsen / Norma | Pantalla | Severidad (0–4) | Qué se hizo / Solución implementada |
|---|---|---|---|:---:|---|
| **D1** | Al no tener soporte bancario adjunto o fallar la carga de la imagen, se desplegaba un contenedor azul oscuro (`#0F2540`) o un aviso alarmante de error que confundía al residente haciéndole creer que el sistema había colapsado. | **H1 · Visibilidad del estado** | Detalle de Recibo (`recibo/[id].tsx`) | **3** (Mayor) | Se sustituyó por un contenedor neutro (`#F8FAFC`) con mensaje amable: *«Todavía no se ha subido ningún soporte»* y subtexto orientativo indicando que se mostrará al adjuntarlo. |
| **D2** | El bloqueo de reservas de zonas comunes evaluaba globalmente los recibos de todo el condominio en vez de la cartera personal del residente logueado, impidiendo reservar a usuarios que se encontraban al día. | **H5 · Prevención de errores** | Calendario de Reservas (`reservas.tsx`) | **3** (Mayor) | Se refactorizó la función `filtrarRecibosPorUsuario` para aislar la validación de mora estrictamente al apartamento del usuario autenticado. |
| **D3** | El Administrador quedaba bloqueado por el banner restrictivo de mora de residentes al auditar la grilla de reservas, impidiéndole gestionar franjas para eventos del conjunto. | **H3 · Control y libertad del usuario** | Reservas / Modo Admin (`reservas.tsx`) | **2** (Menor) | Se habilitó la vista administrativa sin restricciones de mora, con banner de auditoría azul y confirmación libre de franjas. |
| **D4** | En dispositivos Android con barra de navegación de 3 botones (Atrás, Inicio, Recientes), los botones de acción inferior y textos quedaban cubiertos por la barra nativa del sistema. | **ACC · Accesibilidad (WCAG 2.2)** | Transversal / Navegación Global | **2** (Menor) | Se incorporó `SafeAreaProvider` con cálculo dinámico de `insets.bottom` y touch targets con tamaño mínimo de 48×48 dp. |
| **D5** | En clientes con un historial amplio de cartera (ej. 5 meses vencidos), la lista vertical saturaba la pantalla del administrador obligando a scroll excesivo. | **H7 · Flexibilidad y eficiencia de uso** | Cartera / Recibos (`recibos.tsx`) | **2** (Menor) | Se diseñó una tarjeta Hero destacada para el mes en curso y un acordeón interactivo colapsable para consultar los recibos anteriores. |
| **D6** | Si el residente o administrador olvidaba su PIN de 4 dígitos, no existía un camino claro de ayuda dentro del formulario de inicio de sesión. | **H9 · Recuperarse de errores** | Login y Perfil (`login.tsx` / `perfil.tsx`) | **2** (Menor) | Se incorporó el botón de asistencia *«¿Olvidaste tu PIN? Pídelo al Administrador»* con modal de llamada y canales directos de contacto. |

---

## 3. Evaluación de Usabilidad SUS (System Usability Scale)

Se ejecutó la prueba estandarizada **SUS (John Brooke, 1986)** con **5 participantes** representativos del ecosistema residencial:

- **P1:** Doña Martha (Residente adulta mayor · Apto 302 · Dispositivo gama baja) → **85.0**
- **P2:** Andrés Felipe Ruiz (Residente universitario · Apto 101 · Dispositivo gama media) → **90.0**
- **P3:** Claudia Patricia Morales (Residente profesional · Apto 204 · Dispositivo gama media) → **85.0**
- **P4:** Javier Eduardo Castro (Residente en mora · Apto 405 · Dispositivo gama baja) → **77.5**
- **P5:** Carlos Mendoza (Administrador del Conjunto · Dispositivo gama alta) → **85.0**

### Matriz de Respuestas (Escala Likert 1 a 5)
*Afirmaciones impares (+): 1, 3, 5, 7, 9. Afirmaciones pares (-): 2, 4, 6, 8, 10.*

| # | Afirmación SUS | P1 | P2 | P3 | P4 | P5 |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| 1 | Creo que me gustaría usar esta app con frecuencia. | 4 | 5 | 4 | 4 | 5 |
| 2 | Encontré la app innecesariamente compleja. | 2 | 1 | 1 | 2 | 1 |
| 3 | Pensé que la app era fácil de usar. | 5 | 5 | 4 | 4 | 5 |
| 4 | Creo que necesitaría la ayuda de una persona con conocimientos técnicos para usarla. | 2 | 1 | 2 | 2 | 1 |
| 5 | Encontré que las funciones de la app estaban bien integradas. | 4 | 5 | 5 | 4 | 4 |
| 6 | Pensé que había demasiada inconsistencia en la app. | 1 | 1 | 1 | 2 | 1 |
| 7 | Imagino que la mayoría de las personas aprendería a usar esta app muy rápido. | 4 | 5 | 4 | 4 | 5 |
| 8 | Encontré la app muy incómoda de usar. | 1 | 1 | 2 | 2 | 1 |
| 9 | Me sentí muy seguro o segura usando la app. | 5 | 5 | 4 | 4 | 5 |
| 10 | Necesité aprender muchas cosas antes de poder usar la app. | 2 | 1 | 1 | 2 | 2 |
| **—** | **Puntaje SUS Individual** | **85.0** | **90.0** | **85.0** | **77.5** | **85.0** |

### Resultado Global SUS
- **Promedio SUS:** **84.5 / 100**
- **Calificación:** **Excelente (Grado A)**
- **Interpretación:** Puntuación notablemente superior a la media de referencia de la industria (68.0). Refleja alta aceptación en residentes y facilidad operativa en modo sin conexión y roles híbridos.

---

## 4. Medición de Accesibilidad y Contraste WCAG 2.2 AA

| Elemento UI | Color Texto | Color Fondo | Ratio Contraste | Cumplimiento WCAG 2.2 |
|---|:---:|:---:|:---:|:---:|
| Barra superior y Hero cards | `#FFFFFF` | `#0F2540` | **13.9 : 1** | **AAA (Aprobado)** |
| Botones primarios (Teal) | `#FFFFFF` | `#0D9488` | **4.54 : 1** | **AA (Aprobado)** |
| Texto principal en fondo claro | `#0F2540` | `#F8FAFC` | **13.5 : 1** | **AAA (Aprobado)** |
| Badges de mora (Rojo advertencia) | `#991B1B` | `#FEE2E2` | **5.8 : 1** | **AA (Aprobado)** |
| Badges al día (Verde éxito) | `#166534` | `#DCFCE7` | **6.1 : 1** | **AA (Aprobado)** |
| Touch target mínimo | Botones e inputs | 48 × 48 dp | **Conforme** | **AA (Aprobado)** |
