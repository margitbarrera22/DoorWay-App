// src/components/SelectorBloques.tsx — Autora: Margit Dayanna Barrera Gutiérrez (HU-05 #5)
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BloqueHorario, Reserva } from '../domain/modelos';
import { COLORES } from '../theme/tema';

const BLOQUES_OFICIALES: BloqueHorario[] = ['09:00 - 13:00', '14:00 - 18:00', '19:00 - 23:00'];

interface Props {
  reservasDelDia: Reserva[];
  bloqueSeleccionado: BloqueHorario | null;
  alSeleccionarBloque: (bloque: BloqueHorario) => void;
  deshabilitadoPorMora: boolean;
}

export function SelectorBloques({
  reservasDelDia,
  bloqueSeleccionado,
  alSeleccionarBloque,
  deshabilitadoPorMora,
}: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.subtitulo}>Franjas horarias (Verde = Libre · Rojo = Ocupado)</Text>
      {BLOQUES_OFICIALES.map((bloque) => {
        const reservaOcupada = reservasDelDia.find(
          (r) => r.bloqueHorario === bloque && r.estado === 'Confirmada'
        );
        const ocupado = Boolean(reservaOcupada);
        const seleccionado = bloqueSeleccionado === bloque;

        let bg = COLORES.pagadoFondo; // Verde claro disponible
        let borde = COLORES.pagadoTexto;
        let colorTexto = COLORES.pagadoTexto;
        let etiquetaEstado = 'DISPONIBLE';

        if (ocupado) {
          bg = COLORES.moraFondo; // Rojo claro ocupado
          borde = COLORES.moraTexto;
          colorTexto = COLORES.moraTexto;
          etiquetaEstado = `OCUPADO (${reservaOcupada?.apartamento})`;
        } else if (seleccionado) {
          bg = COLORES.primario;
          borde = COLORES.primario;
          colorTexto = COLORES.blanco;
          etiquetaEstado = 'SELECCIONADO ✓';
        }

        return (
          <Pressable
            key={bloque}
            disabled={ocupado || deshabilitadoPorMora}
            onPress={() => alSeleccionarBloque(bloque)}
            accessibilityRole="button"
            style={[estilos.bloqueCard, { backgroundColor: bg, borderColor: borde }]}
          >
            <Text style={[estilos.horaTexto, { color: colorTexto }]}>🕒 {bloque}</Text>
            <Text style={[estilos.estadoTexto, { color: colorTexto }]}>{etiquetaEstado}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginTop: 12 },
  subtitulo: { fontSize: 15, fontWeight: '700', color: COLORES.textoOscuro, marginBottom: 10 },
  bloqueCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horaTexto: { fontSize: 16, fontWeight: '800' },
  estadoTexto: { fontSize: 13, fontWeight: '700' },
});