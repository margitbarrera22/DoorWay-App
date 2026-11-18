// src/app/comunidad.tsx — HU-08 y HU-11 | Lógica: Wilfran | UX/UI: Margit Barrera
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { Anuncio, ContactoEmergencia } from '../domain/modelos';
import { RepositorioComunidadHibrido } from '../data/RepositorioComunidadHibrido';
import {
  guardarPreferenciaSqlite,
  obtenerPreferenciaSqlite,
  leerAnunciosDeSqlite,
  leerDirectorioDeSqlite,
} from '../data/dbLocalSqlite';
import { useAuth } from '../hooks/AuthContext';
import { EstadoPantalla } from '../components/EstadoPantalla';
import { BarraNavegacionModulos } from '../components/BarraNavegacionModulos';

const repoComunidad = new RepositorioComunidadHibrido();

// Colores por categoría de anuncio
const COLORES_CATEGORIA: Record<string, { bg: string; texto: string; icono: string }> = {
  Mantenimiento: { bg: '#FEF9C3', texto: '#854D0E', icono: 'construct' },
  Asamblea:      { bg: '#EDE9FE', texto: '#5B21B6', icono: 'people' },
  Seguridad:     { bg: '#FEE2E2', texto: '#991B1B', icono: 'shield' },
  Convivencia:   { bg: '#DCFCE7', texto: '#166534', icono: 'heart' },
};

type TabActiva = 'avisos' | 'directorio';

