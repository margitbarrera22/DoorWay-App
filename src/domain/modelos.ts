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

export function tieneMoraActiva(recibos: Recibo[]): boolean {
    return recibos.some((r) => r.estado === 'En mora');
}