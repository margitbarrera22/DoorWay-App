// src/components/TarjetaRecibo.tsx — Diseño UX/UI Margit Barrera
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recibo } from '../domain/modelos';

interface Props {
  recibo: Recibo;
  alTocar: () => void;
}

export function TarjetaRecibo({ recibo, alTocar }: Props) {
  let colorBadge = '#FEE2E2';
  let textoBadge = '#991B1B';
  if (recibo.estado === 'En validación') { colorBadge = '#FEF9C3'; textoBadge = '#854D0E'; }
  if (recibo.estado === 'Pagado') { colorBadge = '#DCFCE7'; textoBadge = '#166534'; }

  return (
    <Pressable
      onPress={alTocar}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle del recibo de ${recibo.periodo}`}
      style={estilos.card}
    >
      <View style={estilos.filaSuperior}>
        <Text style={estilos.periodo}>{recibo.periodo}</Text>
        <View style={[estilos.badge, { backgroundColor: colorBadge }]}>
          <Text style={[estilos.badgeTexto, { color: textoBadge }]}>{recibo.estado}</Text>
        </View>
      </View>

      <Text style={estilos.monto}>
        ${recibo.monto.toLocaleString('es-CO')} <Text style={estilos.moneda}>COP</Text>
      </Text>

      <View style={estilos.filaInferior}>
        <View style={estilos.filaFecha}>
          <Ionicons name="calendar-outline" size={14} color="#64748B" />
          <Text style={estilos.fecha}>Vence el {recibo.fechaVencimiento}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filaSuperior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  periodo: { fontSize: 15, fontWeight: '700', color: '#334155', fontFamily: 'Inter_700Bold' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeTexto: { fontSize: 12, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  monto: { fontSize: 30, fontWeight: '900', color: '#0F2540', marginBottom: 14, fontFamily: 'Inter_900Black' },
  moneda: { fontSize: 14, fontWeight: '600', color: '#64748B', fontFamily: 'Inter_600SemiBold' },
  filaInferior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filaFecha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fecha: { fontSize: 13, color: '#64748B', fontWeight: '500', fontFamily: 'Inter_500Medium' },
});