// src/components/ModalTicketReserva.tsx — Autora: Margit Dayanna Barrera Gutiérrez (HU-05)
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Reserva } from '../domain/modelos';
import { COLORES } from '../theme/tema';

interface Props {
  reserva: Reserva | null;
  alCerrar: () => void;
  alCompartirWhatsApp: (reserva: Reserva) => void;
}

export function ModalTicketReserva({ reserva, alCerrar, alCompartirWhatsApp }: Props) {
  if (!reserva) return null;

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={estilos.fondoModal}>
        <View style={estilos.ticketCard}>
          <Text style={estilos.badgeExito}>✅ RESERVA CONFIRMADA SIN COLISIÓN</Text>
          <Text style={estilos.titulo}>{reserva.areaComun}</Text>
          <View style={estilos.separador} />
          <Text style={estilos.item}>🏢 Unidad: {reserva.apartamento}</Text>
          <Text style={estilos.item}>📅 Fecha: {reserva.fecha}</Text>
          <Text style={estilos.item}>🕒 Bloque horario: {reserva.bloqueHorario}</Text>
          <Text style={estilos.item}>🔖 Código Ticket: {reserva.id}</Text>

          <Pressable
            onPress={() => alCompartirWhatsApp(reserva)}
            accessibilityRole="button"
            style={estilos.btnWhatsapp}
          >
            <Text style={estilos.btnTexto}>📲 Compartir comprobante por WhatsApp</Text>
          </Pressable>

          <Pressable onPress={alCerrar} accessibilityRole="button" style={estilos.btnCerrar}>
            <Text style={estilos.btnCerrarTexto}>Cerrar ticket</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondoModal: { flex: 1, backgroundColor: 'rgba(15,37,64,0.65)', justifyContent: 'center', padding: 22 },
  ticketCard: { backgroundColor: COLORES.blanco, borderRadius: 16, padding: 22, elevation: 6 },
  badgeExito: { fontSize: 13, fontWeight: '800', color: COLORES.pagadoTexto, textAlign: 'center', marginBottom: 6 },
  titulo: { fontSize: 22, fontWeight: '900', color: COLORES.primario, textAlign: 'center' },
  separador: { height: 1, backgroundColor: '#CBD5E1', marginVertical: 14 },
  item: { fontSize: 15, color: COLORES.textoOscuro, marginBottom: 8, fontWeight: '600' },
  btnWhatsapp: { backgroundColor: '#0D9488', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 14, minHeight: 48 },
  btnTexto: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  btnCerrar: { marginTop: 10, padding: 12, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  btnCerrarTexto: { color: COLORES.textoGris, fontSize: 15, fontWeight: '700' },
});