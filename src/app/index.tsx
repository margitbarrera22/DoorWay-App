// src/app/index.tsx — Autor: Wilfran Leonardo Betancourt Ardila (TEC-01 #13)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PantallaEstadoCuenta() {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>DoorWay-App</Text>
      <Text style={estilos.subtitulo}>Estado de cuenta y recibos</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F2540',
  },
  subtitulo: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
});
