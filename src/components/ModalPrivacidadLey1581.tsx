// src/components/ModalPrivacidadLey1581.tsx — Autora: Margit Dayanna Barrera Gutiérrez (Ley 1581 de 2012)
import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { COLORES } from '../theme/tema';

interface Props {
  visible: boolean;
  alAceptar: () => void;
}

export function ModalPrivacidadLey1581({ visible, alAceptar }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={estilos.fondo}>
        <View style={estilos.card} accessibilityRole="alertdialog">
          <Text style={estilos.titulo}>🔐 Aviso de Privacidad · Ley 1581 de 2012</Text>
          <ScrollView style={estilos.scroll} nestedScrollEnabled>
            <Text style={estilos.texto}>
              DoorWay-App trata sus datos personales (nombre, unidad residencial, recibos y comprobantes de pago)
              únicamente para la gestión de la copropiedad Conjunto La Nueva Esperanza de Barrancabermeja.
              Usted puede conocer, actualizar o suprimir sus datos solicitándolo a la administración.
              Sus datos no serán compartidos con terceros sin su autorización previa.
            </Text>
          </ScrollView>
          <Pressable onPress={alAceptar} accessibilityRole="button" style={estilos.boton}>
            <Text style={estilos.botonTexto}>Acepto el tratamiento de mis datos</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(15,37,64,0.7)', justifyContent: 'center', padding: 22 },
  card: { backgroundColor: COLORES.blanco, borderRadius: 16, padding: 20, maxHeight: '70%' },
  titulo: { fontSize: 17, fontWeight: '800', color: COLORES.primario, marginBottom: 10 },
  scroll: { maxHeight: 220, marginBottom: 14 },
  texto: { fontSize: 14, color: COLORES.textoOscuro, lineHeight: 21 },
  boton: { backgroundColor: COLORES.primario, paddingVertical: 14, borderRadius: 10, alignItems: 'center', minHeight: 48 },
  botonTexto: { color: COLORES.blanco, fontWeight: '800', fontSize: 14 },
});