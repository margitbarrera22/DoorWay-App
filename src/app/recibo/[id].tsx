// src/app/recibo/[id].tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-03 #3 y HU-04 #4)
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecibos } from '../../hooks/RecibosContext';
import { COLORES } from '../../theme/tema';

export default function DetalleReciboScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { recibos, modoAdmin, conciliar } = useRecibos();

  const recibo = recibos.find((r) => r.id === id);
  if (!recibo) {
    return (
      <View style={estilos.contenedor}>
        <Text style={estilos.titulo}>Recibo no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={{ padding: 20 }}>
      <Text style={estilos.titulo}>{recibo.periodo}</Text>
      <Text style={estilos.monto}>${recibo.monto.toLocaleString('es-CO')} COP</Text>
      <Text style={estilos.item}>Apartamento: {recibo.apartamento}</Text>
      <Text style={estilos.item}>Residente: {recibo.residenteNombre}</Text>
      <Text style={estilos.item}>Vencimiento: {recibo.fechaVencimiento}</Text>
      <Text style={estilos.item}>Estado de conciliación: {recibo.estado}</Text>
      <Text style={estilos.item}>Referencia bancaria: {recibo.referenciaBancaria || 'Sin registrar'}</Text>

      {recibo.estado !== 'Pagado' && !modoAdmin && (
        <Pressable
          style={estilos.btnPrimario}
          onPress={() => router.push({ pathname: '/recibo/subir', params: { idRecibo: recibo.id } })}
        >
          <Text style={estilos.btnTexto}>Subir comprobante de pago (HU-01)</Text>
        </Pressable>
      )}

      {modoAdmin && (
        <View style={estilos.panelAdmin}>
          <Text style={estilos.subtituloAdmin}>Panel de Conciliación (Administrador · HU-04)</Text>
          <Pressable
            style={[estilos.btnPrimario, { backgroundColor: '#166534' }]}
            onPress={async () => {
              await conciliar(recibo.id, 'Pagado');
              router.back();
            }}
          >
            <Text style={estilos.btnTexto}>Aprobar pago (Cambiar a Pagado)</Text>
          </Pressable>
          <Pressable
            style={[estilos.btnPrimario, { backgroundColor: '#991B1B', marginTop: 10 }]}
            onPress={async () => {
              await conciliar(recibo.id, 'En mora', 'Soporte ilegible');
              router.back();
            }}
          >
            <Text style={estilos.btnTexto}>Rechazar soporte (Devolver a En mora)</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },
  titulo: { fontSize: 22, fontWeight: '800', color: COLORES.primario },
  monto: { fontSize: 24, fontWeight: '900', color: COLORES.secundario, marginVertical: 10 },
  item: { fontSize: 16, color: COLORES.textoOscuro, marginBottom: 8 },
  btnPrimario: {
    backgroundColor: COLORES.primario,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 50,
  },
  btnTexto: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  panelAdmin: { marginTop: 28, padding: 16, backgroundColor: '#E2E8F0', borderRadius: 12 },
  subtituloAdmin: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: COLORES.primario },
});
