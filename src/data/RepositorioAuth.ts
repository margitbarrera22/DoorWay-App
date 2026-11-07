// src/data/RepositorioAuth.ts — Autora: Michel Daniela Bayona Díaz
import { supabase } from './RepositorioRecibos';
import { IAuthRepository } from './contratos';
import { UsuarioSesion, RolUsuario } from '../domain/modelos';
import {
  guardarSesionEnSqlite,
  leerSesionDeSqlite,
  borrarSesionDeSqlite,
} from './dbLocalSqlite';

const USUARIOS_SEMILLA_LOCAL: Array<UsuarioSesion & { pin: string }> = [
  {
    id: 'usr-res-01',
    nombre: 'Doña Martha Gómez',
    correo: 'martha@doorway.com',
    pin: '3020',
    rol: 'residente',
    apartamento: 'Torre B - Apto 302',
    aceptoLey1581: false,
  },
  {
    id: 'usr-adm-01',
    nombre: 'Carlos Mendoza (Administrador)',
    correo: 'admin@doorway.com',
    pin: '1234',
    rol: 'admin',
    apartamento: 'Administración General',
    aceptoLey1581: true,
  },
];

export class RepositorioAuthHibrido implements IAuthRepository {
  async iniciarSesion(correo: string, pin: string): Promise<UsuarioSesion> {
    const correoLimpio = correo.trim().toLowerCase();
    const pinLimpio = pin.trim();

    if (!correoLimpio || !pinLimpio) {
      throw new Error('Ingresa tu correo y tu PIN de acceso.');
    }

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('correo', correoLimpio)
        .eq('pin_acceso', pinLimpio)
        .single();

      if (error || !data) {
        throw new Error('Credenciales inválidas. Verifica tu correo y PIN.');
      }

      const sesion: UsuarioSesion = {
        id: data.id,
        nombre: data.nombre,
        correo: data.correo,
        rol: data.rol as RolUsuario,
        apartamento: data.apartamento,
        aceptoLey1581: Boolean(data.acepto_ley1581),
      };

      await guardarSesionEnSqlite(sesion);
      return sesion;
    } catch (err: any) {
      // Respaldo offline con usuarios semilla oficiales si no hay red
      const coincidenciaLocal = USUARIOS_SEMILLA_LOCAL.find(
        (u) => u.correo.toLowerCase() === correoLimpio && u.pin === pinLimpio
      );

      if (coincidenciaLocal) {
        const sesionPrevia = await leerSesionDeSqlite();
        const sesionLocal: UsuarioSesion = {
          id: coincidenciaLocal.id,
          nombre: coincidenciaLocal.nombre,
          correo: coincidenciaLocal.correo,
          rol: coincidenciaLocal.rol,
          apartamento: coincidenciaLocal.apartamento,
          aceptoLey1581:
            sesionPrevia?.id === coincidenciaLocal.id
              ? sesionPrevia.aceptoLey1581
              : coincidenciaLocal.aceptoLey1581,
        };
        await guardarSesionEnSqlite(sesionLocal);
        return sesionLocal;
      }

      throw new Error(err?.message || 'Credenciales incorrectas o sin conexión.');
    }
  }

  async obtenerSesionActivaLocal(): Promise<UsuarioSesion | null> {
    return await leerSesionDeSqlite();
  }

  async registrarAceptacionLey1581(idUsuario: string): Promise<UsuarioSesion> {
    try {
      await supabase
        .from('usuarios')
        .update({ acepto_ley1581: true })
        .eq('id', idUsuario);
    } catch {
      // Continúa guardando en SQLite local aunque esté sin internet
    }

    const sesionActual = await leerSesionDeSqlite();
    if (!sesionActual) {
      throw new Error('No hay una sesión activa para registrar la aceptación de Ley 1581.');
    }

    const actualizada: UsuarioSesion = {
      ...sesionActual,
      aceptoLey1581: true,
    };

    await guardarSesionEnSqlite(actualizada);
    return actualizada;
  }

  async cerrarSesion(): Promise<void> {
    await borrarSesionDeSqlite();
  }
}

