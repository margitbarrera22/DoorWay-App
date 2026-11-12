// src/app/recibo/subir.tsx — Con cámara funcional y banner elegante | Margit Barrera
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { useRecibos } from '../../hooks/RecibosContext';
import { RepositorioRecibosHibrido } from '../../data/RepositorioRecibos';

const repoRecibos = new RepositorioRecibosHibrido();

export default function SubirComprobante() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; idRecibo?: string }>();
  const idObjetivo = params.id || params.idRecibo || 'rec-01';
  const { recibos, cargar } = useRecibos();
  const reciboActual = recibos.find((r) => r.id === idObjetivo);

  const [referencia, setReferencia] = useState(reciboActual?.referenciaBancaria || '');
  const [foto, setFoto] = useState<string | null>(reciboActual?.comprobanteUrl || null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  React.useEffect(() => {
    if (reciboActual) {
      if (reciboActual.referenciaBancaria && !referencia) {
        setReferencia(reciboActual.referenciaBancaria);
      }
      if (reciboActual.comprobanteUrl && !foto) {
        setFoto(reciboActual.comprobanteUrl);
      }
    }
  }, [reciboActual]);

  const tomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setErrorValidacion('Se requiere permiso para usar la cámara.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFoto(result.assets[0].uri);
        setErrorValidacion(null);
      }
    } catch (e: any) {
      setErrorValidacion(e?.message || 'Error al abrir la cámara.');
    }
  };

  const seleccionarGaleria = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setErrorValidacion('Se requiere permiso para acceder a la galería.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFoto(result.assets[0].uri);
        setErrorValidacion(null);
      }
    } catch (e: any) {
      setErrorValidacion(e?.message || 'Error al abrir la galería.');
    }
  };

  /**
   * Copia la imagen desde el URI temporal (cámara/galería) al directorio de documentos
   * del app, que es persistente y siempre accesible incluso entre sesiones.
   */
  const copiarADirectorioPersistente = async (uriOrigen: string): Promise<string> => {
    try {
      const nombre = `soporte_${Date.now()}.jpg`;
      const destino = `${FileSystem.documentDirectory}soportes/${nombre}`;
      // Crear la carpeta si no existe
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}soportes`, { intermediates: true });
      await FileSystem.copyAsync({ from: uriOrigen, to: destino });
      return destino;
    } catch {
      // Si falla la copia, usa el URI original (funciona al menos para esta sesión)
      return uriOrigen;
    }
  };

  const handleEnviar = async () => {
    if (guardando) return;
    if (!referencia || referencia.trim().length < 4) {
      setErrorValidacion('Ingresa el número o código de referencia bancaria (mínimo 4 caracteres).');
      return;
    }
    if (!foto) {
      setErrorValidacion('Falta adjuntar la fotografía del comprobante de pago.');
      return;
    }

    setGuardando(true);
    setErrorValidacion(null);

    try {
      let uriFinal = foto;
      // Solo copiar a documentos persistentes si es un archivo local nuevo (file:// o content://)
      if (!foto.startsWith('http://') && !foto.startsWith('https://')) {
        uriFinal = await copiarADirectorioPersistente(foto);
      }
      await repoRecibos.subirComprobante(idObjetivo, referencia.trim(), uriFinal);
      await cargar();
      // Volver directamente a la pantalla de detalle sin esperar
      router.back();
    } catch (err: any) {
      setErrorValidacion(err?.message || 'No se pudo guardar el comprobante. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  const periodoTexto = reciboActual ? `${reciboActual.periodo} · ${reciboActual.apartamento}` : `Recibo #${idObjetivo}`;
  const montoTexto = reciboActual ? `$${reciboActual.monto.toLocaleString('es-CO')} COP` : '$185.000 COP';

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={estilos.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={estilos.btnBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={estilos.headerTitle}>Subir comprobante</Text>
          <Text style={estilos.headerSub}>{periodoTexto}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={estilos.content}>
        <Text style={estilos.titulo}>Registra tu pago</Text>
        <Text style={estilos.subtitulo}>
          Ingresa la referencia bancaria y adjunta la foto legible del comprobante ({montoTexto}).
        </Text>

        <Text style={estilos.label}>Número o código de referencia bancaria</Text>
        <TextInput
          style={estilos.input}
          value={referencia}
          onChangeText={(txt) => {
            setReferencia(txt);
            if (errorValidacion) setErrorValidacion(null);
          }}
          placeholder="Ej: NEQUI-984120 o 0087145632"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
        />

        <View style={estilos.filaBotonesFoto}>
          <Pressable
            onPress={tomarFoto}
            style={estilos.btnCamara}
            accessibilityRole="button"
            accessibilityLabel="Tomar foto con la cámara"
          >
            <Ionicons name="camera" size={20} color="#0F2540" style={{ marginRight: 8 }} />
            <Text style={estilos.textoBtnCamara}>Cámara</Text>
          </Pressable>

          <Pressable
            onPress={seleccionarGaleria}
            style={estilos.btnGaleria}
            accessibilityRole="button"
            accessibilityLabel="Seleccionar foto de la galería"
          >
            <Ionicons name="images" size={20} color="#0F2540" style={{ marginRight: 8 }} />
            <Text style={estilos.textoBtnGaleria}>Galería</Text>
          </Pressable>
        </View>

        {foto ? (
          <View style={estilos.cajaPreview}>
            <Image source={{ uri: foto }} style={estilos.imagenPreview} />
            <Pressable onPress={() => setFoto(null)} style={estilos.btnQuitarFoto}>
              <Ionicons name="close-circle" size={28} color="#991B1B" />
            </Pressable>
          </View>
        ) : (
          <View style={estilos.cajaPreview}>
            <Ionicons name="image-outline" size={38} color="#94A3B8" style={{ marginBottom: 10, opacity: 0.6 }} />
            <Text style={estilos.textoPreview}>Sin fotografía adjunta</Text>
            <Text style={estilos.textoPreviewSub}>Toma una foto del voucher o el soporte digital</Text>
          </View>
        )}

        {errorValidacion && (
          <View style={estilos.alertaError}>
            <Ionicons name="alert-circle" size={20} color="#991B1B" style={{ marginRight: 8 }} />
            <Text style={estilos.textoAlerta}>{errorValidacion}</Text>
          </View>
        )}

        <Text style={estilos.footerText}>
          Al enviar, el recibo cambiará inmediatamente a estado "En validación" en el sistema.
        </Text>

        <Pressable
          style={[estilos.btnEnviar, guardando && { opacity: 0.7 }]}
          onPress={handleEnviar}
          disabled={guardando}
          accessibilityRole="button"
          accessibilityLabel="Enviar soporte de pago"
        >
          {guardando ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={estilos.textoBtnEnviar}>Enviar soporte</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#0F2540',
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnBack: { padding: 8, minHeight: 44, justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  headerSub: { color: '#94A3B8', fontSize: 12, marginTop: 2, fontFamily: 'Inter_500Medium' },
  content: { padding: 24 },
  titulo: { fontSize: 24, fontWeight: '900', color: '#0F2540', marginBottom: 10, fontFamily: 'Inter_900Black' },
  subtitulo: { fontSize: 14, color: '#64748B', lineHeight: 22, marginBottom: 28, fontFamily: 'Inter_500Medium' },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 10, fontFamily: 'Inter_700Bold' },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#0F2540',
    marginBottom: 20,
    minHeight: 52,
    fontFamily: 'Inter_500Medium',
  },
  filaBotonesFoto: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  btnCamara: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 52,
  },
  btnGaleria: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 52,
  },
  textoBtnCamara: { color: '#0F2540', fontWeight: '700', fontSize: 15, fontFamily: 'Inter_700Bold' },
  textoBtnGaleria: { color: '#0F2540', fontWeight: '700', fontSize: 15, fontFamily: 'Inter_700Bold' },
  cajaPreview: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginBottom: 20,
    minHeight: 180,
    position: 'relative',
  },
  imagenPreview: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  btnQuitarFoto: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 2,
    elevation: 2,
  },
  textoPreview: { color: '#64748B', fontWeight: '600', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  textoPreviewSub: { color: '#94A3B8', fontSize: 12, marginTop: 6, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  alertaError: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoAlerta: { color: '#991B1B', fontWeight: '600', fontSize: 14, flex: 1, fontFamily: 'Inter_600SemiBold' },
  footerText: { textAlign: 'center', color: '#94A3B8', fontSize: 13, marginBottom: 16, fontFamily: 'Inter_500Medium', lineHeight: 18 },
  btnEnviar: {
    backgroundColor: '#0F2540',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    minHeight: 56,
    elevation: 3,
  },
  textoBtnEnviar: { color: '#FFF', fontWeight: '800', fontSize: 16, fontFamily: 'Inter_800ExtraBold' },
  exitoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
  },
  exitoCirculo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#166534',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
  },
  exitoTitulo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2540',
    marginBottom: 8,
    fontFamily: 'Inter_800ExtraBold',
  },
  exitoSubtitulo: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter_500Medium',
  },
  exitoNota: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: 'Inter_500Medium',
  },
});