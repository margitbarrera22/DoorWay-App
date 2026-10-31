import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { ServicioCamaraExpo } from '../data/ServicioCamaraExpo';

const servicioCamara = new ServicioCamaraExpo();

export default function DetalleReciboScreen({ route, navigation }) {
  const { recibo } = route.params || {};
  const [foto, setFoto] = useState(null);

  const handleTomarFoto = async () => {
    try {
      const resultado = await servicioCamara.tomarFotoComprimida();
      if (resultado) {
        setFoto(resultado);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener los permisos o capturar la foto.');
    }
  };

  const handleElegirGaleria = async () => {
    try {
      const resultado = await servicioCamara.elegirDeGaleriaComprimida();
      if (resultado) {
        setFoto(resultado);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen de la galería.');
    }
  };

  const handleSubirComprobante = () => {
    if (!foto) return;
    Alert.alert('¡Éxito!', `Comprobante cargado correctamente para el recibo #${recibo.id}`);
  };

  if (!recibo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró información del recibo.</Text>
        <Button title="Volver a la Lista" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Tarjeta de Información del Recibo */}
      <View style={styles.card}>
        <Text style={styles.label}>ID del Recibo:</Text>
        <Text style={styles.value}>{recibo.id}</Text>

        <Text style={styles.label}>Periodo / Concepto:</Text>
        <Text style={styles.value}>{recibo.periodo}</Text>

        <Text style={styles.label}>Monto a Pagar:</Text>
        <Text style={styles.value}>{recibo.monto}</Text>

        <Text style={styles.label}>Estado de Conciliación:</Text>
        <Text style={styles.value}>{recibo.estado}</Text>
      </View>

      {/* Sección del Comprobante / Cámara */}
      <Text style={styles.sectionTitle}>Adjuntar Comprobante de Pago</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.btnAction} onPress={handleTomarFoto}>
          <Text style={styles.btnActionText}>📷 Tomar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnAction, styles.btnSecondary]} onPress={handleElegirGaleria}>
          <Text style={[styles.btnActionText, styles.btnSecondaryText]}>🖼️ Galería</Text>
        </TouchableOpacity>
      </View>

      {/* Vista previa o Placeholder */}
      {foto ? (
        <View style={styles.previewCard}>
          <Image source={{ uri: foto.uriLocal }} style={styles.previewImage} />
          <View style={styles.infoBadge}>
            <Text style={styles.infoText}>Resolución: {foto.ancho} x {foto.alto} px</Text>
            <Text style={styles.infoText}>Peso aprox: ~{foto.pesoAproxKb} KB (JPEG)</Text>
          </View>
          <TouchableOpacity onPress={() => setFoto(null)} style={styles.btnRemove}>
            <Text style={styles.btnRemoveText}>Eliminar / Cambiar foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>Aún no has adjuntado ningún comprobante.</Text>
        </View>
      )}

      {/* Botón de envío */}
      <TouchableOpacity
        style={[styles.btnSubmit, !foto && styles.btnDisabled]}
        onPress={handleSubirComprobante}
        disabled={!foto}
      >
        <Text style={styles.btnSubmitText}>Subir Comprobante</Text>
      </TouchableOpacity>

      <View style={styles.backButtonContainer}>
        <Button title="Volver a la Lista" onPress={() => navigation.goBack()} color="#6c757d" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, elevation: 2 },
  label: { fontSize: 12, color: '#888', marginTop: 10 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  errorText: { marginBottom: 20, textAlign: 'center', color: '#666' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  btnAction: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnActionText: { color: '#ffffff', fontWeight: '600' },
  btnSecondary: { backgroundColor: '#e9ecef', borderWidth: 1, borderColor: '#ced4da' },
  btnSecondaryText: { color: '#495057' },
  placeholderCard: {
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  placeholderText: { color: '#adb5bd', fontSize: 13 },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    elevation: 2,
  },
  previewImage: { width: '100%', height: 200, borderRadius: 6, resizeMode: 'cover' },
  infoBadge: { backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6, marginTop: 8 },
  infoText: { fontSize: 12, color: '#495057' },
  btnRemove: { marginTop: 8, alignItems: 'center' },
  btnRemoveText: { color: '#dc3545', fontWeight: '500', fontSize: 13 },
  btnSubmit: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnDisabled: { backgroundColor: '#adb5bd', opacity: 0.7 },
  btnSubmitText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  backButtonContainer: { marginTop: 10 },
});