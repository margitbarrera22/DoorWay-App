// src/app/recibo/[id].tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-03 #3, HU-04 #4 y Elemento Transversal #4)
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecibos } from '../../hooks/RecibosContext';
import { COLORES, coloresPorEstado } from '../../theme/tema';

export default function DetalleReciboScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { recibos, modoAdmin, conciliar } = useRecibos();

  const recibo = recibos.find((r) => r.id === id);
  if (!recibo) {
    return (
      <View style={estilos.contenedorCentrado}>
        <Text style={estilos.titulo}>Recibo no encontrado</Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={estilos.btnSecundario}
        >
          <Text style={estilos.btnSecundarioTexto}>Volver a Cartera</Text>
        </Pressable>
      </View>
    );
  }

  const badgeColor = coloresPorEstado(recibo.estado);

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      {/* 1. Tarjeta Principal de Factura */}
      <View style={estilos.cardPrincipal}>
        <View style={estilos.filaBadge}>
          <Text style={estilos.periodo}>{recibo.periodo}</Text>
          <View style={[estilos.badge, { backgroundColor: badgeColor.bg }]}>
            <Text style={[estilos.badgeTexto, { color: badgeColor.text }]}>{recibo.estado}</Text>
          </View>
        </View>

        <Text style={estilos.monto}>${recibo.monto.toLocaleString('es-CO')} COP</Text>
        <View style={estilos.divisor} />

        <View style={estilos.filaDato}>
          <Text style={estilos.etiqueta}>🏢 Apartamento:</Text>
          <Text style={estilos.valorDato}>{recibo.apartamento}</Text>
        </View>

        <View style={estilos.filaDato}>
          <Text style={estilos.etiqueta}>👤 Residente:</Text>
          <Text style={estilos.valorDato}>{recibo.residenteNombre}</Text>
        </View>

        <View style={estilos.filaDato}>
          <Text style={estilos.etiqueta}>📅 Vencimiento:</Text>
          <Text style={estilos.valorDato}>{recibo.fechaVencimiento}</Text>
        </View>

        <View style={estilos.filaDato}>
          <Text style={estilos.etiqueta}>🔢 Ref. Bancaria:</Text>
          <Text style={estilos.valorDato}>{recibo.referenciaBancaria || 'Sin registrar'}</Text>
        </View>

        {recibo.observacionAdmin && (
          <View style={estilos.cajaObservacion}>
            <Text style={estilos.observacionTitulo}>💬 Observación de Administración:</Text>
            <Text style={estilos.observacionTexto}>{recibo.observacionAdmin}</Text>
          </View>
        )}
      </View>

      {/* 2. Visor Oficial de Fotografía del Comprobante (Elemento Transversal #4) */}
      <View style={estilos.seccionFoto}>
        <Text style={estilos.tituloSeccion}>📸 Soporte Fotográfico del Pago</Text>
        {recibo.comprobanteUrl ? (
          <View style={estilos.cardFoto}>
            <Image
              source={{ uri: recibo.comprobanteUrl }}
              style={estilos.imagenComprobante}
              resizeMode="cover"
              accessibilityLabel={`Fotografía del comprobante del recibo ${recibo.periodo}`}
            />
            <View style={estilos.pieFoto}>
              <Text style={estilos.pieFotoTexto}>
                ✓ Archivo adjunto verificado para conciliación
              </Text>
            </View>
          </View>
        ) : (
          <View style={estilos.cardFotoVacia}>
            <Text style={estilos.fotoVaciaIcono}>📷</Text>
            <Text style={estilos.fotoVaciaTexto}>Sin fotografía de soporte adjunta todavía.</Text>
            <Text style={estilos.fotoVaciaSubtexto}>
              El residente puede adjuntar la foto del recibo o voucher bancario.
            </Text>
          </View>
        )}
      </View>

      {/* 3. Acción para Residente: Subir comprobante */}
      {recibo.estado !== 'Pagado' && !modoAdmin && (
        <Pressable
          style={estilos.btnPrimario}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/recibo/subir', params: { idRecibo: recibo.id } })}
        >
          <Text style={estilos.btnPrimarioTexto}>📤 Subir comprobante de pago (HU-01)</Text>
        </Pressable>
      )}

      {/* 4. Panel de Conciliación Exclusivo para Administrador (HU-04) */}
      {modoAdmin && (
        <View style={estilos.panelAdmin}>
          <Text style={estilos.subtituloAdmin}>🛡️ Panel de Conciliación (Administrador · HU-04)</Text>
          <Text style={estilos.descAdmin}>
            Verifica la referencia bancaria y la foto del soporte antes de aprobar o devolver a mora.
          </Text>

          <Pressable
            style={[estilos.btnAccionAdmin, { backgroundColor: '#166534' }]}
            accessibilityRole="button"
            onPress={async () => {
              await conciliar(recibo.id, 'Pagado');
              router.back();
            }}
          >
            <Text style={estilos.btnAccionAdminTexto}>✓ Aprobar pago (Marcar como Pagado)</Text>
          </Pressable>

          <Pressable
            style={[estilos.btnAccionAdmin, { backgroundColor: '#991B1B', marginTop: 10 }]}
            accessibilityRole="button"
            onPress={async () => {
              await conciliar(recibo.id, 'En mora', 'Soporte bancario ilegible o no verificado');
              router.back();
            }}
          >
            <Text style={estilos.btnAccionAdminTexto}>✕ Rechazar soporte (Devolver a En mora)</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },
  contenedorCentrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES.fondo,
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORES.primario,
    marginBottom: 8,
  },
  cardPrincipal: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filaBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  periodo: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORES.primario,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeTexto: {
    fontSize: 13,
    fontWeight: '800',
  },
  monto: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORES.secundario,
    marginTop: 4,
  },
  divisor: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  filaDato: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  etiqueta: {
    fontSize: 14,
    color: COLORES.textoGris,
    fontWeight: '600',
  },
  valorDato: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.textoOscuro,
  },
  cajaObservacion: {
    backgroundColor: '#FEF9C3',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FACC15',
  },
  observacionTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#854D0E',
    marginBottom: 2,
  },
  observacionTexto: {
    fontSize: 13,
    color: '#713F12',
    lineHeight: 18,
  },
  seccionFoto: {
    marginBottom: 16,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.primario,
    marginBottom: 10,
  },
  cardFoto: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    elevation: 3,
  },
  imagenComprobante: {
    width: '100%',
    height: 290,
    backgroundColor: '#E2E8F0',
  },
  pieFoto: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pieFotoTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.pagadoTexto,
  },
  cardFotoVacia: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  fotoVaciaIcono: {
    fontSize: 34,
    marginBottom: 8,
  },
  fotoVaciaTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.textoOscuro,
    textAlign: 'center',
  },
  fotoVaciaSubtexto: {
    fontSize: 12,
    color: COLORES.textoGris,
    textAlign: 'center',
    marginTop: 4,
  },
  btnPrimario: {
    backgroundColor: COLORES.primario,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    elevation: 2,
    marginBottom: 16,
  },
  btnPrimarioTexto: {
    color: COLORES.blanco,
    fontSize: 15,
    fontWeight: '800',
  },
  btnSecundario: {
    backgroundColor: COLORES.secundario,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  btnSecundarioTexto: {
    color: COLORES.blanco,
    fontSize: 14,
    fontWeight: '700',
  },
  panelAdmin: {
    backgroundColor: '#EEF2F6',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  subtituloAdmin: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.primario,
    marginBottom: 4,
  },
  descAdmin: {
    fontSize: 12,
    color: COLORES.textoGris,
    marginBottom: 14,
    lineHeight: 18,
  },
  btnAccionAdmin: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnAccionAdminTexto: {
    color: COLORES.blanco,
    fontSize: 14,
    fontWeight: '800',
  },
});
