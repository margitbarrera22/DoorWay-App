// src/hooks/RecibosContext.tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-03 y HU-04)
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Recibo, EstadoRecibo } from '../domain/modelos';
import { IRecibosRepository } from '../data/contratos';
import { DbLocalSqliteRepository } from '../data/dbLocalSqlite';

export type EstadoVista = 'cargando' | 'vacio' | 'error' | 'conDatos';

export interface ContextoRecibosType {
  recibos: Recibo[];
  estadoVista: EstadoVista;
  mensajeError: string;
  modoAdmin: boolean;
  alternarModoAdmin: () => void;
  cargar: () => Promise<void>;
  conciliar: (id: string, estado: EstadoRecibo, obs?: string) => Promise<void>;
}

const RecibosContext = createContext<ContextoRecibosType | null>(null);
const repositorioPorDefecto: IRecibosRepository = new DbLocalSqliteRepository();

export interface RecibosProviderProps {
  children: React.ReactNode;
  repositorio?: IRecibosRepository;
}

export function RecibosProvider({ children, repositorio = repositorioPorDefecto }: RecibosProviderProps) {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('cargando');
  const [mensajeError, setMensajeError] = useState('');
  const [modoAdmin, setModoAdmin] = useState(false);
  const peticionEnCurso = useRef(false);

  async function cargar() {
    if (peticionEnCurso.current) return;
    peticionEnCurso.current = true;
    setEstadoVista('cargando');
    try {
      const lista = await repositorio.obtenerTodos();
      setRecibos(lista);
      setEstadoVista(lista.length === 0 ? 'vacio' : 'conDatos');
    } catch (e: any) {
      setMensajeError(e?.message || 'No pudimos leer tus recibos de administración');
      setEstadoVista('error');
    } finally {
      peticionEnCurso.current = false;
    }
  }

  async function conciliar(id: string, nuevoEstado: EstadoRecibo, obs?: string) {
    try {
      await repositorio.conciliarReciboAdmin(id, nuevoEstado, obs);
      await cargar();
    } catch (e: any) {
      setMensajeError(e?.message || 'Error al conciliar el recibo');
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <RecibosContext.Provider
      value={{
        recibos,
        estadoVista,
        mensajeError,
        modoAdmin,
        alternarModoAdmin: () => setModoAdmin(!modoAdmin),
        cargar,
        conciliar,
      }}
    >
      {children}
    </RecibosContext.Provider>
  );
}

export function useRecibos() {
  const ctx = useContext(RecibosContext);
  if (!ctx) throw new Error('useRecibos debe usarse dentro de RecibosProvider');
  return ctx;
}
