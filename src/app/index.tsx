// src/app/index.tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-03 #3 y Elementos Transversales #2, #5 y #7)
import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/AuthContext';
import { useRecibos } from '../hooks/RecibosContext';
import { TarjetaRecibo } from '../components/TarjetaRecibo';
import { EstadoPantalla } from '../components/EstadoPantalla';
import { BarraNavegacionModulos } from '../components/BarraNavegacionModulos';
import { BarraSesionHeader } from '../components/BarraSesionHeader';
import { ModalPrivacidadLey1581 } from '../components/ModalPrivacidadLey1581';
import LoginScreen from './login';
import { COLORES } from '../theme/tema';
import { evaluarDerechoAReservar } from '../domain/reglasNegocio';

export default function PantallaEstadoCuenta() {
  const router = useRouter();
  const { usuarioActual, cargandoSesion, aceptarLey1581 } = useAuth();
  const { recibos, estadoVista, mensajeError, cargar, modoAdmin } = useRecibos();
  const [refrescando, setRefrescando] = useState(false);

  if (cargandoSesion) {
    return <EstadoPantalla tipo="cargando" mensaje="Restaurando sesión activa desde SQLite..." />;
  }

  if (!usuarioActual) {
    return <LoginScreen />;
  }

  const alRefrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  const veredictoMora = evaluarDerechoAReservar(recibos);

  return (
    <View style={estilos.contenedor}>
      {/* Modal Legal Ley 1581 de 2012 (Evento de Dominio #2: Solo se muestra si aceptoLey1581 es false) */}
      <ModalPrivacidadLey1581
        visible={!usuarioActual.aceptoLey1581}
        nombreUsuario={usuarioActual.nombre}
        alAceptar={aceptarLey1581}
      />

      {/* 1. Barra de Navegación de Módulos (Nivel Superior) */}
      <BarraNavegacionModulos />

      {/* 2. Barra de Sesión Real y Cierre de Sesión */}
      <BarraSesionHeader />

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

