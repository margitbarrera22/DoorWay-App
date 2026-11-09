// src/domain/modelos.ts — Autora: Michel Daniela Bayona Díaz
export type EstadoRecibo = 'Pagado' | 'En validación' | 'En mora';

export interface Recibo {
  id: string;
  apartamento: string;
  residenteNombre: string;
  periodo: string;
  monto: number;
  fechaVencimiento: string;
  estado: EstadoRecibo;
  referenciaBancaria?: string | null;
  comprobanteUrl?: string | null;
  observacionAdmin?: string | null;
}

export interface ResultadoFoto {
  uriLocal: string;
  ancho: number;
  alto: number;
  pesoAproxKb: number;
}

export type AreaComun = 'Salón Social' | 'Kiosco BBQ';
export type BloqueHorario = '09:00 - 13:00' | '14:00 - 18:00' | '19:00 - 23:00';
export type EstadoReserva = 'Confirmada' | 'Cancelada';

export interface Reserva {
  id: string;
  apartamento: string;
  areaComun: AreaComun;
  fecha: string; // Formato YYYY-MM-DD
  bloqueHorario: BloqueHorario;
  estado: EstadoReserva;
  createdAt?: string;
}

export interface Anuncio {
  id: string;
  titulo: string;
  contenido: string;
  categoria: 'Mantenimiento' | 'Asamblea' | 'Seguridad' | 'Convivencia';
  fechaPublicacion: string;
}

export interface ContactoEmergencia {
  id: string;
  entidad: string;
  telefono: string;
  descripcion: string;
  disponible24h: boolean;
}

export function tieneMoraActiva(recibos: Recibo[]): boolean {
  return recibos.some((r) => r.estado === 'En mora');
}

export const RECIBOS_SEMILLA: Recibo[] = [
  {
    id: 'rec-01',
    apartamento: 'Torre B - Apto 302',
    residenteNombre: 'Doña Martha Gómez',
    periodo: 'Octubre 2026',
    monto: 185000,
    fechaVencimiento: '2026-10-30',
    estado: 'En mora',
    referenciaBancaria: null,
    comprobanteUrl: null,
    observacionAdmin: null,
  },
  {
    id: 'rec-02',
    apartamento: 'Torre B - Apto 302',
    residenteNombre: 'Doña Martha Gómez',
    periodo: 'Septiembre 2026',
    monto: 185000,
    fechaVencimiento: '2026-09-30',
    estado: 'En validación',
    referenciaBancaria: 'NEQUI-984120',
    comprobanteUrl: null,
    observacionAdmin: null,
  },
  {
    id: 'rec-03',
    apartamento: 'Torre B - Apto 302',
    residenteNombre: 'Doña Martha Gómez',
    periodo: 'Agosto 2026',
    monto: 185000,
    fechaVencimiento: '2026-08-30',
    estado: 'Pagado',
    referenciaBancaria: 'PSE-773190',
    comprobanteUrl: null,
    observacionAdmin: null,
  },
  {
    id: 'rec-04',
    apartamento: 'Torre B - Apto 302',
    residenteNombre: 'Doña Martha Gómez',
    periodo: 'Julio 2026',
    monto: 180000,
    fechaVencimiento: '2026-07-30',
    estado: 'Pagado',
    referenciaBancaria: 'BANCOL-441209',
    comprobanteUrl: null,
    observacionAdmin: null,
  },
  {
    id: 'rec-05',
    apartamento: 'Torre B - Apto 302',
    residenteNombre: 'Doña Martha Gómez',
    periodo: 'Junio 2026',
    monto: 180000,
    fechaVencimiento: '2026-06-30',
    estado: 'Pagado',
    referenciaBancaria: 'NEQUI-112094',
    comprobanteUrl: null,
    observacionAdmin: null,
  },
];

export const ANUNCIOS_SEMILLA: Anuncio[] = [
  {
    id: 'anuncio-01',
    titulo: 'Mantenimiento del Tanque de Agua',
    contenido: 'El próximo martes habrá corte programado de 8:00 AM a 2:00 PM por lavado y desinfección de tanques de la torre.',
    categoria: 'Mantenimiento',
    fechaPublicacion: '2026-11-05',
  },
  {
    id: 'anuncio-02',
    titulo: 'Asamblea Extraordinaria de Copropietarios',
    contenido: 'Convocatoria a reunión obligatoria el sábado 15 de Noviembre en el Salón Social a las 4:00 PM.',
    categoria: 'Asamblea',
    fechaPublicacion: '2026-11-04',
  },
  {
    id: 'anuncio-03',
    titulo: 'Horarios de Áreas Comunes y Convivencia',
    contenido: 'Recordamos a los residentes respetar los horarios del Kiosco BBQ y Salón Social hasta las 11:00 PM para mantener la tranquilidad.',
    categoria: 'Convivencia',
    fechaPublicacion: '2026-11-01',
  },
];

export const DIRECTORIO_EMERGENCIAS_SEMILLA: ContactoEmergencia[] = [
  {
    id: 'cont-01',
    entidad: 'Policía Nacional (Cuadrante)',
    telefono: '123',
    descripcion: 'Atención de emergencias y seguridad del cuadrante del sector',
    disponible24h: true,
  },
  {
    id: 'cont-02',
    entidad: 'Bomberos Voluntarios Barrancabermeja',
    telefono: '119',
    descripcion: 'Rescate, control de incendios e inundaciones en el municipio',
    disponible24h: true,
  },
  {
    id: 'cont-03',
    entidad: 'Gasoriente / ESSA Emergencias',
    telefono: '164',
    descripcion: 'Fugas de gas domiciliario y fallas del sistema eléctrico',
    disponible24h: true,
  },
  {
    id: 'cont-04',
    entidad: 'Portería Barrio Nueva Esperanza',
    telefono: '3109876543',
    descripcion: 'Control de acceso, recepción de paquetes y vigilancia 24/7',
    disponible24h: true,
  },
];
