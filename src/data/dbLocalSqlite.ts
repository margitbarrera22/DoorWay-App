// src/data/dbLocalSqlite.ts — Autora: Michel Daniela Bayona Díaz
import * as SQLite from 'expo-sqlite';
import { Recibo, EstadoRecibo, RECIBOS_SEMILLA, UsuarioSesion, RolUsuario } from '../domain/modelos';
import { IRecibosRepository } from './contratos';

export class DbLocalSqliteRepository implements IRecibosRepository {
    private db: SQLite.SQLiteDatabase | null = null;

    async inicializarBaseDatos(): Promise<void> {
        try {
            // Abre la base de datos local de manera asíncrona
            this.db = await SQLite.openDatabaseAsync('doorway_local.db');

            // Crea la tabla local de recibos y la tabla sesion_activa para modo offline y Ley 1581
            await this.db.execAsync(`
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

        CREATE TABLE IF NOT EXISTS sesion_activa (
          id TEXT PRIMARY KEY NOT NULL,
          nombre TEXT NOT NULL,
          correo TEXT NOT NULL,
          rol TEXT NOT NULL,
          apartamento TEXT NOT NULL,
          acepto_ley1581 INTEGER DEFAULT 0
        );
      `);
        } catch (error) {
            console.error('Error al inicializar SQLite local:', error);
        }
    }

    async obtenerTodos(): Promise<Recibo[]> {
        if (!this.db) await this.inicializarBaseDatos();
        if (!this.db) {
            throw new Error('No se pudo conectar con la base de datos SQLite local');
        }
        let resultado = await this.db.getAllAsync<Recibo>('SELECT * FROM recibos_local ORDER BY fechaVencimiento DESC;');
        if (resultado.length === 0) {
            await this.insertarSemilla(RECIBOS_SEMILLA);
            resultado = await this.db.getAllAsync<Recibo>('SELECT * FROM recibos_local ORDER BY fechaVencimiento DESC;');
        }
        return resultado;
    }

    async obtenerPorId(id: string): Promise<Recibo | null> {
        if (!this.db) await this.inicializarBaseDatos();
        if (!this.db) {
            throw new Error('No se pudo conectar con la base de datos SQLite local');
        }
        const resultado = await this.db.getFirstAsync<Recibo>(
            'SELECT * FROM recibos_local WHERE id = ?;',
            [id]
        );
        return resultado || null;
    }

    async subirComprobante(idRecibo: string, referencia: string, uriFotoLocal: string): Promise<Recibo> {
        if (!this.db) await this.inicializarBaseDatos();
        if (!this.db) {
            throw new Error('No se pudo conectar con la base de datos SQLite local');
        }

        await this.db.runAsync(
            `UPDATE recibos_local SET estado = ?, referenciaBancaria = ?, comprobanteUrl = ? WHERE id = ?;`,
            ['En validación', referencia, uriFotoLocal, idRecibo]
        );

        const actualizado = await this.obtenerPorId(idRecibo);
        if (!actualizado) throw new Error(`No se encontró el recibo con ID ${idRecibo}`);
        return actualizado;
    }

    async conciliarReciboAdmin(idRecibo: string, nuevoEstado: EstadoRecibo, observacion?: string): Promise<Recibo> {
        if (!this.db) await this.inicializarBaseDatos();
        if (!this.db) {
            throw new Error('No se pudo conectar con la base de datos SQLite local');
        }

        await this.db.runAsync(
            `UPDATE recibos_local SET estado = ?, observacionAdmin = ? WHERE id = ?;`,
            [nuevoEstado, observacion || null, idRecibo]
        );

        const actualizado = await this.obtenerPorId(idRecibo);
        if (!actualizado) throw new Error(`No se encontró el recibo con ID ${idRecibo}`);
        return actualizado;
    }

    // Método auxiliar para insertar datos semilla iniciales en SQLite
    async insertarSemilla(recibos: Recibo[]): Promise<void> {
        if (!this.db) await this.inicializarBaseDatos();
        if (!this.db) return;
        for (const r of recibos) {
            await this.db.runAsync(
                `INSERT OR REPLACE INTO recibos_local (id, apartamento, residenteNombre, periodo, monto, fechaVencimiento, estado, referenciaBancaria, comprobanteUrl, observacionAdmin) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [r.id, r.apartamento, r.residenteNombre, r.periodo, r.monto, r.fechaVencimiento, r.estado, r.referenciaBancaria || null, r.comprobanteUrl || null, r.observacionAdmin || null]
            );
        }
    }

    // --- PERSISTENCIA DE SESIÓN ACTIVA Y LEY 1581 EN SQLITE ---
    async guardarSesionEnSqlite(usuario: UsuarioSesion): Promise<void> {
        if (!this.db) await this.inicializarBaseDatos();
        if (!this.db) return;
        await this.db.runAsync('DELETE FROM sesion_activa;');
        await this.db.runAsync(
            `INSERT INTO sesion_activa (id, nombre, correo, rol, apartamento, acepto_ley1581)
             VALUES (?, ?, ?, ?, ?, ?);`,
            [
                usuario.id,
                usuario.nombre,
                usuario.correo,
                usuario.rol,
                usuario.apartamento,
                usuario.aceptoLey1581 ? 1 : 0,
            ]
        );
    }

    async leerSesionDeSqlite(): Promise<UsuarioSesion | null> {
        if (!this.db) await this.inicializarBaseDatos();
        if (!this.db) return null;
        const fila = await this.db.getFirstAsync<any>('SELECT * FROM sesion_activa LIMIT 1;');
        if (!fila) return null;
        return {
            id: fila.id,
            nombre: fila.nombre,
            correo: fila.correo,
            rol: fila.rol as RolUsuario,
            apartamento: fila.apartamento,
            aceptoLey1581: Boolean(fila.acepto_ley1581),
        };
    }

    async borrarSesionDeSqlite(): Promise<void> {
        if (!this.db) await this.inicializarBaseDatos();
        if (!this.db) return;
        await this.db.runAsync('DELETE FROM sesion_activa;');
    }
}

const instanciaSqliteSesion = new DbLocalSqliteRepository();

export async function guardarSesionEnSqlite(usuario: UsuarioSesion): Promise<void> {
    await instanciaSqliteSesion.guardarSesionEnSqlite(usuario);
}

export async function leerSesionDeSqlite(): Promise<UsuarioSesion | null> {
    return await instanciaSqliteSesion.leerSesionDeSqlite();
}

export async function borrarSesionDeSqlite(): Promise<void> {
    await instanciaSqliteSesion.borrarSesionDeSqlite();
}

