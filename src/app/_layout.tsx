import React, { useEffect } from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '../hooks/AuthContext';
import { RecibosProvider } from '../hooks/RecibosContext';
import { COLORES } from '../theme/tema';

function PantallaCargaInicial() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2540' }}>
      <Image
        source={require('../../assets/adaptive-icon.png')}
        style={{ width: 130, height: 130, marginBottom: 24 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}

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
    return <PantallaCargaInicial />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: COLORES.primario },
        headerTintColor: COLORES.blanco,
        headerTitleStyle: { fontWeight: '800', fontSize: 17 },
        contentStyle: { backgroundColor: COLORES.fondo },
        animation: 'none',
        animationDuration: 0,
        presentation: 'card',
      }}
    >
      <Stack.Screen
        name="inicio"
        options={{ title: 'DoorWay · Inicio', animation: 'none' }}
      />
      <Stack.Screen
        name="cartera"
        options={{ title: 'DoorWay · Cartera y Facturación', animation: 'none' }}
      />
      <Stack.Screen
        name="reservas"
        options={{ title: 'Reservar Área Común (HU-05)', animation: 'none' }}
      />
      <Stack.Screen
        name="comunidad"
        options={{ title: 'Cartelera y Emergencias (HU-08/11)', animation: 'none' }}
      />
      <Stack.Screen
        name="perfil"
        options={{ title: 'Mi Perfil', animation: 'none' }}
      />
      <Stack.Screen
        name="index"
        options={{ title: 'DoorWay', animation: 'none' }}
      />
      <Stack.Screen
        name="login"
        options={{ title: 'Iniciar Sesión', animation: 'none' }}
      />
      <Stack.Screen
        name="recibo/[id]"
        options={{ title: 'Detalle del Recibo', animation: 'none' }}
      />
      <Stack.Screen
        name="recibo/subir"
        options={{ title: 'Subir Comprobante de Pago', animation: 'none' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return <PantallaCargaInicial />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RecibosProvider>
          <NavegacionProtegida />
        </RecibosProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}