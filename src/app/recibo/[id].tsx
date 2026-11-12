// src/app/recibo/[id].tsx — Lógica: Wilfran | UX/UI: Margit Barrera
import React, { useCallback, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRecibos } from '../../hooks/RecibosContext';

export default function DetalleRecibo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recibos, modoAdmin, conciliar, cargar } = useRecibos();
  const recibo = recibos.find((r) => r.id === id);

  const [errorCargaFoto, setErrorCargaFoto] = useState(false);
  const [cargandoFoto, setCargandoFoto] = useState(false);

  // Recarga datos frescos de SQLite cada vez que la pantalla vuelve al foco
  useFocusEffect(
    useCallback(() => {
      cargar();
      setErrorCargaFoto(false);
    }, [])
  );

  if (!recibo) {
    return (
      <View style={estilos.contenedorCentrado}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
        <Text style={estilos.textoError}>Recibo no encontrado</Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={estilos.btnVolverError}
        >
          <Text style={estilos.btnVolverErrorTexto}>Volver a Cartera</Text>
        </Pressable>
      </View>
    );
  }

  const esMora = recibo.estado === 'En mora';
  const esValidacion = recibo.estado === 'En validación';
  const esPagado = recibo.estado === 'Pagado';

  const aprobarPago = async () => {
    try {
      await conciliar(recibo.id, 'Pagado');
    } catch {}
    router.back();
  };

  const rechazarPago = async () => {
    try {
      await conciliar(recibo.id, 'En mora', 'Soporte bancario rechazado o no verificado');
    } catch {}
    router.back();
  };

  return (
    <ScrollView
      style={estilos.contenedor}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 40 }}
    >
      <View style={[estilos.header, { paddingTop: Math.max(insets.top, 24) + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={estilos.btnBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={estilos.headerTitle}>Detalle del recibo</Text>
          <Text style={estilos.headerSub}>Administración · Recibo {recibo.id}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={estilos.content}>
        <View style={estilos.card}>
          <View style={estilos.filaTop}>
            <Text style={estilos.periodo}>{recibo.periodo}</Text>
            {esMora && (
              <View style={estilos.badgeMora}>
                <Text style={estilos.badgeMoraTexto}>En mora</Text>
              </View>
            )}
            {esValidacion && (
              <View style={estilos.badgeValidacion}>
                <Text style={estilos.badgeValidacionTexto}>En validación</Text>
              </View>
            )}
            {esPagado && (
              <View style={estilos.badgePagado}>
                <Text style={estilos.badgePagadoTexto}>Pagado</Text>
              </View>
            )}
          </View>

          <Text style={estilos.labelTotal}>Total del recibo</Text>
          <Text style={estilos.montoGrande}>
            ${recibo.monto.toLocaleString('es-CO')} <Text style={estilos.moneda}>COP</Text>
          </Text>

          <View style={estilos.divider} />

          <View style={estilos.filaDato}>
            <Text style={estilos.labelDato}>Apartamento</Text>
            <Text style={estilos.valorDato}>{recibo.apartamento}</Text>
          </View>
          <View style={estilos.filaDato}>
            <Text style={estilos.labelDato}>Residente</Text>
            <Text style={estilos.valorDato}>{recibo.residenteNombre}</Text>
          </View>
          <View style={estilos.filaDato}>
            <Text style={estilos.labelDato}>Vencimiento</Text>
            <Text style={estilos.valorDato}>{recibo.fechaVencimiento}</Text>
          </View>
          <View style={estilos.filaDato}>
            <Text style={estilos.labelDato}>Ref. Bancaria</Text>
            <Text style={estilos.valorDato}>{recibo.referenciaBancaria || 'Sin registrar'}</Text>
          </View>

          {esMora && recibo.observacionAdmin && (
            <View style={estilos.cajaObservacion}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#854D0E" style={{ marginRight: 6 }} />
                <Text style={estilos.observacionTitulo}>Observación de Administración:</Text>
              </View>
              <Text style={estilos.observacionTexto}>{recibo.observacionAdmin}</Text>
            </View>
          )}
        </View>

        {/* Sección: Comprobante fotográfico adjunto */}
        <View style={estilos.seccionFoto}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={estilos.tituloSeccion}>Soporte fotográfico del pago</Text>
            {recibo.comprobanteUrl ? (
              <Pressable
                onPress={() => router.push({ pathname: '/recibo/subir', params: { id: recibo.id, idRecibo: recibo.id } })}
                style={estilos.btnCambiarFotoHeader}
                accessibilityRole="button"
                accessibilityLabel="Cambiar foto de soporte"
              >
                <Ionicons name="camera-reverse-outline" size={16} color="#0F2540" style={{ marginRight: 4 }} />
                <Text style={estilos.btnCambiarFotoHeaderText}>Cambiar</Text>
              </Pressable>
            ) : null}
          </View>
          {recibo.comprobanteUrl && !errorCargaFoto ? (
            <View style={estilos.cardFoto}>
              <View style={estilos.contenedorImagen}>
                {cargandoFoto && (
                  <View style={estilos.loaderFoto}>
                    <ActivityIndicator size="small" color="#0F2540" />
                  </View>
                )}
                <Image
                  source={{ uri: recibo.comprobanteUrl }}
                  style={estilos.imagenComprobante}
                  resizeMode="contain"
                  onLoadStart={() => setCargandoFoto(true)}
                  onLoadEnd={() => setCargandoFoto(false)}
                  onError={() => {
                    setCargandoFoto(false);
                    setErrorCargaFoto(true);
                  }}
                  accessibilityLabel={`Fotografía del comprobante del recibo ${recibo.periodo}`}
                />
              </View>
              <View style={estilos.pieFoto}>
                <Ionicons name="checkmark-circle" size={16} color="#166534" style={{ marginRight: 6 }} />
                <Text style={estilos.pieFotoTexto}>Soporte registrado en el sistema</Text>
              </View>
            </View>
          ) : recibo.comprobanteUrl && errorCargaFoto ? (
            <View style={estilos.cardFotoVacia}>
              <Ionicons name="cloud-offline-outline" size={38} color="#D97706" style={{ marginBottom: 8 }} />
              <Text style={[estilos.fotoVaciaTexto, { color: '#B45309' }]}>Soporte registrado pero no se pudo cargar la imagen</Text>
              <Text style={estilos.fotoVaciaSubtexto}>Puedes reintentar o subir una foto nueva tocando Cambiar arriba</Text>
              <Pressable
                onPress={() => setErrorCargaFoto(false)}
                style={{ marginTop: 10, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#FEF3C7', borderRadius: 8 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#92400E' }}>Reintentar cargar foto</Text>
              </Pressable>
            </View>
          ) : (
            <View style={estilos.cardFotoVacia}>
              <Ionicons
                name="image-outline"
                size={38}
                color="#94A3B8"
                style={{ marginBottom: 8, opacity: 0.8 }}
              />
              <Text style={estilos.fotoVaciaTexto}>Todavía no se ha subido ningún soporte</Text>
              <Text style={estilos.fotoVaciaSubtexto}>El comprobante se mostrará aquí una vez sea adjuntado</Text>
            </View>
          )}
        </View>

        {/* Vista Residente: Cuando el pago ya fue enviado y está 'En validación' */}
        {!modoAdmin && esValidacion && (
          <View style={estilos.bannerRevision}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="time" size={20} color="#854D0E" style={{ marginRight: 8 }} />
              <Text style={estilos.bannerRevisionTitulo}>Pago en validación</Text>
            </View>
            <Text style={estilos.bannerRevisionTexto}>
              Tu soporte fue enviado con éxito. La administración verificará y conciliará tu pago en breve.
            </Text>
            <Pressable
              style={estilos.btnCambiarSoporte}
              onPress={() => router.push({ pathname: '/recibo/subir', params: { id: recibo.id, idRecibo: recibo.id } })}
              accessibilityRole="button"
              accessibilityLabel="Cambiar soporte"
            >
              <Ionicons name="camera-outline" size={16} color="#854D0E" style={{ marginRight: 6 }} />
              <Text style={estilos.btnCambiarSoporteTexto}>Cambiar soporte o corregir</Text>
            </Pressable>
          </View>
        )}

        {/* Vista Residente: Cuando está 'En mora' (requiere subir soporte) */}
        {!modoAdmin && esMora && (
          <>
            <Pressable
              style={estilos.btnSubir}
              onPress={() => router.push({ pathname: '/recibo/subir', params: { id: recibo.id, idRecibo: recibo.id } })}
              accessibilityRole="button"
              accessibilityLabel="Subir comprobante de pago"
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={estilos.btnSubirTexto}>Subir comprobante</Text>
            </Pressable>
            <Text style={estilos.textoAyuda}>Adjunta el soporte fotográfico para validar tu pago.</Text>
          </>
        )}

        {/* Vista Residente: Cuando está 'Pagado' */}
        {!modoAdmin && esPagado && (
          <View style={estilos.bannerPagado}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="checkmark-done-circle" size={20} color="#166534" style={{ marginRight: 8 }} />
              <Text style={estilos.bannerPagadoTitulo}>Recibo al día y pagado</Text>
            </View>
            <Text style={estilos.bannerPagadoTexto}>
              Este pago se encuentra registrado. Si necesitas modificar el número de referencia bancaria o actualizar la foto, puedes hacerlo aquí:
            </Text>
            <Pressable
              style={estilos.btnEditarSoportePagado}
              onPress={() => router.push({ pathname: '/recibo/subir', params: { id: recibo.id, idRecibo: recibo.id } })}
              accessibilityRole="button"
              accessibilityLabel="Actualizar comprobante o referencia"
            >
              <Ionicons name="create-outline" size={16} color="#166534" style={{ marginRight: 6 }} />
              <Text style={estilos.btnEditarSoportePagadoTexto}>Actualizar número o foto</Text>
            </Pressable>
          </View>
        )}

        {/* Modo Administrador: Botones Aprobar/Rechazar y Edición */}
        {modoAdmin && (
          <View style={estilos.cardAdmin}>
            <View style={estilos.filaAdmin}>
              <Ionicons name="shield-checkmark" size={22} color="#0F2540" style={{ marginRight: 10 }} />
              <Text style={estilos.tituloAdmin}>Panel de Conciliación (Admin)</Text>
            </View>
            <Text style={estilos.descAdmin}>
              Verifica el comprobante y la referencia antes de aprobar o rechazar el pago de este recibo.
            </Text>
            <View style={estilos.filaBotonesAdmin}>
              <Pressable
                onPress={aprobarPago}
                accessibilityRole="button"
                accessibilityLabel="Aprobar pago del recibo"
                style={estilos.btnAprobar}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={estilos.textoBtnAprobar}>Aprobar pago</Text>
              </Pressable>
              <Pressable
                onPress={rechazarPago}
                accessibilityRole="button"
                accessibilityLabel="Rechazar pago del recibo"
                style={estilos.btnRechazar}
              >
                <Ionicons name="close-circle" size={20} color="#991B1B" style={{ marginRight: 8 }} />
                <Text style={estilos.textoBtnRechazar}>Rechazar</Text>
              </Pressable>
            </View>

            <Pressable
              style={estilos.btnEditarAdmin}
              onPress={() => router.push({ pathname: '/recibo/subir', params: { id: recibo.id, idRecibo: recibo.id } })}
              accessibilityRole="button"
              accessibilityLabel="Editar número de referencia o foto del soporte"
            >
              <Ionicons name="create-outline" size={16} color="#0F2540" style={{ marginRight: 6 }} />
              <Text style={estilos.btnEditarAdminTexto}>Editar número de referencia o foto</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },
  contenedorCentrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  textoError: { color: '#0F2540', fontSize: 17, fontWeight: '700', marginBottom: 16, fontFamily: 'Inter_700Bold' },
  btnVolverError: {
    backgroundColor: '#0F2540',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnVolverErrorTexto: { color: '#FFF', fontWeight: '700', fontSize: 14, fontFamily: 'Inter_700Bold' },
  header: {
    backgroundColor: '#0F2540',
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnBack: { marginRight: 12, padding: 8, minHeight: 44, justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  headerSub: { color: '#94A3B8', fontSize: 12, marginTop: 3, fontFamily: 'Inter_500Medium' },
  content: { padding: 24 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 26,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    marginBottom: 16,
  },
  filaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 },
  periodo: { fontSize: 17, fontWeight: '700', color: '#334155', fontFamily: 'Inter_700Bold' },
  badgeMora: { backgroundColor: '#FEE2E2', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeMoraTexto: { color: '#991B1B', fontSize: 12, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  badgeValidacion: { backgroundColor: '#FEF9C3', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeValidacionTexto: { color: '#854D0E', fontSize: 12, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  badgePagado: { backgroundColor: '#DCFCE7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgePagadoTexto: { color: '#166534', fontSize: 12, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  labelTotal: { fontSize: 13, color: '#64748B', marginBottom: 6, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  montoGrande: { fontSize: 38, fontWeight: '900', color: '#0F2540', marginBottom: 22, fontFamily: 'Inter_900Black' },
  moneda: { fontSize: 16, color: '#64748B', fontFamily: 'Inter_600SemiBold' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 22 },
  filaDato: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  labelDato: { color: '#64748B', fontSize: 14, fontWeight: '500', fontFamily: 'Inter_500Medium' },
  valorDato: { color: '#0F2540', fontWeight: '700', fontSize: 14, fontFamily: 'Inter_700Bold' },
  cajaObservacion: {
    backgroundColor: '#FEF9C3',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  observacionTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#854D0E',
    fontFamily: 'Inter_800ExtraBold',
  },
  observacionTexto: {
    fontSize: 13,
    color: '#713F12',
    lineHeight: 18,
    fontFamily: 'Inter_500Medium',
  },
  seccionFoto: {
    marginBottom: 8,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2540',
    marginBottom: 12,
    fontFamily: 'Inter_800ExtraBold',
  },
  cardFoto: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    marginBottom: 16,
  },
  contenedorImagen: {
    width: '100%',
    height: 320,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loaderFoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.7)',
    zIndex: 2,
  },
  imagenComprobante: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  pieFoto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pieFotoTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    fontFamily: 'Inter_700Bold',
  },
  bannerRevision: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  bannerRevisionTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#854D0E',
    fontFamily: 'Inter_800ExtraBold',
  },
  bannerRevisionTexto: {
    fontSize: 13,
    color: '#713F12',
    lineHeight: 19,
    fontFamily: 'Inter_500Medium',
    marginBottom: 12,
  },
  btnCambiarSoporte: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAB308',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnCambiarSoporteTexto: {
    color: '#854D0E',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  btnCambiarFotoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnCambiarFotoHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },
  bannerPagado: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  bannerPagadoTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
    fontFamily: 'Inter_800ExtraBold',
  },
  bannerPagadoTexto: {
    fontSize: 13,
    color: '#14532D',
    lineHeight: 19,
    fontFamily: 'Inter_500Medium',
    marginBottom: 12,
  },
  btnEditarSoportePagado: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#166534',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnEditarSoportePagadoTexto: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  btnEditarAdmin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  btnEditarAdminTexto: {
    color: '#0F2540',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  cardFotoVacia: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  fotoVaciaTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  fotoVaciaSubtexto: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Inter_500Medium',
  },
  btnSubir: {
    backgroundColor: '#0F2540',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    marginTop: 10,
    minHeight: 56,
    elevation: 3,
  },
  btnSubirTexto: { color: '#FFF', fontSize: 16, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  textoAyuda: { textAlign: 'center', color: '#94A3B8', fontSize: 13, marginTop: 10, fontFamily: 'Inter_500Medium' },
  cardAdmin: { backgroundColor: '#FFF', borderRadius: 16, padding: 22, marginTop: 16, borderWidth: 1, borderColor: '#0F2540' },
  filaAdmin: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tituloAdmin: { fontSize: 16, fontWeight: '800', color: '#0F2540', fontFamily: 'Inter_800ExtraBold' },
  descAdmin: { color: '#64748B', fontSize: 14, marginBottom: 18, lineHeight: 21, fontFamily: 'Inter_500Medium' },
  filaBotonesAdmin: { flexDirection: 'row', gap: 12 },
  btnAprobar: { flex: 1, backgroundColor: '#166534', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, minHeight: 48 },
  textoBtnAprobar: { color: '#FFF', fontWeight: '800', fontSize: 15, fontFamily: 'Inter_800ExtraBold' },
  btnRechazar: { flex: 1, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#991B1B', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, minHeight: 48 },
  textoBtnRechazar: { color: '#991B1B', fontWeight: '800', fontSize: 15, fontFamily: 'Inter_800ExtraBold' },
});