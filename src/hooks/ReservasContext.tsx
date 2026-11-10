// src/hooks/ReservasContext.tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-05 #5, HU-02 #2 y HU-06 #6)
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AreaComun, BloqueHorario, Reserva } from '../domain/modelos';
import {
  evaluarDerechoAReservar,
  puedeCancelarCon24h,
  VeredictoPermisoReserva,
} from '../domain/reglasNegocio';
import { IReservasRepository } from '../data/contratos';
import { RepositorioReservasSupabase } from '../data/RepositorioReservas';
import { compartirTicketWhatsApp } from '../data/compartirTicketWhatsApp';
import { useRecibos } from './RecibosContext';

export const FECHAS_DEMO_RESERVAS = ['2026-11-15', '2026-11-16', '2026-11-17'];

export interface ReservasContextType {
  area: AreaComun;
  setArea: (nuevaArea: AreaComun) => void;
  fecha: string;
  setFecha: (nuevaFecha: string) => void;
  bloqueSeleccionado: BloqueHorario | null;
  setBloqueSeleccionado: (bloque: BloqueHorario | null) => void;
  reservasDelDia: Reserva[];
  ticketConfirmado: Reserva | null;
  cerrarTicket: () => void;
  mensajeFeedback: string | null;
  avisoCancelacion: string | null;
  cargandoDisponibilidad: boolean;
  guardando: boolean;
  cancelando: boolean;
  veredictoMora: VeredictoPermisoReserva;
  cargarDisponibilidad: () => Promise<void>;
  confirmarReserva: (apartamento?: string) => Promise<void>;
  intentarCancelar: (reserva: Reserva) => Promise<void>;
  compartirTicketPorWhatsApp: (reserva: Reserva) => Promise<void>;
}

const ReservasContext = createContext<ReservasContextType | null>(null);
const repositorioPorDefecto: IReservasRepository = new RepositorioReservasSupabase();

export interface ReservasProviderProps {
  children: React.ReactNode;
  repositorio?: IReservasRepository;
}

export function ReservasProvider({
  children,
  repositorio = repositorioPorDefecto,
}: ReservasProviderProps) {
  const { recibos } = useRecibos();
  const veredictoMora = evaluarDerechoAReservar(recibos);

  const [area, setAreaState] = useState<AreaComun>('Salón Social');
  const [fecha, setFechaState] = useState<string>(FECHAS_DEMO_RESERVAS[0]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<BloqueHorario | null>(null);
  const [reservasDelDia, setReservasDelDia] = useState<Reserva[]>([]);
  const [ticketConfirmado, setTicketConfirmado] = useState<Reserva | null>(null);
  const [mensajeFeedback, setMensajeFeedback] = useState<string | null>(null);
  const [avisoCancelacion, setAvisoCancelacion] = useState<string | null>(null);
  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [cancelando, setCancelando] = useState<boolean>(false);

  const peticionEnCurso = useRef(false);

  async function cargarDisponibilidad() {
    setCargandoDisponibilidad(true);
    try {
      const lista = await repositorio.obtenerPorAreaYFecha(area, fecha);
      setReservasDelDia(lista);
    } catch (e: any) {
      setMensajeFeedback(e?.message || 'Error al consultar la disponibilidad del calendario.');
    } finally {
      setCargandoDisponibilidad(false);
    }
  }

  useEffect(() => {
    setBloqueSeleccionado(null);
    setMensajeFeedback(null);
    setAvisoCancelacion(null);
    cargarDisponibilidad();
  }, [area, fecha]);

  function setArea(nuevaArea: AreaComun) {
    setAreaState(nuevaArea);
  }

  function setFecha(nuevaFecha: string) {
    setFechaState(nuevaFecha);
  }

  async function confirmarReserva(apartamento = 'Torre B - Apto 302') {
    if (!veredictoMora.permitido || !bloqueSeleccionado || peticionEnCurso.current) return;
    peticionEnCurso.current = true;
    setGuardando(true);
    setMensajeFeedback(null);
    setAvisoCancelacion(null);

    try {
      const nueva = await repositorio.crearReserva(
        apartamento,
        area,
        fecha,
        bloqueSeleccionado
      );
      setTicketConfirmado(nueva);
      setBloqueSeleccionado(null);
      await cargarDisponibilidad();
    } catch (e: any) {
      setMensajeFeedback(e?.message || 'No se pudo completar la reserva.');
    } finally {
      setGuardando(false);
      peticionEnCurso.current = false;
    }
  }

  async function intentarCancelar(reserva: Reserva) {
    if (cancelando) return;
    setAvisoCancelacion(null);
    setMensajeFeedback(null);

    const evaluacion = puedeCancelarCon24h(reserva.fecha, reserva.bloqueHorario);
    if (!evaluacion.puedeCancelar) {
      setAvisoCancelacion(evaluacion.mensaje);
      return;
    }

    setCancelando(true);
    try {
      await repositorio.cancelarReserva(reserva.id);
      setAvisoCancelacion('Reserva cancelada con éxito (>24h). El turno quedó libre para otros vecinos.');
      await cargarDisponibilidad();
    } catch (e: any) {
      setAvisoCancelacion(e?.message || 'No se pudo cancelar la reserva.');
    } finally {
      setCancelando(false);
    }
  }

  async function compartirTicketPorWhatsApp(reserva: Reserva) {
    await compartirTicketWhatsApp(reserva);
  }

  return (
    <ReservasContext.Provider
      value={{
        area,
        setArea,
        fecha,
        setFecha,
        bloqueSeleccionado,
        setBloqueSeleccionado,
        reservasDelDia,
        ticketConfirmado,
        cerrarTicket: () => setTicketConfirmado(null),
        mensajeFeedback,
        avisoCancelacion,
        cargandoDisponibilidad,
        guardando,
        cancelando,
        veredictoMora,
        cargarDisponibilidad,
        confirmarReserva,
        intentarCancelar,
        compartirTicketPorWhatsApp,
      }}
    >
      {children}
    </ReservasContext.Provider>
  );
}

export function useReservas() {
  const ctx = useContext(ReservasContext);
  if (!ctx) {
    throw new Error('useReservas debe usarse dentro de un ReservasProvider');
  }
  return ctx;
}
