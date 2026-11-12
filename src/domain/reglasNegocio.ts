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

/**
 * Filtra los recibos para vincular única y exclusivamente los correspondientes
 * al usuario en sesión activa, evitando mezclar estados de cuenta entre clientes.
 */
export function filtrarRecibosPorUsuario(
    recibos: Recibo[],
    usuario: { nombre?: string; apartamento?: string; rol?: string } | null
): Recibo[] {
    if (!usuario) return [];
    if (usuario.rol === 'admin') return recibos;

    const apto = (usuario.apartamento || '').toLowerCase().trim();
    const nombre = (usuario.nombre || '').toLowerCase().trim();
    const digitosApto = apto.replace(/\D/g, '');

    const propios = recibos.filter((r) => {
        const rApto = (r.apartamento || '').toLowerCase().trim();
        const rNom = (r.residenteNombre || '').toLowerCase().trim();
        const rDigitos = rApto.replace(/\D/g, '');

        if (nombre && (rNom === nombre || rNom.includes(nombre) || nombre.includes(rNom))) return true;
        if (apto && (rApto === apto || rApto.includes(apto) || apto.includes(rApto))) return true;
        if (digitosApto && rDigitos && digitosApto === rDigitos) return true;

        return false;
    });

    return propios;
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