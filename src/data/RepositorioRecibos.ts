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
    // 1. Asegura que SQLite tenga datos base
    await dbLocal.obtenerTodos();

    // 2. Sincroniza desde Supabase para traer actualizaciones remotas de referencia, foto y estado
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
          comprobanteUrl: f.comprobante_url,
          observacionAdmin: f.observacion_admin,
        }));
        // Actualiza SQLite con los datos frescos de Supabase
        await dbLocal.sincronizarDesdeSupabase(mapeados);
      }
    } catch {
      // Sin internet o Supabase no disponible → continúa solo con SQLite local
    }

    // Lee de SQLite siempre con los datos más frescos
    return await dbLocal.obtenerTodos();
  }

  async obtenerPorId(id: string): Promise<Recibo | null> {
    const todos = await this.obtenerTodos();
    return todos.find((r) => r.id === id) ?? null;
  }

  private async subirImagenAlBucketSoportes(idRecibo: string, uriLocal: string): Promise<string | null> {
    if (!uriLocal) return null;
    // Si ya es una URL remota de Supabase o web, conservarla directamente
    if (uriLocal.startsWith('http://') || uriLocal.startsWith('https://')) {
      return uriLocal;
    }

    try {
      const rutaArchivo = `comprobantes/${idRecibo}-${Date.now()}.jpg`;
      let cuerpoSubida: any = null;

      // En React Native / Expo, leemos el archivo con expo-file-system en base64 para construir el ArrayBuffer real
      try {
        const FileSystem = require('expo-file-system/legacy');
        const base64 = await FileSystem.readAsStringAsync(uriLocal, {
          encoding: 'base64',
        });
        if (base64) {
          const binario = atob(base64);
          const bytes = new Uint8Array(binario.length);
          for (let i = 0; i < binario.length; i++) {
            bytes[i] = binario.charCodeAt(i);
          }
          cuerpoSubida = bytes.buffer;
        }
      } catch {
        // Fallback para entorno Web / Blob
        const res = await fetch(uriLocal);
        cuerpoSubida = await res.blob();
      }

      if (!cuerpoSubida) return null;

      const { data: uploadData, error: errorUpload } = await supabase.storage
        .from('soportes')
        .upload(rutaArchivo, cuerpoSubida, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (errorUpload || !uploadData) {
        return null;
      }

      const { data: urlData } = supabase.storage.from('soportes').getPublicUrl(rutaArchivo);
      return urlData?.publicUrl || null;
    } catch {
      return null;
    }
  }

  async subirComprobante(idRecibo: string, referencia: string, uriFotoLocal: string): Promise<Recibo> {
    const refLimpia = referencia.trim();

    // 1. Intentar subir imagen al storage de Supabase si hay red
    let urlRemota: string | null = null;
    try {
      urlRemota = await this.subirImagenAlBucketSoportes(idRecibo, uriFotoLocal);
    } catch {
      // Sin internet
    }

    // 2. URL que se guardará en SQLite: si subió a la nube usamos la URL remota, si no, la local persistente
    const urlAGuardar = urlRemota || uriFotoLocal;

    // 3. Guarda SIEMPRE en SQLite local primero (Garantiza funcionamiento offline)
    await dbLocal.subirComprobante(idRecibo, refLimpia, urlAGuardar);

    // 4. Sincroniza a Supabase en la tabla 'recibos'
    try {
      await supabase
        .from('recibos')
        .update({
          estado: 'En validación',
          referencia_bancaria: refLimpia,
          comprobante_url: urlAGuardar,
          observacion_admin: null,
        })
        .eq('id', idRecibo);
    } catch {
      // En modo avión o fallo de red, SQLite ya tiene el soporte guardado localmente
    }

    // 5. Devuelve el recibo actualizado desde SQLite (prioridad de visualización inmediata)
    const todos = await dbLocal.obtenerTodos();
    const actualizado = todos.find((r) => r.id === idRecibo);
    if (!actualizado) throw new Error(`No se encontró el recibo con ID ${idRecibo}`);
    return actualizado;
  }

  async conciliarReciboAdmin(idRecibo: string, nuevoEstado: EstadoRecibo, observacion?: string): Promise<Recibo> {
    // 1. SIEMPRE guarda en SQLite primero
    await dbLocal.conciliarReciboAdmin(idRecibo, nuevoEstado, observacion);

    // 2. Sincroniza con Supabase
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
