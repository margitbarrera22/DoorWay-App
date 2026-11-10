// src/components/BarraNavegacionModulos.tsx — Autores: Margit Dayanna Barrera Gutiérrez & Michel Daniela Bayona Díaz
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORES } from '../theme/tema';

export function BarraNavegacionModulos() {
  const router = useRouter();
  const rutaActual = usePathname();

  const pestañas = [
    { titulo: '💳 Cartera', ruta: '/' },
    { titulo: '📅 Reservas', ruta: '/reservas' },
    { titulo: '📢 Comunidad', ruta: '/comunidad' },
  ];

  return (
    <View style={estilos.contenedor}>
      {pestañas.map((p) => {
        const activa = rutaActual === p.ruta;
        return (
          <Pressable
            key={p.ruta}
            onPress={() => router.push(p.ruta as any)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            style={[estilos.tab, activa && estilos.tabActiva]}
          >
            <Text style={[estilos.texto, activa && estilos.textoActivo]}>{p.titulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tabActiva: { backgroundColor: COLORES.primario },
  texto: { fontSize: 13, fontWeight: '800', color: COLORES.textoOscuro },
  textoActivo: { color: COLORES.blanco },
});

