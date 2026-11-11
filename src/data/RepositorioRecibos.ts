// src/data/RepositorioRecibos.ts — Autora: Michel Daniela Bayona Díaz (TEC-03 #15)
// SQLite es la fuente de verdad. Supabase sincroniza en segundo plano si está disponible.
import { createClient } from '@supabase/supabase-js';
import { IRecibosRepository } from './contratos';
import { Recibo, EstadoRecibo } from '../domain/modelos';
import { DbLocalSqliteRepository } from './dbLocalSqlite';

const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_URL = envUrl && envUrl.startsWith('http') ? envUrl : 'https://vmgtbrdmefrmtlzxtzxk.supabase.co';
const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const SUPABASE_KEY = envKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ3RicmRtZWZybXRsenh0enhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMTg0MDIsImV4cCI6MjEwODg5NDQwMn0.Omp-PqpSXXIfuO7rCicuy0-GhYcLcmWNk8yvkGi9y1g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const dbLocal = new DbLocalSqliteRepository();

export class RepositorioRecibosHibrido implements IRecibosRepository {

  async obtenerTodos(): Promise<Recibo[]> {
    // SQLite es SIEMPRE la fuente de verdad (preserva comprobantes subidos localmente).
    // Supabase se intenta en segundo plano solo para enriquecer datos remotos futuros.
    const local = await dbLocal.obtenerTodos();

    // Intento silencioso de sincronización con Supabase (no bloquea ni lanza)
    try {
      const { data, error } = await supabase
        .from('recibos')
        .select('*')
        .order('fecha_vencimiento', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapeados: Recibo[] = data.map((f: any) => ({
          id: f.id,
          apartamento: f.apartamento,
          residenteNombre: f.residente_nombre,
          periodo: f.periodo,
          monto: f.monto,
          fechaVencimiento: f.fecha_vencimiento,
          estado: f.estado as EstadoRecibo,
          referenciaBancaria: f.referencia_bancaria,
          // Nunca sobreescribe con null: si SQLite tiene un comprobante, lo conserva
          comprobanteUrl: f.comprobante_url,
          observacionAdmin: f.observacion_admin,
        }));
        // INSERT OR IGNORE → no pisa comprobanteUrl local
        await dbLocal.insertarSemilla(mapeados);
      }
    } catch {
      // Sin internet o Supabase no configurado → continúa solo con SQLite
    }

    // Lee de SQLite siempre (tiene el comprobanteUrl real del residente)
    return await dbLocal.obtenerTodos();
  }

  async obtenerPorId(id: string): Promise<Recibo | null> {
    const todos = await this.obtenerTodos();
    return todos.find((r) => r.id === id) ?? null;
  }

  private async subirImagenAlBucketSoportes(idRecibo: string, uriLocal: string): Promise<string | null> {
    try {
      const respuestaArchivo = await fetch(uriLocal);
      const blob = await respuestaArchivo.blob();
      const rutaArchivo = `comprobantes/${idRecibo}-${Date.now()}.jpg`;

      const { data: uploadData, error: errorUpload } = await supabase.storage
        .from('soportes')
        .upload(rutaArchivo, blob, { contentType: 'image/jpeg', upsert: true });

      // Si falla la subida (ej: bucket soportes no existe o error 404), NO inventar URL falsa
      if (errorUpload || !uploadData) {
        return null;
      }

      const { data: urlData } = supabase.storage.from('soportes').getPublicUrl(rutaArchivo);
      return urlData?.publicUrl || null;
    } catch {
      // Sin Supabase Storage o en modo avión
      return null;
    }
  }

  async subirComprobante(idRecibo: string, referencia: string, uriFotoLocal: string): Promise<Recibo> {
    // 1. Guarda SIEMPRE en SQLite local primero (Garantiza funcionamiento offline / modo avión inmediato)
    await dbLocal.subirComprobante(idRecibo, referencia.trim(), uriFotoLocal);

    // 2. Si hay conexión y credenciales de Supabase configuradas, sincroniza a la nube
    if (envUrl && envUrl.startsWith('http') && !envUrl.includes('doorway-demo') && envKey) {
      try {
        const urlNube = await this.subirImagenAlBucketSoportes(idRecibo, uriFotoLocal);
        await supabase
          .from('recibos')
          .update({
            estado: 'En validación',
            referencia_bancaria: referencia.trim(),
            comprobante_url: urlNube || null,
            observacion_admin: null,
          })
          .eq('id', idRecibo);
      } catch {
        // En modo avión o fallo de red, SQLite ya tiene el soporte guardado localmente
      }
    }

    // 3. Devuelve el recibo actualizado desde SQLite (prioridad de visualización inmediata)
    const todos = await dbLocal.obtenerTodos();
    const actualizado = todos.find((r) => r.id === idRecibo);
    if (!actualizado) throw new Error(`No se encontró el recibo con ID ${idRecibo}`);
    return actualizado;
  }

  async conciliarReciboAdmin(idRecibo: string, nuevoEstado: EstadoRecibo, observacion?: string): Promise<Recibo> {
    // 1. SIEMPRE guarda en SQLite primero
    await dbLocal.conciliarReciboAdmin(idRecibo, nuevoEstado, observacion);

    // 2. Intenta sincronizar con Supabase (opcional)
    try {
      await supabase
        .from('recibos')
        .update({ estado: nuevoEstado, observacion_admin: observacion ?? null })
        .eq('id', idRecibo);
    } catch {
      // Sin conexión: SQLite ya tiene el dato
    }

    // 3. Devuelve el recibo actualizado desde SQLite
    const todos = await dbLocal.obtenerTodos();
    const actualizado = todos.find((r) => r.id === idRecibo);
    if (!actualizado) throw new Error(`No se encontró el recibo con ID ${idRecibo}`);
    return actualizado;
  }
}
