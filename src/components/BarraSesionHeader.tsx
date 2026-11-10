// src/components/BarraSesionHeader.tsx — Autores: Margit Dayanna Barrera Gutiérrez & Michel Daniela Bayona Díaz
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/AuthContext';
import { COLORES } from '../theme/tema';

export function BarraSesionHeader() {
  const { usuarioActual, cerrarSesion } = useAuth();

  if (!usuarioActual) return null;

  const esAdmin = usuarioActual.rol === 'admin';

  return (
    <View style={estilos.barraRol}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={estilos.subtituloRol}>
          {esAdmin ? 'SESIÓN ADMINISTRATIVA ACTIVA' : 'SESIÓN RESIDENTE ACTIVA'}
        </Text>
        <Text style={estilos.textoRol} numberOfLines={1}>
          {esAdmin
            ? `🛡️ ${usuarioActual.nombre}`
            : `👤 ${usuarioActual.nombre} (${usuarioActual.apartamento})`}
        </Text>
      </View>
      <Pressable
        onPress={cerrarSesion}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión actual y volver al inicio de sesión"
        style={estilos.btnSalir}
      >
        <Text style={estilos.btnSalirTexto}>Salir</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  barraRol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EEF2F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  subtituloRol: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.textoGris,
    letterSpacing: 0.8,
  },
  textoRol: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.primario,
    marginTop: 2,
  },
  btnSalir: {
    backgroundColor: COLORES.primario,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSalirTexto: {
    color: COLORES.blanco,
    fontWeight: '800',
    fontSize: 13,
  },
});

