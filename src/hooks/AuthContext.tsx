// src/hooks/AuthContext.tsx — Autores: Wilfran Leonardo Betancourt Ardila & Said Alexander Pacheco Moncada (Elemento Transversal #2 · Login y Sesión SQLite)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UsuarioSesion } from '../domain/modelos';
import { IAuthRepository } from '../data/contratos';
import { RepositorioAuthHibrido } from '../data/RepositorioAuth';

export interface AuthContextType {
  usuarioActual: UsuarioSesion | null;
  estaAutenticado: boolean;
  cargandoSesion: boolean;
  errorAuth: string | null;
  iniciarSesion: (correo: string, pin: string) => Promise<boolean>;
  aceptarLey1581: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
  limpiarErrorAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const repositorioPorDefecto: IAuthRepository = new RepositorioAuthHibrido();

export interface AuthProviderProps {
  children: React.ReactNode;
  repositorio?: IAuthRepository;
}

export function AuthProvider({ children, repositorio = repositorioPorDefecto }: AuthProviderProps) {
  const [usuarioActual, setUsuarioActual] = useState<UsuarioSesion | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;
    async function restaurarSesionLocal() {
      try {
        const sesionGuardada = await repositorio.obtenerSesionActivaLocal();
        if (montado && sesionGuardada) {
          setUsuarioActual(sesionGuardada);
        }
      } catch {
        // Si no existe sesión previa en SQLite, continúa sin sesión activa
      } finally {
        if (montado) {
          setCargandoSesion(false);
        }
      }
    }
    restaurarSesionLocal();
    return () => {
      montado = false;
    };
  }, [repositorio]);

  async function iniciarSesion(correo: string, pin: string): Promise<boolean> {
    setErrorAuth(null);
    try {
      const sesion = await repositorio.iniciarSesion(correo, pin);
      setUsuarioActual(sesion);
      return true;
    } catch (e: any) {
      setErrorAuth(e?.message || 'No fue posible iniciar sesión. Verifica tus datos.');
      return false;
    }
  }

  async function aceptarLey1581(): Promise<void> {
    if (!usuarioActual) return;
    try {
      const actualizada = await repositorio.registrarAceptacionLey1581(usuarioActual.id);
      setUsuarioActual(actualizada);
    } catch (e: any) {
      setErrorAuth(e?.message || 'No se pudo registrar la aceptación de privacidad.');
    }
  }

  async function cerrarSesion(): Promise<void> {
    setErrorAuth(null);
    await repositorio.cerrarSesion();
    setUsuarioActual(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuarioActual,
        estaAutenticado: usuarioActual !== null,
        cargandoSesion,
        errorAuth,
        iniciarSesion,
        aceptarLey1581,
        cerrarSesion,
        limpiarErrorAuth: () => setErrorAuth(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return ctx;
}
