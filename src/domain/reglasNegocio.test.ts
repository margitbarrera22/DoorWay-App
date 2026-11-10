// src/domain/reglasNegocio.test.ts — Autora: Michel Daniela Bayona Díaz (HU-02, HU-05 y HU-06)
import { evaluarDerechoAReservar, puedeCancelarCon24h } from './reglasNegocio';
import { Recibo, RECIBOS_SEMILLA, tieneMoraActiva } from './modelos';

export function ejecutarPruebasUnitariasDominio(): void {
  // Caso 1: Residente con un recibo en mora no tiene permitido reservar (HU-02)
  const veredictoConMora = evaluarDerechoAReservar(RECIBOS_SEMILLA);
  if (veredictoConMora.permitido !== false) {
    throw new Error('Fallo Caso 1: Se esperaba permitido = false cuando existe mora activa.');
  }
  if (veredictoConMora.cantidadEnMora !== 1 || veredictoConMora.montoTotalMora !== 185000) {
    throw new Error('Fallo Caso 1: Conteo o suma de mora incorrectos.');
  }
  if (!tieneMoraActiva(RECIBOS_SEMILLA)) {
    throw new Error('Fallo Caso 1: tieneMoraActiva() debía retornar true.');
  }

  // Caso 2: Residente al día tiene permitido reservar áreas comunes (HU-02 / HU-05)
  const recibosAlDia: Recibo[] = RECIBOS_SEMILLA.map((r) => ({
    ...r,
    estado: 'Pagado',
  }));
  const veredictoAlDia = evaluarDerechoAReservar(recibosAlDia);
  if (veredictoAlDia.permitido !== true || veredictoAlDia.montoTotalMora !== 0) {
    throw new Error('Fallo Caso 2: Se esperaba permitido = true cuando todos los recibos están Pagados.');
  }

  // Caso 3: Cancelación bloqueada cuando faltan menos de 24 horas para el inicio del turno (HU-06)
  const ahoraMenosDe24h = new Date('2026-11-15T10:00:00');
  const resultadoRechazado = puedeCancelarCon24h('2026-11-15', '14:00 - 18:00', ahoraMenosDe24h);
  if (resultadoRechazado.puedeCancelar !== false) {
    throw new Error('Fallo Caso 3: Se esperaba bloqueo de cancelación con menos de 24h de anticipación.');
  }

  // Caso 4: Cancelación permitida cuando faltan más de 24 horas para el inicio del turno (HU-06)
  const ahoraMasDe24h = new Date('2026-11-13T08:00:00');
  const resultadoPermitido = puedeCancelarCon24h('2026-11-15', '14:00 - 18:00', ahoraMasDe24h);
  if (resultadoPermitido.puedeCancelar !== true) {
    throw new Error('Fallo Caso 4: Se esperaba permitir la cancelación con más de 24h de anticipación.');
  }

  console.log('✅ Todas las pruebas unitarias de dominio (HU-02, HU-05 y HU-06) pasaron con éxito.');
}
