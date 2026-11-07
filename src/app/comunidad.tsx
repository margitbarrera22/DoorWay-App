// src/app/comunidad.tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-08 #8 y HU-11 #11)
import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORES } from '../theme/tema';

const DIRECTORIO_BARRANCABERMEJA = [
  {
    id: 'em-01',
    entidad: 'Portería Principal · Conjunto La Nueva Esperanza',
    telefono: '3158894021',
    descripcion: 'Vigilancia interna, apertura de portón y control de visitantes.',
  },
  {
    id: 'em-02',
    entidad: 'Policía Nacional · Cuadrante Barrancabermeja',
    telefono: '123',
    descripcion: 'Atención inmediata de emergencias de seguridad y cuadrante.',
  },
  {
    id: 'em-03',
    entidad: 'Bomberos Voluntarios de Barrancabermeja',
    telefono: '119',
    descripcion: 'Incendios, fugas de gas, rescates e inundaciones.',
  },
  {
    id: 'em-04',
    entidad: 'Urgencias Servicios Públicos (Aguas / ESSA)',
    telefono: '115',
    descripcion: 'Reporte de daños eléctricos en torres o rotura de tuberías.',
  },
];

const ANUNCIOS_INICIALES = [
  {
    id: 'anu-01',
    categoria: 'Mantenimiento',
    fecha: '2026-11-05',
    titulo: 'Corte programado de agua por lavado de tanques',
    contenido:
      'Este sábado de 8:00 AM a 12:00 PM se realizará mantenimiento preventivo del tanque elevado de las Torres A y B.',
  },
  {
    id: 'anu-02',
    categoria: 'Asamblea',
    fecha: '2026-11-04',
    titulo: 'Asamblea extraordinaria de copropietarios',
    contenido:
      'Se cita a todos los residentes el próximo viernes a las 7:00 PM en el Salón Social para aprobar el presupuesto de seguridad.',
  },
  {
    id: 'anu-03',
    categoria: 'Seguridad',
    fecha: '2026-11-03',
    titulo: 'Control de ingreso vehicular en portería',
    contenido:
      'Recuerde anunciar a sus visitantes con anticipación y mantener al día su cuota de administración para uso del BBQ.',
  },
];

export default function PantallaComunidad() {
  const router = useRouter();
  const llamar = (telefono: string) => {
    Linking.openURL(`tel:${telefono}`);
  };

  return (
    <View style={estilos.contenedorPrincipal}>
      {/* Barra de Navegación Modular Persistente */}
      <View style={estilos.barraModulos}>
        <Pressable
          accessibilityRole="tab"
          onPress={() => router.push('/')}
          style={estilos.tabModulo}
        >
          <Text style={estilos.textoModulo}>💳 Cartera</Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          onPress={() => router.push('/reservas')}
          style={estilos.tabModulo}
        >
          <Text style={estilos.textoModulo}>📅 Reservas</Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: true }}
          style={[estilos.tabModulo, estilos.tabModuloActivo]}
        >
          <Text style={[estilos.textoModulo, estilos.textoModuloActivo]}>📢 Comunidad</Text>
        </Pressable>
      </View>

      <ScrollView style={estilos.contenedor} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {/* 1. Directorio de Emergencias Directo */}
        <Text style={estilos.tituloSeccion}>🚨 Directorio de Emergencias · Barrancabermeja</Text>
        <Text style={estilos.subtituloSeccion}>Llamada directa en un solo toque (HU-11)</Text>

        {DIRECTORIO_BARRANCABERMEJA.map((contacto) => (
          <View key={contacto.id} style={estilos.cardEmergencia}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={estilos.nombreEntidad}>{contacto.entidad}</Text>
              <Text style={estilos.descEntidad}>{contacto.descripcion}</Text>
            </View>
            <Pressable
              onPress={() => llamar(contacto.telefono)}
              accessibilityRole="button"
              accessibilityLabel={`Llamar a ${contacto.entidad}`}
              style={estilos.btnLlamar}
            >
              <Text style={estilos.btnLlamarTexto}>📞 {contacto.telefono}</Text>
            </Pressable>
          </View>
        ))}

        {/* 2. Cartelera de Comunicados */}
        <Text style={[estilos.tituloSeccion, { marginTop: 24 }]}>
          📢 Cartelera Oficial de Administración
        </Text>
        <Text style={estilos.subtituloSeccion}>Comunicados y circulares del conjunto (HU-08)</Text>

        {ANUNCIOS_INICIALES.map((anuncio) => (
          <View key={anuncio.id} style={estilos.cardAnuncio}>
            <View style={estilos.filaMeta}>
              <View style={estilos.badgeCategoria}>
                <Text style={estilos.categoriaTexto}>{anuncio.categoria.toUpperCase()}</Text>
              </View>
              <Text style={estilos.fechaTexto}>{anuncio.fecha}</Text>
            </View>
            <Text style={estilos.tituloAnuncio}>{anuncio.titulo}</Text>
            <Text style={estilos.contenidoAnuncio}>{anuncio.contenido}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedorPrincipal: { flex: 1, backgroundColor: COLORES.fondo },
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },
  barraModulos: {
    flexDirection: 'row',
    backgroundColor: COLORES.blanco,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  tabModulo: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tabModuloActivo: { backgroundColor: COLORES.primario },
  textoModulo: { fontSize: 13, fontWeight: '800', color: COLORES.textoOscuro },
  textoModuloActivo: { color: COLORES.blanco },
  tituloSeccion: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORES.primario,
  },
  subtituloSeccion: {
    fontSize: 12,
    color: COLORES.textoGris,
    marginTop: 2,
    marginBottom: 12,
  },
  cardEmergencia: {
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nombreEntidad: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.primario,
  },
  descEntidad: {
    fontSize: 12,
    color: COLORES.textoGris,
    marginTop: 3,
    lineHeight: 16,
  },
  btnLlamar: {
    backgroundColor: '#166534',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLlamarTexto: {
    color: COLORES.blanco,
    fontWeight: '800',
    fontSize: 13,
  },
  cardAnuncio: {
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filaMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeCategoria: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoriaTexto: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.secundario,
  },
  fechaTexto: {
    fontSize: 12,
    color: COLORES.textoGris,
    fontWeight: '600',
  },
  tituloAnuncio: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.textoOscuro,
    marginBottom: 6,
  },
  contenidoAnuncio: {
    fontSize: 13,
    color: COLORES.textoOscuro,
    lineHeight: 19,
  },
});
