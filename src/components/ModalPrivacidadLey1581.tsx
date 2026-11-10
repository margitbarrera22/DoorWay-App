// src/components/ModalPrivacidadLey1581.tsx — Autores: Margit Dayanna Barrera Gutiérrez & Michel Daniela Bayona Díaz (Evento de Dominio #2 · Ley 1581 de 2012)
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { COLORES } from '../theme/tema';

export interface ModalPrivacidadLey1581Props {
  visible: boolean;
  nombreUsuario?: string;
  alAceptar: () => Promise<void> | void;
}

export function ModalPrivacidadLey1581({
  visible,
  nombreUsuario,
  alAceptar,
}: ModalPrivacidadLey1581Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={estilos.fondoOscuro}>
        <View style={estilos.cajaModal}>
          <View style={estilos.encabezadoBadge}>
            <Text style={estilos.textoBadge}>🔒 PROTECCIÓN DE DATOS PERSONALES · COLOMBIA</Text>
          </View>

          <Text style={estilos.titulo}>Aviso de Privacidad · Ley 1581 de 2012</Text>

          <ScrollView style={estilos.areaTexto} showsVerticalScrollIndicator={false}>
            <Text style={estilos.parrafo}>
              Bienvenido(a){nombreUsuario ? `, ${nombreUsuario}` : ''}. En cumplimiento de la{' '}
              <Text style={estilos.negrita}>Ley Estatutaria 1581 de 2012</Text> y el Decreto 1377 de
              2013 sobre Protección de Datos Personales (Habeas Data), el conjunto residencial
              informa que los datos recolectados en <Text style={estilos.negrita}>DoorWay-App</Text>{' '}
              se tratarán exclusivamente para:
            </Text>

            <View style={estilos.listaItem}>
              <Text style={estilos.vineta}>•</Text>
              <Text style={estilos.textoItem}>
                Gestión de estado de cuenta, validación de comprobantes bancarios y control de
                cartera de administración (HU-01, HU-03 y HU-04).
              </Text>
            </View>

            <View style={estilos.listaItem}>
              <Text style={estilos.vineta}>•</Text>
              <Text style={estilos.textoItem}>
                Agendamiento sin colisiones y control de acceso a las áreas comunes del conjunto
                residencial (HU-02, HU-05 y HU-06).
              </Text>
            </View>

            <View style={estilos.listaItem}>
              <Text style={estilos.vineta}>•</Text>
              <Text style={estilos.textoItem}>
                Comunicación oficial de administración y directorio de emergencias local en
                Barrancabermeja (HU-08 y HU-11).
              </Text>
            </View>

            <Text style={[estilos.parrafo, { marginTop: 10 }]}>
              Esta aceptación se solicita únicamente en tu primer ingreso y queda respaldada en la
              base de datos local SQLite y en el servidor del conjunto.
            </Text>
          </ScrollView>

          <Pressable
            onPress={alAceptar}
            accessibilityRole="button"
            accessibilityLabel="Aceptar tratamiento de datos personales según Ley 1581 de 2012"
            style={estilos.btnAceptar}
          >
            <Text style={estilos.btnAceptarTexto}>
              ✓ Acepto el Tratamiento de Datos (Ley 1581)
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondoOscuro: {
    flex: 1,
    backgroundColor: 'rgba(15, 37, 64, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cajaModal: {
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    elevation: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  encabezadoBadge: {
    backgroundColor: '#CCFBF1',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  textoBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.secundario,
    letterSpacing: 0.5,
  },
  titulo: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORES.primario,
    marginBottom: 12,
  },
  areaTexto: {
    marginBottom: 16,
  },
  parrafo: {
    fontSize: 13,
    color: COLORES.textoOscuro,
    lineHeight: 20,
    marginBottom: 10,
  },
  negrita: {
    fontWeight: '800',
    color: COLORES.primario,
  },
  listaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 8,
  },
  vineta: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORES.secundario,
    marginRight: 8,
    lineHeight: 19,
  },
  textoItem: {
    flex: 1,
    fontSize: 13,
    color: COLORES.textoOscuro,
    lineHeight: 19,
  },
  btnAceptar: {
    backgroundColor: COLORES.secundario,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    elevation: 2,
  },
  btnAceptarTexto: {
    color: COLORES.blanco,
    fontSize: 14,
    fontWeight: '800',
  },
});

