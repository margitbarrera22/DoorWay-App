// src/app/index.tsx — Cartera y Módulos | Lógica: Wilfran Betancourt | UX/UI: Margit Barrera
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useRecibos } from '../hooks/RecibosContext';
import { useAuth } from '../hooks/AuthContext';
import { TarjetaRecibo } from '../components/TarjetaRecibo';
import { EstadoPantalla } from '../components/EstadoPantalla';
import { evaluarDerechoAReservar } from '../domain/reglasNegocio';
import { BarraNavegacionModulos } from '../components/BarraNavegacionModulos';
import { ModalPrivacidadLey1581 } from '../components/ModalPrivacidadLey1581';

export default function PantallaCartera() {
  const router = useRouter();
  const { recibos, estadoVista, mensajeError, cargar, modoAdmin } = useRecibos();
  const { usuarioActual, aceptarLey1581 } = useAuth();
  const [refrescando, setRefrescando] = useState(false);

  // Control para mostrar u ocultar recibos anteriores (no mostrarlos todos de golpe)
  const [mostrarAnteriores, setMostrarAnteriores] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  const alRefrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  const veredictoMora = evaluarDerechoAReservar(recibos);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0F2540" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  // El recibo actual es el más reciente (primero de la lista)
  const reciboActual = recibos.length > 0 ? recibos[0] : null;
  // Los recibos anteriores son los restantes
  const recibosAnteriores = recibos.length > 1 ? recibos.slice(1) : [];

  const recibosFiltrados = recibosAnteriores.filter((r) => {
    if (!busqueda.trim()) return true;
    const b = busqueda.toLowerCase();
    return (
      r.periodo.toLowerCase().includes(b) ||
      r.fechaVencimiento.includes(b) ||
      r.estado.toLowerCase().includes(b) ||
      (r.referenciaBancaria && r.referenciaBancaria.toLowerCase().includes(b))
    );
  });

  return (
    <View style={estilos.contenedor}>
      {/* Header corporativo DoorWay */}
      <View style={estilos.header}>
        <View style={estilos.headerTextos}>
          <Text style={estilos.headerTitulo}>Cartera</Text>
          <Text style={estilos.headerSub}>
            {usuarioActual?.nombre || (modoAdmin ? 'Carlos Mendoza' : 'Doña Martha Gómez')} ·{' '}
            {usuarioActual?.rol === 'admin'
              ? 'Administrador'
              : usuarioActual?.apartamento || 'Torre B - Apto 302'}
          </Text>
        </View>

        {/* Botón Logo / Avatar que lleva al perfil */}
        <Pressable
          onPress={() => router.push('/perfil')}
          accessibilityRole="button"
          accessibilityLabel="Ir al perfil del cliente"
          style={estilos.btnPerfilHeader}
        >
          {usuarioActual?.avatarUrl ? (
            <Image source={{ uri: usuarioActual.avatarUrl }} style={estilos.avatarHeaderImg} />
          ) : (
            <Ionicons name="business" size={26} color="#FFF" />
          )}
          <View style={estilos.puntoActivo} />
        </Pressable>
      </View>

      {/* Banner de Estado (Al día o En mora) */}
      {!modoAdmin && recibos.length > 0 && (
        <View style={veredictoMora.permitido ? estilos.bannerAlDia : estilos.bannerMora}>
          <Ionicons
            name={veredictoMora.permitido ? 'checkmark-circle' : 'alert-circle'}
            size={20}
            color={veredictoMora.permitido ? '#166534' : '#991B1B'}
            style={{ marginRight: 10 }}
          />
          <Text style={veredictoMora.permitido ? estilos.bannerAlDiaTexto : estilos.bannerMoraTexto}>
            {veredictoMora.permitido
              ? 'Estado al día · Habilitado para uso y reserva de áreas comunes'
              : veredictoMora.motivoBloqueo}
          </Text>
        </View>
      )}

      {/* Estados de la pantalla */}
      {estadoVista === 'cargando' && <EstadoPantalla tipo="cargando" />}

      {estadoVista === 'error' && (
        <EstadoPantalla
          tipo="error"
          mensaje={mensajeError}
          textoBoton="Reintentar"
          alPresionarBoton={cargar}
        />
      )}

      {estadoVista === 'vacio' && (
        <EstadoPantalla
          tipo="vacio"
          mensaje="Aún no tienes recibos registrados en tu estado de cuenta"
          textoBoton="Subir comprobante"
          alPresionarBoton={() => router.push('/recibo/subir')}
        />
      )}

      {estadoVista === 'conDatos' && (
        <ScrollView
          contentContainerStyle={estilos.scrollContent}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={alRefrescar} colors={['#0F2540']} />}
        >
          {/* ── RECIBO ACTUAL (HERO CARD DESTACADA) ── */}
          {reciboActual && (
            <View style={estilos.seccionHero}>
              <View style={estilos.heroEtiquetaFila}>
                <View style={estilos.badgeReciboActual}>
                  <Ionicons name="sparkles" size={13} color="#0F2540" style={{ marginRight: 5 }} />
                  <Text style={estilos.badgeReciboActualTexto}>RECIBO ACTUAL</Text>
                </View>
                <Text style={estilos.periodoHero}>{reciboActual.periodo}</Text>
              </View>

              <View style={estilos.cardHero}>
                <View style={estilos.cardHeroTop}>
                  <View>
                    <Text style={estilos.labelTotalHero}>Cuota de administración</Text>
                    <Text style={estilos.montoHero}>
                      ${reciboActual.monto.toLocaleString('es-CO')}{' '}
                      <Text style={estilos.monedaHero}>COP</Text>
                    </Text>
                  </View>

                  {/* Badge de Estado */}
                  <View
                    style={[
                      estilos.badgeEstado,
                      reciboActual.estado === 'Pagado' && estilos.badgePagado,
                      reciboActual.estado === 'En validación' && estilos.badgeValidacion,
                      reciboActual.estado === 'En mora' && estilos.badgeMora,
                    ]}
                  >
                    <Text
                      style={[
                        estilos.badgeEstadoTexto,
                        reciboActual.estado === 'Pagado' && { color: '#166534' },
                        reciboActual.estado === 'En validación' && { color: '#854D0E' },
                        reciboActual.estado === 'En mora' && { color: '#991B1B' },
                      ]}
                    >
                      {reciboActual.estado}
                    </Text>
                  </View>
                </View>

                {/* Datos del recibo */}
                <View style={estilos.heroDetalles}>
                  <View style={estilos.filaHeroDato}>
                    <Ionicons name="calendar-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={estilos.heroDatoTexto}>Vence el {reciboActual.fechaVencimiento}</Text>
                  </View>

                  {reciboActual.referenciaBancaria ? (
                    <View style={estilos.filaHeroDato}>
                      <Ionicons name="receipt-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                      <Text style={estilos.heroDatoTexto} numberOfLines={1}>
                        Ref: {reciboActual.referenciaBancaria}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Acciones principales del recibo actual */}
                <View style={estilos.filaAccionesHero}>
                  {reciboActual.estado === 'En mora' ? (
                    <Pressable
                      onPress={() => router.push({ pathname: '/recibo/subir', params: { id: reciboActual.id, idRecibo: reciboActual.id } })}
                      style={estilos.btnHeroPrincipal}
                      accessibilityRole="button"
                      accessibilityLabel="Subir comprobante de pago para este recibo"
                    >
                      <Ionicons name="cloud-upload-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={estilos.btnHeroPrincipalTexto}>Subir Comprobante</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => router.push(`/recibo/${reciboActual.id}`)}
                      style={estilos.btnHeroPrincipal}
                      accessibilityRole="button"
                      accessibilityLabel="Ver detalle del comprobante"
                    >
                      <Ionicons name="eye-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={estilos.btnHeroPrincipalTexto}>Ver Detalle del Recibo</Text>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => router.push(`/recibo/${reciboActual.id}`)}
                    style={estilos.btnHeroSecundario}
                    accessibilityRole="button"
                    accessibilityLabel="Ver opciones del recibo"
                  >
                    <Ionicons name="information-circle-outline" size={20} color="#0F2540" />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* ── SECCIÓN: RECIBOS ANTERIORES (Colapsable y con Búsqueda) ── */}
          {recibosAnteriores.length > 0 && (
            <View style={estilos.seccionAnteriores}>
              <Pressable
                onPress={() => setMostrarAnteriores(!mostrarAnteriores)}
                style={estilos.botonToggleAnteriores}
                accessibilityRole="button"
                accessibilityLabel="Mostrar u ocultar recibos anteriores"
              >
                <View style={estilos.filaToggle}>
                  <Ionicons name="time-outline" size={20} color="#0F2540" style={{ marginRight: 8 }} />
                  <Text style={estilos.tituloAnteriores}>Recibos Anteriores</Text>
                  <View style={estilos.badgeContador}>
                    <Text style={estilos.badgeContadorTexto}>{recibosAnteriores.length}</Text>
                  </View>
                </View>

                <Ionicons
                  name={mostrarAnteriores ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color="#0F2540"
                />
              </Pressable>

              {/* Si está desplegado, mostramos el buscador y los recibos pasados */}
              {mostrarAnteriores && (
                <View style={estilos.contenedorDesplegado}>
                  {/* Buscador de recibos anteriores */}
                  <View style={estilos.cajaBusqueda}>
                    <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                    <TextInput
                      style={estilos.inputBusqueda}
                      value={busqueda}
                      onChangeText={setBusqueda}
                      placeholder="Buscar por mes, estado o referencia..."
                      placeholderTextColor="#94A3B8"
                    />
                    {busqueda ? (
                      <Pressable onPress={() => setBusqueda('')}>
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                      </Pressable>
                    ) : null}
                  </View>

                  {/* Lista de recibos pasados filtrados */}
                  {recibosFiltrados.length === 0 ? (
                    <View style={estilos.vacioBusqueda}>
                      <Text style={estilos.textoVacioBusqueda}>
                        No se encontraron recibos anteriores con esa búsqueda.
                      </Text>
                    </View>
                  ) : (
                    recibosFiltrados.map((item) => (
                      <TarjetaRecibo
                        key={item.id}
                        recibo={item}
                        alTocar={() => router.push(`/recibo/${item.id}`)}
                      />
                    ))
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      <BarraNavegacionModulos />

      <ModalPrivacidadLey1581
        visible={Boolean(usuarioActual && !usuarioActual.aceptoLey1581)}
        alAceptar={aceptarLey1581}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    backgroundColor: '#0F2540',
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextos: { flex: 1, paddingRight: 12 },
  headerTitulo: { color: '#FFF', fontSize: 24, fontWeight: '900', fontFamily: 'Inter_900Black' },
  headerSub: { color: '#94A3B8', fontSize: 13, marginTop: 4, fontFamily: 'Inter_500Medium' },

  btnPerfilHeader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  avatarHeaderImg: { width: 44, height: 44, borderRadius: 22 },
  puntoActivo: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F2540',
  },

  bannerAlDia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#86EFAC',
  },
  bannerAlDiaTexto: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  bannerMora: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
  },
  bannerMoraTexto: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
    fontFamily: 'Inter_600SemiBold',
  },

  scrollContent: { padding: 20, paddingBottom: 40 },

  // Hero Card Recibo Actual
  seccionHero: { marginBottom: 24 },
  heroEtiquetaFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  badgeReciboActual: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeReciboActualTexto: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.5,
  },
  periodoHero: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Inter_700Bold',
  },

  cardHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#0F2540',
    elevation: 3,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  labelTotalHero: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  montoHero: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F2540',
    fontFamily: 'Inter_900Black',
  },
  monedaHero: { fontSize: 16, fontWeight: '600', color: '#64748B' },

  badgeEstado: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgePagado: { backgroundColor: '#DCFCE7' },
  badgeValidacion: { backgroundColor: '#FEF9C3' },
  badgeMora: { backgroundColor: '#FEE2E2' },
  badgeEstadoTexto: { fontSize: 12, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },

  heroDetalles: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 8,
  },
  filaHeroDato: { flexDirection: 'row', alignItems: 'center' },
  heroDatoTexto: { fontSize: 13, color: '#334155', fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1 },

  filaAccionesHero: { flexDirection: 'row', gap: 10 },
  btnHeroPrincipal: {
    flex: 1,
    backgroundColor: '#0F2540',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
  },
  btnHeroPrincipalTexto: { color: '#FFF', fontSize: 15, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  btnHeroSecundario: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sección Recibos Anteriores (Desplegable)
  seccionAnteriores: { marginTop: 8 },
  botonToggleAnteriores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  filaToggle: { flexDirection: 'row', alignItems: 'center' },
  tituloAnteriores: { fontSize: 16, fontWeight: '800', color: '#0F2540', fontFamily: 'Inter_800ExtraBold' },
  badgeContador: {
    backgroundColor: '#0F2540',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeContadorTexto: { color: '#FFF', fontSize: 11, fontWeight: '700', fontFamily: 'Inter_700Bold' },

  contenedorDesplegado: { marginTop: 14 },
  cajaBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 46,
    marginBottom: 16,
  },
  inputBusqueda: { flex: 1, fontSize: 14, color: '#0F2540', fontFamily: 'Inter_500Medium' },
  vacioBusqueda: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  textoVacioBusqueda: { color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium', textAlign: 'center' },
});
