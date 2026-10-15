# Examen · Sprint 1 · React Native + Expo

- **Equipo y proyecto:** Los Diurnos (Equipo Condominios App) · DoorWay-App (Sistema Integral de Gestión para Condominios)
- **Objetivo (sí o no):** «La lista de estado de cuenta y recibos de pago (HU-03) funciona en un teléfono Android con sus cuatro situaciones y su vista de detalle en React Native, y sus criterios de aceptación están escritos».
- **Historia técnica:** HU-03 (#3) · **Otra Must:** HU-02 (#2).

## 1. Persona y mapa de hoy

<!-- MARGIT: Pega aquí arriba los 5 datos de Doña Martha y la tabla de los 4 momentos -->

**Cambio en el backlog:** Al identificar en el mapa de experiencia que el residente envía la foto del voucher por WhatsApp y pasa días sin saber si el administrador ya lo revisó o si sigue en mora, se modificó la historia HU-03 en el backlog para agregar explícitamente el estado de conciliación del recibo («Pagado», «En validación», «En mora») y la referencia bancaria tanto en la lista como en la vista de detalle.

## 2. Criterios (tres por historia: éxito, error, celular)

### Historia Técnica: HU-03 — Consulta de estado de cuenta y recibos de pago
```gherkin
# language: es
Escenario: Consulta exitosa de mis recibos de administración y su detalle
  Dado que soy un residente autenticado con cobros de administración registrados
  Cuando abro la pantalla «Estado de cuenta y recibos»
  Entonces veo la lista de mis recibos ordenada del más reciente al más antiguo con su periodo, monto y estado, y al tocar uno veo su detalle completo

Escenario: Error al consultar el estado de cuenta por falla del servidor
  Dado que el servidor de cartera no responde a la consulta
  Cuando abro la pantalla «Estado de cuenta y recibos»
  Entonces veo el aviso «No pudimos leer tus recibos de administración» y el botón «Reintentar»

Escenario: Residente nuevo sin recibos generados aún (lista vacía en el celular)
  Dado que soy un residente recién vinculado y nunca se ha registrado un recibo en mi cuenta
  Cuando abro la pantalla «Estado de cuenta y recibos» en mi teléfono Android
  Entonces veo el mensaje «Aún no tienes recibos registrados» y el botón «Subir comprobante»
```

### Otra Historia Must: HU-02 — Bloqueo automático de reserva por mora financiera
```gherkin
# language: es
Escenario: Residente al día accede a confirmar una reserva de área común
  Dado que mi estado de cuenta en el módulo de cartera tiene saldo pendiente igual a $0
  Cuando selecciono una fecha disponible para el salón social
  Entonces veo habilitado el botón «Confirmar reserva» con el resumen del horario elegido

Escenario: Bloqueo automático de reserva cuando el residente presenta mora activa
  Dado que tengo una o más cuotas de administración vencidas en estado «En mora»
  Cuando intento seleccionar un horario en el calendario de áreas comunes
  Entonces veo una alerta que me informa el bloqueo por saldo pendiente y el botón «Ver mi estado de cuenta»

Escenario: Intento de reserva desde el celular cuando se pierde la conexión de datos móviles
  Dado que mi teléfono Android perdió la conexión a internet antes de validar mi estado financiero
  Cuando pulso sobre un área común para consultar su disponibilidad en tiempo real
  Entonces veo un mensaje indicando que se requiere conexión en línea para verificar cartera y disponibilidad junto al botón «Reintentar»
```

**Revisó:** <!-- MARGIT: Escribe tu nombre aquí después de revisar -->

## 3. MVP y calidad

<!-- MARGIT: Pega aquí la tabla del MVP, los 2 requisitos de calidad con número y el hallazgo de Nielsen -->

## 4. Plan con usuarios

- **A quién y cuándo (issue INV-02):** Visita presencial el sábado 17 de octubre de 2026 (9:00 a. m.) en Barrancabermeja a dos personas reales del contexto (no compañeros de clase): (1) Administrador(a) de un conjunto residencial local y (2) Residente propietario que paga administración mensual y usa áreas comunes (registrado en el issue INV-02).
- **Tres preguntas sobre hechos pasados:**
  1. «Cuénteme cómo fue la última vez que pagó la cuota de administración y envió el soporte de pago: ¿por qué medio lo mandó y cuánto tardaron en confirmarle que quedó al día?»
  2. «Hábleme de la última vez que usted o un vecino intentó apartar el salón social o el kiosco BBQ: ¿cómo verificaron si estaba libre y qué inconveniente ocurrió?»
  3. «Imagínese esta situación: Dado que usted envió ayer la foto de su comprobante de pago, Cuando hoy abre la aplicación para reservar el salón social... ¿qué esperaría que pasara en la pantalla?»

## 5. Prueba técnica y demo

- **Pull request:** #[Número del PR] (examen/sprint1-tecnico -> main) · **Revisó:** Margit Dayanna Barrera Gutiérrez · **Dispositivo:** Teléfono Android físico

| Ejemplo | ¿Cumple? | Por qué |
|---|---|---|
| Escenario 1 (Con datos y detalle) | Sí | Muestra los 5 recibos de prueba tras 1,5 s y al tocar una fila abre su detalle por :id con Expo Router y regresa con «atrás». |
| Escenario 2 (Error y reintentar) | Sí | Al elegir el escenario de falla en el menú debug (__DEV__) muestra el mensaje claro en español y el botón «Reintentar» vuelve a invocar cargar(). |
| Escenario 3 (Lista vacía en celular) | No del todo | Muestra el mensaje de lista vacía y el botón «Subir comprobante»; al pulsarlo informa que la captura con cámara (HU-01) se conectará en el Sprint 2. |

## 6. Quién hizo qué

<!-- MARGIT: Pega aquí la tabla final con los enlaces de los 4 integrantes -->
