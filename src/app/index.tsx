// src/app/index.tsx — Lógica: Wilfran Betancourt | UX/UI: Margit Barrera
import React, { useState } from 'react';
import { View, FlatList, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useRecibos } from '../hooks/RecibosContext';
import { TarjetaRecibo } from '../components/TarjetaRecibo';
import { EstadoPantalla } from '../components/EstadoPantalla';
import { evaluarDerechoAReservar } from '../domain/reglasNegocio';
import { BarraNavegacionModulos } from '../components/BarraNavegacionModulos';

export default function PantallaEstadoCuenta() {
  const router = useRouter();
  const { recibos, estadoVista, mensajeError, cargar, modoAdmin, alternarModoAdmin } = useRecibos();
  const [refrescando, setRefrescando] = useState(false);

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

  return (
    <View style={estilos.contenedor}>
      {/* Barra de Rol */}
      <View style={estilos.barraRol}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.subtituloRol}>SESIÓN ACTIVA</Text>
          <View style={estilos.filaRol}>
            <Ionicons
              name={modoAdmin ? "shield-checkmark" : "person"}
              size={16}
              color={modoAdmin ? "#0F2540" : "#475569"}
              style={{ marginRight: 6 }}
            />
            <Text style={estilos.textoRol}>
              {modoAdmin ? 'Administrador General' : 'Residente: Doña Martha (302)'}
            </Text>
          </View>
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

      {/* Banner de Mora */}
      {!modoAdmin && recibos.length > 0 && (
        <View style={veredictoMora.permitido ? estilos.bannerAlDia : estilos.bannerMora}>
          <Ionicons
            name={veredictoMora.permitido ? "checkmark-circle" : "alert-circle"}
            size={20}
            color={veredictoMora.permitido ? "#166534" : "#991B1B"}
            style={{ marginRight: 10 }}
          />
          <Text style={veredictoMora.permitido ? estilos.bannerAlDiaTexto : estilos.bannerMoraTexto}>
            {veredictoMora.permitido
              ? 'Estado al día · Tienes derecho a reservar áreas comunes'
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
        <FlatList
          data={recibos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          refreshing={refrescando}
          onRefresh={alRefrescar}
          ListHeaderComponent={
            <View style={estilos.headerLista}>
              <Text style={estilos.tituloSeccion}>Historial de Facturación</Text>
              <Text style={estilos.contadorRecibos}>
                {String(recibos.length) + ' ' + (recibos.length === 1 ? 'recibo' : 'recibos')}
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

      <BarraNavegacionModulos />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },
  barraRol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subtituloRol: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  filaRol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoRol: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },
  btnRol: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRolTexto: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  bannerAlDia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#86EFAC',
  },
  bannerAlDiaTexto: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  bannerMora: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
  },
  bannerMoraTexto: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  headerLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },
  contadorRecibos: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Inter_600SemiBold',
  },
  lista: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
});