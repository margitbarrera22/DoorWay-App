// src/app/reservas.tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-05 #5 y HU-02 #2)
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecibos } from '../hooks/RecibosContext';
import { AreaComun, BloqueHorario } from '../domain/modelos';
import { evaluarDerechoAReservar } from '../domain/reglasNegocio';
import { COLORES } from '../theme/tema';

const AREAS: AreaComun[] = ['Salón Social', 'Kiosco BBQ'];
const FECHAS_DEMO = ['2026-11-15', '2026-11-16', '2026-11-17'];
const BLOQUES_OFICIALES: BloqueHorario[] = ['09:00 - 13:00', '14:00 - 18:00', '19:00 - 23:00'];

export default function PantallaReservas() {
  const router = useRouter();
  const { recibos } = useRecibos();
  const veredictoMora = evaluarDerechoAReservar(recibos);

  const [area, setArea] = useState<AreaComun>('Salón Social');
  const [fecha, setFecha] = useState<string>(FECHAS_DEMO[0]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<BloqueHorario | null>(null);

  // Semilla visual de demostración para el Día 1 (Salón Social ocupado en la tarde del 15)
  const estaOcupado = (b: BloqueHorario) => {
    return area === 'Salón Social' && fecha === '2026-11-15' && b === '14:00 - 18:00';
  };

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      {/* 1. Alerta de Bloqueo por Mora Activa (HU-02) */}
      {!veredictoMora.permitido && (
        <View style={estilos.bannerMora} accessibilityRole="alert">
          <Text style={estilos.bannerMoraTitulo}>⚠️ Reserva Bloqueada por Mora Activa (HU-02)</Text>
          <Text style={estilos.bannerMoraDesc}>{veredictoMora.motivoBloqueo}</Text>
          <Pressable
            onPress={() => router.push('/')}
            accessibilityRole="button"
            accessibilityLabel="Ir a cartera para ponerse al día"
            style={estilos.btnIrACartera}
          >
            <Text style={estilos.btnIrACarteraTexto}>💳 Ver Cartera · Ponerse al Día</Text>
          </Pressable>
        </View>
      )}

      {veredictoMora.permitido && (
        <View style={estilos.bannerAlDia}>
          <Text style={estilos.bannerAlDiaTexto}>
            ✅ ¡Estás al día! Tienes habilitado el sistema de reservas de áreas comunes.
          </Text>
        </View>
      )}

      {/* 2. Selector de Área Común */}
      <Text style={estilos.seccionTitulo}>1. Selecciona el Área Común</Text>
      <View style={estilos.filaChips}>
        {AREAS.map((item) => {
          const activo = area === item;
          return (
            <Pressable
              key={item}
              onPress={() => {
                setArea(item);
                setBloqueSeleccionado(null);
              }}
              accessibilityRole="button"
              style={[estilos.chip, activo && estilos.chipActivo]}
            >
              <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
                {item === 'Salón Social' ? '🎉 ' : '🍖 '}
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 3. Selector de Fecha */}
      <Text style={estilos.seccionTitulo}>2. Selecciona la Fecha del Evento</Text>
      <View style={estilos.filaChips}>
        {FECHAS_DEMO.map((f) => {
          const activo = fecha === f;
          return (
            <Pressable
              key={f}
              onPress={() => {
                setFecha(f);
                setBloqueSeleccionado(null);
              }}
              accessibilityRole="button"
              style={[estilos.chip, activo && estilos.chipActivo]}
            >
              <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>📅 {f}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* 4. Calendario Cromático de Bloques Horarios */}
      <Text style={estilos.seccionTitulo}>3. Franjas Horarias Disponibles</Text>
      <Text style={estilos.seccionSubtitulo}>
        Verde = Disponible · Rojo = Ocupado · Azul = Tu selección
      </Text>

      {BLOQUES_OFICIALES.map((bloque) => {
        const ocupado = estaOcupado(bloque);
        const seleccionado = bloqueSeleccionado === bloque;
        const deshabilitado = ocupado || !veredictoMora.permitido;

        let bg = COLORES.pagadoFondo;
        let borde = COLORES.pagadoTexto;
        let textoColor = COLORES.pagadoTexto;
        let etiqueta = 'DISPONIBLE';

        if (ocupado) {
          bg = COLORES.moraFondo;
          borde = COLORES.moraTexto;
          textoColor = COLORES.moraTexto;
          etiqueta = 'OCUPADO (Torre A - Apto 104)';
        } else if (seleccionado) {
          bg = COLORES.primario;
          borde = COLORES.primario;
          textoColor = COLORES.blanco;
          etiqueta = 'SELECCIONADO ✓';
        }

        return (
          <Pressable
            key={bloque}
            disabled={deshabilitado}
            onPress={() => setBloqueSeleccionado(bloque)}
            accessibilityRole="button"
            style={[
              estilos.bloqueCard,
              { backgroundColor: bg, borderColor: borde },
              deshabilitado && !ocupado && { opacity: 0.5 },
            ]}
          >
            <Text style={[estilos.bloqueHora, { color: textoColor }]}>🕒 {bloque}</Text>
            <Text style={[estilos.bloqueEstado, { color: textoColor }]}>{etiqueta}</Text>
          </Pressable>
        );
      })}

      {/* 5. Botón de Confirmación */}
      <Pressable
        disabled={!veredictoMora.permitido || !bloqueSeleccionado}
        style={[
          estilos.btnConfirmar,
          (!veredictoMora.permitido || !bloqueSeleccionado) && estilos.btnConfirmarDeshabilitado,
        ]}
      >
        <Text style={estilos.btnConfirmarTexto}>
          {bloqueSeleccionado
            ? `Confirmar Reserva: ${area} (${bloqueSeleccionado})`
            : 'Selecciona una franja disponible'}
        </Text>
      </Pressable>

      <Text style={estilos.notaPie}>
        * Integración backend en Supabase y generación de ticket digital en desarrollo (Sprint 2 - Días 2 y 3).
      </Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },
  bannerMora: {
    backgroundColor: COLORES.moraFondo,
    borderWidth: 1.5,
    borderColor: COLORES.moraTexto,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  bannerMoraTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.moraTexto,
    marginBottom: 6,
  },
  bannerMoraDesc: {
    fontSize: 14,
    color: COLORES.textoOscuro,
    lineHeight: 20,
    marginBottom: 12,
  },
  btnIrACartera: {
    backgroundColor: COLORES.moraTexto,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  btnIrACarteraTexto: {
    color: COLORES.blanco,
    fontWeight: '800',
    fontSize: 14,
  },
  bannerAlDia: {
    backgroundColor: COLORES.pagadoFondo,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  bannerAlDiaTexto: {
    color: COLORES.pagadoTexto,
    fontSize: 13,
    fontWeight: '700',
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.primario,
    marginTop: 10,
    marginBottom: 8,
  },
  seccionSubtitulo: {
    fontSize: 12,
    color: COLORES.textoGris,
    marginBottom: 12,
  },
  filaChips: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  chipActivo: {
    backgroundColor: COLORES.primario,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.textoOscuro,
  },
  chipTextoActivo: {
    color: COLORES.blanco,
  },
  bloqueCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bloqueHora: {
    fontSize: 15,
    fontWeight: '800',
  },
  bloqueEstado: {
    fontSize: 12,
    fontWeight: '800',
  },
  btnConfirmar: {
    backgroundColor: COLORES.secundario,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
    minHeight: 52,
    elevation: 3,
  },
  btnConfirmarDeshabilitado: {
    opacity: 0.45,
  },
  btnConfirmarTexto: {
    color: COLORES.blanco,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  notaPie: {
    marginTop: 18,
    fontSize: 11,
    color: COLORES.textoGris,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
