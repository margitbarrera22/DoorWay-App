// src/data/RepositorioRecibos.ts — Autora: Michel Daniela Bayona Díaz (TEC-03 #15)
import { createClient } from '@supabase/supabase-js';
import { IRecibosRepository } from './contratos';
import { Recibo, EstadoRecibo } from '../domain/modelos';
import { DbLocalSqliteRepository } from './dbLocalSqlite';

// Llaves de conexión de Supabase (con fallback seguro que no crashea si faltan variables de entorno)
const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_URL = envUrl && envUrl.startsWith('http') ? envUrl : 'https://doorway-demo.supabase.co';
const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const SUPABASE_KEY = envKey || 'dummy-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const dbLocal = new DbLocalSqliteRepository();

export class RepositorioRecibosHibrido implements IRecibosRepository {
  async obtenerTodos(): Promise<Recibo[]> {
    try {
      // 1. Intenta leer de Supabase (Cloud)
      const { data, error } = await supabase
        .from('recibos')
        .select('*')
        .order('fecha_vencimiento', { ascending: false });

      if (error) throw error;

      const mapeados: Recibo[] = (data || []).map((f: any) => ({
        id: f.id,
        apartamento: f.apartamento,
        residenteNombre: f.residente_nombre,
        periodo: f.periodo,
        monto: f.monto,
        fechaVencimiento: f.fecha_vencimiento,
        estado: f.estado as EstadoRecibo,
        referenciaBancaria: f.referencia_bancaria,
        comprobanteUrl: f.comprobante_url,
        observacionAdmin: f.observacion_admin,
      }));

      // 2. Guarda copia en SQLite local
      await dbLocal.insertarSemilla(mapeados);
      return mapeados;
    } catch {
      // 3. Si no hay internet o falla la red, lee de SQLite local
      return await dbLocal.obtenerTodos();
    }
  }

  async obtenerPorId(id: string): Promise<Recibo | null> {
    const todos = await this.obtenerTodos();
    return todos.find((r) => r.id === id) ?? null;
  }

  async subirComprobante(idRecibo: string, referencia: string, uriFotoLocal: string): Promise<Recibo> {
    const { error } = await supabase
      .from('recibos')
      .update({
        estado: 'En validación',
        referencia_bancaria: referencia.trim(),
        comprobante_url: uriFotoLocal,
      })
      .eq('id', idRecibo);

    if (error) throw new Error('No se pudo registrar el comprobante en el servidor');
    
    // Actualiza también en SQLite local
    await dbLocal.subirComprobante(idRecibo, referencia, uriFotoLocal);
    
    const todos = await this.obtenerTodos();
    return todos.find((r) => r.id === idRecibo)!;
  }

  async conciliarReciboAdmin(idRecibo: string, nuevoEstado: EstadoRecibo, observacion?: string): Promise<Recibo> {
    const { error } = await supabase
      .from('recibos')
      .update({ estado: nuevoEstado, observacion_admin: observacion ?? null })
      .eq('id', idRecibo);

    if (error) throw new Error('Error al conciliar el recibo');
    
    // Actualiza también en SQLite local
    await dbLocal.conciliarReciboAdmin(idRecibo, nuevoEstado, observacion);
    
    const todos = await this.obtenerTodos();
    return todos.find((r) => r.id === idRecibo)!;
  }
}
