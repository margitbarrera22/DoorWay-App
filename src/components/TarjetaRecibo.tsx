// src/components/TarjetaRecibo.tsx — Autora: Margit Dayanna Barrera Gutiérrez
import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Recibo } from '../domain/modelos';
import { COLORES, coloresPorEstado } from '../theme/tema';

interface Props {
  recibo: Recibo;
  alTocar: () => void;
}

export function TarjetaRecibo({ recibo, alTocar }: Props) {
  const badge = coloresPorEstado(recibo.estado);
  return (
    <Pressable
      onPress={alTocar}
      accessibilityRole="button"
      accessibilityLabel={`Recibo de ${recibo.periodo}, valor ${recibo.monto} pesos, estado ${recibo.estado}`}
      style={estilos.card}
    >
      <View style={estilos.filaSuperior}>
        <Text style={estilos.periodo}>{recibo.periodo}</Text>
        <View style={[estilos.badge, { backgroundColor: badge.bg }]}>
          <Text style={[estilos.badgeTexto, { color: badge.text }]}>{recibo.estado}</Text>
        </View>
      </View>
      <Text style={estilos.monto}>${recibo.monto.toLocaleString('es-CO')} COP</Text>
      <Text style={estilos.meta}>Vence: {recibo.fechaVencimiento} · {recibo.apartamento}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: COLORES.blanco,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 88,
    elevation: 2,
  },
  filaSuperior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  periodo: { fontSize: 17, fontWeight: '700', color: COLORES.textoOscuro },
  monto: { fontSize: 18, fontWeight: '800', color: COLORES.primario, marginTop: 6 },
  meta: { fontSize: 14, color: COLORES.textoGris, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeTexto: { fontSize: 13, fontWeight: '700' },
});