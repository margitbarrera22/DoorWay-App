// src/app/index.tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-03 #3)
import React from 'react';
import { View, FlatList, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecibos } from '../hooks/RecibosContext';
import { TarjetaRecibo } from '../components/TarjetaRecibo';
import { EstadoPantalla } from '../components/EstadoPantalla';
import { COLORES } from '../theme/tema';

export default function PantallaEstadoCuenta() {
  const router = useRouter();
  const { recibos, estadoVista, mensajeError, cargar, modoAdmin, alternarModoAdmin } = useRecibos();

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.barraRol}>
        <Text style={estilos.textoRol}>Vista actual: {modoAdmin ? 'Administrador(a)' : 'Residente (Doña Martha)'}</Text>
        <Pressable onPress={alternarModoAdmin} style={estilos.btnRol}>
          <Text style={estilos.btnRolTexto}>Cambiar Rol</Text>
        </Pressable>
      </View>

      {estadoVista === 'cargando' && <EstadoPantalla tipo="cargando" />}
      {estadoVista === 'error' && (
        <EstadoPantalla tipo="error" mensaje={mensajeError} textoBoton="Reintentar" alPresionarBoton={cargar} />
      )}
      {estadoVista === 'vacio' && (
        <EstadoPantalla
          tipo="vacio"
          mensaje="Aún no tienes recibos registrados"
          textoBoton="Subir comprobante"
          alPresionarBoton={() => router.push('/recibo/subir')}
        />
      )}
      {estadoVista === 'conDatos' && (
        <FlatList
          data={recibos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TarjetaRecibo recibo={item} alTocar={() => router.push(`/recibo/${item.id}`)} />
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },
  barraRol: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#E2E8F0' },
  textoRol: { fontSize: 14, fontWeight: '700', color: COLORES.primario },
  btnRol: { backgroundColor: COLORES.secundario, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnRolTexto: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
