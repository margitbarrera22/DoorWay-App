import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function DetalleReciboScreen({ route, navigation }) {
  const { recibo } = route.params || {};

  if (!recibo) {
    return (
      <View style={styles.container}>
        <Text>No se encontró información del recibo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

      <Button title="Volver a la Lista" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, elevation: 2 },
  label: { fontSize: 12, color: '#888', marginTop: 10 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#333' },
});