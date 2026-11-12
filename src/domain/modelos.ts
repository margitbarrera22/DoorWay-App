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

export type RolUsuario = 'residente' | 'admin';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  apartamento: string;
  aceptoLey1581: boolean;
  avatarUrl?: string | null;
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
    id: 'anu-01',
    titulo: 'Corte programado de agua por lavado de tanques',
    contenido:
      'Este sábado de 8:00 AM a 12:00 PM se realizará mantenimiento preventivo del tanque elevado de las Torres A y B.',
    categoria: 'Mantenimiento',
    fechaPublicacion: '2026-11-05',
  },
  {
    id: 'anu-02',
    titulo: 'Asamblea extraordinaria de copropietarios',
    contenido:
      'Se cita a todos los residentes el próximo viernes a las 7:00 PM en el Salón Social para aprobar el presupuesto de seguridad.',
    categoria: 'Asamblea',
    fechaPublicacion: '2026-11-04',
  },
  {
    id: 'anu-03',
    titulo: 'Control de ingreso vehicular en portería',
    contenido:
      'Recuerde anunciar a sus visitantes con anticipación y mantener al día su cuota de administración para uso del BBQ.',
    categoria: 'Seguridad',
    fechaPublicacion: '2026-11-03',
  },
];

export const DIRECTORIO_EMERGENCIAS_SEMILLA: ContactoEmergencia[] = [
  {
    id: 'em-01',
    entidad: 'Portería Principal · Conjunto La Nueva Esperanza',
    telefono: '3158894021',
    descripcion: 'Vigilancia interna, apertura de portón y control de visitantes.',
    disponible24h: true,
  },
  {
    id: 'em-02',
    entidad: 'Policía Nacional · Cuadrante Barrancabermeja',
    telefono: '123',
    descripcion: 'Atención inmediata de emergencias de seguridad y convivencia ciudadana.',
    disponible24h: true,
  },
  {
    id: 'em-03',
    entidad: 'Bomberos Voluntarios de Barrancabermeja',
    telefono: '119',
    descripcion: 'Incendios, fugas de gas, rescates e inundaciones en áreas comunes.',
    disponible24h: true,
  },
  {
    id: 'em-04',
    entidad: 'Urgencias de Servicios Públicos (ESSA / Aguas de Barrancabermeja)',
    telefono: '115',
    descripcion: 'Reporte de daños eléctricos en torres o rotura de tuberías matrices.',
    disponible24h: true,
  },
];
