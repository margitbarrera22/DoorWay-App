// src/data/dbLocalSqlite.ts — Autora: Michel Daniela Bayona Díaz
import * as SQLite from 'expo-sqlite';
import {
    Recibo,
    EstadoRecibo,
    RECIBOS_SEMILLA,
    Anuncio,
    ContactoEmergencia,
    ANUNCIOS_SEMILLA,
    DIRECTORIO_EMERGENCIAS_SEMILLA,
} from '../domain/modelos';
import { IRecibosRepository } from './contratos';

let dbInstancia: SQLite.SQLiteDatabase | null = null;

async function obtenerDb(): Promise<SQLite.SQLiteDatabase> {
    if (!dbInstancia) {
        dbInstancia = await SQLite.openDatabaseAsync('doorway_local.db');
        await dbInstancia.execAsync(`
        CREATE TABLE IF NOT EXISTS recibos_local (
          id TEXT PRIMARY KEY NOT NULL,
          apartamento TEXT NOT NULL,
          residenteNombre TEXT NOT NULL,
          periodo TEXT NOT NULL,
          monto INTEGER NOT NULL,
          fechaVencimiento TEXT NOT NULL,
          estado TEXT NOT NULL,
          referenciaBancaria TEXT,
          comprobanteUrl TEXT,
          observacionAdmin TEXT
        );

        CREATE TABLE IF NOT EXISTS anuncios_cache (
          id TEXT PRIMARY KEY NOT NULL,
          titulo TEXT NOT NULL,
          contenido TEXT NOT NULL,
          categoria TEXT NOT NULL,
          fechaPublicacion TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS directorio_emergencias (
          id TEXT PRIMARY KEY NOT NULL,
          entidad TEXT NOT NULL,
          telefono TEXT NOT NULL,
          descripcion TEXT NOT NULL,
          disponible24h INTEGER NOT NULL
        );
      `);
    }
    return dbInstancia;
}

export class DbLocalSqliteRepository implements IRecibosRepository {
    async inicializarBaseDatos(): Promise<void> {
        try {
            await obtenerDb();
        } catch (error) {
            console.error('Error al inicializar SQLite local:', error);
        }
    }

    async obtenerTodos(): Promise<Recibo[]> {
        const db = await obtenerDb();
        let resultado = await db.getAllAsync<Recibo>('SELECT * FROM recibos_local ORDER BY fechaVencimiento DESC;');
        if (resultado.length === 0) {
            await this.insertarSemilla(RECIBOS_SEMILLA);
            resultado = await db.getAllAsync<Recibo>('SELECT * FROM recibos_local ORDER BY fechaVencimiento DESC;');
        }
        return resultado;
    }

    async obtenerPorId(id: string): Promise<Recibo | null> {
        const db = await obtenerDb();
        const resultado = await db.getFirstAsync<Recibo>(
            'SELECT * FROM recibos_local WHERE id = ?;',
            [id]
        );
        return resultado || null;
    }

    async subirComprobante(idRecibo: string, referencia: string, uriFotoLocal: string): Promise<Recibo> {
        const db = await obtenerDb();
        await db.runAsync(
            `UPDATE recibos_local SET estado = ?, referenciaBancaria = ?, comprobanteUrl = ? WHERE id = ?;`,
            ['En validación', referencia, uriFotoLocal, idRecibo]
        );

        const actualizado = await this.obtenerPorId(idRecibo);
        if (!actualizado) throw new Error(`No se encontró el recibo con ID ${idRecibo}`);
        return actualizado;
    }

    async conciliarReciboAdmin(idRecibo: string, nuevoEstado: EstadoRecibo, observacion?: string): Promise<Recibo> {
        const db = await obtenerDb();
        await db.runAsync(
            `UPDATE recibos_local SET estado = ?, observacionAdmin = ? WHERE id = ?;`,
            [nuevoEstado, observacion || null, idRecibo]
        );

        const actualizado = await this.obtenerPorId(idRecibo);
        if (!actualizado) throw new Error(`No se encontró el recibo con ID ${idRecibo}`);
        return actualizado;
    }

    // Método auxiliar para insertar datos semilla iniciales en SQLite
    async insertarSemilla(recibos: Recibo[]): Promise<void> {
        const db = await obtenerDb();
        for (const r of recibos) {
            await db.runAsync(
                `INSERT OR REPLACE INTO recibos_local (id, apartamento, residenteNombre, periodo, monto, fechaVencimiento, estado, referenciaBancaria, comprobanteUrl, observacionAdmin) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [r.id, r.apartamento, r.residenteNombre, r.periodo, r.monto, r.fechaVencimiento, r.estado, r.referenciaBancaria || null, r.comprobanteUrl || null, r.observacionAdmin || null]
            );
        }
    }
}

// Funciones auxiliares para la gestión de Comunidad (Anuncios y Directorio) en SQLite local (TEC-05 #17)
export async function guardarAnunciosEnSqlite(anuncios: Anuncio[]): Promise<void> {
    try {
        const db = await obtenerDb();
        for (const a of anuncios) {
            await db.runAsync(
                `INSERT OR REPLACE INTO anuncios_cache (id, titulo, contenido, categoria, fechaPublicacion)
                 VALUES (?, ?, ?, ?, ?);`,
                [a.id, a.titulo, a.contenido, a.categoria, a.fechaPublicacion]
            );
        }
    } catch (e) {
        console.warn('Error al guardar anuncios en SQLite:', e);
    }
}

export async function leerAnunciosDeSqlite(): Promise<Anuncio[]> {
    try {
        const db = await obtenerDb();
        const filas = await db.getAllAsync<any>(
            'SELECT * FROM anuncios_cache ORDER BY fechaPublicacion DESC;'
        );
        if (filas.length > 0) {
            return filas.map((f) => ({
                id: f.id,
                titulo: f.titulo,
                contenido: f.contenido,
                categoria: f.categoria,
                fechaPublicacion: f.fechaPublicacion,
            }));
        }
        await guardarAnunciosEnSqlite(ANUNCIOS_SEMILLA);
        return ANUNCIOS_SEMILLA;
    } catch {
        return ANUNCIOS_SEMILLA;
    }
}

export async function leerDirectorioDeSqlite(): Promise<ContactoEmergencia[]> {
    try {
        const db = await obtenerDb();
        const filas = await db.getAllAsync<any>(
            'SELECT * FROM directorio_emergencias;'
        );
        if (filas.length > 0) {
            return filas.map((f) => ({
                id: f.id,
                entidad: f.entidad,
                telefono: f.telefono,
                descripcion: f.descripcion,
                disponible24h: Boolean(f.disponible24h),
            }));
        }
        for (const c of DIRECTORIO_EMERGENCIAS_SEMILLA) {
            await db.runAsync(
                `INSERT OR REPLACE INTO directorio_emergencias (id, entidad, telefono, descripcion, disponible24h)
                 VALUES (?, ?, ?, ?, ?);`,
                [c.id, c.entidad, c.telefono, c.descripcion, c.disponible24h ? 1 : 0]
            );
        }
        return DIRECTORIO_EMERGENCIAS_SEMILLA;
    } catch {
        return DIRECTORIO_EMERGENCIAS_SEMILLA;
    }
}
