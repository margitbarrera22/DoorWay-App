// src/app/login.tsx — Adaptación UX/UI: Margit Barrera & Wilfran Betancourt
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { iniciarSesion, registrarResidente, errorAuth, limpiarErrorAuth } = useAuth();

  // Modo: 'login' o 'registro' (exclusivo para residentes)
  const [modo, setModo] = useState<'login' | 'registro'>('login');

  // Campos Login
  const [correo, setCorreo] = useState('');
  const [pin, setPin] = useState('');

  // Campos Registro de Residente
  const [regNombre, setRegNombre] = useState('');
  const [regApto, setRegApto] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regPinConfirm, setRegPinConfirm] = useState('');

  const [cargando, setCargando] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  const handleLogin = async () => {
    if (!correo.trim() || !pin.trim()) {
      Alert.alert('Datos requeridos', 'Por favor ingresa tu correo (o unidad) y PIN de acceso');
      return;
    }
    limpiarErrorAuth();
    setCargando(true);
    const ok = await iniciarSesion(correo, pin);
    setCargando(false);
    if (ok) {
      router.replace('/');
    }
  };

  const handleRegistro = async () => {
    if (!regNombre.trim() || !regApto.trim() || !regCorreo.trim() || !regPin.trim()) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos del registro.');
      return;
    }
    if (!regCorreo.includes('@') || !regCorreo.includes('.')) {
      Alert.alert('Correo inválido', 'Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (regPin.trim().length < 4) {
      Alert.alert('PIN muy corto', 'El PIN de acceso debe tener al menos 4 dígitos.');
      return;
    }
    if (regPin.trim() !== regPinConfirm.trim()) {
      Alert.alert('Error de PIN', 'Los PIN de acceso no coinciden.');
      return;
    }

    limpiarErrorAuth();
    setCargando(true);
    const ok = await registrarResidente({
      nombre: regNombre.trim(),
      apartamento: regApto.trim(),
      correo: regCorreo.trim(),
      pin: regPin.trim(),
    });
    setCargando(false);

    if (ok) {
      Alert.alert('¡Registro exitoso!', 'Bienvenido a DoorWay. Tu cuenta ha sido creada.', [
        { text: 'Continuar', onPress: () => router.replace('/') },
      ]);
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0F2540" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ScrollView
        contentContainerStyle={[
          estilos.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 12,
            paddingBottom: Math.max(insets.bottom, 24) + 60,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Logo y Branding */}
        <View style={estilos.header}>
          <View style={estilos.logoContainer}>
            <Image
              source={require('../../assets/icon.png')}
              style={estilos.logoImagen}
              resizeMode="contain"
            />
            <Text style={estilos.tituloApp}>DoorWay</Text>
            <Text style={estilos.subtituloApp}>Gestión Integral de Copropiedad</Text>
          </View>
        </View>

        {/* Selector de modo Login / Registro */}
        <View style={estilos.tabsContenedor}>
          <Pressable
            onPress={() => {
              limpiarErrorAuth();
              setModo('login');
            }}
            style={[estilos.tabBoton, modo === 'login' && estilos.tabBotonActivo]}
            accessibilityRole="tab"
          >
            <Text style={[estilos.tabTexto, modo === 'login' && estilos.tabTextoActivo]}>
              Iniciar Sesión
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              limpiarErrorAuth();
              setModo('registro');
            }}
            style={[estilos.tabBoton, modo === 'registro' && estilos.tabBotonActivo]}
            accessibilityRole="tab"
          >
            <Text style={[estilos.tabTexto, modo === 'registro' && estilos.tabTextoActivo]}>
              Registro de Cliente
            </Text>
          </Pressable>
        </View>

        {/* ── FORMULARIO: INICIAR SESIÓN ── */}
        {modo === 'login' && (
          <View style={estilos.formContainer}>
            <Text style={estilos.formTitulo}>Acceso al Sistema</Text>
            <Text style={estilos.formSubtitulo}>
              Ingresa con tu correo o número de apartamento
            </Text>

            <View style={estilos.inputGroup}>
              <Text style={estilos.label}>Correo o Unidad</Text>
              <View style={estilos.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
                <TextInput
                  style={estilos.input}
                  value={correo}
                  onChangeText={setCorreo}
                  placeholder="ej. martha@doorway.com ó 302"
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
                  keyboardType="numeric"
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
              <View style={estilos.cajaError}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={estilos.textoError}>{errorAuth}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => {
                limpiarErrorAuth();
                setModo('registro');
              }}
              style={estilos.btnEnlaceSecundario}
            >
              <Text style={estilos.textoEnlace}>
                ¿Eres nuevo residente? <Text style={estilos.textoEnlaceDestacado}>Crea tu cuenta aquí</Text>
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── FORMULARIO: REGISTRO CLIENTES / RESIDENTES ── */}
        {modo === 'registro' && (
          <View style={estilos.formContainer}>
            <Text style={estilos.formTitulo}>Registro de Residente</Text>
            <Text style={estilos.formSubtitulo}>
              Crea tu perfil para gestionar tus pagos y reservar zonas comunes
            </Text>

            <View style={estilos.inputGroup}>
              <Text style={estilos.label}>Nombre Completo</Text>
              <View style={estilos.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
                <TextInput
                  style={estilos.input}
                  value={regNombre}
                  onChangeText={setRegNombre}
                  placeholder="Ej: Andrés Pérez"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={estilos.inputGroup}>
              <Text style={estilos.label}>Apartamento / Torre</Text>
              <View style={estilos.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
                <TextInput
                  style={estilos.input}
                  value={regApto}
                  onChangeText={setRegApto}
                  placeholder="Ej: Torre B - Apto 302"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={estilos.inputGroup}>
              <Text style={estilos.label}>Correo Electrónico</Text>
              <View style={estilos.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
                <TextInput
                  style={estilos.input}
                  value={regCorreo}
                  onChangeText={setRegCorreo}
                  placeholder="Ej: andres@correo.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={estilos.filaPins}>
              <View style={[estilos.inputGroup, { flex: 1 }]}>
                <Text style={estilos.label}>PIN (4 dígitos)</Text>
                <View style={estilos.inputContainer}>
                  <Ionicons name="key-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={estilos.input}
                    value={regPin}
                    onChangeText={setRegPin}
                    placeholder="••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </View>

              <View style={[estilos.inputGroup, { flex: 1 }]}>
                <Text style={estilos.label}>Confirmar PIN</Text>
                <View style={estilos.inputContainer}>
                  <Ionicons name="checkmark-done-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={estilos.input}
                    value={regPinConfirm}
                    onChangeText={setRegPinConfirm}
                    placeholder="••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </View>
            </View>

            <Pressable
              onPress={handleRegistro}
              disabled={cargando}
              style={[estilos.btnLogin, cargando && estilos.btnLoginDeshabilitado]}
              accessibilityRole="button"
              accessibilityLabel="Crear cuenta de residente"
            >
              {cargando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={estilos.btnLoginTexto}>Crear Cuenta de Residente</Text>
              )}
            </Pressable>

            {errorAuth ? (
              <View style={estilos.cajaError}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={estilos.textoError}>{errorAuth}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => {
                limpiarErrorAuth();
                setModo('login');
              }}
              style={estilos.btnEnlaceSecundario}
            >
              <Text style={estilos.textoEnlace}>
                ¿Ya tienes una cuenta? <Text style={estilos.textoEnlaceDestacado}>Inicia sesión</Text>
              </Text>
            </Pressable>
          </View>
        )}

        {/* Pie de pantalla corporativo */}
        <View style={estilos.footer}>
          <Text style={estilos.footerTexto}>
            DoorWay Condominium Suite · Seguro y en cumplimiento con Ley 1581
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: 24 },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingTop: 48,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoContainer: { alignItems: 'center' },
  logoImagen: {
    width: 76,
    height: 76,
    borderRadius: 18,
    marginBottom: 8,
  },
  tituloApp: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F2540',
    fontFamily: 'Inter_900Black',
  },
  subtituloApp: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },

  tabsContenedor: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 4,
  },
  tabBoton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBotonActivo: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Inter_600SemiBold',
  },
  tabTextoActivo: {
    color: '#0F2540',
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },

  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 24,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  formTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2540',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'Inter_800ExtraBold',
  },
  formSubtitulo: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter_500Medium',
  },

  inputGroup: { marginBottom: 16 },
  filaPins: { flexDirection: 'row', gap: 12 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    fontFamily: 'Inter_700Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F2540',
    fontFamily: 'Inter_500Medium',
  },

  btnLogin: {
    backgroundColor: '#0F2540',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 50,
    justifyContent: 'center',
    elevation: 2,
  },
  btnLoginDeshabilitado: { backgroundColor: '#CBD5E1', elevation: 0 },
  btnLoginTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
  cajaError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  textoError: {
    color: '#DC2626',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  btnEnlaceSecundario: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 8,
  },
  textoEnlace: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
  },
  textoEnlaceDestacado: {
    color: '#0F2540',
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  footerTexto: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
});
