// src/data/RepositorioAuth.ts — Autora: Michel Daniela Bayona Díaz & Wilfran Betancourt
import { supabase } from './RepositorioRecibos';
import { IAuthRepository } from './contratos';
import { UsuarioSesion, RolUsuario } from '../domain/modelos';
import {
  DbLocalSqliteRepository,
  guardarSesionEnSqlite,
  leerSesionDeSqlite,
  borrarSesionDeSqlite,
} from './dbLocalSqlite';

const dbLocal = new DbLocalSqliteRepository();

const USUARIOS_SEMILLA_LOCAL: Array<UsuarioSesion & { pinesValidos: string[]; alias: string[] }> = [
  {
    id: 'usr-res-01',
    nombre: 'Doña Martha Gómez',
    correo: 'martha@doorway.com',
    pinesValidos: ['3020', '1234'],
    alias: ['martha.gomez@doorway.app', 'martha', '302', '302b', 'residente'],
    rol: 'residente',
    apartamento: 'Torre B - Apto 302',
    aceptoLey1581: true,
    avatarUrl: null,
  },
  {
    id: 'usr-adm-01',
    nombre: 'Carlos Mendoza (Administrador)',
    correo: 'admin@doorway.com',
    pinesValidos: ['1234', 'admin'],
    alias: ['admin@doorway.app', 'admin', 'administrador', 'carlos'],
    rol: 'admin',
    apartamento: 'Administración General',
    aceptoLey1581: true,
    avatarUrl: null,
  },
];

export class RepositorioAuthHibrido implements IAuthRepository {
  async iniciarSesion(correoOApartamento: string, pin: string): Promise<UsuarioSesion> {
    const entrada = correoOApartamento.trim().toLowerCase();
    const pinLimpio = pin.trim();

    if (!entrada || !pinLimpio) {
      throw new Error('Ingresa tu correo o unidad y tu PIN de acceso.');
    }

    const esAdminEntrada =
      entrada === 'admin' ||
      entrada === 'admin@doorway.com' ||
      entrada.includes('administrador') ||
      entrada.includes('mendoza');

    if (esAdminEntrada && (pinLimpio === '1234' || pinLimpio.toLowerCase() === 'admin')) {
      // 1. Intentar validar admin en Supabase
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('correo', 'admin@doorway.com')
          .eq('pin_acceso', '1234')
          .single();

        if (!error && data) {
          const sesionAdmin: UsuarioSesion = {
            id: data.id,
            nombre: data.nombre,
            correo: data.correo,
            rol: data.rol as RolUsuario,
            apartamento: data.apartamento,
            aceptoLey1581: Boolean(data.acepto_ley1581),
            avatarUrl: null,
          };
          await guardarSesionEnSqlite(sesionAdmin);
          return sesionAdmin;
        }
      } catch {}

      // Fallback offline admin
      const adminSeed = USUARIOS_SEMILLA_LOCAL[1];
      const sesionAdminSeed: UsuarioSesion = {
        id: adminSeed.id,
        nombre: adminSeed.nombre,
        correo: adminSeed.correo,
        rol: adminSeed.rol,
        apartamento: adminSeed.apartamento,
        aceptoLey1581: adminSeed.aceptoLey1581,
        avatarUrl: null,
      };
      await guardarSesionEnSqlite(sesionAdminSeed);
      return sesionAdminSeed;
    }

