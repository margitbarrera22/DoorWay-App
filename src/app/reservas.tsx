// src/app/reservas.tsx — Autor: Wilfran Leonardo Betancourt Ardila (HU-05 #5, HU-02 #2 y HU-06 #6)
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AreaComun } from '../domain/modelos';
import { useReservas, FECHAS_DEMO_RESERVAS } from '../hooks/ReservasContext';
import { useAuth } from '../hooks/AuthContext';
import { BannerMora } from '../components/BannerMora';
import { SelectorBloques } from '../components/SelectorBloques';
import { ModalTicketReserva } from '../components/ModalTicketReserva';
import { COLORES } from '../theme/tema';

const AREAS_DISPONIBLES: Array<{ nombre: AreaComun; icono: string; detalle: string }> = [
  { nombre: 'Salón Social', icono: '🎉', detalle: 'Eventos y reuniones · Cap. 40 personas' },
  { nombre: 'Kiosco BBQ', icono: '🍖', detalle: 'Zona parrillera al aire libre · Cap. 15 personas' },
];

export default function PantallaReservas() {
  const router = useRouter();
  const { usuarioActual } = useAuth();
  const apartamentoActivo =
    usuarioActual?.rol === 'residente' ? usuarioActual.apartamento : 'Torre B - Apto 302';

  const {
    area,
    setArea,
    fecha,
    setFecha,
    bloqueSeleccionado,
    setBloqueSeleccionado,
    reservasDelDia,
    ticketConfirmado,
    cerrarTicket,
    mensajeFeedback,
    avisoCancelacion,
    cargandoDisponibilidad,
    guardando,
    cancelando,
    veredictoMora,
    cargarDisponibilidad,
    confirmarReserva,
    intentarCancelar,
    compartirTicketPorWhatsApp,
  } = useReservas();

  const misReservasActivas = reservasDelDia.filter(
    (r) => r.apartamento === apartamentoActivo && r.estado === 'Confirmada'
  );

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
          accessibilityState={{ selected: true }}
          style={[estilos.tabModulo, estilos.tabModuloActivo]}
        >
          <Text style={[estilos.textoModulo, estilos.textoModuloActivo]}>📅 Reservas</Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          onPress={() => router.push('/comunidad')}
          style={estilos.tabModulo}
        >
          <Text style={estilos.textoModulo}>📢 Comunidad</Text>
        </Pressable>
      </View>

      <ScrollView style={estilos.contenedor} contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
        {/* Encabezado de Unidad y Sincronización */}
        <View style={estilos.headerUnidad}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.etiquetaUnidad}>UNIDAD SOLICITANTE</Text>
            <Text style={estilos.valorUnidad}>🏢 {apartamentoActivo}</Text>
          </View>
          <Pressable
            onPress={cargarDisponibilidad}
            accessibilityRole="button"
            accessibilityLabel="Actualizar disponibilidad del calendario"
            style={estilos.btnRefrescar}
          >
            <Text style={estilos.btnRefrescarTexto}>
              {cargandoDisponibilidad ? '⏳...' : '🔄 Actualizar'}
            </Text>
          </Pressable>
        </View>

        {/* 1. Alerta de Bloqueo por Mora Activa (HU-02 · Componente Oficial de Margit) */}
        {!veredictoMora.permitido ? (
          <BannerMora
            mensaje={veredictoMora.motivoBloqueo!}
            alIrACartera={() => router.push('/')}
          />
        ) : (
          <View style={estilos.bannerAlDia}>
            <Text style={estilos.bannerAlDiaTexto}>
              ✅ Cartera al día · Sin mora activa. Puedes reservar sin restricciones.
            </Text>
          </View>
        )}

        {/* 2. Selector de Área Común */}
        <Text style={estilos.label}>1. Selecciona el Área Común</Text>
        <View style={estilos.filaBotones}>
          {AREAS_DISPONIBLES.map((item) => {
            const activa = area === item.nombre;
            return (
              <Pressable
                key={item.nombre}
                onPress={() => setArea(item.nombre)}
                accessibilityRole="button"
                style={[estilos.cardArea, activa && estilos.cardAreaActiva]}
              >
                <Text style={estilos.iconoArea}>{item.icono}</Text>
                <Text style={[estilos.tituloArea, activa && estilos.textoBlanco]}>
                  {item.nombre}
                </Text>
                <Text style={[estilos.detalleArea, activa && estilos.textoBlancoSuave]}>
                  {item.detalle}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 3. Selector de Fecha */}
        <Text style={estilos.label}>2. Elige la fecha en el calendario</Text>
        <View style={estilos.filaBotones}>
          {FECHAS_DEMO_RESERVAS.map((f) => {
            const activa = fecha === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFecha(f)}
                accessibilityRole="button"
                style={[estilos.chip, activa && estilos.chipActivo]}
              >
                <Text style={[estilos.chipTexto, activa && estilos.chipTextoActivo]}>📅 {f}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* 4. Calendario Cromático (HU-05 · Componente Oficial de Margit) */}
        {cargandoDisponibilidad ? (
          <View style={estilos.cajaCargando}>
            <ActivityIndicator size="small" color={COLORES.primario} />
            <Text style={estilos.textoCargando}>Consultando disponibilidad en Supabase...</Text>
          </View>
        ) : (
          <SelectorBloques
            reservasDelDia={reservasDelDia}
            bloqueSeleccionado={bloqueSeleccionado}
            alSeleccionarBloque={setBloqueSeleccionado}
            deshabilitadoPorMora={!veredictoMora.permitido}
          />
        )}

        {/* 5. Mensajes de Retroalimentación / Anti-colisión / Cancelación */}
        {(mensajeFeedback || avisoCancelacion) && (
          <View
            style={[
              estilos.alertaBox,
              avisoCancelacion?.includes('éxito') && estilos.alertaExitoBox,
            ]}
          >
            <Text
              style={[
                estilos.alertaTexto,
                avisoCancelacion?.includes('éxito') && estilos.alertaExitoTexto,
              ]}
            >
              {mensajeFeedback || avisoCancelacion}
            </Text>
          </View>
        )}

        {/* 6. Botón de Confirmar Reserva */}
        <Pressable
          disabled={!veredictoMora.permitido || !bloqueSeleccionado || guardando}
          onPress={() => confirmarReserva(apartamentoActivo)}
          accessibilityRole="button"
          style={[
            estilos.btnConfirmar,
            (!veredictoMora.permitido || !bloqueSeleccionado || guardando) && { opacity: 0.45 },
          ]}
        >
          <Text style={estilos.btnConfirmarTexto}>
            {guardando
              ? 'Verificando disponibilidad sin colisión...'
              : bloqueSeleccionado
              ? `Confirmar Reserva · ${area} (${bloqueSeleccionado})`
              : 'Confirmar Reserva sin Colisión'}
          </Text>
        </Pressable>

        {/* 7. Mis Reservas Activas con Cancelación >24h (HU-06) */}
        {misReservasActivas.length > 0 && (
          <View style={estilos.seccionMisReservas}>
            <Text style={estilos.tituloMisReservas}>📌 Tus reservas confirmadas en esta fecha</Text>
            {misReservasActivas.map((miRes) => (
              <View key={miRes.id} style={estilos.miReservaBox}>
                <View style={{ marginBottom: 10 }}>
                  <Text style={estilos.miReservaTexto}>
                    ✅ {miRes.areaComun} · {miRes.bloqueHorario}
                  </Text>
                  <Text style={estilos.miReservaMeta}>
                    Fecha: {miRes.fecha} · Ticket: {miRes.id}
                  </Text>
                </View>
                <View style={estilos.filaAccionesReserva}>
                  <Pressable
                    onPress={() => compartirTicketPorWhatsApp(miRes)}
                    accessibilityRole="button"
                    style={estilos.btnCompartirMini}
                  >
                    <Text style={estilos.btnCompartirMiniTexto}>📲 WhatsApp</Text>
                  </Pressable>
                  <Pressable
                    disabled={cancelando}
                    onPress={() => intentarCancelar(miRes)}
                    accessibilityRole="button"
                    style={estilos.btnCancelar}
                  >
                    <Text style={estilos.btnCancelarTexto}>
                      {cancelando ? 'Cancelando...' : 'Cancelar turno (>24h · HU-06)'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 8. Modal de Ticket Digital (HU-05 · Componente Oficial de Margit) */}
        <ModalTicketReserva
          reserva={ticketConfirmado}
          alCerrar={cerrarTicket}
          alCompartirWhatsApp={compartirTicketPorWhatsApp}
        />
      </ScrollView>
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
  headerUnidad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  etiquetaUnidad: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.textoGris,
    letterSpacing: 0.7,
  },
  valorUnidad: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.primario,
    marginTop: 2,
  },
  btnRefrescar: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    minHeight: 44,
    justifyContent: 'center',
  },
  btnRefrescarTexto: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.primario,
  },
  bannerAlDia: {
    backgroundColor: COLORES.pagadoFondo,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  bannerAlDiaTexto: {
    color: COLORES.pagadoTexto,
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.primario,
    marginTop: 8,
    marginBottom: 8,
  },
  filaBotones: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  cardArea: {
    flex: 1,
    backgroundColor: COLORES.blanco,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    minHeight: 96,
    justifyContent: 'center',
  },
  cardAreaActiva: {
    backgroundColor: COLORES.primario,
    borderColor: COLORES.primario,
  },
  iconoArea: { fontSize: 22, marginBottom: 4 },
  tituloArea: { fontSize: 15, fontWeight: '800', color: COLORES.primario },
  detalleArea: { fontSize: 11, color: COLORES.textoGris, marginTop: 3, lineHeight: 15 },
  textoBlanco: { color: COLORES.blanco },
  textoBlancoSuave: { color: '#CBD5E1' },
  chip: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  chipActivo: { backgroundColor: COLORES.primario },
  chipTexto: { fontWeight: '700', color: COLORES.textoOscuro, fontSize: 13 },
  chipTextoActivo: { color: COLORES.blanco },
  cajaCargando: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  textoCargando: { fontSize: 13, color: COLORES.textoGris, fontWeight: '600' },
  alertaBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  alertaExitoBox: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  alertaTexto: { color: '#991B1B', fontWeight: '700', fontSize: 13 },
  alertaExitoTexto: { color: '#166534' },
  btnConfirmar: {
    backgroundColor: COLORES.secundario,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    minHeight: 52,
    justifyContent: 'center',
    elevation: 2,
  },
  btnConfirmarTexto: { color: '#FFF', fontWeight: '800', fontSize: 15, textAlign: 'center' },
  seccionMisReservas: { marginTop: 22 },
  tituloMisReservas: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.primario,
    marginBottom: 8,
  },
  miReservaBox: {
    backgroundColor: '#DCFCE7',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  miReservaTexto: { fontWeight: '800', color: '#166534', fontSize: 15 },
  miReservaMeta: { fontSize: 12, color: '#166534', marginTop: 2, fontWeight: '600' },
  filaAccionesReserva: { flexDirection: 'row', gap: 8 },
  btnCompartirMini: {
    backgroundColor: COLORES.secundario,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCompartirMiniTexto: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  btnCancelar: {
    flex: 1,
    backgroundColor: '#991B1B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  btnCancelarTexto: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
