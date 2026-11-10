// src/data/compartirTicketWhatsApp.ts — Autor: Said Alexander Pacheco Moncada (HU-05 / Mejora Nivel Superior)
import { Share } from 'react-native';
import { Reserva } from '../domain/modelos';

export async function compartirTicketWhatsApp(reserva: Reserva): Promise<void> {
    const mensaje =
        `🚪 *DOORWAY-APP · TICKET DE RESERVA CONFIRMADA*\n` +
        `• *Área común:* ${reserva.areaComun}\n` +
        `• *Apartamento:* ${reserva.apartamento}\n` +
        `• *Fecha:* ${reserva.fecha}\n` +
        `• *Horario:* ${reserva.bloqueHorario}\n` +
        `• *Código de verificación:* ${reserva.id}\n` +
        `✅ _Estado de cartera verificado al día (Sin mora activa)._`;

    await Share.share({
        message: mensaje,
        title: 'Comprobante de Reserva DoorWay-App',
    });
}