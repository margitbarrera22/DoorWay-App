import React from 'react';
import { Stack } from 'expo-router';
import { RecibosProvider } from '../hooks/RecibosContext';

export default function RootLayout() {
  return (
    <RecibosProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="recibo/[id]"
          options={{
            headerShown: true,
            title: 'Detalle del recibo',
            headerStyle: { backgroundColor: '#1E293B' },
            headerTintColor: '#FFFFFF',
          }}
        />
      </Stack>
    </RecibosProvider>
  );
}
