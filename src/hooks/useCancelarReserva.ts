// src/hooks/useCancelarReserva.ts — Autor: Said Alexander Pacheco Moncada (HU-06 #6)
import { useState } from 'react';
import { Reserva } from '../domain/modelos';
import { puedeCancelarCon24h } from '../domain/reglasNegocio';
import { RepositorioReservasSupabase } from '../data/RepositorioReservas';

const repositorio = new RepositorioReservasSupabase();

export function useCancelarReserva(alTerminar: () => Promise<void>) {
    const [avisoCancelacion, setAvisoCancelacion] = useState<string | null>(null);
    const [cancelando, setCancelando] = useState(false);

    async function intentarCancelar(reserva: Reserva) {
        if (cancelando) return;
        setAvisoCancelacion(null);

        const evaluacion = puedeCancelarCon24h(reserva.fecha, reserva.bloqueHorario);
        if (!evaluacion.puedeCancelar) {
            setAvisoCancelacion(evaluacion.mensaje);
            return;
        }

        setCancelando(true);
        try {
            await repositorio.cancelarReserva(reserva.id);
            setAvisoCancelacion('Reserva cancelada con éxito (>24h). El turno quedó libre.');
            await alTerminar();
        } catch (e: any) {
            setAvisoCancelacion(e?.message || 'Error al cancelar la reserva.');
        } finally {
            setCancelando(false);
        }
    }

    return { intentarCancelar, avisoCancelacion, cancelando };
}