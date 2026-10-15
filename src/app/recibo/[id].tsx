import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecibosViewModel } from '../../hooks/RecibosContext';

export default function DetalleReciboScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useRecibosViewModel();
  const router = useRouter();

  const recibo = id ? vm.buscarPorId(id) : undefined;

  if (!recibo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.errorTitle}>No se encontró el recibo solicitado ({id})</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Volver a la lista</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.codigo}>Código de recibo: {recibo.id}</Text>
        <Text style={styles.periodo}>{recibo.periodo}</Text>
        <Text style={styles.monto}>{recibo.monto}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Unidad residencial:</Text>
          <Text style={styles.value}>{recibo.apartamento}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha límite de pago:</Text>
          <Text style={styles.value}>{recibo.fechaLimite}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Estado de conciliación:</Text>
          <Text style={styles.valueBold}>{recibo.estado}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Referencia / Soporte:</Text>
          <Text style={styles.value}>{recibo.referencia}</Text>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Volver a mis recibos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codigo: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  periodo: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  monto: { fontSize: 24, fontWeight: '800', color: '#00963F', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 },
  row: { marginBottom: 12 },
  label: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 15, color: '#1E293B', fontWeight: '500' },
  valueBold: { fontSize: 15, color: '#0F172A', fontWeight: '700' },
  errorTitle: { fontSize: 16, color: '#DC2626', marginBottom: 16, textAlign: 'center' },
  backBtn: {
    marginTop: 18,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
