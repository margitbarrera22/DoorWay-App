// src/app/comunidad.tsx — HU-08 y HU-11 | Lógica: Wilfran | UX/UI: Margit Barrera
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { Anuncio, ContactoEmergencia } from '../domain/modelos';
import { RepositorioComunidadHibrido } from '../data/RepositorioComunidadHibrido';
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
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modoOffline, setModoOffline] = useState(false);
  const [tabActiva, setTabActiva] = useState<TabActiva>('avisos');

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  async function cargarDatos() {
    setCargando(true);
    try {
      const res = await repoComunidad.cargarComunidadCompleta();
      setAnuncios(res.anuncios);
      setContactos(res.contactos);
      setModoOffline(res.desdeCacheSqlite);
    } catch (error) {
      console.error('Error cargando comunidad:', error);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  if (!fontsLoaded || cargando) {
    return <ActivityIndicator size="large" color="#0F2540" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={estilos.contenedor}>
      {/* Header */}
      <View style={estilos.header}>
        <View style={estilos.headerTextos}>
          <Text style={estilos.headerTitle}>Comunidad</Text>
          <Text style={estilos.headerSub}>Conjunto La Nueva Esperanza</Text>
        </View>
        <View style={estilos.headerIcono}>
          <Ionicons name="people" size={26} color="#FFF" />
        </View>
      </View>

      {/* Banner offline */}
      {modoOffline && (
        <View style={estilos.bannerOffline}>
          <Ionicons name="airplane" size={16} color="#854D0E" style={{ marginRight: 8 }} />
          <Text style={estilos.bannerOfflineTexto}>
            Sin conexión — mostrando caché local
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
      <ScrollView contentContainerStyle={estilos.contenido}>

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
                Toca el número para llamar directamente
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

      <BarraNavegacionModulos />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    backgroundColor: '#0F2540',
    paddingTop: 55,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextos: { flex: 1 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  headerSub: { color: '#94A3B8', fontSize: 13, marginTop: 3, fontFamily: 'Inter_500Medium' },
  headerIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  // Banner offline
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

  // Tabs
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
    borderBottomWidth: 2,
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
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  badge: {
    backgroundColor: '#0F2540',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  badgeTexto: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },

  // Contenido scroll
  contenido: {
    padding: 20,
    paddingBottom: 32,
  },

  // Cartelera
  cardAnuncio: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
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
    padding: 16,
  },
  tituloAnuncio: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2540',
    marginBottom: 6,
    lineHeight: 21,
    fontFamily: 'Inter_700Bold',
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
    borderRadius: 10,
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
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
  infoEmergencia: { flex: 1 },
  nombreEntidad: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2540',
    marginBottom: 3,
    fontFamily: 'Inter_700Bold',
    lineHeight: 19,
  },
  descEntidad: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    fontFamily: 'Inter_500Medium',
  },
  badge24h: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badge24hTexto: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  btnLlamar: {
    backgroundColor: '#0F2540',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 70,
    minHeight: 52,
    marginLeft: 10,
  },
  btnLlamarNumero: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
});
