// src/domain/reglasNegocio.ts — Autora: Michel Daniela Bayona Díaz (HU-02 y HU-06)
import { Recibo, Reserva, BloqueHorario, tieneMoraActiva } from './modelos';

export interface VeredictoPermisoReserva {
    permitido: boolean;
    motivoBloqueo?: string;
    cantidadEnMora: number;
    montoTotalMora: number;
}

export function evaluarDerechoAReservar(recibos: Recibo[]): VeredictoPermisoReserva {
    const enMora = recibos.filter((r) => r.estado === 'En mora');
    if (enMora.length > 0) {
        const suma = enMora.reduce((acc, r) => acc + r.monto, 0);
        return {
            permitido: false,
            cantidadEnMora: enMora.length,
            montoTotalMora: suma,
            motivoBloqueo: `Tienes ${enMora.length} recibo(s) en mora por $${suma.toLocaleString('es-CO')} COP. Ponte al día para reservar áreas comunes.`,
        };
    }
    return { permitido: true, cantidadEnMora: 0, montoTotalMora: 0 };
}

export function puedeCancelarCon24h(fechaReserva: string, bloque: BloqueHorario, ahora: Date = new Date()): {
    puedeCancelar: boolean;
    mensaje: string;
} {
    const horaInicioTexto = bloque.split(' - ')[0]; // ej. "09:00"
    const fechaEvento = new Date(`${fechaReserva}T${horaInicioTexto}:00`);
    const diferenciaMs = fechaEvento.getTime() - ahora.getTime();
    const horasRestantes = diferenciaMs / (1000 * 60 * 60);

    if (horasRestantes < 24) {
        return {
            puedeCancelar: false,
            mensaje: 'Solo puedes cancelar una reserva con al menos 24 horas de anticipación al inicio del turno.',
        };
    }
    return {
        puedeCancelar: true,
        mensaje: 'Cancelación permitida. El horario quedará libre para otros vecinos.',
    };
}