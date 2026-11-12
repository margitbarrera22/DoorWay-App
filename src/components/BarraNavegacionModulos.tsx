// src/components/BarraNavegacionModulos.tsx — UX/UI: Margit Barrera
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export function BarraNavegacionModulos() {
  const router = useRouter();
  const rutaActual = usePathname();
  const insets = useSafeAreaInsets();

  const pestañas = [
    { titulo: 'Inicio', icono: 'home', ruta: '/inicio' },
    { titulo: 'Cartera', icono: 'wallet', ruta: '/' },
    { titulo: 'Reservas', icono: 'calendar', ruta: '/reservas' },
    { titulo: 'Avisos', icono: 'notifications', ruta: '/comunidad' },
  ];

  return (
    <View style={[estilos.contenedor, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {pestañas.map((p) => {
        const activa = rutaActual === p.ruta;
        const iconoNombre = activa ? p.icono : `${p.icono}-outline`;
        return (
          <Pressable
            key={p.titulo}
            onPress={() => router.push(p.ruta as any)}
            accessibilityRole="tab"
            accessibilityLabel={`Ir a ${p.titulo}`}
            style={estilos.tab}
          >
            <Ionicons
              name={iconoNombre as any}
              size={24}
              color={activa ? '#0F2540' : '#94A3B8'}
            />
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 56,
  },
  texto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  textoActivo: {
    color: '#0F2540',
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});