    // 2. Para residentes/clientes: buscar en Supabase primero
    try {
      let query = supabase.from('usuarios').select('*').eq('pin_acceso', pinLimpio);

      if (entrada.includes('@')) {
        query = query.eq('correo', entrada);
      } else {
        query = query.or(`apartamento.ilike.%${entrada}%,correo.ilike.%${entrada}%`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const fila = data[0];
        // Consultar si tiene avatar local guardado
        const localUser = await dbLocal.buscarUsuarioRegistrado(fila.correo, pinLimpio);
        const sesion: UsuarioSesion = {
          id: fila.id,
          nombre: fila.nombre,
          correo: fila.correo,
          rol: fila.rol as RolUsuario,
          apartamento: fila.apartamento,
          aceptoLey1581: Boolean(fila.acepto_ley1581),
          avatarUrl: localUser?.avatarUrl || null,
        };

        await guardarSesionEnSqlite(sesion);
        await dbLocal.guardarUsuarioRegistrado({
          id: fila.id,
          nombre: fila.nombre,
          correo: fila.correo,
          pin_acceso: pinLimpio,
          rol: fila.rol,
          apartamento: fila.apartamento,
          acepto_ley1581: fila.acepto_ley1581,
          avatarUrl: sesion.avatarUrl,
        });

        return sesion;
      }
    } catch {
      // Si la red falla o está offline, continúa al respaldo local
    }

    // 3. Respaldo en SQLite para usuarios registrados localmente
    const local = await dbLocal.buscarUsuarioRegistrado(entrada, pinLimpio);
    if (local) {
      const sesionLocal: UsuarioSesion = {
        id: local.id,
        nombre: local.nombre,
        correo: local.correo,
        rol: local.rol as RolUsuario,
        apartamento: local.apartamento,
        aceptoLey1581: Boolean(local.acepto_ley1581),
        avatarUrl: local.avatarUrl || null,
      };
      await guardarSesionEnSqlite(sesionLocal);
      return sesionLocal;
    }

    // 4. Semilla de residente oficial de demostración (Doña Martha)
    const seedResidente = USUARIOS_SEMILLA_LOCAL[0];
    const matchSeed =
      (seedResidente.correo.toLowerCase() === entrada ||
        seedResidente.alias.some((a) => a.toLowerCase() === entrada) ||
        entrada === '302' ||
        entrada.includes('martha')) &&
      seedResidente.pinesValidos.includes(pinLimpio);

    if (matchSeed) {
      const sesionSeed: UsuarioSesion = {
        id: seedResidente.id,
        nombre: seedResidente.nombre,
        correo: seedResidente.correo,
        rol: seedResidente.rol,
        apartamento: seedResidente.apartamento,
        aceptoLey1581: seedResidente.aceptoLey1581,
        avatarUrl: null,
      };
      await guardarSesionEnSqlite(sesionSeed);
      return sesionSeed;
    }

    throw new Error('Credenciales incorrectas. Verifica tu correo o unidad y el PIN de acceso.');
  }

  async registrarResidente(datos: {
    nombre: string;
    correo: string;
    pin: string;
    apartamento: string;
  }): Promise<UsuarioSesion> {
    const nombre = datos.nombre.trim();
    const correo = datos.correo.trim().toLowerCase();
    const pin = datos.pin.trim();
    const apartamento = datos.apartamento.trim();

    if (!nombre || nombre.length < 3) {
      throw new Error('Por favor ingresa tu nombre completo.');
    }
    if (!apartamento || apartamento.length < 2) {
      throw new Error('Por favor ingresa tu número de apartamento o unidad (ej: Torre A - 204).');
    }
    if (!correo || !correo.includes('@') || !correo.includes('.')) {
      throw new Error('Por favor ingresa un correo electrónico válido.');
    }
    if (!pin || pin.length < 4) {
      throw new Error('El PIN de acceso debe tener mínimo 4 dígitos.');
    }

    const nuevoId = `usr-${Date.now()}`;

    // 1. Guardar en Supabase (tabla usuarios)
    let idFinal = nuevoId;
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          {
            id: nuevoId,
            nombre,
            correo,
            pin_acceso: pin,
            rol: 'residente',
            apartamento,
            acepto_ley1581: false,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        idFinal = data.id;
      }
    } catch (err) {
      console.warn('Registro en Supabase advertencia (se mantendrá en local):', err);
    }

    // 2. Guardar en SQLite local para acceso offline garantizado
    await dbLocal.guardarUsuarioRegistrado({
      id: idFinal,
      nombre,
      correo,
      pin_acceso: pin,
      rol: 'residente',
      apartamento,
      acepto_ley1581: false,
      avatarUrl: null,
    });

    // 3. Crear sesión activa en SQLite
    const nuevaSesion: UsuarioSesion = {
      id: idFinal,
      nombre,
      correo,
      rol: 'residente',
      apartamento,
      aceptoLey1581: false,
      avatarUrl: null,
    };

    await guardarSesionEnSqlite(nuevaSesion);
    return nuevaSesion;
  }

  async actualizarPin(idUsuario: string, pinActual: string, nuevoPin: string): Promise<void> {
    if (!nuevoPin || nuevoPin.trim().length < 4) {
      throw new Error('El nuevo PIN debe tener al menos 4 dígitos.');
    }

    // Actualizar en Supabase
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ pin_acceso: nuevoPin.trim() })
        .eq('id', idUsuario);

      if (error) {
        console.warn('Error al actualizar PIN en Supabase:', error);
      }
    } catch {}

    // Actualizar en SQLite local
    await dbLocal.actualizarPinUsuario(idUsuario, nuevoPin.trim());
  }

  async actualizarAvatar(idUsuario: string, uriFoto: string): Promise<UsuarioSesion> {
    await dbLocal.actualizarAvatarUsuario(idUsuario, uriFoto);
    const sesionActual = await leerSesionDeSqlite();
    if (!sesionActual) {
      throw new Error('No hay sesión activa para actualizar foto.');
    }
    const actualizada: UsuarioSesion = {
      ...sesionActual,
      avatarUrl: uriFoto,
    };
    await guardarSesionEnSqlite(actualizada);
    return actualizada;
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
