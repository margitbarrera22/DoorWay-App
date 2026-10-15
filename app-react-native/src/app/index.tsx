// src/app/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRecibosViewModel } from '../hooks/RecibosContext';
import { Escenario } from '../data/repositorioSimulado';
import { ReciboPago } from '../domain/recibo';

const OPCIONES_ESCENARIO: { label: string; valor: Escenario }[] = [
  { label: 'Con datos (5 recibos)', valor: 'conDatos' },
  { label: 'Lista vacía', valor: 'vacio' },
  { label: 'Error de servidor', valor: 'falla' },
  { label: 'Cargando...', valor: 'cargando' },
];

export default function EstadoCuentaScreen() {
  const vm = useRecibosViewModel();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const colorEstado = (estado: ReciboPago['estado']) => {
    if (estado === 'Pagado') return '#16A34A';
    if (estado === 'En validación') return '#D97706';
    return '#DC2626';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* AppBar / Encabezado con selector de situaciones en modo Debug */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.appBarTitle}>Estado de cuenta y recibos</Text>
          <Text style={styles.appBarSub}>DoorWay-App · Apto B-302</Text>
        </View>
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugBtn}
            onPress={() => setMenuAbierto(!menuAbierto)}
            accessibilityLabel="Cambiar escenario de prueba"
          >
            <Text style={styles.debugBtnText}>🧪 {vm.escenarioActual}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menú desplegable de escenarios (solo en modo desarrollo __DEV__) */}
      {__DEV__ && menuAbierto && (
        <View style={styles.dropdownMenu}>
          {OPCIONES_ESCENARIO.map((op) => (
            <TouchableOpacity
              key={op.valor}
              style={[
                styles.dropdownItem,
                vm.escenarioActual === op.valor && styles.dropdownItemActivo,
              ]}
              onPress={() => {
                setMenuAbierto(false);
                vm.cambiarEscenario(op.valor);
              }}
            >
              <Text style={styles.dropdownItemText}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Cuerpo de la pantalla con las 4 situaciones obligatorias */}
      <View style={styles.body}>
        {vm.estado === 'cargando' && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#00963F" />
            <Text style={styles.helperText}>Consultando tus recibos de administración...</Text>
          </View>
        )}

        {vm.estado === 'error' && (
          <View style={styles.centerBox}>
            <Text style={styles.avisoIcon}>⚠️</Text>
            <Text style={styles.avisoTitulo}>
              No pudimos leer tus recibos de administración
            </Text>
            <Text style={styles.avisoDesc}>
              Revisa tu conexión a internet e inténtalo de nuevo.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={vm.cargar}>
              <Text style={styles.primaryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {vm.estado === 'vacio' && (
          <View style={styles.centerBox}>
            <Text style={styles.avisoIcon}>📄</Text>
            <Text style={styles.avisoTitulo}>Aún no tienes recibos registrados</Text>
            <Text style={styles.avisoDesc}>
              Cuando realices tu primer pago de administración podrás consultarlo aquí.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                Alert.alert(
                  'Próximo incremento',
                  'Subir comprobante con cámara (HU-01) llega en el Sprint 2.'
                )
              }
            >
              <Text style={styles.primaryBtnText}>Subir comprobante</Text>
            </TouchableOpacity>
          </View>
        )}

        {vm.estado === 'listo' && (
          <FlatList
            data={vm.recibos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cardRow}
                onPress={() => router.push(/recibo/ as any)}
              >
                <View style={styles.cardInfo}>
                  <Text style={styles.cardPeriodo}>{item.periodo}</Text>
                  <Text style={styles.cardMonto}>{item.monto}</Text>
                  <Text style={styles.cardRef}>Vence: {item.fechaLimite}</Text>
                </View>
                <View
                  style={[
                    styles.estadoBadge,
                    { backgroundColor: colorEstado(item.estado) + '20' },
                  ]}
                >
                  <Text style={[styles.estadoText, { color: colorEstado(item.estado) }]}>
                    {item.estado}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  appBar: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appBarTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  appBarSub: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  debugBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2FD27A',
  },
  debugBtnText: { color: '#8DEBB6', fontSize: 12, fontWeight: '600' },
  dropdownMenu: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 6 },
  dropdownItemActivo: { backgroundColor: '#334155' },
  dropdownItemText: { color: '#F1F5F9', fontSize: 14 },
  body: { flex: 1 },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  helperText: { marginTop: 12, fontSize: 14, color: '#475569', textAlign: 'center' },
  avisoIcon: { fontSize: 44, marginBottom: 12 },
  avisoTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  avisoDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#00963F',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  listContainer: { padding: 16 },
  cardRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardInfo: { flex: 1, paddingRight: 10 },
  cardPeriodo: { fontSize: 15, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  cardMonto: { fontSize: 16, fontWeight: '700', color: '#00963F', marginBottom: 2 },
  cardRef: { fontSize: 12, color: '#64748B' },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
  estadoText: { fontSize: 12, fontWeight: '700' },
});
