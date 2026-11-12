import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../hooks/AuthContext';
import { RecibosProvider } from '../hooks/RecibosContext';
import { COLORES } from '../theme/tema';

function NavegacionProtegida() {
  const { usuarioActual, cargandoSesion } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (cargandoSesion) return;
    const enLogin = segments[0] === 'login';
    if (!usuarioActual && !enLogin) {
      router.replace('/login');
    }
  }, [usuarioActual, cargandoSesion, segments]);

  if (cargandoSesion) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORES.fondo }}>
        <ActivityIndicator size="large" color={COLORES.primario} />
      </View>
    );
  }

  return (
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
        options={{ title: 'DoorWay · Cartera', headerShown: false }}
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
        name="perfil"
        options={{ 
          title: 'Mi Perfil',
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
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RecibosProvider>
        <NavegacionProtegida />
      </RecibosProvider>
    </AuthProvider>
  );
}