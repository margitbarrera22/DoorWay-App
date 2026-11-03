// src/hooks/useSubirComprobante.ts — Autor: Said Alexander Pacheco Moncada (HU-01 #1)
import { useState } from 'react';
import { ServicioCamaraExpo } from '../data/ServicioCamaraExpo';
import { RepositorioRecibosHibrido } from '../data/RepositorioRecibos';
import { ResultadoFoto } from '../domain/modelos';

const servicioCamara = new ServicioCamaraExpo();
const repositorio = new RepositorioRecibosHibrido();

export function useSubirComprobante(idRecibo: string, alTerminarExito: () => void) {
  const [referencia, setReferencia] = useState('');
  const [foto, setFoto] = useState<ResultadoFoto | null>(null);
  const [avisoValidacion, setAvisoValidacion] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function capturarConCamara() {
    try {
      setAvisoValidacion(null);
      const resultado = await servicioCamara.tomarFotoComprimida();
      if (resultado) setFoto(resultado);
    } catch (e: any) {
      setAvisoValidacion(e?.message || 'No se pudo abrir la cámara');
    }
  }

  async function enviarSoporte() {
    if (guardando) return;
    if (!foto) {
      setAvisoValidacion('Falta adjuntar la fotografía del comprobante de pago.');
      return;
    }
    if (!referencia || referencia.trim().length < 4) {
      setAvisoValidacion('Escribe el número de referencia bancaria (mínimo 4 caracteres).');
      return;
    }
    setGuardando(true);
    setAvisoValidacion(null);
    try {
      await repositorio.subirComprobante(idRecibo, referencia, foto.uriLocal);
      alTerminarExito();
    } catch (e: any) {
      setAvisoValidacion(e?.message || 'Error al guardar el comprobante. Tus datos siguen en pantalla.');
    } finally {
      setGuardando(false);
    }
  }

  return { referencia, setReferencia, foto, avisoValidacion, guardando, capturarConCamara, enviarSoporte };
}