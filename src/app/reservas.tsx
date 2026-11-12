// src/app/reservas.tsx — Calendario real + Reserva funcional | Wilfran + Margit
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useRecibos } from '../hooks/RecibosContext';
import { useAuth } from '../hooks/AuthContext';
import { AreaComun, BloqueHorario, Reserva } from '../domain/modelos';
import { evaluarDerechoAReservar } from '../domain/reglasNegocio';
import { BarraNavegacionModulos } from '../components/BarraNavegacionModulos';

// ── Repositorio local de reservas en SQLite (sin Supabase, funciona offline) ──
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('doorway_local.db');

function inicializarTablaReservas() {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS reservas_local (
        id TEXT PRIMARY KEY NOT NULL,
        apartamento TEXT NOT NULL,
        areaComun TEXT NOT NULL,
        fecha TEXT NOT NULL,
        bloqueHorario TEXT NOT NULL,
        estado TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
  } catch {}
}

function guardarReservaLocal(r: Reserva): void {
  try {
    inicializarTablaReservas();
    db.runSync(
      `INSERT OR REPLACE INTO reservas_local (id, apartamento, areaComun, fecha, bloqueHorario, estado, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [r.id, r.apartamento, r.areaComun, r.fecha, r.bloqueHorario, r.estado, r.createdAt ?? new Date().toISOString()]
    );
  } catch (e) {
    console.warn('Error guardando reserva en SQLite:', e);
  }
}

function leerReservasLocales(): Reserva[] {
  try {
    inicializarTablaReservas();
    const filas = db.getAllSync<any>('SELECT * FROM reservas_local ORDER BY createdAt DESC;');
    return filas.map((f) => ({
      id: f.id,
      apartamento: f.apartamento,
      areaComun: f.areaComun as AreaComun,
      fecha: f.fecha,
      bloqueHorario: f.bloqueHorario as BloqueHorario,
      estado: f.estado as 'Confirmada' | 'Cancelada',
      createdAt: f.createdAt,
    }));
  } catch (e) {
    console.warn('Error leyendo reservas locales:', e);
    return [];
  }
}

// ────────────────────────────────────────────────────────────────────────────

const AREAS: AreaComun[] = ['Salón Social', 'Kiosco BBQ'];
const BLOQUES_OFICIALES: BloqueHorario[] = ['09:00 - 13:00', '14:00 - 18:00', '19:00 - 23:00'];

export default function PantallaReservas() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recibos, modoAdmin } = useRecibos();
  const { usuarioActual } = useAuth();
  const veredictoMora = evaluarDerechoAReservar(recibos);

  const [area, setArea] = useState<AreaComun>('Salón Social');
  const [fecha, setFecha] = useState<string>('2026-11-15');
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<BloqueHorario | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');
  const [reservasGuardadas, setReservasGuardadas] = useState<Reserva[]>([]);
  const [reservaReciente, setReservaReciente] = useState<Reserva | null>(null);

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // Carga historial al abrir y al cambiar de rol
  useEffect(() => {
    setReservasGuardadas(leerReservasLocales());
  }, [modoAdmin]);

  const estaOcupadoPorOtro = (b: BloqueHorario) => {
    // Bloqueo demo hardcodeado (simulación de otro residente)
    if (area === 'Salón Social' && fecha === '2026-11-15' && b === '14:00 - 18:00') return true;
    // Bloquea franjas que ya están confirmadas en la lista local
    return reservasGuardadas.some(
      (r) => r.areaComun === area && r.fecha === fecha && r.bloqueHorario === b && r.estado === 'Confirmada'
    );
  };

  const onDayPress = (day: DateData) => {
    setFecha(day.dateString);
    setBloqueSeleccionado(null);
    setMostrarCalendario(false);
  };

  const markedDates = {
    [fecha]: { selected: true, selectedColor: '#0F2540' },
    '2026-11-15': { marked: true, dotColor: '#FCA5A5' },
    '2026-11-16': { marked: true, dotColor: '#86EFAC' },
    '2026-11-17': { marked: true, dotColor: '#86EFAC' },
  };

  const confirmarReserva = async () => {
    if ((!modoAdmin && !veredictoMora.permitido) || !bloqueSeleccionado) return;
    setGuardando(true);
    setErrorGuardar('');
    try {
      const nueva: Reserva = {
        id: `res-${Date.now()}`,
        apartamento: modoAdmin ? 'Administración' : 'Torre B - Apto 302',
        areaComun: area,
        fecha,
        bloqueHorario: bloqueSeleccionado,
        estado: 'Confirmada',
        createdAt: new Date().toISOString(),
      };
      guardarReservaLocal(nueva);
      const actualizadas = leerReservasLocales();
      setReservasGuardadas(actualizadas);
      setReservaReciente(nueva);
      setBloqueSeleccionado(null);
      // Oculta el banner de éxito después de 4 segundos
      setTimeout(() => setReservaReciente(null), 4000);
    } catch (e: any) {
      setErrorGuardar(e?.message || 'No se pudo guardar la reserva.');
    } finally {
      setGuardando(false);
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0F2540" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={estilos.contenedor}>
      {/* Header corporativo */}
      <View style={[estilos.header, { paddingTop: Math.max(insets.top, 24) + 12 }]}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={estilos.headerTitle}>
            {modoAdmin ? 'Gestión de Áreas Comunes' : 'Reservar Área Común'}
          </Text>
          <Text style={estilos.headerSub}>
            {modoAdmin ? 'Panel de Administración · Calendario' : 'Agenda de áreas comunes · DoorWay'}
          </Text>
        </View>

        {/* Botón de Perfil en el Header */}
        <Pressable
          onPress={() => router.push('/perfil')}
          accessibilityRole="button"
          accessibilityLabel="Ir al perfil del usuario"
          style={estilos.btnPerfilHeader}
        >
          {usuarioActual?.avatarUrl ? (
            <Image source={{ uri: usuarioActual.avatarUrl }} style={estilos.avatarHeaderImg} />
          ) : (
            <Ionicons name="business" size={26} color="#FFF" />
          )}
          <View style={estilos.puntoActivo} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Banner de éxito reciente */}
        {reservaReciente && (
          <View style={estilos.bannerExito}>
            <Ionicons name="checkmark-circle" size={22} color="#166534" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={estilos.bannerExitoTitulo}>¡Reserva confirmada!</Text>
              <Text style={estilos.bannerExitoDetalle}>
                {reservaReciente.areaComun} · {reservaReciente.fecha} · {reservaReciente.bloqueHorario}
              </Text>
            </View>
          </View>
        )}

        {/* Error al guardar */}
        {errorGuardar !== '' && (
          <View style={estilos.bannerError}>
            <Ionicons name="alert-circle" size={18} color="#991B1B" style={{ marginRight: 8 }} />
            <Text style={estilos.bannerErrorTexto}>{errorGuardar}</Text>
          </View>
        )}

        {/* Banner para Modo Administrador */}
        {modoAdmin && (
          <View style={estilos.bannerAdmin}>
            <Ionicons name="shield-checkmark" size={20} color="#0F2540" style={{ marginRight: 10 }} />
            <Text style={estilos.bannerAdminTexto}>
              Modo Administrador · Consulta de reservas y disponibilidad de la copropiedad.
            </Text>
          </View>
        )}

        {/* Banner mora / al día SOLO PARA EL RESIDENTE */}
        {!modoAdmin && !veredictoMora.permitido && (
          <View style={estilos.bannerMora}>
            <Ionicons name="alert-circle" size={22} color="#991B1B" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={estilos.bannerMoraTitulo}>Reserva Bloqueada</Text>
              <Text style={estilos.bannerMoraDesc}>{veredictoMora.motivoBloqueo}</Text>
            </View>
          </View>
        )}

        {!modoAdmin && veredictoMora.permitido && !reservaReciente && (
          <View style={estilos.bannerAlDia}>
            <Ionicons name="checkmark-circle" size={20} color="#166534" style={{ marginRight: 10 }} />
            <Text style={estilos.bannerAlDiaTexto}>
              ¡Estás al día! Tienes habilitado el sistema de reservas.
            </Text>
          </View>
        )}

        {/* ── HISTORIAL DE RESERVAS ── */}
        {reservasGuardadas.length > 0 && (
          <View style={estilos.seccionHistorial}>
            <View style={estilos.filaSeccion}>
              <Ionicons name="list" size={18} color="#0F2540" style={{ marginRight: 8 }} />
              <Text style={estilos.tituloSeccion}>
                {modoAdmin ? 'Reservas registradas' : 'Mis reservas'}
              </Text>
              <View style={estilos.badgeContador}>
                <Text style={estilos.badgeContadorTexto}>{reservasGuardadas.length}</Text>
              </View>
            </View>

            {reservasGuardadas.map((r) => (
              <View
                key={r.id}
                style={[
                  estilos.cardReserva,
                  r.estado === 'Cancelada' && estilos.cardReservaCancelada,
                ]}
              >
                <View style={estilos.iconoReserva}>
                  <Ionicons
                    name={r.areaComun === 'Salón Social' ? 'people' : 'restaurant'}
                    size={20}
                    color={r.estado === 'Confirmada' ? '#0F2540' : '#94A3B8'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.cardReservaArea}>{r.areaComun}</Text>
                  <Text style={estilos.cardReservaDetalle}>
                    {r.fecha}  ·  {r.bloqueHorario}
                  </Text>
                  <Text style={estilos.cardReservaApto}>
                    Apt. {r.apartamento}
                  </Text>
                </View>
                <View
                  style={[
                    estilos.badgeEstado,
                    r.estado === 'Cancelada' ? estilos.badgeEstadoCancelada : estilos.badgeEstadoConfirmada,
                  ]}
                >
                  <Text
                    style={[
                      estilos.badgeEstadoTexto,
                      { color: r.estado === 'Cancelada' ? '#991B1B' : '#166534' },
                    ]}
                  >
                    {r.estado}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── FORMULARIO DE NUEVA RESERVA (solo residente) ── */}
        {!modoAdmin && (
          <View style={estilos.contenido}>
            <Text style={estilos.tituloSeccion}>1. Selecciona el Área</Text>
            <View style={estilos.filaChips}>
              {AREAS.map((item) => {
                const activo = area === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => { setArea(item); setBloqueSeleccionado(null); }}
                    accessibilityRole="button"
                    style={[estilos.chip, activo && estilos.chipActivo]}
                  >
                    <Ionicons
                      name={item === 'Salón Social' ? 'people' : 'restaurant'}
                      size={18}
                      color={activo ? '#FFF' : '#64748B'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={estilos.tituloSeccion}>2. Elige la Fecha</Text>
            <Pressable
              onPress={() => setMostrarCalendario(!mostrarCalendario)}
              accessibilityRole="button"
              style={estilos.btnCalendario}
            >
              <Ionicons name="calendar" size={20} color="#0F2540" style={{ marginRight: 10 }} />
              <Text style={estilos.btnCalendarioTexto}>{fecha}</Text>
              <Ionicons name={mostrarCalendario ? 'chevron-up' : 'chevron-down'} size={20} color="#0F2540" style={{ marginLeft: 10 }} />
            </Pressable>

            {mostrarCalendario && (
              <View style={estilos.calendarioContainer}>
                <Calendar
                  current={fecha}
                  onDayPress={onDayPress}
                  markedDates={markedDates}
                  minDate={'2026-11-10'}
                  maxDate={'2026-12-31'}
                  theme={{
                    backgroundColor: '#FFFFFF',
                    calendarBackground: '#FFFFFF',
                    textSectionTitleColor: '#64748B',
                    selectedDayBackgroundColor: '#0F2540',
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: '#0F2540',
                    dayTextColor: '#0F2540',
                    textDisabledColor: '#CBD5E1',
                    dotColor: '#0F2540',
                    selectedDotColor: '#FFFFFF',
                    arrowColor: '#0F2540',
                    monthTextColor: '#0F2540',
                    textDayFontFamily: 'Inter_500Medium',
                    textMonthFontFamily: 'Inter_700Bold',
                    textDayHeaderFontFamily: 'Inter_600SemiBold',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12,
                  }}
                />
              </View>
            )}

            <Text style={estilos.tituloSeccion}>3. Franjas Horarias Disponibles</Text>
            <View style={estilos.leyenda}>
              <View style={estilos.itemLeyenda}><View style={[estilos.dot, { backgroundColor: '#DCFCE7' }]} /><Text style={estilos.textoLeyenda}>Disponible</Text></View>
              <View style={estilos.itemLeyenda}><View style={[estilos.dot, { backgroundColor: '#FEE2E2' }]} /><Text style={estilos.textoLeyenda}>Ocupado</Text></View>
              <View style={estilos.itemLeyenda}><View style={[estilos.dot, { backgroundColor: '#0F2540' }]} /><Text style={estilos.textoLeyenda}>Seleccionado</Text></View>
            </View>

            {BLOQUES_OFICIALES.map((bloque) => {
              const ocupado = estaOcupadoPorOtro(bloque);
              const seleccionado = bloqueSeleccionado === bloque;
              const deshabilitado = ocupado || (!modoAdmin && !veredictoMora.permitido);

              let bg = '#F8FAFC', borde = '#CBD5E1', textoColor = '#64748B', etiqueta = 'DISPONIBLE', iconoNombre = 'time-outline';
              if (ocupado) {
                bg = '#FEE2E2'; borde = '#FCA5A5'; textoColor = '#991B1B'; etiqueta = 'OCUPADO'; iconoNombre = 'lock-closed';
              } else if (seleccionado) {
                bg = '#0F2540'; borde = '#0F2540'; textoColor = '#FFFFFF'; etiqueta = 'SELECCIONADO'; iconoNombre = 'checkmark-circle';
              }

              return (
                <Pressable
                  key={bloque}
                  disabled={deshabilitado}
                  onPress={() => setBloqueSeleccionado(bloque)}
                  accessibilityRole="button"
                  style={[estilos.bloqueCard, { backgroundColor: bg, borderColor: borde }, deshabilitado && !ocupado && { opacity: 0.5 }]}
                >
                  <View style={estilos.bloqueInfo}>
                    <Ionicons name={iconoNombre as any} size={20} color={textoColor} style={{ marginRight: 12 }} />
                    <View>
                      <Text style={[estilos.bloqueHora, { color: textoColor }]}>{bloque}</Text>
                      <Text style={[estilos.bloqueEstado, { color: textoColor }]}>{etiqueta}</Text>
                    </View>
                  </View>
                  {seleccionado && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
                </Pressable>
              );
            })}

            <Pressable
              disabled={(!modoAdmin && !veredictoMora.permitido) || !bloqueSeleccionado || guardando}
              onPress={confirmarReserva}
              style={[
                estilos.btnConfirmar,
                ((!modoAdmin && !veredictoMora.permitido) || !bloqueSeleccionado || guardando) && estilos.btnConfirmarDeshabilitado,
              ]}
              accessibilityRole="button"
            >
              {guardando ? (
                <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 10 }} />
              ) : (
                <Ionicons name="checkmark-circle" size={22} color="#FFF" style={{ marginRight: 10 }} />
              )}
              <Text style={estilos.btnConfirmarTexto}>
                {guardando
                  ? 'Guardando...'
                  : bloqueSeleccionado
                  ? `Confirmar: ${bloqueSeleccionado}`
                  : 'Selecciona una franja disponible'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Mensaje para admin que no puede reservar */}
        {modoAdmin && reservasGuardadas.length === 0 && (
          <View style={estilos.adminVacio}>
            <Ionicons name="calendar-outline" size={40} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <Text style={estilos.adminVacioTexto}>No hay reservas registradas aún</Text>
            <Text style={estilos.adminVacioSub}>Las reservas de residentes aparecerán aquí</Text>
          </View>
        )}

      </ScrollView>
      <BarraNavegacionModulos />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#0F2540',
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  headerSub: { color: '#94A3B8', fontSize: 12, marginTop: 2, fontFamily: 'Inter_500Medium' },
  btnPerfilHeader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  avatarHeaderImg: { width: 44, height: 44, borderRadius: 22 },
  puntoActivo: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F2540',
  },

  // Banners
  bannerExito: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  bannerExitoTitulo: { fontSize: 15, fontWeight: '800', color: '#166534', fontFamily: 'Inter_800ExtraBold', marginBottom: 2 },
  bannerExitoDetalle: { fontSize: 13, color: '#166534', fontFamily: 'Inter_500Medium' },
  bannerError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  bannerErrorTexto: { color: '#991B1B', fontSize: 13, fontWeight: '600', flex: 1, fontFamily: 'Inter_600SemiBold' },
  bannerMora: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    margin: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  bannerMoraTitulo: { fontSize: 15, fontWeight: '800', color: '#991B1B', fontFamily: 'Inter_800ExtraBold', marginBottom: 4 },
  bannerMoraDesc: { fontSize: 13, color: '#991B1B', lineHeight: 18, fontFamily: 'Inter_500Medium' },
  bannerAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    margin: 20,
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  bannerAdminTexto: { color: '#0F2540', fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1 },
  bannerAlDia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    margin: 20,
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  bannerAlDiaTexto: { color: '#166534', fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1 },

  // Historial de reservas
  seccionHistorial: { paddingHorizontal: 20, paddingTop: 24 },
  filaSeccion: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  tituloSeccion: { fontSize: 16, fontWeight: '700', color: '#0F2540', fontFamily: 'Inter_700Bold' },
  badgeContador: {
    backgroundColor: '#0F2540',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeContadorTexto: { color: '#FFF', fontSize: 12, fontWeight: '700', fontFamily: 'Inter_700Bold' },

  cardReserva: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  cardReservaCancelada: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.75,
  },
  iconoReserva: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardReservaArea: { fontSize: 15, fontWeight: '700', color: '#0F2540', fontFamily: 'Inter_700Bold', marginBottom: 2 },
  cardReservaDetalle: { fontSize: 13, color: '#475569', fontFamily: 'Inter_500Medium', marginBottom: 2 },
  cardReservaApto: { fontSize: 12, color: '#94A3B8', fontFamily: 'Inter_500Medium' },
  badgeEstado: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeEstadoConfirmada: { backgroundColor: '#DCFCE7' },
  badgeEstadoCancelada: { backgroundColor: '#FEE2E2' },
  badgeEstadoTexto: { fontSize: 12, fontWeight: '700', fontFamily: 'Inter_700Bold' },

  // Formulario
  contenido: { padding: 24, paddingTop: 8 },
  filaChips: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', paddingVertical: 14, borderRadius: 12, minHeight: 52, borderWidth: 1, borderColor: '#E2E8F0' },
  chipActivo: { backgroundColor: '#0F2540', borderColor: '#0F2540' },
  chipTexto: { fontSize: 14, fontWeight: '700', color: '#64748B', fontFamily: 'Inter_700Bold' },
  chipTextoActivo: { color: '#FFF' },

  btnCalendario: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingVertical: 14, minHeight: 52, marginBottom: 12 },
  btnCalendarioTexto: { fontSize: 15, fontWeight: '700', color: '#0F2540', fontFamily: 'Inter_700Bold' },
  calendarioContainer: { backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24, overflow: 'hidden' },

  leyenda: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 },
  itemLeyenda: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  textoLeyenda: { fontSize: 12, color: '#64748B', fontFamily: 'Inter_500Medium' },

  bloqueCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, padding: 16, marginBottom: 12, minHeight: 64 },
  bloqueInfo: { flexDirection: 'row', alignItems: 'center' },
  bloqueHora: { fontSize: 15, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  bloqueEstado: { fontSize: 12, fontWeight: '600', marginTop: 2, fontFamily: 'Inter_600SemiBold' },

  btnConfirmar: { backgroundColor: '#0F2540', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderRadius: 14, marginTop: 16, minHeight: 56, elevation: 3 },
  btnConfirmarDeshabilitado: { backgroundColor: '#CBD5E1', elevation: 0 },
  btnConfirmarTexto: { color: '#FFF', fontSize: 15, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },

  // Admin vacío
  adminVacio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48, marginTop: 32 },
  adminVacioTexto: { fontSize: 16, fontWeight: '700', color: '#334155', fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 6 },
  adminVacioSub: { fontSize: 13, color: '#94A3B8', fontFamily: 'Inter_500Medium', textAlign: 'center' },
});
