// src/data/RepositorioReservas.ts — Implementación Supabase para gestión de reservas (HU-05 y HU-06)
import { IReservasRepository } from './contratos';
import { Reserva, AreaComun, BloqueHorario } from '../domain/modelos';
import { supabase } from './RepositorioRecibos';

// Semilla inicial en memoria para soporte offline / fallback
let reservasMemoria: Reserva[] = [
    {
        id: 'res-01',
        apartamento: 'Torre B - Apto 302',
        areaComun: 'Salón Social',
        fecha: '2026-11-20',
        bloqueHorario: '14:00 - 18:00',
        estado: 'Confirmada',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'res-02',
        apartamento: 'Torre A - Apto 101',
        areaComun: 'Kiosco BBQ',
        fecha: '2026-11-22',
        bloqueHorario: '19:00 - 23:00',
        estado: 'Confirmada',
        createdAt: new Date().toISOString(),
    },
];

export class RepositorioReservasSupabase implements IReservasRepository {
    async obtenerPorAreaYFecha(area: AreaComun, fecha: string): Promise<Reserva[]> {
        try {
            const { data, error } = await supabase
                .from('reservas')
                .select('*')
                .eq('area_comun', area)
                .eq('fecha', fecha);

            if (error) throw error;

            const mapeadas: Reserva[] = (data || []).map((r: any) => ({
                id: r.id,
                apartamento: r.apartamento,
                areaComun: r.area_comun as AreaComun,
                fecha: r.fecha,
                bloqueHorario: r.bloque_horario as BloqueHorario,
                estado: r.estado,
                createdAt: r.created_at,
            }));

            return mapeadas;
        } catch {
            // Fallback a memoria si la red falla o está offline
            return reservasMemoria.filter((r) => r.areaComun === area && r.fecha === fecha);
        }
    }

    async crearReserva(
        apartamento: string,
        area: AreaComun,
        fecha: string,
        bloque: BloqueHorario
    ): Promise<Reserva> {
        try {
            const { data, error } = await supabase
                .from('reservas')
                .insert([
                    {
                        apartamento,
                        area_comun: area,
                        fecha,
                        bloque_horario: bloque,
                        estado: 'Confirmada',
                    },
                ])
                .select()
                .single();

            if (error) {
                // Manejo atómico de excepciones ante colisiones UNIQUE(area_comun, fecha, bloque_horario)
                if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('colision')) {
                    throw new Error('El turno seleccionado ya se encuentra reservado por otro residente. Por favor elige otro horario.');
                }
                throw error;
            }

            const nuevaReserva: Reserva = {
                id: data.id,
                apartamento: data.apartamento,
                areaComun: data.area_comun as AreaComun,
                fecha: data.fecha,
                bloqueHorario: data.bloque_horario as BloqueHorario,
                estado: data.estado,
                createdAt: data.created_at,
            };

            reservasMemoria.push(nuevaReserva);
            return nuevaReserva;
        } catch (e: any) {
            if (e.message?.includes('turno seleccionado')) throw e;

            // Verificación en fallback de memoria
            const existeColision = reservasMemoria.some(
                (r) =>
                    r.areaComun === area &&
                    r.fecha === fecha &&
                    r.bloqueHorario === bloque &&
                    r.estado === 'Confirmada'
            );

            if (existeColision) {
                throw new Error('El turno seleccionado ya se encuentra reservado por otro residente. Por favor elige otro horario.');
            }

            const nueva: Reserva = {
                id: `res-${Date.now()}`,
                apartamento,
                areaComun: area,
                fecha,
                bloqueHorario: bloque,
                estado: 'Confirmada',
                createdAt: new Date().toISOString(),
            };
            reservasMemoria.push(nueva);
            return nueva;
        }
    }

    async cancelarReserva(idReserva: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('reservas')
                .update({ estado: 'Cancelada' })
                .eq('id', idReserva);

            if (error) throw error;
        } catch {
            // Actualizar en fallback de memoria
            const item = reservasMemoria.find((r) => r.id === idReserva);
            if (item) {
                item.estado = 'Cancelada';
            }
        }
    }
}

