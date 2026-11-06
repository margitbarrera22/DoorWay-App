// src/app/_layout.tsx — Autor: Wilfran Leonardo Betancourt Ardila (TEC-01 #13)
import React from 'react';
import { Stack } from 'expo-router';
import { RecibosProvider } from '../hooks/RecibosContext';
import { COLORES } from '../theme/tema';

export default function RootLayout() {
  return (
    <RecibosProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORES.primario },
          headerTintColor: COLORES.blanco,
          headerTitleStyle: { fontWeight: '800', fontSize: 17 },
          contentStyle: { backgroundColor: COLORES.fondo },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'DoorWay · Cartera y Módulos' }}
        />
        <Stack.Screen
          name="recibo/[id]"
          options={{ title: 'Detalle del Recibo' }}
        />
        <Stack.Screen
          name="recibo/subir"
          options={{ title: 'Subir Comprobante de Pago' }}
        />
        <Stack.Screen
          name="reservas"
          options={{ title: 'Reservar Área Común (HU-05)' }}
        />
        <Stack.Screen
          name="comunidad"
          options={{ title: 'Cartelera y Emergencias (HU-08/11)' }}
        />
      </Stack>
    </RecibosProvider>
  );
}
