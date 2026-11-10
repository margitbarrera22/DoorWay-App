// src/app/comunidad.tsx — Autores: Margit Dayanna Barrera Gutiérrez & Wilfran Leonardo Betancourt Ardila (HU-08 #8, HU-11 #11 y TEC-05 #17)
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Anuncio, ContactoEmergencia } from '../domain/modelos';
import { RepositorioComunidadHibrido } from '../data/RepositorioComunidadHibrido';
import { EstadoPantalla } from '../components/EstadoPantalla';
import { COLORES } from '../theme/tema';

const repoComunidad = new RepositorioComunidadHibrido();

export default function PantallaComunidad() {
  const router = useRouter();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modoOffline, setModoOffline] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    try {
      const res = await repoComunidad.cargarComunidadCompleta();
      setAnuncios(res.anuncios);
      setContactos(res.contactos);
      setModoOffline(res.desdeCacheSqlite);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

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

      {cargando ? (
        <EstadoPantalla tipo="cargando" mensaje="Cargando cartelera y directorio local..." />
      ) : (
        <ScrollView style={estilos.contenedor} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          {modoOffline && (
            <View style={estilos.badgeOffline} accessibilityRole="alert">
              <Text style={estilos.badgeOfflineTexto}>
                ✈️ Modo sin conexión activo: Leyendo Cartelera y Directorio desde SQLite local
              </Text>
            </View>
          )}

          {/* 1. Directorio de Emergencias Directo */}
          <Text style={estilos.tituloSeccion}>🚨 Directorio de Emergencias · Barrancabermeja (HU-11)</Text>
          <Text style={estilos.subtituloSeccion}>Llamada directa en un solo toque (Offline-First)</Text>

          {contactos.map((contacto) => (
            <View key={contacto.id} style={estilos.cardEmergencia}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={estilos.nombreEntidad}>{contacto.entidad}</Text>
                <Text style={estilos.descEntidad}>{contacto.descripcion}</Text>
              </View>
              <Pressable
                onPress={() => llamar(contacto.telefono)}
                accessibilityRole="button"
                accessibilityLabel={`Llamar a ${contacto.entidad} al número ${contacto.telefono}`}
                style={estilos.btnLlamar}
              >
                <Text style={estilos.btnLlamarTexto}>📞 {contacto.telefono}</Text>
              </Pressable>
            </View>
          ))}

          {/* 2. Cartelera de Comunicados */}
          <Text style={[estilos.tituloSeccion, { marginTop: 24 }]}>
            📢 Cartelera Oficial de Administración (HU-08)
          </Text>
          <Text style={estilos.subtituloSeccion}>Comunicados y circulares del conjunto</Text>

          {anuncios.map((anuncio) => (
            <View key={anuncio.id} style={estilos.cardAnuncio}>
              <View style={estilos.filaMeta}>
                <View style={estilos.badgeCategoria}>
                  <Text style={estilos.categoriaTexto}>{anuncio.categoria.toUpperCase()}</Text>
                </View>
                <Text style={estilos.fechaTexto}>{anuncio.fechaPublicacion}</Text>
              </View>
              <Text style={estilos.tituloAnuncio}>{anuncio.titulo}</Text>
              <Text style={estilos.contenidoAnuncio}>{anuncio.contenido}</Text>
            </View>
          ))}
        </ScrollView>
      )}
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
  badgeOffline: {
    backgroundColor: '#FEF9C3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#854D0E',
  },
  badgeOfflineTexto: {
    color: '#854D0E',
    fontWeight: '700',
    fontSize: 13,
  },
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
