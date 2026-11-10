// src/components/BannerMora.tsx — Autora: Margit Dayanna Barrera Gutiérrez (HU-02 #2)
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORES } from '../theme/tema';

interface Props {
  mensaje: string;
  alIrACartera: () => void;
}

export function BannerMora({ mensaje, alIrACartera }: Props) {
  return (
    <View style={estilos.banner} accessibilityRole="alert">
      <Text style={estilos.titulo}>⚠️ Reserva bloqueada por mora activa (HU-02)</Text>
      <Text style={estilos.descripcion}>{mensaje}</Text>
      <Pressable
        onPress={alIrACartera}
        accessibilityRole="button"
        accessibilityLabel="Ir a mi estado de cuenta para ponerme al día"
        style={estilos.boton}
      >
        <Text style={estilos.botonTexto}>Ver mi estado de cuenta · Ponerse al día aquí</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  banner: {
    backgroundColor: COLORES.moraFondo,
    borderWidth: 1.5,
    borderColor: COLORES.moraTexto,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  titulo: { fontSize: 16, fontWeight: '800', color: COLORES.moraTexto, marginBottom: 6 },
  descripcion: { fontSize: 14, color: COLORES.textoOscuro, lineHeight: 20, marginBottom: 12 },
  boton: {
    backgroundColor: COLORES.moraTexto,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonTexto: { color: COLORES.blanco, fontSize: 14, fontWeight: '700' },
});