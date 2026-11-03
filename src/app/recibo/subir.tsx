// src/app/recibo/subir.tsx — Autor: Said Alexander Pacheco Moncada (HU-01 #1)
import React from 'react';
import { View, Text, TextInput, Pressable, Image, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSubirComprobante } from '../../hooks/useSubirComprobante';
import { useRecibos } from '../../hooks/RecibosContext';
import { COLORES } from '../../theme/tema';

export default function SubirComprobanteScreen() {
  const { idRecibo } = useLocalSearchParams<{ idRecibo?: string }>();
  const router = useRouter();
  const { cargar } = useRecibos();
  const idObjetivo = idRecibo || 'rec-01';

  // Este hook contiene toda la lógica de la cámara y el guardado en el repositorio
  const { referencia, setReferencia, foto, avisoValidacion, guardando, capturarConCamara, enviarSoporte } =
    useSubirComprobante(idObjetivo, async () => {
      await cargar(); // Recarga la lista para mostrar el nuevo estado "En validación"
      router.back();  // Vuelve al detalle del recibo
    });

  return (
    <ScrollView style={ estilos.contenedor } contentContainerStyle={{ padding: 20 }}>
      <Text style={ estilos.titulo }>Subir soporte de pago</Text>
      <Text style={ estilos.sub }>Recibo asociado: {idObjetivo}</Text>

      <Text style={ estilos.label }>1. Número de referencia o aprobación bancaria</Text>
      <TextInput
        value={referencia}
        onChangeText={setReferencia}
        placeholder="Ej. NEQUI-849201 o PSE-33190"
        style={ estilos.input }
      />

      <Text style={ estilos.label }>2. Fotografía del comprobante (Cámara o Galería)</Text>
      <Pressable onPress={capturarConCamara} style={ estilos.btnSecundario }>
        <Text style={ estilos.btnSecTexto }>{foto ? 'Cambiar fotografía' : 'Tomar foto del comprobante'}</Text>
      </Pressable>

      {foto && (
        <View style={ estilos.previewBox }>
          <Image source={{ uri: foto.uriLocal }} style={ estilos.previewImg } />
          <Text style={ estilos.metaFoto }>Comprimida automáticamente (~{foto.pesoAproxKb} KB)</Text>
        </View>
      )}

      {avisoValidacion && (
        <View style={ estilos.alertaBox }>
          <Text style={ estilos.alertaTexto }>{avisoValidacion}</Text>
        </View>
      )}

      <Pressable onPress={enviarSoporte} disabled={guardando} style={ estilos.btnPrimario }>
        <Text style={ estilos.btnPrimTexto }>{guardando ? 'Enviando soporte...' : 'Enviar comprobante'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },
  titulo: { fontSize: 21, fontWeight: '800', color: COLORES.primario },
  sub: { fontSize: 14, color: COLORES.textoGris, marginBottom: 16 },
  label: { fontSize: 15, fontWeight: '700', color: COLORES.textoOscuro, marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 14, fontSize: 16 },
  btnSecundario: { backgroundColor: COLORES.secundario, padding: 15, borderRadius: 10, alignItems: 'center', minHeight: 48 },
  btnSecTexto: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  previewBox: { marginTop: 14, alignItems: 'center' },
  previewImg: { width: 220, height: 260, borderRadius: 10 },
  metaFoto: { fontSize: 13, color: COLORES.textoGris, marginTop: 6 },
  alertaBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginTop: 14 },
  alertaTexto: { color: '#991B1B', fontWeight: '600', fontSize: 14 },
  btnPrimario: { backgroundColor: COLORES.primario, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 22, minHeight: 50 },
  btnPrimTexto: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});