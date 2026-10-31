// src/theme/tema.ts — Autora: Margit Dayanna Barrera Gutiérrez
export const COLORES = {
  primario: '#0F2540',
  secundario: '#0D9488',
  fondo: '#F8FAFC',
  blanco: '#FFFFFF',
  textoOscuro: '#1E293B',
  textoGris: '#64748B',
  pagadoTexto: '#166534',
  pagadoFondo: '#DCFCE7',
  validacionTexto: '#854D0E',
  validacionFondo: '#FEF9C3',
  moraTexto: '#991B1B',
  moraFondo: '#FEE2E2',
};

export function coloresPorEstado(estado: 'Pagado' | 'En validación' | 'En mora') {
  if (estado === 'Pagado') return { bg: COLORES.pagadoFondo, text: COLORES.pagadoTexto };
  if (estado === 'En validación') return { bg: COLORES.validacionFondo, text: COLORES.validacionTexto };
  return { bg: COLORES.moraFondo, text: COLORES.moraTexto };
}