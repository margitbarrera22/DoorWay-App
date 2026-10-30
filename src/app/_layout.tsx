// src/app/_layout.tsx — Autor: Wilfran Leonardo Betancourt Ardila (TEC-01 #13)
import React from 'react';
import { Stack } from 'expo-router';
import { RecibosProvider } from '../hooks/RecibosContext';

export default function RootLayout() {
  return (
    <RecibosProvider>
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#0F2540' }, headerTintColor: '#FFFFFF' }}>
        <Stack.Screen name="index" options={{ title: 'Estado de cuenta y recibos' }} />
        <Stack.Screen name="recibo/[id]" options={{ title: 'Detalle del recibo' }} />
        <Stack.Screen name="recibo/subir" options={{ title: 'Subir comprobante de pago' }} />
      </Stack>
    </RecibosProvider>
  );
}
