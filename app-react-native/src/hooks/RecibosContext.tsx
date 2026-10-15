// src/hooks/RecibosContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ReciboPago } from '../domain/recibo';
import { Escenario, repositorioSimulado } from '../data/repositorioSimulado';

export type EstadoUi = 'cargando' | 'listo' | 'vacio' | 'error';

interface RecibosViewModelType {
  estado: EstadoUi;
  recibos: ReciboPago[];
  escenarioActual: Escenario;
  cargar: () => Promise<void>;
  cambiarEscenario: (nuevo: Escenario) => void;
  buscarPorId: (id: string) => ReciboPago | undefined;
}

const RecibosContext = createContext<RecibosViewModelType | undefined>(undefined);

export function RecibosProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<EstadoUi>('cargando');
  const [recibos, setRecibos] = useState<ReciboPago[]>([]);
  const [escenarioActual, setEscenarioActual] = useState<Escenario>(repositorioSimulado.escenario);

  const peticionEnCurso = useRef<boolean>(false);
  const idPeticionRef = useRef<number>(0);

  const cargar = useCallback(async () => {
    if (peticionEnCurso.current && repositorioSimulado.escenario !== 'cargando') {
      return;
    }

    peticionEnCurso.current = true;
    const idActual = ++idPeticionRef.current;
    setEstado('cargando');

    try {
      const datos = await repositorioSimulado.obtenerTodos();
      if (idActual !== idPeticionRef.current) return;

      if (datos.length === 0) {
        setRecibos([]);
        setEstado('vacio');
      } else {
        setRecibos(datos);
        setEstado('listo');
      }
    } catch {
      if (idActual !== idPeticionRef.current) return;
      setEstado('error');
    } finally {
      if (idActual === idPeticionRef.current) {
        peticionEnCurso.current = false;
      }
    }
  }, []);

  const cambiarEscenario = useCallback((nuevo: Escenario) => {
    peticionEnCurso.current = false;
    repositorioSimulado.escenario = nuevo;
    setEscenarioActual(nuevo);
    cargar();
  }, [cargar]);

  const buscarPorId = useCallback(
    (id: string) => recibos.find((item) => item.id === id),
    [recibos]
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <RecibosContext.Provider
      value={{ estado, recibos, escenarioActual, cargar, cambiarEscenario, buscarPorId }}
    >
      {children}
    </RecibosContext.Provider>
  );
}

export function useRecibosViewModel(): RecibosViewModelType {
  const context = useContext(RecibosContext);
  if (!context) {
    throw new Error('useRecibosViewModel debe usarse dentro de un RecibosProvider');
  }
  return context;
}
