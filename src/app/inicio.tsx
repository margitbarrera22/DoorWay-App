// src/app/inicio.tsx — Pantalla de Inicio / Dashboard | UX/UI: Margit Barrera & Wilfran Betancourt
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useRecibos } from '../hooks/RecibosContext';
import { useAuth } from '../hooks/AuthContext';
import { BarraNavegacionModulos } from '../components/BarraNavegacionModulos';

export default function PantallaInicio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { modoAdmin, recibos } = useRecibos();
  const { usuarioActual } = useAuth();

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0F2540" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  const totalRecibos = recibos.length;
  const recibosMora = recibos.filter((r) => r.estado === 'En mora').length;
  const recibosPagados = recibos.filter((r) => r.estado === 'Pagado').length;
  const recibosValidacion = recibos.filter((r) => r.estado === 'En validación').length;

  const porcentajeAlDia = totalRecibos > 0 ? Math.round((recibosPagados / totalRecibos) * 100) : 100;

  const accesos = [
    {
      titulo: 'Cartera',
      subtitulo: 'Estado de cuenta y recibos',
      icono: 'wallet',
      color: '#0F2540',
      ruta: '/',
    },
    {
      titulo: 'Reservas',
      subtitulo: 'Salón Social y Kiosco BBQ',
      icono: 'calendar',
      color: '#0F2540',
      ruta: '/reservas',
    },
    {
      titulo: 'Avisos',
      subtitulo: 'Cartelera y emergencias 24h',
      icono: 'notifications',
      color: '#0F2540',
      ruta: '/comunidad',
    },
  ];

  return (
    <View style={estilos.contenedor}>
      {/* Header corporativo */}
      <View style={[estilos.header, { paddingTop: Math.max(insets.top, 24) + 12 }]}>
        <View style={estilos.headerContent}>
          <Text style={estilos.bienvenida}>Bienvenido/a 👋</Text>
          <Text style={estilos.nombre} numberOfLines={1}>
            {usuarioActual?.nombre || (modoAdmin ? 'Carlos Mendoza' : 'Doña Martha Gómez')}
          </Text>
          <View style={estilos.badgeRol}>
            <Ionicons
              name={modoAdmin ? 'shield-checkmark' : 'home'}
              size={13}
              color="#CBD5E1"
              style={{ marginRight: 5 }}
            />
            <Text style={estilos.badgeRolTexto}>
              {usuarioActual?.rol === 'admin'
                ? 'Administración General'
                : usuarioActual?.apartamento || 'Torre B - Apto 302'}
            </Text>
          </View>
        </View>

        {/* Botón de Perfil en el Header (Logo / Avatar) */}
        <Pressable
          onPress={() => router.push('/perfil')}
          accessibilityRole="button"
          accessibilityLabel="Abrir mi perfil de usuario"
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

      <ScrollView contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 70 }}>
        {/* Resumen Ejecutivo del Conjunto (Diseño Profesional Cohesivo) */}
        <View style={estilos.seccion}>
          <View style={estilos.cardResumenEjecutivo}>
            <View style={estilos.resumenHeader}>
              <View>
                <Text style={estilos.tituloResumen}>Resumen del Conjunto</Text>
                <Text style={estilos.subtituloResumen}>Balance consolidado de la copropiedad</Text>
              </View>
              <View style={estilos.badgePeriodo}>
                <Text style={estilos.badgePeriodoTexto}>2026</Text>
              </View>
            </View>

            {/* Fila de Métricas */}
            <View style={estilos.filaMetricas}>
              {/* Tarjeta 1: Total */}
              <View style={estilos.itemMetrica}>
                <View style={estilos.iconoMetricaTotal}>
                  <Ionicons name="documents-outline" size={18} color="#0F2540" />
                </View>
                <Text style={estilos.numeroMetrica}>{totalRecibos}</Text>
                <Text style={estilos.labelMetrica}>Recibos</Text>
              </View>

              {/* Tarjeta 2: Pagados */}
              <View style={estilos.itemMetrica}>
                <View style={estilos.iconoMetricaPagado}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#166534" />
                </View>
                <Text style={[estilos.numeroMetrica, { color: '#166534' }]}>{recibosPagados}</Text>
                <Text style={estilos.labelMetrica}>Pagados</Text>
              </View>

              {/* Tarjeta 3: En Mora */}
              <View style={estilos.itemMetrica}>
                <View style={estilos.iconoMetricaMora}>
                  <Ionicons name="alert-circle-outline" size={18} color="#991B1B" />
                </View>
                <Text style={[estilos.numeroMetrica, { color: '#991B1B' }]}>{recibosMora}</Text>
                <Text style={estilos.labelMetrica}>En mora</Text>
              </View>
            </View>

            {/* Barra de progreso de recaudo */}
            <View style={estilos.contenedorProgreso}>
              <View style={estilos.filaTextoProgreso}>
                <Text style={estilos.textoProgresoLabel}>Efectividad de recaudo</Text>
                <Text style={estilos.textoProgresoValor}>{porcentajeAlDia}%</Text>
              </View>
              <View style={estilos.barraFondo}>
                <View style={[estilos.barraRelleno, { width: `${porcentajeAlDia}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Accesos rápidos */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Módulos Principales</Text>
          {accesos.map((item) => (
            <Pressable
              key={item.titulo}
              onPress={() => router.push(item.ruta as any)}
              accessibilityRole="button"
              accessibilityLabel={`Ir a ${item.titulo}`}
              style={estilos.cardAcceso}
            >
              <View style={[estilos.iconoAcceso, { backgroundColor: item.color }]}>
                <Ionicons name={item.icono as any} size={22} color="#FFF" />
              </View>
              <View style={estilos.textoAcceso}>
                <Text style={estilos.tituloAcceso}>{item.titulo}</Text>
                <Text style={estilos.subtituloAcceso}>{item.subtitulo}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </Pressable>
          ))}
        </View>

        {/* Banner informativo institucional */}
        <View style={estilos.banner}>
          <Ionicons name="shield-checkmark" size={20} color="#0F2540" style={{ marginRight: 10 }} />
          <Text style={estilos.bannerTexto}>
            DoorWay · Conjunto La Nueva Esperanza · Barrancabermeja
          </Text>
        </View>
      </ScrollView>

      <BarraNavegacionModulos />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#0F2540',
    paddingTop: 55,
    paddingBottom: 24,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: { flex: 1, paddingRight: 12 },
  bienvenida: { color: '#94A3B8', fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  nombre: { color: '#FFF', fontSize: 22, fontWeight: '900', fontFamily: 'Inter_900Black', marginBottom: 6 },
  badgeRol: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeRolTexto: { color: '#E2E8F0', fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  btnPerfilHeader: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  avatarHeaderImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  puntoActivo: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F2540',
  },

  seccion: { paddingHorizontal: 20, paddingTop: 20 },
  tituloSeccion: { fontSize: 16, fontWeight: '800', color: '#0F2540', marginBottom: 14, fontFamily: 'Inter_800ExtraBold' },

  // Card Resumen Ejecutivo
  cardResumenEjecutivo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  resumenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tituloResumen: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },
  subtituloResumen: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  badgePeriodo: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePeriodoTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },

  filaMetricas: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  itemMetrica: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconoMetricaTotal: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconoMetricaPagado: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconoMetricaMora: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  numeroMetrica: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F2540',
    fontFamily: 'Inter_900Black',
  },
  labelMetrica: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    fontFamily: 'Inter_600SemiBold',
  },

  contenedorProgreso: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  filaTextoProgreso: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  textoProgresoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  textoProgresoValor: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },
  barraFondo: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    backgroundColor: '#0F2540',
    borderRadius: 4,
  },

  cardAcceso: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  iconoAcceso: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textoAcceso: { flex: 1 },
  tituloAcceso: { fontSize: 15, fontWeight: '700', color: '#0F2540', fontFamily: 'Inter_700Bold' },
  subtituloAcceso: { fontSize: 12, color: '#64748B', marginTop: 2, fontFamily: 'Inter_500Medium' },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bannerTexto: { color: '#0F2540', fontSize: 12, fontWeight: '600', flex: 1, fontFamily: 'Inter_600SemiBold' },
});
