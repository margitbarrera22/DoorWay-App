// src/app/login.tsx — Adaptación UX/UI: Margit Barrera
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { iniciarSesion, errorAuth, limpiarErrorAuth } = useAuth();
  const [correo, setCorreo] = useState('');
  const [pin, setPin] = useState('');
  const [cargando, setCargando] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const handleLogin = async () => {
    if (!correo || !pin) {
      Alert.alert('Error', 'Por favor ingresa correo y PIN');
      return;
    }
    limpiarErrorAuth();
    setCargando(true);
    const ok = await iniciarSesion(correo, pin);
    setCargando(false);
    if (ok) {
      router.replace('/');
    }
    // Si falla, errorAuth se muestra en pantalla automáticamente
  };

  // Accesos rápidos demo
  const loginRapido = (tipo: 'residente' | 'admin') => {
    if (tipo === 'residente') {
      setCorreo('martha.gomez@doorway.app');
      setPin('1234');
    } else {
      setCorreo('admin@doorway.app');
      setPin('admin');
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0F2540" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={estilos.contenedor}>
      {/* Logo y Branding */}
      <View style={estilos.header}>
        <View style={estilos.logoContainer}>
          <Ionicons name="shield-checkmark" size={64} color="#0F2540" />
          <Text style={estilos.tituloApp}>DoorWay</Text>
          <Text style={estilos.subtituloApp}>Sistema de Gestión de Copropiedad</Text>
        </View>
      </View>

      {/* Formulario de Login */}
      <View style={estilos.formContainer}>
        <Text style={estilos.formTitulo}>Iniciar Sesión</Text>
        
        <View style={estilos.inputGroup}>
          <Text style={estilos.label}>Correo Electrónico</Text>
          <View style={estilos.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
            <TextInput
              style={estilos.input}
              value={correo}
              onChangeText={setCorreo}
              placeholder="tu@email.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={estilos.inputGroup}>
          <Text style={estilos.label}>PIN de Acceso</Text>
          <View style={estilos.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
            <TextInput
              style={estilos.input}
              value={pin}
              onChangeText={setPin}
              placeholder="••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
            />
          </View>
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={cargando}
          style={[estilos.btnLogin, cargando && estilos.btnLoginDeshabilitado]}
          accessibilityRole="button"
          accessibilityLabel="Iniciar sesión"
        >
          {cargando ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={estilos.btnLoginTexto}>Ingresar</Text>
          )}
        </Pressable>

        {errorAuth ? (
          <Text style={estilos.textoError}>{errorAuth}</Text>
        ) : null}

        <Text style={estilos.olvideContrasena}>¿Olvidaste tu contraseña?</Text>
      </View>

      {/* Accesos Rápidos Demo */}
      <View style={estilos.demoContainer}>
        <Text style={estilos.demoTitulo}>Accesos Rápidos (Demo)</Text>
        
        <View style={estilos.filaDemo}>
          <Pressable
            onPress={() => loginRapido('residente')}
            style={estilos.btnDemo}
            accessibilityRole="button"
            accessibilityLabel="Acceso rápido como residente Doña Martha"
          >
            <Ionicons name="person" size={24} color="#0F2540" style={{ marginBottom: 8 }} />
            <Text style={estilos.btnDemoTitulo}>Doña Martha</Text>
            <Text style={estilos.btnDemoSub}>Residente</Text>
          </Pressable>

          <Pressable
            onPress={() => loginRapido('admin')}
            style={[estilos.btnDemo, estilos.btnDemoAdmin]}
            accessibilityRole="button"
            accessibilityLabel="Acceso rápido como administrador"
          >
            <Ionicons name="shield-checkmark" size={24} color="#FFF" style={{ marginBottom: 8 }} />
            <Text style={[estilos.btnDemoTitulo, estilos.btnDemoTituloAdmin]}>Carlos Mendoza</Text>
            <Text style={[estilos.btnDemoSub, estilos.btnDemoSubAdmin]}>Administrador</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingTop: 100,
    paddingBottom: 40,
  },
  logoContainer: { alignItems: 'center' },
  tituloApp: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F2540',
    marginTop: 16,
    fontFamily: 'Inter_900Black',
  },
  subtituloApp: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  
  formContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F2540',
    marginBottom: 28,
    textAlign: 'center',
    fontFamily: 'Inter_800ExtraBold',
  },
  
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F2540',
    fontFamily: 'Inter_500Medium',
  },
  
  btnLogin: {
    backgroundColor: '#0F2540',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 56,
    elevation: 2,
  },
  btnLoginDeshabilitado: { backgroundColor: '#CBD5E1', elevation: 0 },
  btnLoginTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
  textoError: {
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  
  olvideContrasena: {
    textAlign: 'center',
    color: '#0F2540',
    fontSize: 14,
    marginTop: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },

  demoContainer: {
    backgroundColor: '#FFF',
    padding: 24,
    marginTop: 2,
  },
  demoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  filaDemo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  btnDemo: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 120,
    justifyContent: 'center',
  },
  btnDemoAdmin: {
    backgroundColor: '#0F2540',
    borderColor: '#0F2540',
  },
  btnDemoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2540',
    marginTop: 4,
    fontFamily: 'Inter_700Bold',
  },
  btnDemoTituloAdmin: {
    color: '#FFF',
  },
  btnDemoSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  btnDemoSubAdmin: {
    color: '#94A3B8',
  },
});