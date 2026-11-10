// src/app/comunidad.tsx — Autores: Margit Dayanna Barrera Gutiérrez, Wilfran Leonardo Betancourt Ardila & Michel Daniela Bayona Díaz (HU-08 #8, HU-11 #11 y TEC-05 #17)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Anuncio, ContactoEmergencia } from '../domain/modelos';
import { RepositorioComunidadHibrido } from '../data/RepositorioComunidadHibrido';
import { useAuth } from '../hooks/AuthContext';
import { EstadoPantalla } from '../components/EstadoPantalla';
import { BarraNavegacionModulos } from '../components/BarraNavegacionModulos';
import { BarraSesionHeader } from '../components/BarraSesionHeader';
import { COLORES } from '../theme/tema';

const repoComunidad = new RepositorioComunidadHibrido();

const CATEGORIAS_ANUNCIO: Array<Anuncio['categoria']> = [
  'Mantenimiento',
  'Asamblea',
  'Seguridad',
  'Convivencia',
];

export default function PantallaComunidad() {
  const { usuarioActual } = useAuth();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modoOffline, setModoOffline] = useState(false);

  // Estado del formulario de nuevo comunicado (Solo Administrador · HU-08)
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState<Anuncio['categoria']>('Mantenimiento');
  const [publicando, setPublicando] = useState(false);
  const [mensajeAdmin, setMensajeAdmin] = useState<string | null>(null);

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

  const publicarComunicadoAdmin = async () => {
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) {
      setMensajeAdmin('⚠️ Por favor completa el título y el contenido del comunicado.');
      return;
    }

    setPublicando(true);
    setMensajeAdmin(null);
    try {
      const creado = await repoComunidad.crearAnuncioAdmin(
        nuevoTitulo,
        nuevoContenido,
        nuevaCategoria
      );
      setAnuncios((prev) => [creado, ...prev.filter((a) => a.id !== creado.id)]);
      setNuevoTitulo('');
      setNuevoContenido('');
      setMensajeAdmin('✅ Comunicado publicado en la Cartelera y respaldado en SQLite.');
    } catch {
      setMensajeAdmin('⚠️ Error al publicar el comunicado.');
    } finally {
      setPublicando(false);
    }
  };

  return (
    <View style={estilos.contenedorPrincipal}>
      {/* Barra de Navegación Modular Persistente */}
      <BarraNavegacionModulos />
      <BarraSesionHeader />

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

          {/* Formulario exclusivo para el Administrador: Publicar Comunicado en Cartelera (HU-08 / Evento #15) */}
          {usuarioActual?.rol === 'admin' && (
            <View style={estilos.panelAdminAnuncio}>
              <Text style={estilos.tituloFormAdmin}>
                🛡️ Nuevo Comunicado Oficial (Solo Administrador · HU-08)
              </Text>
              <Text style={estilos.subtituloFormAdmin}>
                Publica circulares en Supabase con respaldo inmediato en caché SQLite
              </Text>

              <Text style={estilos.etiquetaCampo}>Categoría del anuncio</Text>
              <View style={estilos.filaCategorias}>
                {CATEGORIAS_ANUNCIO.map((cat) => {
                  const activa = nuevaCategoria === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setNuevaCategoria(cat)}
                      accessibilityRole="button"
                      style={[estilos.chipCategoria, activa && estilos.chipCategoriaActiva]}
                    >
                      <Text
                        style={[
                          estilos.chipCategoriaTexto,
                          activa && estilos.chipCategoriaTextoActivo,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={estilos.etiquetaCampo}>Título del comunicado</Text>
              <TextInput
                value={nuevoTitulo}
                onChangeText={setNuevoTitulo}
                placeholder="Ej. Mantenimiento de motobomba Torre A"
                placeholderTextColor="#94A3B8"
                style={estilos.inputAdmin}
              />

              <Text style={estilos.etiquetaCampo}>Contenido detallado</Text>
              <TextInput
                value={nuevoContenido}
                onChangeText={setNuevoContenido}
                placeholder="Escribe el detalle de horarios y recomendaciones para los residentes..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                style={[estilos.inputAdmin, { minHeight: 76, textAlignVertical: 'top' }]}
              />

              {mensajeAdmin && (
                <Text style={estilos.mensajeFeedbackAdmin}>{mensajeAdmin}</Text>
              )}

              <Pressable
                onPress={publicarComunicadoAdmin}
                disabled={publicando}
                accessibilityRole="button"
                accessibilityLabel="Publicar en Cartelera HU-08"
                style={[estilos.btnPublicarAdmin, publicando && { opacity: 0.6 }]}
              >
                <Text style={estilos.btnPublicarAdminTexto}>
                  {publicando ? 'Publicando comunicado...' : '📢 Publicar en Cartelera (HU-08)'}
                </Text>
              </Pressable>
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
  panelAdminAnuncio: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORES.primario,
    elevation: 3,
  },
  tituloFormAdmin: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.primario,
  },
  subtituloFormAdmin: {
    fontSize: 12,
    color: COLORES.textoGris,
    marginTop: 2,
    marginBottom: 12,
  },
  etiquetaCampo: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.textoOscuro,
    marginTop: 8,
    marginBottom: 6,
  },
  filaCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  chipCategoria: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipCategoriaActiva: {
    backgroundColor: COLORES.primario,
    borderColor: COLORES.primario,
  },
  chipCategoriaTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.textoOscuro,
  },
  chipCategoriaTextoActivo: {
    color: COLORES.blanco,
  },
  inputAdmin: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORES.textoOscuro,
  },
  mensajeFeedbackAdmin: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.primario,
    marginTop: 10,
  },
  btnPublicarAdmin: {
    backgroundColor: COLORES.secundario,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 48,
  },
  btnPublicarAdminTexto: {
    color: COLORES.blanco,
    fontWeight: '800',
    fontSize: 14,
  },
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