export default function PantallaComunidad() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { usuarioActual } = useAuth();

  const [anuncios, setAnuncios] = useState<Anuncio[]>(() => {
    try {
      return leerAnunciosDeSqlite();
    } catch {
      return [];
    }
  });
  const [contactos, setContactos] = useState<ContactoEmergencia[]>(() => {
    try {
      return leerDirectorioDeSqlite();
    } catch {
      return [];
    }
  });
  // Carga instantánea: no bloquea con spinner, muestra la caché local inmediatamente
  const [cargando, setCargando] = useState(false);
  const [modoOffline, setModoOffline] = useState(false);
  const [mostrarModalCampana, setMostrarModalCampana] = useState(false);
  const [notificacionesLeidas, setNotificacionesLeidas] = useState(false);
  const [tabActiva, setTabActiva] = useState<TabActiva>('avisos');
  const [notificacionesActivas, setNotificacionesActivas] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    let montado = true;
    async function sincronizarEnSegundoPlano() {
      try {
        const res = await Promise.race([
          repoComunidad.cargarComunidadCompleta(),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
        ]);
        if (montado && res) {
          if (res.anuncios && res.anuncios.length > 0) setAnuncios(res.anuncios);
          if (res.contactos && res.contactos.length > 0) setContactos(res.contactos);
          setModoOffline(Boolean(res.desdeCacheSqlite));
        }
      } catch {
        // Red lenta o sin conexión: la vista ya está renderizada desde SQLite
      }

      try {
        const pref = await obtenerPreferenciaSqlite('notificaciones_activadas');
        if (montado && pref !== null) {
          setNotificacionesActivas(pref === 'true');
        }
      } catch {}
    }

    sincronizarEnSegundoPlano();
    return () => {
      montado = false;
    };
  }, []);

  const alternarNotificaciones = async (valor: boolean) => {
    setNotificacionesActivas(valor);
    await guardarPreferenciaSqlite('notificaciones_activadas', valor ? 'true' : 'false');
    if (valor) {
      Alert.alert(
        '¡Notificaciones Activadas! 🔔',
        'Recibirás alertas en tiempo real sobre cortes de agua, mantenimientos, convocatorias a asamblea y avisos de seguridad.'
      );
    } else {
      Alert.alert(
        'Notificaciones en Pausa',
        'Has desactivado las notificaciones instantáneas de avisos de la comunidad.'
      );
    }
  };

  if (!fontsLoaded) {
    return null;
  }
  if (cargando && anuncios.length === 0) {
    return <ActivityIndicator size="large" color="#0F2540" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={estilos.contenedor}>
      {/* Header corporativo */}
      <View style={[estilos.header, { paddingTop: Math.max(insets.top, 24) + 12 }]}>
        <View style={estilos.headerTextos}>
          <Text style={estilos.headerTitle}>Avisos y Comunidad</Text>
          <Text style={estilos.headerSub}>Conjunto La Nueva Esperanza · Barrancabermeja</Text>
        </View>

        <View style={estilos.headerAccionesDerecha}>
          {/* Campanita de notificación de la comunidad propuesta por el profesor */}
          <Pressable
            onPress={() => setMostrarModalCampana(true)}
            accessibilityRole="button"
            accessibilityLabel="Abrir alertas y notificaciones comunitarias"
            style={estilos.btnCampanaHeader}
          >
            <Ionicons
              name={notificacionesActivas ? 'notifications' : 'notifications-outline'}
              size={22}
              color="#FFF"
            />
            {!notificacionesLeidas && (
              <View style={estilos.badgeCampana}>
                <Text style={estilos.badgeCampanaTexto}>3</Text>
              </View>
            )}
          </Pressable>

          {/* Botón de Perfil en el Header */}
          <Pressable
            onPress={() => router.push('/perfil')}
            accessibilityRole="button"
            accessibilityLabel="Ir al perfil del usuario"
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
      </View>

      {/* Banner offline */}
      {modoOffline && (
        <View style={estilos.bannerOffline}>
          <Ionicons name="airplane" size={16} color="#854D0E" style={{ marginRight: 8 }} />
          <Text style={estilos.bannerOfflineTexto}>
            Sin conexión — mostrando avisos y emergencias en caché local
          </Text>
        </View>
      )}

      {/* Tabs internos */}
      <View style={estilos.tabsRow}>
        <Pressable
          onPress={() => setTabActiva('avisos')}
          style={[estilos.tab, tabActiva === 'avisos' && estilos.tabActivo]}
          accessibilityRole="tab"
        >
          <Ionicons
            name={tabActiva === 'avisos' ? 'megaphone' : 'megaphone-outline'}
            size={16}
            color={tabActiva === 'avisos' ? '#0F2540' : '#94A3B8'}
            style={{ marginRight: 6 }}
          />
          <Text style={[estilos.tabTexto, tabActiva === 'avisos' && estilos.tabTextoActivo]}>
            Cartelera
          </Text>
          {anuncios.length > 0 && (
            <View style={estilos.badge}>
              <Text style={estilos.badgeTexto}>{anuncios.length}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => setTabActiva('directorio')}
          style={[estilos.tab, tabActiva === 'directorio' && estilos.tabActivo]}
          accessibilityRole="tab"
        >
          <Ionicons
            name={tabActiva === 'directorio' ? 'call' : 'call-outline'}
            size={16}
            color={tabActiva === 'directorio' ? '#0F2540' : '#94A3B8'}
            style={{ marginRight: 6 }}
          />
          <Text style={[estilos.tabTexto, tabActiva === 'directorio' && estilos.tabTextoActivo]}>
            Emergencias
          </Text>
        </Pressable>
      </View>

      {/* Contenido según tab */}
      <ScrollView contentContainerStyle={[estilos.contenido, { paddingBottom: Math.max(insets.bottom, 16) + 70 }]}>
        {/* ── SECCIÓN DE PERMISOS DE NOTIFICACIONES ── */}
        <View style={estilos.cardNotificaciones}>
          <View style={estilos.iconoNotificacion}>
            <Ionicons
              name={notificacionesActivas ? 'notifications' : 'notifications-off-outline'}
              size={22}
              color="#0F2540"
            />
          </View>
          <View style={estilos.textosNotificacion}>
            <Text style={estilos.tituloNotificacion}>Permitir Notificaciones</Text>
            <Text style={estilos.subtituloNotificacion}>
              {notificacionesActivas
                ? 'Alertas activadas para cortes, asambleas y seguridad'
                : 'Activa para recibir alertas comunitarias al instante'}
            </Text>
          </View>
          <Switch
            value={notificacionesActivas}
            onValueChange={alternarNotificaciones}
            trackColor={{ false: '#CBD5E1', true: '#0F2540' }}
            thumbColor={notificacionesActivas ? '#FFFFFF' : '#F1F5F9'}
          />
        </View>

        {/* ── CARTELERA ── */}
        {tabActiva === 'avisos' && (
          <>
            {anuncios.length === 0 ? (
              <EstadoPantalla tipo="vacio" mensaje="No hay anuncios publicados por el momento." />
            ) : (
              anuncios.map((anuncio) => {
                const cat = COLORES_CATEGORIA[anuncio.categoria] ?? {
                  bg: '#F1F5F9', texto: '#475569', icono: 'information-circle',
                };
                return (
                  <View key={anuncio.id} style={estilos.cardAnuncio}>
                    {/* Franja de categoría */}
                    <View style={[estilos.franjaCategoria, { backgroundColor: cat.bg }]}>
                      <Ionicons name={cat.icono as any} size={14} color={cat.texto} style={{ marginRight: 6 }} />
                      <Text style={[estilos.categoriaTexto, { color: cat.texto }]}>
                        {anuncio.categoria.toUpperCase()}
                      </Text>
                      <View style={{ flex: 1 }} />
                      <Ionicons name="calendar-outline" size={13} color={cat.texto} style={{ marginRight: 4 }} />
                      <Text style={[estilos.fechaTexto, { color: cat.texto }]}>
                        {anuncio.fechaPublicacion}
                      </Text>
                    </View>
                    {/* Cuerpo */}
                    <View style={estilos.cuerpoAnuncio}>
                      <Text style={estilos.tituloAnuncio}>{anuncio.titulo}</Text>
                      <Text style={estilos.contenidoAnuncio}>{anuncio.contenido}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ── DIRECTORIO DE EMERGENCIAS ── */}
        {tabActiva === 'directorio' && (
          <>
            <View style={estilos.infoDirectorio}>
              <Ionicons name="flash" size={16} color="#991B1B" style={{ marginRight: 8 }} />
              <Text style={estilos.infoDirectorioTexto}>
                Toca el número para llamar directamente desde tu celular
              </Text>
            </View>

            {contactos.map((contacto) => (
              <View key={contacto.id} style={estilos.cardEmergencia}>
                <View style={estilos.iconoEmergencia}>
                  <Ionicons name="call" size={20} color="#0F2540" />
                </View>
                <View style={estilos.infoEmergencia}>
                  <Text style={estilos.nombreEntidad}>{contacto.entidad}</Text>
                  <Text style={estilos.descEntidad}>{contacto.descripcion}</Text>
                  {contacto.disponible24h && (
                    <View style={estilos.badge24h}>
                      <Ionicons name="time" size={11} color="#166534" style={{ marginRight: 3 }} />
                      <Text style={estilos.badge24hTexto}>24 horas</Text>
                    </View>
                  )}
                </View>
                <Pressable
                  onPress={() => Linking.openURL(`tel:${contacto.telefono}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Llamar a ${contacto.entidad}`}
                  style={estilos.btnLlamar}
                >
                  <Text style={estilos.btnLlamarNumero}>{contacto.telefono}</Text>
                  <Ionicons name="call" size={14} color="#FFF" style={{ marginTop: 2 }} />
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Modal de Centro de Notificaciones Comunitarias (Propuesta del profesor) */}
      <Modal
        visible={mostrarModalCampana}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarModalCampana(false)}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenido}>
            <View style={estilos.modalCabecera}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={estilos.modalIconoCampana}>
                  <Ionicons name="notifications" size={20} color="#0F2540" />
                </View>
                <View>
                  <Text style={estilos.modalTitulo}>Notificaciones</Text>
                  <Text style={estilos.modalSubtitulo}>Avisos y alertas comunitarias</Text>
                </View>
              </View>
              <Pressable
                onPress={() => setMostrarModalCampana(false)}
                accessibilityRole="button"
                accessibilityLabel="Cerrar notificaciones"
                style={estilos.btnCerrarModal}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            {/* Switch rápido de alertas */}
            <View style={estilos.modalFilaSwitch}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={estilos.modalTextoSwitch}>Alertas instantáneas</Text>
                <Text style={estilos.modalDescSwitch}>
                  {notificacionesActivas ? 'Notificaciones activadas' : 'Alertas en pausa'}
                </Text>
              </View>
              <Switch
                value={notificacionesActivas}
                onValueChange={alternarNotificaciones}
                trackColor={{ false: '#CBD5E1', true: '#0F2540' }}
                thumbColor={notificacionesActivas ? '#FFFFFF' : '#F1F5F9'}
              />
            </View>

            {/* Lista de alertas recientes */}
            <ScrollView style={estilos.modalListaAlertas} showsVerticalScrollIndicator={false}>
              <View style={estilos.itemAlerta}>
                <View style={[estilos.iconoTipoAlerta, { backgroundColor: '#FEF9C3' }]}>
                  <Ionicons name="water" size={16} color="#854D0E" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={estilos.tituloItemAlerta}>Corte de Agua Programado</Text>
                    <Text style={estilos.tiempoItemAlerta}>Hace 2h</Text>
                  </View>
                  <Text style={estilos.descItemAlerta}>
                    Lavado de tanques en Torre A y B. Suspensión de 8:00 AM a 2:00 PM.
                  </Text>
                </View>
              </View>

              <View style={estilos.itemAlerta}>
                <View style={[estilos.iconoTipoAlerta, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name="people" size={16} color="#5B21B6" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={estilos.tituloItemAlerta}>Convocatoria Asamblea</Text>
                    <Text style={estilos.tiempoItemAlerta}>Ayer</Text>
                  </View>
                  <Text style={estilos.descItemAlerta}>
                    Asamblea extraordinaria de copropietarios el sábado 28 en el Salón Social.
                  </Text>
                </View>
              </View>

              <View style={estilos.itemAlerta}>
                <View style={[estilos.iconoTipoAlerta, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="shield-checkmark" size={16} color="#991B1B" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={estilos.tituloItemAlerta}>Seguridad en Portería</Text>
                    <Text style={estilos.tiempoItemAlerta}>Hace 3d</Text>
                  </View>
                  <Text style={estilos.descItemAlerta}>
                    Registro de cédula obligatorio para domiciliarios y visitantes peatonales.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Botón de acción */}
            <View style={estilos.modalPie}>
              <Pressable
                onPress={() => {
                  setNotificacionesLeidas(true);
                  setMostrarModalCampana(false);
                }}
                style={estilos.btnMarcarLeidas}
                accessibilityRole="button"
                accessibilityLabel="Marcar todas las alertas como leídas"
              >
                <Ionicons name="checkmark-done" size={16} color="#0F2540" style={{ marginRight: 6 }} />
                <Text style={estilos.btnMarcarLeidasTexto}>Marcar todas como leídas</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <BarraNavegacionModulos />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    backgroundColor: '#0F2540',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextos: { flex: 1, paddingRight: 8 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  headerSub: { color: '#94A3B8', fontSize: 11, marginTop: 2, fontFamily: 'Inter_500Medium' },

  btnPerfilHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  avatarHeaderImg: { width: 36, height: 36, borderRadius: 18 },
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

  bannerOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE047',
  },
  bannerOfflineTexto: { color: '#854D0E', fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActivo: {
    borderBottomColor: '#0F2540',
  },
  tabTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    fontFamily: 'Inter_600SemiBold',
  },
  tabTextoActivo: {
    color: '#0F2540',
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
  badge: {
    backgroundColor: '#0F2540',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
    marginLeft: 6,
  },
  badgeTexto: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },

  contenido: {
    padding: 20,
    paddingBottom: 32,
  },

  // Card Notificaciones
  cardNotificaciones: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  iconoNotificacion: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textosNotificacion: { flex: 1, paddingRight: 10 },
  tituloNotificacion: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
    marginBottom: 2,
  },
  subtituloNotificacion: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: 'Inter_500Medium',
  },

  // Cartelera
  cardAnuncio: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  franjaCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoriaTexto: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
  fechaTexto: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  cuerpoAnuncio: {
    padding: 18,
  },
  tituloAnuncio: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2540',
    marginBottom: 6,
    lineHeight: 21,
    fontFamily: 'Inter_800ExtraBold',
  },
  contenidoAnuncio: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
    fontFamily: 'Inter_500Medium',
  },

  // Directorio de emergencias
  infoDirectorio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  infoDirectorioTexto: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  cardEmergencia: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  iconoEmergencia: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoEmergencia: { flex: 1, minWidth: 0, paddingRight: 8 },
  nombreEntidad: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2540',
    marginBottom: 2,
    fontFamily: 'Inter_700Bold',
    lineHeight: 18,
  },
  descEntidad: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: 'Inter_500Medium',
  },
  badge24h: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badge24hTexto: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  btnLlamar: {
    backgroundColor: '#0F2540',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 64,
    minHeight: 46,
    marginLeft: 6,
    flexShrink: 0,
    elevation: 2,
  },
  btnLlamarNumero: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
    fontFamily: 'Inter_800ExtraBold',
  },
  headerAccionesDerecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnCampanaHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeCampana: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0F2540',
    paddingHorizontal: 3,
  },
  badgeCampanaTexto: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'Inter_900Black',
  },

  // Estilos del Modal de Notificaciones Comunitarias
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 37, 64, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContenido: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalCabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalIconoCampana: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },
  modalSubtitulo: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
  },
  btnCerrarModal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFilaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTextoSwitch: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },
  modalDescSwitch: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  modalListaAlertas: {
    maxHeight: 250,
  },
  itemAlerta: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  iconoTipoAlerta: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloItemAlerta: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },
  tiempoItemAlerta: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Inter_500Medium',
  },
  descItemAlerta: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
    lineHeight: 17,
    fontFamily: 'Inter_500Medium',
  },
  modalPie: {
    marginTop: 16,
    paddingTop: 12,
  },
  btnMarcarLeidas: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnMarcarLeidasTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },
});
