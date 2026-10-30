// src/hooks/RecibosContext.tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-03 y HU-04)
import React, { createContext, useContext, useState } from 'react';

export type EstadoVista = 'cargando' | 'vacio' | 'error' | 'conDatos';

interface ContextoRecibosType {
  recibos: any[];
  estadoVista: EstadoVista;
  mensajeError: string;
  modoAdmin: boolean;
  alternarModoAdmin: () => void;
  cargar: () => Promise<void>;
  conciliar: (id: string, estado: any, obs?: string) => Promise<void>;
}

const RecibosContext = createContext<ContextoRecibosType | null>(null);

export function RecibosProvider({ children }: { children: React.ReactNode }) {
  const [recibos, setRecibos] = useState<any[]>([]);
  const [estadoVista, setEstadoVista] = useState<EstadoVista>('cargando');
  const [mensajeError, setMensajeError] = useState('');
  const [modoAdmin, setModoAdmin] = useState(false);

  async function cargar() {
    // Se completará en Día 2 con RepositorioRecibos
  }

  async function conciliar(id: string, nuevoEstado: any, obs?: string) {
    // Se completará en Día 2 con RepositorioRecibos
  }

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
