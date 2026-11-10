// src/data/RepositorioReservas.ts — Autora: Michel Daniela Bayona Díaz (HU-05 y HU-06)
import { supabase } from './RepositorioRecibos';
import { IReservasRepository } from './contratos';
import { Reserva, AreaComun, BloqueHorario, EstadoReserva } from '../domain/modelos';

export class RepositorioReservasSupabase implements IReservasRepository {
  async obtenerPorAreaYFecha(area: AreaComun, fecha: string): Promise<Reserva[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('area_comun', area)
      .eq('fecha', fecha)
      .eq('estado', 'Confirmada');

    if (error) throw new Error('No pudimos consultar la disponibilidad del calendario.');

    return (data || []).map((f: any) => ({
      id: f.id,
      apartamento: f.apartamento,
      areaComun: f.area_comun as AreaComun,
      fecha: f.fecha,
      bloqueHorario: f.bloque_horario as BloqueHorario,
      estado: f.estado as EstadoReserva,
      createdAt: f.created_at,
    }));
  }

  async crearReserva(apartamento: string, area: AreaComun, fecha: string, bloque: BloqueHorario): Promise<Reserva> {
    // 1. Validación previa de concurrencia antes de insertar
    const ocupadas = await this.obtenerPorAreaYFecha(area, fecha);
    const yaOcupado = ocupadas.some((r) => r.bloqueHorario === bloque && r.estado === 'Confirmada');
    if (yaOcupado) {
      throw new Error('Este horario acaba de ser tomado por otro residente. Elige otra franja disponible.');
    }

    const nuevoId = `res-${Date.now()}`;
    const { data, error } = await supabase
      .from('reservas')
      .insert({
        id: nuevoId,
        apartamento,
        area_comun: area,
        fecha,
        bloque_horario: bloque,
        estado: 'Confirmada',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.includes('unique')) {
        throw new Error('Este horario acaba de ser tomado por otro residente.');
      }
      throw new Error('No se pudo registrar la reserva. Verifica tu conexión a internet.');
    }

    return {
      id: data.id,
      apartamento: data.apartamento,
      areaComun: data.area_comun as AreaComun,
      fecha: data.fecha,
      bloqueHorario: data.bloque_horario as BloqueHorario,
      estado: data.estado as EstadoReserva,
    };
  }

  async cancelarReserva(idReserva: string): Promise<void> {
    const { error } = await supabase
      .from('reservas')
      .update({ estado: 'Cancelada' })
      .eq('id', idReserva);

    if (error) throw new Error('No se pudo cancelar la reserva en el servidor.');
  }
}