// src/app/index.tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-03 #3)
import React, { useState } from 'react';
import { View, FlatList, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecibos } from '../hooks/RecibosContext';
import { TarjetaRecibo } from '../components/TarjetaRecibo';
import { EstadoPantalla } from '../components/EstadoPantalla';
import { COLORES } from '../theme/tema';
import { evaluarDerechoAReservar } from '../domain/reglasNegocio';

export default function PantallaEstadoCuenta() {
  const router = useRouter();
  const { recibos, estadoVista, mensajeError, cargar, modoAdmin, alternarModoAdmin } = useRecibos();
  const [refrescando, setRefrescando] = useState(false);

  const alRefrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  const veredictoMora = evaluarDerechoAReservar(recibos);

  return (
    <View style={estilos.contenedor}>
      {/* 1. Barra de Navegación de Módulos (Nivel Superior) */}
      <View style={estilos.barraModulos}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: true }}
          style={[estilos.tabModulo, estilos.tabModuloActivo]}
        >
          <Text style={[estilos.textoModulo, estilos.textoModuloActivo]}>💳 Cartera</Text>
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
          onPress={() => router.push('/comunidad')}
          style={estilos.tabModulo}
        >
          <Text style={estilos.textoModulo}>📢 Comunidad</Text>
        </Pressable>
      </View>

      {/* 2. Barra de Rol y Contexto de Usuario */}
      <View style={estilos.barraRol}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.subtituloRol}>SESIÓN ACTIVA</Text>
          <Text style={estilos.textoRol}>
            {modoAdmin ? '🛡️ Administrador General' : '👤 Residente: Doña Martha (302)'}
          </Text>
        </View>
        <Pressable
          onPress={alternarModoAdmin}
          accessibilityRole="button"
          accessibilityLabel="Cambiar entre vista de Residente y Administrador"
          style={estilos.btnRol}
        >
          <Text style={estilos.btnRolTexto}>Cambiar Rol</Text>
        </Pressable>
      </View>

      {/* 3. Indicador de Estado de Mora (HU-02 Regla de Negocio) */}
      {!modoAdmin && recibos.length > 0 && (
        <View style={veredictoMora.permitido ? estilos.bannerAlDia : estilos.bannerMora}>
          <Text style={veredictoMora.permitido ? estilos.bannerAlDiaTexto : estilos.bannerMoraTexto}>
            {veredictoMora.permitido
              ? '✅ Estado al día · Tienes derecho a reservar áreas comunes'
              : `⚠️ ${veredictoMora.motivoBloqueo}`}
          </Text>
        </View>
      )}

      {/* 4. Estados de la Pantalla */}
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
        <FlatList
          data={recibos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshing={refrescando}
          onRefresh={alRefrescar}
          ListHeaderComponent={
            <View style={estilos.headerLista}>
              <Text style={estilos.tituloSeccion}>Historial de Facturación y Recibos</Text>
              <Text style={estilos.contadorRecibos}>
                {recibos.length} {recibos.length === 1 ? 'recibo' : 'recibos'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TarjetaRecibo
              recibo={item}
              alTocar={() => router.push(`/recibo/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
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
  tabModuloActivo: {
    backgroundColor: COLORES.primario,
  },
  textoModulo: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.textoOscuro,
  },
  textoModuloActivo: {
    color: COLORES.blanco,
  },
  barraRol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EEF2F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  subtituloRol: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.textoGris,
    letterSpacing: 0.8,
  },
  textoRol: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.primario,
    marginTop: 2,
  },
  btnRol: {
    backgroundColor: COLORES.secundario,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRolTexto: {
    color: COLORES.blanco,
    fontWeight: '800',
    fontSize: 13,
  },
  bannerAlDia: {
    backgroundColor: COLORES.pagadoFondo,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#86EFAC',
  },
  bannerAlDiaTexto: {
    color: COLORES.pagadoTexto,
    fontSize: 13,
    fontWeight: '700',
  },
  bannerMora: {
    backgroundColor: COLORES.moraFondo,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
  },
  bannerMoraTexto: {
    color: COLORES.moraTexto,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  headerLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.primario,
  },
  contadorRecibos: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.textoGris,
  },
});
