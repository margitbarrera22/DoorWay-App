// src/app/perfil.tsx — Perfil de Usuario | UX/UI: Margit Barrera & Wilfran Betancourt
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/AuthContext';
import { BarraNavegacionModulos } from '../components/BarraNavegacionModulos';

export default function PantallaPerfil() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { usuarioActual, actualizarPin, actualizarAvatar, cerrarSesion } = useAuth();

  // Estados para cambio de PIN
  const [pinActual, setPinActual] = useState('');
  const [nuevoPin, setNuevoPin] = useState('');
  const [confirmarPin, setConfirmarPin] = useState('');
  const [guardandoPin, setGuardandoPin] = useState(false);
  const [mensajePin, setMensajePin] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Estados para foto
  const [cargandoFoto, setCargandoFoto] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  const cambiarFoto = async (origen: 'camara' | 'galeria') => {
    try {
      setCargandoFoto(true);
      let res;
      if (origen === 'camara') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se necesita permiso de cámara.');
          return;
        }
        res = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se necesita acceso a tus fotos.');
          return;
        }
        res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uriOriginal = res.assets[0].uri;
        await actualizarAvatar(uriOriginal);
        Alert.alert('¡Foto actualizada!', 'Tu foto de perfil se ha guardado correctamente.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No fue posible actualizar la foto de perfil.');
    } finally {
      setCargandoFoto(false);
    }
  };

  const seleccionarOpcionFoto = () => {
    Alert.alert('Foto de Perfil', 'Selecciona cómo deseas subir tu foto:', [
      { text: 'Tomar Foto', onPress: () => cambiarFoto('camara') },
      { text: 'Elegir de Galería', onPress: () => cambiarFoto('galeria') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleCambiarPin = async () => {
    setMensajePin(null);
    if (!pinActual.trim() || !nuevoPin.trim() || !confirmarPin.trim()) {
      setMensajePin({ tipo: 'error', texto: 'Por favor completa todos los campos de PIN.' });
      return;
    }
    if (nuevoPin.trim().length < 4) {
      setMensajePin({ tipo: 'error', texto: 'El nuevo PIN debe tener al menos 4 dígitos.' });
      return;
    }
    if (nuevoPin.trim() !== confirmarPin.trim()) {
      setMensajePin({ tipo: 'error', texto: 'El nuevo PIN y su confirmación no coinciden.' });
      return;
    }

    setGuardandoPin(true);
    const ok = await actualizarPin(pinActual.trim(), nuevoPin.trim());
    setGuardandoPin(false);

    if (ok) {
      setMensajePin({ tipo: 'ok', texto: '¡PIN de acceso actualizado con éxito!' });
      setPinActual('');
      setNuevoPin('');
      setConfirmarPin('');
      setTimeout(() => setMensajePin(null), 4000);
    } else {
      setMensajePin({ tipo: 'error', texto: 'No se pudo actualizar el PIN. Inténtalo de nuevo.' });
    }
  };

  const handleCerrarSesion = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await cerrarSesion();
          router.replace('/login');
        },
      },
    ]);
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0F2540" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  const esAdmin = usuarioActual?.rol === 'admin';

  return (
    <View style={estilos.contenedor}>
      {/* Header corporativo */}
      <View style={[estilos.header, { paddingTop: Math.max(insets.top, 24) + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver a la pantalla anterior"
          style={estilos.btnBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <View style={estilos.headerCenter}>
          <Text style={estilos.headerTitulo}>Mi Perfil</Text>
          <Text style={estilos.headerSub}>Configuración y Cuenta</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          estilos.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tarjeta de Avatar y Datos Principales */}
        <View style={estilos.cardPerfil}>
          <View style={estilos.avatarContainer}>
            {usuarioActual?.avatarUrl ? (
              <Image source={{ uri: usuarioActual.avatarUrl }} style={estilos.avatarImagen} />
            ) : (
              <View style={estilos.avatarPlaceholder}>
                <Ionicons name={esAdmin ? 'shield-checkmark' : 'person'} size={48} color="#0F2540" />
              </View>
            )}

            <Pressable
              onPress={seleccionarOpcionFoto}
              disabled={cargandoFoto}
              accessibilityRole="button"
              accessibilityLabel="Cambiar foto de perfil"
              style={estilos.btnEditarAvatar}
            >
              {cargandoFoto ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={18} color="#FFF" />
              )}
            </Pressable>
          </View>

          <Text style={estilos.nombreUsuario}>
            {usuarioActual?.nombre || 'Usuario DoorWay'}
          </Text>

          <View style={[estilos.badgeRol, esAdmin ? estilos.badgeRolAdmin : estilos.badgeRolResidente]}>
            <Ionicons
              name={esAdmin ? 'shield-checkmark' : 'home'}
              size={14}
              color={esAdmin ? '#FFF' : '#0F2540'}
              style={{ marginRight: 6 }}
            />
            <Text style={[estilos.badgeRolTexto, esAdmin ? estilos.badgeRolTextoAdmin : estilos.badgeRolTextoResidente]}>
              {esAdmin ? 'Administrador General' : 'Residente'}
            </Text>
          </View>

          <View style={estilos.separador} />

          {/* Información del usuario */}
          <View style={estilos.filaInfo}>
            <View style={estilos.iconoInfo}>
              <Ionicons name="mail-outline" size={18} color="#64748B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.labelInfo}>Correo Electrónico</Text>
              <Text style={estilos.valorInfo}>{usuarioActual?.correo || 'Sin correo'}</Text>
            </View>
          </View>

          <View style={estilos.filaInfo}>
            <View style={estilos.iconoInfo}>
              <Ionicons name="business-outline" size={18} color="#64748B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.labelInfo}>Apartamento / Unidad</Text>
              <Text style={estilos.valorInfo}>{usuarioActual?.apartamento || 'N/A'}</Text>
            </View>
          </View>

          <View style={estilos.filaInfo}>
            <View style={estilos.iconoInfo}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#166534" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.labelInfo}>Ley 1581 (Protección de Datos)</Text>
              <Text style={[estilos.valorInfo, { color: '#166534' }]}>Aceptada y Vigente</Text>
            </View>
          </View>
        </View>

        {/* Tarjeta de Cambio de PIN */}
        <View style={estilos.cardSeccion}>
          <View style={estilos.filaTituloSeccion}>
            <Ionicons name="key" size={20} color="#0F2540" style={{ marginRight: 8 }} />
            <Text style={estilos.tituloSeccion}>Seguridad y PIN de Acceso</Text>
          </View>
          <Text style={estilos.subtituloSeccion}>
            Actualiza tu PIN numérico de acceso para ingresar a la aplicación
          </Text>

          <View style={estilos.inputGroup}>
            <Text style={estilos.labelInput}>PIN Actual</Text>
            <TextInput
              style={estilos.input}
              value={pinActual}
              onChangeText={setPinActual}
              placeholder="••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <View style={estilos.filaPins}>
            <View style={[estilos.inputGroup, { flex: 1 }]}>
              <Text style={estilos.labelInput}>Nuevo PIN</Text>
              <TextInput
                style={estilos.input}
                value={nuevoPin}
                onChangeText={setNuevoPin}
                placeholder="••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            <View style={[estilos.inputGroup, { flex: 1 }]}>
              <Text style={estilos.labelInput}>Confirmar</Text>
              <TextInput
                style={estilos.input}
                value={confirmarPin}
                onChangeText={setConfirmarPin}
                placeholder="••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          {/* Ayuda: Si olvidó su PIN actual */}
          <Pressable
            onPress={() => {
              Alert.alert(
                '¿Olvidaste tu PIN actual?',
                'Si no recuerdas tu PIN actual, debes comunicarte con la administración general para que restablezcan tu clave de acceso:\n\n' +
                '👤 Administrador: Carlos Mendoza\n' +
                '🏢 Oficina: Portería / Administración\n' +
                '📞 Teléfono: 315 789 2341\n' +
                '✉️ Correo: admin@doorway.com',
                [
                  {
                    text: 'Llamar a Administración',
                    onPress: () => Linking.openURL('tel:3157892341'),
                  },
                  { text: 'Entendido', style: 'cancel' },
                ]
              );
            }}
            style={estilos.btnOlvidoPinPerfil}
            accessibilityRole="button"
            accessibilityLabel="¿Olvidaste tu PIN actual? Comunícate con el Administrador"
          >
            <Ionicons name="help-circle-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={estilos.textoOlvidoPinPerfil}>
              ¿No recuerdas tu PIN actual? <Text style={estilos.textoOlvidoPinPerfilDestacado}>Pídelo al Admin</Text>
            </Text>
          </Pressable>

          {mensajePin && (
            <View style={mensajePin.tipo === 'ok' ? estilos.cajaExito : estilos.cajaError}>
              <Ionicons
                name={mensajePin.tipo === 'ok' ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={mensajePin.tipo === 'ok' ? '#166534' : '#DC2626'}
                style={{ marginRight: 6 }}
              />
              <Text style={mensajePin.tipo === 'ok' ? estilos.textoExito : estilos.textoError}>
                {mensajePin.texto}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleCambiarPin}
            disabled={guardandoPin}
            style={[estilos.btnActualizarPin, guardandoPin && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Guardar nuevo PIN de acceso"
          >
            {guardandoPin ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={estilos.btnActualizarPinTexto}>Guardar Nuevo PIN</Text>
            )}
          </Pressable>
        </View>

        {/* Botón de Cerrar Sesión */}
        <Pressable
          onPress={handleCerrarSesion}
          style={estilos.btnCerrarSesion}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión actual"
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={estilos.btnCerrarSesionTexto}>Cerrar Sesión Activa</Text>
        </Pressable>
      </ScrollView>

      <BarraNavegacionModulos />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#0F2540',
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnBack: { padding: 8, minHeight: 44, justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitulo: { color: '#FFF', fontSize: 18, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  headerSub: { color: '#94A3B8', fontSize: 12, marginTop: 2, fontFamily: 'Inter_500Medium' },

  scrollContent: { padding: 20, paddingBottom: 40 },

  cardPerfil: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImagen: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#0F2540',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnEditarAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0F2540',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  nombreUsuario: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeRol: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeRolAdmin: { backgroundColor: '#0F2540' },
  badgeRolResidente: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  badgeRolTexto: { fontSize: 12, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  badgeRolTextoAdmin: { color: '#FFF' },
  badgeRolTextoResidente: { color: '#0F2540' },

  separador: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },

  filaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  iconoInfo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  labelInfo: { fontSize: 11, color: '#94A3B8', fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  valorInfo: { fontSize: 14, fontWeight: '700', color: '#1E293B', fontFamily: 'Inter_700Bold' },

  cardSeccion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 16,
  },
  filaTituloSeccion: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tituloSeccion: { fontSize: 16, fontWeight: '800', color: '#0F2540', fontFamily: 'Inter_800ExtraBold' },
  subtituloSeccion: { fontSize: 12, color: '#64748B', fontFamily: 'Inter_500Medium', marginBottom: 18 },

  inputGroup: { marginBottom: 14 },
  filaPins: { flexDirection: 'row', gap: 12 },
  labelInput: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, fontFamily: 'Inter_700Bold' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0F2540',
    minHeight: 48,
    fontFamily: 'Inter_500Medium',
  },

  btnActualizarPin: {
    backgroundColor: '#0F2540',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    minHeight: 48,
    justifyContent: 'center',
  },
  btnActualizarPinTexto: { color: '#FFF', fontSize: 14, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },

  cajaExito: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  textoExito: { color: '#166534', fontSize: 12, fontWeight: '700', fontFamily: 'Inter_700Bold', flex: 1 },
  cajaError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  textoError: { color: '#DC2626', fontSize: 12, fontWeight: '700', fontFamily: 'Inter_700Bold', flex: 1 },

  btnCerrarSesion: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    paddingVertical: 14,
    minHeight: 50,
  },
  btnCerrarSesionTexto: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
  btnOlvidoPinPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 4,
    paddingVertical: 6,
  },
  textoOlvidoPinPerfil: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
  },
  textoOlvidoPinPerfilDestacado: {
    color: '#0F2540',
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
