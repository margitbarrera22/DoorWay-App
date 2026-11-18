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
    { titulo: 'Cartera', icono: 'wallet', ruta: '/cartera' },
    { titulo: 'Reservas', icono: 'calendar', ruta: '/reservas' },
    { titulo: 'Avisos', icono: 'notifications', ruta: '/comunidad' },
    { titulo: 'Perfil', icono: 'person-circle', ruta: '/perfil' },
  ];

  return (
    <View style={[estilos.contenedor, { paddingBottom: Math.max(insets.bottom, 18) + 6 }]}>
      {pestañas.map((p) => {
        const activa = rutaActual === p.ruta || (p.ruta === '/inicio' && rutaActual === '/');
        const iconoNombre = activa ? p.icono : `${p.icono}-outline`;
        return (
          <Pressable
            key={p.titulo}
            onPress={() => {
              if (rutaActual !== p.ruta) {
                router.navigate(p.ruta as any);
              }
            }}
            accessibilityRole="tab"
            accessibilityLabel={`Ir a ${p.titulo}`}
            style={estilos.tab}
          >
            <Ionicons
              name={iconoNombre as any}
              size={22}
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
    paddingTop: 6,
    elevation: 10,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 50,
  },
  texto: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  textoActivo: {
    color: '#0F2540',
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
