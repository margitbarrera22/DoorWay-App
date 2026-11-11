// src/app/inicio.tsx — Pantalla de Inicio / Dashboard | UX/UI: Margit Barrera
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useRecibos } from '../hooks/RecibosContext';
import { BarraNavegacionModulos } from '../components/BarraNavegacionModulos';

export default function PantallaInicio() {
  const router = useRouter();
  const { modoAdmin, recibos } = useRecibos();

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
      subtitulo: 'Áreas comunes del conjunto',
      icono: 'calendar',
      color: '#1E40AF',
      ruta: '/reservas',
    },
    {
      titulo: 'Avisos',
      subtitulo: 'Cartelera y emergencias',
      icono: 'notifications',
      color: '#7C3AED',
      ruta: '/comunidad',
    },
  ];

  return (
    <View style={estilos.contenedor}>
      {/* Header de bienvenida */}
      <View style={estilos.header}>
        <View style={estilos.headerContent}>
          <Text style={estilos.bienvenida}>Bienvenido/a 👋</Text>
          <Text style={estilos.nombre}>
            {modoAdmin ? 'Administrador General' : 'Doña Martha · Apt. 302'}
          </Text>
          <View style={estilos.badgeRol}>
            <Ionicons
              name={modoAdmin ? 'shield-checkmark' : 'person-circle'}
              size={14}
              color={modoAdmin ? '#FCD34D' : '#94A3B8'}
              style={{ marginRight: 5 }}
            />
            <Text style={estilos.badgeRolTexto}>
              {modoAdmin ? 'Modo Administrador' : 'Modo Residente'}
            </Text>
          </View>
        </View>
        <View style={estilos.logoContainer}>
          <Ionicons name="business" size={32} color="#FFF" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Resumen rápido */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Resumen del conjunto</Text>
          <View style={estilos.filaStats}>
            <View style={[estilos.cardStat, { borderLeftColor: '#0F2540' }]}>
              <Text style={estilos.statNumero}>{totalRecibos}</Text>
              <Text style={estilos.statEtiqueta}>Recibos</Text>
            </View>
            <View style={[estilos.cardStat, { borderLeftColor: '#166534' }]}>
              <Text style={[estilos.statNumero, { color: '#166534' }]}>{recibosPagados}</Text>
              <Text style={estilos.statEtiqueta}>Pagados</Text>
            </View>
            <View style={[estilos.cardStat, { borderLeftColor: '#991B1B' }]}>
              <Text style={[estilos.statNumero, { color: '#991B1B' }]}>{recibosMora}</Text>
              <Text style={estilos.statEtiqueta}>En mora</Text>
            </View>
          </View>
        </View>

        {/* Accesos rápidos */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Accesos rápidos</Text>
          {accesos.map((item) => (
            <Pressable
              key={item.titulo}
              onPress={() => router.push(item.ruta as any)}
              accessibilityRole="button"
              accessibilityLabel={`Ir a ${item.titulo}`}
              style={estilos.cardAcceso}
            >
              <View style={[estilos.iconoAcceso, { backgroundColor: item.color }]}>
                <Ionicons name={item.icono as any} size={24} color="#FFF" />
              </View>
              <View style={estilos.textoAcceso}>
                <Text style={estilos.tituloAcceso}>{item.titulo}</Text>
                <Text style={estilos.subtituloAcceso}>{item.subtitulo}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </Pressable>
          ))}
        </View>

        {/* Banner informativo */}
        <View style={estilos.banner}>
          <Ionicons name="information-circle" size={20} color="#1E40AF" style={{ marginRight: 10 }} />
          <Text style={estilos.bannerTexto}>
            DoorWay · Gestor de condominios
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
    paddingBottom: 28,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: { flex: 1 },
  bienvenida: { color: '#94A3B8', fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  nombre: { color: '#FFF', fontSize: 20, fontWeight: '900', fontFamily: 'Inter_900Black', marginBottom: 8 },
  badgeRol: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeRolTexto: { color: '#E2E8F0', fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  seccion: { paddingHorizontal: 24, paddingTop: 24 },
  tituloSeccion: { fontSize: 16, fontWeight: '800', color: '#0F2540', marginBottom: 16, fontFamily: 'Inter_800ExtraBold' },
  filaStats: { flexDirection: 'row', gap: 12 },
  cardStat: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statNumero: { fontSize: 28, fontWeight: '900', color: '#0F2540', fontFamily: 'Inter_900Black' },
  statEtiqueta: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2, fontFamily: 'Inter_600SemiBold' },
  cardAcceso: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  iconoAcceso: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textoAcceso: { flex: 1 },
  tituloAcceso: { fontSize: 16, fontWeight: '700', color: '#0F2540', fontFamily: 'Inter_700Bold' },
  subtituloAcceso: { fontSize: 13, color: '#64748B', marginTop: 2, fontFamily: 'Inter_500Medium' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 24,
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bannerTexto: { color: '#1E40AF', fontSize: 13, fontWeight: '600', flex: 1, fontFamily: 'Inter_600SemiBold' },
});

