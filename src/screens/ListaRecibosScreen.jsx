import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert
} from 'react-native';

// Repositorio simulado (Cocina)
const DATOS_EJEMPLO = [
  { id: 'REC-2026-10', periodo: 'Octubre 2026 · Cuota Admin', monto: '$185.000 COP', estado: 'En validación' },
  { id: 'REC-2026-09', periodo: 'Septiembre 2026 · Cuota Admin', monto: '$185.000 COP', estado: 'Pagado' },
  { id: 'REC-2026-08', periodo: 'Agosto 2026 · Cuota Extra', monto: '$95.000 COP', estado: 'En mora' },
  { id: 'REC-2026-07', periodo: 'Julio 2026 · Reserva Salón', monto: '$60.000 COP', estado: 'Pagado' },
  { id: 'REC-2026-06', periodo: 'Junio 2026 · Cuota Admin', monto: '$185.000 COP', estado: 'Pagado' },
];

export default function ListaRecibosScreen({ navigation }) {
  const [escenario, setEscenario] = useState('conDatos'); // conDatos | vacio | falla | cargando
  const [estadoUi, setEstadoUi] = useState('cargando');   // cargando | listo | vacio | error
  const [recibos, setRecibos] = useState([]);

  const cargarDatos = async (escenarioActual = escenario) => {
    setEstadoUi('cargando');

    if (escenarioActual === 'cargando') return; // Se queda cargando indefinitely

    setTimeout(() => {
      if (escenarioActual === 'falla') {
        setEstadoUi('error');
      } else if (escenarioActual === 'vacio') {
        setRecibos([]);
        setEstadoUi('vacio');
      } else {
        setRecibos(DATOS_EJEMPLO);
        setEstadoUi('listo');
      }
    }, 1200);
  };

  useEffect(() => {
    cargarDatos();
  }, [escenario]);

  // Selector de pruebas activo solo en modo desarrollo (__DEV__)
  const cambiarEscenarioModal = () => {
    Alert.alert(
      '🧪 Modo Depuración (Matraz)',
      'Selecciona un escenario de prueba:',
      [
        { text: 'Con Datos', onPress: () => setEscenario('conDatos') },
        { text: 'Lista Vacía', onPress: () => setEscenario('vacio') },
        { text: 'Falla/Error', onPress: () => setEscenario('falla') },
        { text: 'Cargando', onPress: () => setEscenario('cargando') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Botón de depuración tipo Matraz para evaluación del docente */}
      {__DEV__ && (
        <View style={styles.debugHeader}>
          <Button title="🧪 Cambiar Escenario" onPress={cambiarEscenarioModal} color="#6200ee" />
          <Text style={styles.debugText}>Actual: {escenario}</Text>
        </View>
      )}

      {/* MANEJO DE LOS 4 ESTADOS DE UI */}
      {estadoUi === 'cargando' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.stateText}>Cargando estado de cuenta...</Text>
        </View>
      )}

      {estadoUi === 'error' && (
        <View style={styles.center}>
          <Text style={styles.errorText}>No pudimos leer tus recibos de administración</Text>
          <Button title="Reintentar" onPress={() => cargarDatos()} />
        </View>
      )}

      {estadoUi === 'vacio' && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aún no tienes recibos registrados</Text>
          <Button
            title="Subir comprobante"
            onPress={() => Alert.alert('Aviso', 'Subir comprobante con cámara (HU-01) llega en el Sprint 2')}
          />
        </View>
      )}

      {estadoUi === 'listo' && (
        <FlatList
          data={recibos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('DetalleRecibo', { recibo: item })}
            >
              <Text style={styles.cardTitle}>{item.periodo}</Text>
              <Text style={styles.cardMonto}>{item.monto}</Text>
              <Text style={styles.cardEstado}>Estado: {item.estado}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  debugHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: 8, backgroundColor: '#e0e0e0', borderRadius: 8 },
  debugText: { fontWeight: 'bold', fontSize: 12 },
  stateText: { marginTop: 10, fontSize: 14, color: '#666' },
  errorText: { fontSize: 16, color: '#c62828', textAlign: 'center', marginBottom: 15 },
  emptyText: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardMonto: { fontSize: 14, color: '#2e7d32', marginTop: 4 },
  cardEstado: { fontSize: 12, color: '#666', marginTop: 2 },
});