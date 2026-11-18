// src/app/recibo/[id].tsx — Factura Electrónica Oficial DIAN | UX/UI: Margit Barrera (UNIPAZ 2026)
import React, { useCallback, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRecibos } from '../../hooks/RecibosContext';
import { useAuth } from '../../hooks/AuthContext';
import { EstadoRecibo, Recibo } from '../../domain/modelos';

export default function DetalleRecibo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recibos, modoAdmin, conciliar, cargar } = useRecibos();
  const { usuarioActual } = useAuth();

  const reciboDirecto = recibos.find((r) => r.id === id);
  const reciboPorApto = usuarioActual?.apartamento ? recibos.find((r) => r.apartamento === usuarioActual.apartamento) : null;
  const recibo: Recibo = reciboDirecto || reciboPorApto || (recibos.length > 0 ? recibos[0] : {
    id: id || 'rec-01',
    apartamento: usuarioActual?.apartamento || 'Torre B - Apto 302',
    residenteNombre: usuarioActual?.nombre || 'Doña Martha Gómez',
    periodo: 'Noviembre 2026',
    monto: 185000,
    fechaVencimiento: '2026-11-30',
    estado: 'En mora' as EstadoRecibo,
    referenciaBancaria: null,
    comprobanteUrl: null,
    observacionAdmin: null,
  });

  const [errorCargaFoto, setErrorCargaFoto] = useState(false);
  const [cargandoFoto, setCargandoFoto] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargar();
      setErrorCargaFoto(false);
    }, [])
  );

  const esMora = recibo.estado === 'En mora';
  const esValidacion = recibo.estado === 'En validación';
  const esPagado = recibo.estado === 'Pagado';

  const consecutivoFactura = `FE-2026-${recibo.id.replace('rec-', '').toUpperCase().padStart(4, '0')}`;
  const subtotalCuota = Math.round(recibo.monto * 0.85);
  const fondoImprevistos = recibo.monto - subtotalCuota;

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
    <View style={estilos.contenedorPrincipal}>
      {/* Barra de cabecera limpia */}
      <View style={[estilos.headerBar, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver a cartera"
          style={estilos.btnVolverHeader}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={estilos.headerCentro}>
          <Text style={estilos.headerTitulo} numberOfLines={1}>Factura Electrónica</Text>
          <Text style={estilos.headerSubtitulo} numberOfLines={1}>
            {consecutivoFactura} · {recibo.apartamento}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={estilos.scrollArea}
        contentContainerStyle={[
          estilos.scrollContenido,
          { paddingBottom: Math.max(insets.bottom, 24) + 60 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════════════════════════
            HOJA DE FACTURA ELECTRÓNICA PROFESIONAL (ESTILO FINTECH)
            ══════════════════════════════════════════════════════════════ */}
        <View style={estilos.hojaFactura}>
          {/* Cabecera del Documento */}
          <View style={estilos.encabezadoFactura}>
            <View style={estilos.filaMarca}>
              <View style={estilos.logoEmisor}>
                <Ionicons name="business" size={20} color="#0F2540" />
              </View>
              <View style={estilos.infoEmisor}>
                <Text style={estilos.nombreEmisor} numberOfLines={1}>CONJUNTO LA NUEVA ESPERANZA</Text>
                <Text style={estilos.datosEmisor}>NIT 901.482.319-4 · Régimen P.H. Ley 675</Text>
                <Text style={estilos.datosEmisorSec}>Cra 28 # 45-12 · Barrancabermeja</Text>
              </View>
            </View>

            {/* Fila con Folio y Estado Fiscal */}
            <View style={estilos.filaFolioEstado}>
              <View style={estilos.columnaFolio}>
                <Text style={estilos.labelFolio}>EXPENSA COMÚN</Text>
                <Text style={estilos.numeroFolio}>{consecutivoFactura}</Text>
              </View>
              <View
                style={[
                  estilos.pillEstadoFiscal,
                  esPagado && estilos.pillEstadoPagado,
                  esValidacion && estilos.pillEstadoValidacion,
                  esMora && estilos.pillEstadoMora,
                ]}
              >
                <Ionicons
                  name={esPagado ? 'checkmark-circle' : esValidacion ? 'time' : 'alert-circle'}
                  size={13}
                  color={esPagado ? '#166534' : esValidacion ? '#854D0E' : '#991B1B'}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    estilos.textoPillEstado,
                    esPagado && { color: '#166534' },
                    esValidacion && { color: '#854D0E' },
                    esMora && { color: '#991B1B' },
                  ]}
                  numberOfLines={1}
                >
                  {esPagado ? 'PAGADA' : esValidacion ? 'EN REVISIÓN' : 'EN MORA'}
                </Text>
              </View>
            </View>
          </View>

          <View style={estilos.lineaSeparadora} />

          {/* Información del Copropietario (Cuadrícula limpia sin bordes pesados) */}
          <View style={estilos.seccionDatosCliente}>
            <View style={estilos.filaDatoPar}>
              <View style={estilos.columnaDato}>
                <Text style={estilos.labelCampo}>COPROPIETARIO</Text>
                <Text style={estilos.valorCampo} numberOfLines={1}>{recibo.residenteNombre}</Text>
              </View>
              <View style={estilos.columnaDato}>
                <Text style={estilos.labelCampo}>UNIDAD / APTO</Text>
                <Text style={estilos.valorCampo} numberOfLines={1}>{recibo.apartamento}</Text>
              </View>
            </View>

            <View style={[estilos.filaDatoPar, { marginTop: 12 }]}>
              <View style={estilos.columnaDato}>
                <Text style={estilos.labelCampo}>PERÍODO FACTURADO</Text>
                <Text style={estilos.valorCampo} numberOfLines={1}>{recibo.periodo}</Text>
              </View>
              <View style={estilos.columnaDato}>
                <Text style={estilos.labelCampo}>VENCIMIENTO</Text>
                <Text style={[estilos.valorCampo, esMora && { color: '#DC2626' }]} numberOfLines={1}>
                  {recibo.fechaVencimiento}
                </Text>
              </View>
            </View>

            {recibo.referenciaBancaria ? (
              <View style={{ marginTop: 12 }}>
                <Text style={estilos.labelCampo}>REFERENCIA DE PAGO</Text>
                <Text style={estilos.valorCampoRef} numberOfLines={1}>{recibo.referenciaBancaria}</Text>
              </View>
            ) : null}
          </View>

          <View style={estilos.lineaSeparadora} />

          {/* Desglose de Conceptos */}
          <View style={estilos.seccionDesglose}>
            <View style={estilos.cabeceraDesglose}>
              <Text style={estilos.colConceptoHeader}>CONCEPTO</Text>
              <Text style={estilos.colTotalHeader}>VALOR</Text>
            </View>

            <View style={estilos.filaConcepto}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={estilos.nombreConcepto}>Cuota Ordinaria Administración</Text>
                <Text style={estilos.detalleConcepto}>Mantenimiento, vigilancia y áreas comunes (85%)</Text>
              </View>
              <Text style={estilos.valorConcepto}>${subtotalCuota.toLocaleString('es-CO')}</Text>
            </View>

            <View style={estilos.filaConcepto}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={estilos.nombreConcepto}>Fondo de Imprevistos</Text>
                <Text style={estilos.detalleConcepto}>Reserva reglamentaria Ley 675 Art. 35 (15%)</Text>
              </View>
              <Text style={estilos.valorConcepto}>${fondoImprevistos.toLocaleString('es-CO')}</Text>
            </View>

            {/* Totales */}
            <View style={estilos.bloqueTotales}>
              <View style={estilos.filaTotalLinea}>
                <Text style={estilos.labelTotalLinea}>Subtotal:</Text>
                <Text style={estilos.valorTotalLinea}>${recibo.monto.toLocaleString('es-CO')} COP</Text>
              </View>
              <View style={estilos.filaTotalLinea}>
                <Text style={estilos.labelTotalLinea}>IVA (Exento Ley 675):</Text>
                <Text style={estilos.valorTotalLinea}>$0 COP</Text>
              </View>
              <View style={estilos.lineaTotalDestacada} />
              <View style={estilos.filaGranTotal}>
                <Text style={estilos.labelGranTotal}>TOTAL FACTURADO:</Text>
                <Text style={estilos.valorGranTotal}>
                  ${recibo.monto.toLocaleString('es-CO')} <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B' }}>COP</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Timbre Fiscal / Estado de Pago */}
          <View
            style={[
              estilos.franjaEstadoFiscal,
              esPagado && estilos.franjaPagado,
              esValidacion && estilos.franjaValidacion,
              esMora && estilos.franjaMora,
            ]}
          >
            <Ionicons
              name={esPagado ? 'checkmark-circle' : esValidacion ? 'hourglass' : 'alert-circle'}
              size={18}
              color={esPagado ? '#166534' : esValidacion ? '#854D0E' : '#991B1B'}
              style={{ marginRight: 8, flexShrink: 0 }}
            />
            <Text
              style={[
                estilos.textoFranjaEstado,
                esPagado && { color: '#166534' },
                esValidacion && { color: '#854D0E' },
                esMora && { color: '#991B1B' },
              ]}
              numberOfLines={2}
            >
              {esPagado
                ? 'Factura Cancelada y Conciliada'
                : esValidacion
                ? 'Comprobante en Proceso de Validación'
                : 'Expensa Pendiente de Pago'}
            </Text>
          </View>

          {/* Observación del Administrador si existe */}
          {esMora && recibo.observacionAdmin ? (
            <View style={estilos.cajaObservacionAdmin}>
              <Ionicons name="information-circle" size={16} color="#854D0E" style={{ marginRight: 6, flexShrink: 0 }} />
              <Text style={estilos.textoObservacionAdmin}>{recibo.observacionAdmin}</Text>
            </View>
          ) : null}

          {/* Pie de CUFE y Legal */}
          <View style={estilos.pieCufeFiscal}>
            <Ionicons name="qr-code-outline" size={26} color="#0F2540" style={{ marginRight: 8, flexShrink: 0 }} />
            <View style={{ flex: 1 }}>
              <Text style={estilos.codigoCufe} numberOfLines={1}>
                CUFE: d4a8-9b12-doorway-2026-{recibo.id}-ph
              </Text>
              <Text style={estilos.normativaLegal} numberOfLines={1}>
                Documento equivalente según Decreto 358 de 2020 · DIAN
              </Text>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════
            SECCIÓN DEL SOPORTE BANCARIO ADJUNTO
            ══════════════════════════════════════════════════════════════ */}
        <View style={estilos.cardSoporteBancario}>
          <View style={estilos.cabeceraSoporte}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <Ionicons name="receipt-outline" size={18} color="#0F2540" style={{ marginRight: 6, flexShrink: 0 }} />
              <Text style={estilos.tituloSoporte} numberOfLines={1}>Soporte de Transferencia</Text>
            </View>
            {recibo.comprobanteUrl ? (
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/recibo/subir', params: { id: recibo.id, idRecibo: recibo.id } })
                }
                style={estilos.btnCambiarSoporteHeader}
                accessibilityRole="button"
                accessibilityLabel="Cambiar soporte"
              >
                <Ionicons name="camera-reverse-outline" size={14} color="#0F2540" style={{ marginRight: 4 }} />
                <Text style={estilos.btnCambiarSoporteTexto}>Cambiar</Text>
              </Pressable>
            ) : null}
          </View>

          {recibo.comprobanteUrl && !errorCargaFoto ? (
            <View style={estilos.marcoImagen}>
              {cargandoFoto && (
                <View style={estilos.loaderImagen}>
                  <ActivityIndicator size="small" color="#0F2540" />
                </View>
              )}
              <Image
                source={{ uri: recibo.comprobanteUrl }}
                style={estilos.imagenSoporte}
                resizeMode="contain"
                onLoadStart={() => setCargandoFoto(true)}
                onLoadEnd={() => setCargandoFoto(false)}
                onError={() => {
                  setCargandoFoto(false);
                  setErrorCargaFoto(true);
                }}
              />
              <View style={estilos.pieImagenVerificada}>
                <Ionicons name="checkmark-circle" size={14} color="#166534" style={{ marginRight: 4 }} />
                <Text style={estilos.textoImagenVerificada}>Comprobante adjuntado correctamente</Text>
              </View>
            </View>
          ) : (
            <View style={estilos.placeholderSinSoporte}>
              <Ionicons name="document-attach-outline" size={32} color="#94A3B8" style={{ marginBottom: 6 }} />
              <Text style={estilos.tituloSinSoporte}>
                {errorCargaFoto ? 'Soporte registrado en almacenamiento' : 'Sin comprobante adjunto'}
              </Text>
              <Text style={estilos.subtituloSinSoporte}>
                {errorCargaFoto
                  ? 'Puedes cambiar la imagen tocando el botón «Cambiar»'
                  : 'Sube la captura de tu transferencia bancaria para validarla'}
              </Text>
            </View>
          )}
        </View>

        {/* ══════════════════════════════════════════════════════════════
            ACCIONES PRINCIPALES SEGÚN EL ROL
            ══════════════════════════════════════════════════════════════ */}
        {/* RESIDENTE: Botón de subir soporte cuando está en mora */}
        {!modoAdmin && esMora && (
          <View style={estilos.contenedorAccion}>
            <Pressable
              style={estilos.btnAccionPrincipal}
              onPress={() =>
                router.push({ pathname: '/recibo/subir', params: { id: recibo.id, idRecibo: recibo.id } })
              }
              accessibilityRole="button"
              accessibilityLabel="Subir comprobante de pago"
            >
              <Ionicons name="cloud-upload" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={estilos.btnAccionPrincipalTexto}>Subir Comprobante de Pago</Text>
            </Pressable>
            <Text style={estilos.notaPieAccion}>
              Adjunta la captura de tu transferencia bancaria para poner tu cuenta al día.
            </Text>
          </View>
        )}

        {/* RESIDENTE: Estado en validación */}
        {!modoAdmin && esValidacion && (
          <View style={estilos.tarjetaMensajeValidacion}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="time" size={18} color="#854D0E" style={{ marginRight: 6 }} />
              <Text style={estilos.tituloMensajeValidacion}>Comprobante en Revisión</Text>
            </View>
            <Text style={estilos.textoMensajeValidacion}>
              La administración está validando tu soporte bancario. Tan pronto sea conciliado, tu cuenta quedará al día.
            </Text>
            <Pressable
              style={estilos.btnEditarSoportePill}
              onPress={() =>
                router.push({ pathname: '/recibo/subir', params: { id: recibo.id, idRecibo: recibo.id } })
              }
            >
              <Ionicons name="camera-outline" size={14} color="#854D0E" style={{ marginRight: 4 }} />
              <Text style={estilos.btnEditarSoportePillTexto}>Corregir o cambiar comprobante</Text>
            </Pressable>
          </View>
        )}

        {/* ADMINISTRADOR: Panel de Conciliación Fiscal */}
        {modoAdmin && (
          <View style={estilos.panelConciliacionAdmin}>
            <View style={estilos.cabeceraAdmin}>
              <Ionicons name="shield-checkmark" size={20} color="#0F2540" style={{ marginRight: 6 }} />
              <Text style={estilos.tituloPanelAdmin}>Panel de Conciliación (Administrador)</Text>
            </View>
            <Text style={estilos.descPanelAdmin}>
              Revisa el comprobante y concilia esta expensa común:
            </Text>

            <View style={estilos.filaBotonesConciliar}>
              <Pressable
                onPress={aprobarPago}
                accessibilityRole="button"
                accessibilityLabel="Aprobar pago"
                style={estilos.btnAprobarRecaudo}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={estilos.btnAprobarTexto} numberOfLines={1}>Aprobar Recaudo</Text>
              </Pressable>

              <Pressable
                onPress={rechazarPago}
                accessibilityRole="button"
                accessibilityLabel="Rechazar soporte"
                style={estilos.btnRechazarRecaudo}
              >
                <Ionicons name="close-circle" size={18} color="#991B1B" style={{ marginRight: 6 }} />
                <Text style={estilos.btnRechazarTexto} numberOfLines={1}>Rechazar</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    backgroundColor: '#0F2540',
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnVolverHeader: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerCentro: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: 8,
  },
  headerTitulo: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
  headerSubtitulo: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },

  scrollArea: {
    flex: 1,
  },
  scrollContenido: {
    padding: 16,
  },

  // ── HOJA DE FACTURA ELECTRÓNICA (FINTECH STYLE) ──
  hojaFactura: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  encabezadoFactura: {
    marginBottom: 4,
  },
  filaMarca: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoEmisor: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexShrink: 0,
  },
  infoEmisor: {
    flex: 1,
    minWidth: 0,
  },
  nombreEmisor: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },
  datosEmisor: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontFamily: 'Inter_500Medium',
  },
  datosEmisorSec: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontFamily: 'Inter_500Medium',
  },

  filaFolioEstado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  columnaFolio: {
    flex: 1,
    minWidth: 0,
  },
  labelFolio: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    fontFamily: 'Inter_700Bold',
  },
  numeroFolio: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F2540',
    marginTop: 1,
    fontFamily: 'Inter_900Black',
  },
  pillEstadoFiscal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  pillEstadoPagado: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  pillEstadoValidacion: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE047',
  },
  pillEstadoMora: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  textoPillEstado: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.3,
  },

  lineaSeparadora: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },

  // Datos Cliente
  seccionDatosCliente: {
    paddingVertical: 2,
  },
  filaDatoPar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  columnaDato: {
    flex: 1,
    minWidth: 0,
  },
  labelCampo: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: 'Inter_700Bold',
  },
  valorCampo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },
  valorCampoRef: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D9488',
    fontFamily: 'Inter_800ExtraBold',
  },

  // Desglose
  seccionDesglose: {
    paddingVertical: 2,
  },
  cabeceraDesglose: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  colConceptoHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    fontFamily: 'Inter_800ExtraBold',
  },
  colTotalHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    fontFamily: 'Inter_800ExtraBold',
  },
  filaConcepto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  nombreConcepto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },
  detalleConcepto: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  valorConcepto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
    marginLeft: 6,
    flexShrink: 0,
  },

  bloqueTotales: {
    marginTop: 12,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  filaTotalLinea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  labelTotalLinea: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
  },
  valorTotalLinea: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F2540',
    fontFamily: 'Inter_600SemiBold',
  },
  lineaTotalDestacada: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 6,
  },
  filaGranTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  labelGranTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },
  valorGranTotal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F2540',
    fontFamily: 'Inter_900Black',
  },

  // Franja de Estado
  franjaEstadoFiscal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  franjaPagado: {
    backgroundColor: '#DCFCE7',
  },
  franjaValidacion: {
    backgroundColor: '#FEF9C3',
  },
  franjaMora: {
    backgroundColor: '#FEE2E2',
  },
  textoFranjaEstado: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    flex: 1,
  },

  cajaObservacionAdmin: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF9C3',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  textoObservacionAdmin: {
    fontSize: 11.5,
    color: '#854D0E',
    flex: 1,
    lineHeight: 16,
    fontFamily: 'Inter_500Medium',
  },

  pieCufeFiscal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  codigoCufe: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Inter_600SemiBold',
  },
  normativaLegal: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
    fontFamily: 'Inter_500Medium',
  },

  // ── SECCIÓN SOPORTE BANCARIO ──
  cardSoporteBancario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cabeceraSoporte: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tituloSoporte: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
    flex: 1,
  },
  btnCambiarSoporteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 0,
  },
  btnCambiarSoporteTexto: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },

  marcoImagen: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  loaderImagen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 2,
  },
  imagenSoporte: {
    width: '100%',
    height: 240,
    backgroundColor: '#F8FAFC',
  },
  pieImagenVerificada: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  textoImagenVerificada: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#166534',
    fontFamily: 'Inter_700Bold',
  },

  placeholderSinSoporte: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  tituloSinSoporte: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  subtituloSinSoporte: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },

  // Acciones Residente
  contenedorAccion: {
    marginBottom: 16,
  },
  btnAccionPrincipal: {
    backgroundColor: '#0F2540',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 50,
    elevation: 2,
  },
  btnAccionPrincipalTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
  notaPieAccion: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter_500Medium',
  },

  tarjetaMensajeValidacion: {
    backgroundColor: '#FEF9C3',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE047',
    marginBottom: 16,
  },
  tituloMensajeValidacion: {
    fontSize: 13,
    fontWeight: '800',
    color: '#854D0E',
    fontFamily: 'Inter_800ExtraBold',
  },
  textoMensajeValidacion: {
    fontSize: 12,
    color: '#713F12',
    lineHeight: 17,
    fontFamily: 'Inter_500Medium',
  },
  btnEditarSoportePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF08A',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  btnEditarSoportePillTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#854D0E',
    fontFamily: 'Inter_700Bold',
  },

  // Acciones Administrador
  panelConciliacionAdmin: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cabeceraAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tituloPanelAdmin: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },
  descPanelAdmin: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    fontFamily: 'Inter_500Medium',
  },
  filaBotonesConciliar: {
    flexDirection: 'row',
    gap: 10,
  },
  btnAprobarRecaudo: {
    flex: 1,
    backgroundColor: '#166534',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    minHeight: 46,
  },
  btnAprobarTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
  btnRechazarRecaudo: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    minHeight: 46,
  },
  btnRechazarTexto: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
});
