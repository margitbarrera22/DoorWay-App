import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../hooks/AuthContext';
import { RecibosProvider } from '../hooks/RecibosContext';
import { COLORES } from '../theme/tema';

export default function RootLayout() {
  return (
    <AuthProvider>
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
            name="inicio"
            options={{ title: 'DoorWay · Inicio', headerShown: false }}
          />
          <Stack.Screen
            name="login"
            options={{ title: 'Iniciar Sesión', headerShown: false }}
          />
          <Stack.Screen
            name="recibo/[id]"
            options={{ 
              title: 'Detalle del Recibo',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="recibo/subir"
            options={{ 
              title: 'Subir Comprobante de Pago',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="reservas"
            options={{ 
              title: 'Reservar Área Común (HU-05)',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="comunidad"
            options={{ 
              title: 'Cartelera y Emergencias (HU-08/11)',
              headerShown: false
            }}
          />
        </Stack>
      </RecibosProvider>
    </AuthProvider>
  );
}