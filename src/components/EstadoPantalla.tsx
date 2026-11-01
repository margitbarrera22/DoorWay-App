// src/components/EstadoPantalla.tsx — Autora: Margit Dayanna Barrera Gutiérrez
import React from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { COLORES } from '../theme/tema';

interface Props {
  tipo: 'cargando' | 'vacio' | 'error';
  mensaje?: string;
  textoBoton?: string;
  alPresionarBoton?: () => void;
}

export function EstadoPantalla({ tipo, mensaje, textoBoton, alPresionarBoton }: Props) {
  if (tipo === 'cargando') {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={COLORES.secundario} />
        <Text style={estilos.titulo}>Consultando tus recibos de administración...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.centro}>
      <Text style={estilos.titulo}>
        {tipo === 'error'
          ? (mensaje || 'No pudimos leer tus recibos de administración')
          : (mensaje || 'Aún no tienes recibos registrados')}
      </Text>
      {textoBoton && alPresionarBoton && (
        <Pressable
          onPress={alPresionarBoton}
          accessibilityRole="button"
          style={estilos.boton}
        >
          <Text style={estilos.botonTexto}>{textoBoton}</Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  titulo: { fontSize: 17, fontWeight: '600', color: COLORES.textoOscuro, textAlign: 'center', marginTop: 12, marginBottom: 20 },
  boton: { backgroundColor: COLORES.primario, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10, minHeight: 48, justifyContent: 'center' },
  botonTexto: { color: COLORES.blanco, fontSize: 16, fontWeight: '700' },
});