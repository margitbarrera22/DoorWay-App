// src/app/index.tsx — Cartera y Módulos | Lógica: Wilfran Betancourt | UX/UI: Margit Barrera
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useRecibos } from '../hooks/RecibosContext';
import { useAuth } from '../hooks/AuthContext';
import { TarjetaRecibo } from '../components/TarjetaRecibo';
import { EstadoPantalla } from '../components/EstadoPantalla';
import { Recibo, EstadoRecibo } from '../domain/modelos';
import { evaluarDerechoAReservar, filtrarRecibosPorUsuario } from '../domain/reglasNegocio';
import { BarraNavegacionModulos } from '../components/BarraNavegacionModulos';
import { ModalPrivacidadLey1581 } from '../components/ModalPrivacidadLey1581';

export default function PantallaCartera() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recibos, estadoVista, mensajeError, cargar, modoAdmin } = useRecibos();
  const { usuarioActual, aceptarLey1581 } = useAuth();
  const [refrescando, setRefrescando] = useState(false);

  // Filtros para Administrador
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('todos');
  const [busquedaAdmin, setBusquedaAdmin] = useState('');

  // Control para Residente: mostrar u ocultar recibos anteriores (no todos de golpe)
  const [mostrarAnteriores, setMostrarAnteriores] = useState(false);
  const [busquedaResidente, setBusquedaResidente] = useState('');

  // Control para Administrador: minimizar meses anteriores debajo del mes actual de cada cliente
  const [clientesExpandidos, setClientesExpandidos] = useState<Record<string, boolean>>({});

  const alternarExpandirCliente = (apto: string) => {
    setClientesExpandidos((prev) => ({
      ...prev,
      [apto]: !prev[apto],
    }));
  };

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

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0F2540" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  const esAdmin = modoAdmin || usuarioActual?.rol === 'admin';

  // ── MODO ADMINISTRADOR: GESTIÓN DE CARTERA POR CLIENTES ──
  // Obtener lista única de clientes representados en los recibos
  const mapaClientes = new Map<string, { nombre: string; apartamento: string }>();
  for (const r of recibos) {
    if (!mapaClientes.has(r.apartamento)) {
      mapaClientes.set(r.apartamento, {
        nombre: r.residenteNombre,
        apartamento: r.apartamento,
      });
    }
  }
  const listaClientesAdmin = Array.from(mapaClientes.values());

  // Filtrado de recibos para el administrador
  const recibosAdminFiltrados = recibos.filter((r) => {
    // Filtro por chip de cliente
    if (clienteSeleccionado !== 'todos' && r.apartamento !== clienteSeleccionado) {
      return false;
    }
    // Filtro por texto de búsqueda
    if (busquedaAdmin.trim()) {
      const b = busquedaAdmin.toLowerCase();
      const matchNombre = r.residenteNombre?.toLowerCase().includes(b);
      const matchApto = r.apartamento?.toLowerCase().includes(b);
      const matchPeriodo = r.periodo?.toLowerCase().includes(b);
      const matchRef = r.referenciaBancaria?.toLowerCase().includes(b);
      const matchEstado = r.estado?.toLowerCase().includes(b);
      return matchNombre || matchApto || matchPeriodo || matchRef || matchEstado;
    }
    return true;
  });

  // Agrupar recibos del admin por cliente para mostrar el mes actual y minimizar los del pasado
  interface GrupoClienteAdmin {
    apartamento: string;
    nombre: string;
    reciboActual: Recibo;
    recibosAnteriores: Recibo[];
  }

  const gruposPorCliente: GrupoClienteAdmin[] = [];
  const agrupadoTemp = new Map<string, Recibo[]>();

  for (const r of recibosAdminFiltrados) {
    const clave = r.apartamento;
    if (!agrupadoTemp.has(clave)) {
      agrupadoTemp.set(clave, []);
    }
    agrupadoTemp.get(clave)!.push(r);
  }

  for (const [apto, lista] of agrupadoTemp.entries()) {
    if (lista.length > 0) {
      gruposPorCliente.push({
        apartamento: apto,
        nombre: lista[0].residenteNombre,
        reciboActual: lista[0], // el más reciente / mes actual
        recibosAnteriores: lista.slice(1), // meses pasados a minimizar
      });
    }
  }

  // ── MODO RESIDENTE: RECIBOS PROPIOS Y RECIBO ACTUAL HERO ──
  const misRecibos = filtrarRecibosPorUsuario(recibos, usuarioActual);

  // Si un residente nuevo se registró y aún no tiene recibo en la base, creamos su primer recibo activo
  const recibosFinalesResidente: Recibo[] =
    misRecibos.length > 0
      ? misRecibos
      : [
          {
            id: `rec-${usuarioActual?.id || 'nuevo'}-01`,
            apartamento: usuarioActual?.apartamento || 'Torre B - Apto 302',
            residenteNombre: usuarioActual?.nombre || 'Residente DoorWay',
            periodo: 'Noviembre 2026',
            monto: 185000,
            fechaVencimiento: '2026-11-30',
            estado: 'Pagado' as EstadoRecibo,
            referenciaBancaria: 'REF-REG-001',
            comprobanteUrl: null,
            observacionAdmin: null,
          },
        ];

  const reciboActualResidente = recibosFinalesResidente[0];
  const recibosAnterioresResidente =
    recibosFinalesResidente.length > 1 ? recibosFinalesResidente.slice(1) : [];

  const veredictoMoraResidente = evaluarDerechoAReservar(recibosFinalesResidente);

  const recibosAnterioresFiltrados = recibosAnterioresResidente.filter((r) => {
    if (!busquedaResidente.trim()) return true;
    const b = busquedaResidente.toLowerCase();
    return (
      r.periodo.toLowerCase().includes(b) ||
      r.fechaVencimiento.includes(b) ||
      r.estado.toLowerCase().includes(b) ||
      (r.referenciaBancaria && r.referenciaBancaria.toLowerCase().includes(b))
    );
  });

  return (
    <View style={estilos.contenedor}>
      {/* Header corporativo DoorWay */}
      <View style={[estilos.header, { paddingTop: Math.max(insets.top, 24) + 12 }]}>
        <View style={estilos.headerTextos}>
          <Text style={estilos.headerTitulo}>
            {esAdmin ? 'Cartera de Copropiedad' : 'Mi Cartera'}
          </Text>
          <Text style={estilos.headerSub} numberOfLines={1}>
            {esAdmin
              ? 'Panel Administrativo · Gestión por Clientes'
              : `${usuarioActual?.nombre || 'Residente'} · ${usuarioActual?.apartamento || 'Unidad Residencial'}`}
          </Text>
        </View>

        {/* Botón Logo / Avatar que lleva al perfil */}
        <Pressable
          onPress={() => router.push('/perfil')}
          accessibilityRole="button"
          accessibilityLabel="Ir al perfil del cliente"
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

      {/* Banner de Estado SOLO PARA EL RESIDENTE */}
      {!esAdmin && (
        <View style={veredictoMoraResidente.permitido ? estilos.bannerAlDia : estilos.bannerMora}>
          <Ionicons
            name={veredictoMoraResidente.permitido ? 'checkmark-circle' : 'alert-circle'}
            size={20}
            color={veredictoMoraResidente.permitido ? '#166534' : '#991B1B'}
            style={{ marginRight: 10 }}
          />
          <Text style={veredictoMoraResidente.permitido ? estilos.bannerAlDiaTexto : estilos.bannerMoraTexto}>
            {veredictoMoraResidente.permitido
              ? 'Estado al día · Habilitado para uso y reserva de áreas comunes'
              : veredictoMoraResidente.motivoBloqueo}
          </Text>
        </View>
      )}

      {/* Estados generales de carga y error */}
      {estadoVista === 'cargando' && <EstadoPantalla tipo="cargando" />}

      {estadoVista === 'error' && (
        <EstadoPantalla
          tipo="error"
          mensaje={mensajeError}
          textoBoton="Reintentar"
          alPresionarBoton={cargar}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          VISTA 1: MODO ADMINISTRADOR (CARTERA POR CLIENTES)
          ══════════════════════════════════════════════════════════════ */}
      {esAdmin && estadoVista !== 'cargando' && (
        <ScrollView
          contentContainerStyle={[estilos.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 70 }]}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={alRefrescar} colors={['#0F2540']} />}
        >
          {/* Tarjeta de Resumen de Cartera General */}
          <View style={estilos.cardAdminResumen}>
            <View style={estilos.filaAdminResumenHeader}>
              <View>
                <Text style={estilos.adminResumenTitulo}>Balance General de Clientes</Text>
                <Text style={estilos.adminResumenSub}>
                  {listaClientesAdmin.length} clientes registrados en copropiedad
                </Text>
              </View>
              <View style={estilos.badgeAdminRol}>
                <Ionicons name="shield-checkmark" size={14} color="#0F2540" style={{ marginRight: 4 }} />
                <Text style={estilos.badgeAdminRolTexto}>Admin</Text>
              </View>
            </View>

            <View style={estilos.filaPillsStats}>
              <View style={estilos.pillStat}>
                <Text style={estilos.pillStatNumero}>{recibos.length}</Text>
                <Text style={estilos.pillStatLabel}>Recibos Totales</Text>
              </View>
              <View style={[estilos.pillStat, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[estilos.pillStatNumero, { color: '#166534' }]}>
                  {recibos.filter((r) => r.estado === 'Pagado').length}
                </Text>
                <Text style={[estilos.pillStatLabel, { color: '#166534' }]}>Pagados</Text>
              </View>
              <View style={[estilos.pillStat, { backgroundColor: '#FEF9C3' }]}>
                <Text style={[estilos.pillStatNumero, { color: '#854D0E' }]}>
                  {recibos.filter((r) => r.estado === 'En validación').length}
                </Text>
                <Text style={[estilos.pillStatLabel, { color: '#854D0E' }]}>En Revisión</Text>
              </View>
              <View style={[estilos.pillStat, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[estilos.pillStatNumero, { color: '#991B1B' }]}>
                  {recibos.filter((r) => r.estado === 'En mora').length}
                </Text>
                <Text style={[estilos.pillStatLabel, { color: '#991B1B' }]}>En Mora</Text>
              </View>
            </View>
          </View>

          {/* Selector de Clientes (Filtro por Cliente) */}
          <View style={estilos.seccionFiltroClientes}>
            <Text style={estilos.subtituloSeccionAdmin}>Filtrar por Cliente:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.scrollChipsClientes}>
              <Pressable
                onPress={() => setClienteSeleccionado('todos')}
                style={[estilos.chipCliente, clienteSeleccionado === 'todos' && estilos.chipClienteActivo]}
              >
                <Ionicons
                  name="people"
                  size={15}
                  color={clienteSeleccionado === 'todos' ? '#FFF' : '#64748B'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[estilos.chipClienteTexto, clienteSeleccionado === 'todos' && estilos.chipClienteTextoActivo]}>
                  Todos ({recibos.length})
                </Text>
              </Pressable>

              {listaClientesAdmin.map((cli) => {
                const activo = clienteSeleccionado === cli.apartamento;
                const totalCli = recibos.filter((r) => r.apartamento === cli.apartamento).length;
                return (
                  <Pressable
                    key={cli.apartamento}
                    onPress={() => setClienteSeleccionado(cli.apartamento)}
                    style={[estilos.chipCliente, activo && estilos.chipClienteActivo]}
                  >
                    <Ionicons
                      name="person"
                      size={14}
                      color={activo ? '#FFF' : '#64748B'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[estilos.chipClienteTexto, activo && estilos.chipClienteTextoActivo]}>
                      {cli.nombre.split(' ')[0]} ({cli.apartamento.replace('Torre ', 'T.').replace(' - Apto ', ' ')})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Buscador de Recibos para Admin */}
          <View style={estilos.cajaBusqueda}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={estilos.inputBusqueda}
              value={busquedaAdmin}
              onChangeText={setBusquedaAdmin}
              placeholder="Buscar por cliente, apartamento, ref o estado..."
              placeholderTextColor="#94A3B8"
            />
            {busquedaAdmin ? (
              <Pressable onPress={() => setBusquedaAdmin('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            ) : null}
          </View>

          {/* Lista de Recibos por Cliente para el Administrador */}
          <View style={estilos.listaAdminRecibos}>
            <View style={estilos.filaTituloListaAdmin}>
              <Text style={estilos.tituloListaAdmin}>
                Recibos de Cartera ({recibosAdminFiltrados.length})
              </Text>
              {clienteSeleccionado !== 'todos' && (
                <Pressable onPress={() => setClienteSeleccionado('todos')}>
                  <Text style={estilos.btnLimpiarFiltro}>Ver todos</Text>
                </Pressable>
              )}
            </View>

            {gruposPorCliente.length === 0 ? (
              <View style={estilos.vacioAdmin}>
                <Ionicons name="search-outline" size={36} color="#94A3B8" style={{ marginBottom: 8 }} />
                <Text style={estilos.vacioAdminTexto}>No se encontraron recibos con los filtros actuales</Text>
              </View>
            ) : (
              gruposPorCliente.map((grupo) => {
                const item = grupo.reciboActual;
                const anteriores = grupo.recibosAnteriores;
                const estaExpandido = Boolean(clientesExpandidos[grupo.apartamento]);

                return (
                  <View key={item.id} style={estilos.cardReciboAdmin}>
                    {/* Encabezado del Cliente */}
                    <View style={estilos.cardReciboAdminHeader}>
                      <View style={estilos.avatarClienteMini}>
                        <Ionicons name="person" size={16} color="#0F2540" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={estilos.nombreClienteAdmin}>{item.residenteNombre}</Text>
                        <Text style={estilos.aptoClienteAdmin}>{item.apartamento}</Text>
                      </View>
                      <View
                        style={[
                          estilos.badgeEstado,
                          item.estado === 'Pagado' && estilos.badgePagado,
                          item.estado === 'En validación' && estilos.badgeValidacion,
                          item.estado === 'En mora' && estilos.badgeMora,
                        ]}
                      >
                        <Text
                          style={[
                            estilos.badgeEstadoTexto,
                            item.estado === 'Pagado' && { color: '#166534' },
                            item.estado === 'En validación' && { color: '#854D0E' },
                            item.estado === 'En mora' && { color: '#991B1B' },
                          ]}
                        >
                          {item.estado}
                        </Text>
                      </View>
                    </View>

                    {/* Cuerpo del Recibo Actual */}
                    <View style={estilos.cardReciboAdminBody}>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={estilos.periodoAdminTexto}>{item.periodo}</Text>
                          <View style={estilos.chipMesActual}>
                            <Text style={estilos.chipMesActualTexto}>Mes actual</Text>
                          </View>
                        </View>
                        <Text style={estilos.montoAdminTexto}>
                          ${(item.monto ?? 185000).toLocaleString('es-CO')}{' '}
                          <Text style={estilos.monedaAdminTexto}>COP</Text>
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => router.push(`/recibo/${item.id}`)}
                        style={estilos.btnGestionarAdmin}
                        accessibilityRole="button"
                        accessibilityLabel={`Gestionar recibo actual de ${item.residenteNombre}`}
                      >
                        <Text style={estilos.btnGestionarAdminTexto}>Gestionar</Text>
                        <Ionicons name="chevron-forward" size={16} color="#FFF" />
                      </Pressable>
                    </View>

                    {/* Pie con detalles de soporte y vencimiento */}
                    <View style={estilos.cardReciboAdminFooter}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="calendar-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
                        <Text style={estilos.fechaVenceAdmin}>Vence: {item.fechaVencimiento}</Text>
                      </View>

                      {item.referenciaBancaria ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="receipt-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
                          <Text style={estilos.refAdmin} numberOfLines={1}>
                            Ref: {item.referenciaBancaria}
                          </Text>
                        </View>
                      ) : null}

                      {item.comprobanteUrl ? (
                        <View style={estilos.chipFotoSoporte}>
                          <Ionicons name="image" size={12} color="#166534" style={{ marginRight: 3 }} />
                          <Text style={estilos.chipFotoSoporteTexto}>Foto adjunta</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Acordeón para Meses Anteriores Minimizados (ej. Doña Martha) */}
                    {anteriores.length > 0 && (
                      <View style={{ marginTop: 10 }}>
                        <Pressable
                          onPress={() => alternarExpandirCliente(grupo.apartamento)}
                          style={estilos.btnToggleMesesAnteriores}
                          accessibilityRole="button"
                          accessibilityLabel={`Ver recibos de meses anteriores de ${grupo.nombre}`}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons
                              name={estaExpandido ? 'chevron-up-circle' : 'time-outline'}
                              size={15}
                              color="#0F2540"
                              style={{ marginRight: 6 }}
                            />
                            <Text style={estilos.textoToggleMesesAnteriores}>
                              {estaExpandido
                                ? `Ocultar meses anteriores de ${grupo.nombre.split(' ')[0]}`
                                : `Ver ${anteriores.length} recibos anteriores (${anteriores.map((r) => r.periodo.split(' ')[0]).join(', ')})`}
                            </Text>
                          </View>
                          <Ionicons
                            name={estaExpandido ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color="#0F2540"
                          />
                        </Pressable>

                        {/* Lista desplegada de meses anteriores minimizados */}
                        {estaExpandido && (
                          <View style={estilos.contenedorMesesAnteriores}>
                            {anteriores.map((ant) => (
                              <View key={ant.id} style={estilos.cardReciboAnteriorAdmin}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                    <Text style={estilos.periodoAnteriorTexto}>{ant.periodo}</Text>
                                    <View
                                      style={[
                                        estilos.badgeEstadoMini,
                                        ant.estado === 'Pagado' && estilos.badgePagado,
                                        ant.estado === 'En validación' && estilos.badgeValidacion,
                                        ant.estado === 'En mora' && estilos.badgeMora,
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          estilos.badgeEstadoMiniTexto,
                                          ant.estado === 'Pagado' && { color: '#166534' },
                                          ant.estado === 'En validación' && { color: '#854D0E' },
                                          ant.estado === 'En mora' && { color: '#991B1B' },
                                        ]}
                                      >
                                        {ant.estado}
                                      </Text>
                                    </View>
                                  </View>
                                  <Text style={estilos.montoAnteriorTexto}>
                                    ${(ant.monto ?? 185000).toLocaleString('es-CO')} COP
                                  </Text>
                                  {ant.referenciaBancaria ? (
                                    <Text style={estilos.refAnteriorTexto} numberOfLines={1}>
                                      Ref: {ant.referenciaBancaria}
                                    </Text>
                                  ) : null}
                                </View>

                                <Pressable
                                  onPress={() => router.push(`/recibo/${ant.id}`)}
                                  style={estilos.btnVerDetalleMini}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Gestionar recibo anterior de ${ant.periodo}`}
                                >
                                  <Text style={estilos.btnVerDetalleMiniTexto}>Gestionar</Text>
                                  <Ionicons name="chevron-forward" size={13} color="#0F2540" />
                                </Pressable>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VISTA 2: MODO RESIDENTE / CLIENTE (RECIBO ACTUAL + ANTERIORES)
          ══════════════════════════════════════════════════════════════ */}
      {!esAdmin && estadoVista !== 'cargando' && (
        <ScrollView
          contentContainerStyle={[estilos.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 70 }]}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={alRefrescar} colors={['#0F2540']} />}
        >
          {/* ── RECIBO ACTUAL (HERO CARD DESTACADA) ── */}
          {reciboActualResidente && (
            <View style={estilos.seccionHero}>
              <View style={estilos.heroEtiquetaFila}>
                <View style={estilos.badgeReciboActual}>
                  <Ionicons name="sparkles" size={13} color="#0F2540" style={{ marginRight: 5 }} />
                  <Text style={estilos.badgeReciboActualTexto}>RECIBO ACTUAL</Text>
                </View>
                <Text style={estilos.periodoHero}>{reciboActualResidente.periodo}</Text>
              </View>

              <View style={estilos.cardHero}>
                <View style={estilos.cardHeroTop}>
                  <View>
                    <Text style={estilos.labelTotalHero}>Cuota de administración</Text>
                    <Text style={estilos.montoHero}>
                      ${(reciboActualResidente.monto ?? 185000).toLocaleString('es-CO')}{' '}
                      <Text style={estilos.monedaHero}>COP</Text>
                    </Text>
                  </View>

                  {/* Badge de Estado */}
                  <View
                    style={[
                      estilos.badgeEstado,
                      reciboActualResidente.estado === 'Pagado' && estilos.badgePagado,
                      reciboActualResidente.estado === 'En validación' && estilos.badgeValidacion,
                      reciboActualResidente.estado === 'En mora' && estilos.badgeMora,
                    ]}
                  >
                    <Text
                      style={[
                        estilos.badgeEstadoTexto,
                        reciboActualResidente.estado === 'Pagado' && { color: '#166534' },
                        reciboActualResidente.estado === 'En validación' && { color: '#854D0E' },
                        reciboActualResidente.estado === 'En mora' && { color: '#991B1B' },
                      ]}
                    >
                      {reciboActualResidente.estado}
                    </Text>
                  </View>
                </View>

                {/* Datos del recibo */}
                <View style={estilos.heroDetalles}>
                  <View style={estilos.filaHeroDato}>
                    <Ionicons name="calendar-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={estilos.heroDatoTexto}>Vence el {reciboActualResidente.fechaVencimiento}</Text>
                  </View>

                  {reciboActualResidente.referenciaBancaria ? (
                    <View style={estilos.filaHeroDato}>
                      <Ionicons name="receipt-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                      <Text style={estilos.heroDatoTexto} numberOfLines={1}>
                        Ref: {reciboActualResidente.referenciaBancaria}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Acciones principales del recibo actual */}
                <View style={estilos.filaAccionesHero}>
                  {reciboActualResidente.estado === 'En mora' ? (
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/recibo/subir',
                          params: { id: reciboActualResidente.id, idRecibo: reciboActualResidente.id },
                        })
                      }
                      style={estilos.btnHeroPrincipal}
                      accessibilityRole="button"
                      accessibilityLabel="Subir comprobante de pago para este recibo"
                    >
                      <Ionicons name="cloud-upload-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={estilos.btnHeroPrincipalTexto}>Subir Comprobante</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => router.push(`/recibo/${reciboActualResidente.id}`)}
                      style={estilos.btnHeroPrincipal}
                      accessibilityRole="button"
                      accessibilityLabel="Ver detalle del comprobante"
                    >
                      <Ionicons name="eye-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={estilos.btnHeroPrincipalTexto}>Ver Detalle del Recibo</Text>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => router.push(`/recibo/${reciboActualResidente.id}`)}
                    style={estilos.btnHeroSecundario}
                    accessibilityRole="button"
                    accessibilityLabel="Ver opciones del recibo"
                  >
                    <Ionicons name="information-circle-outline" size={20} color="#0F2540" />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* ── SECCIÓN: RECIBOS ANTERIORES (Colapsable y con Búsqueda) ── */}
          {recibosAnterioresResidente.length > 0 && (
            <View style={estilos.seccionAnteriores}>
              <Pressable
                onPress={() => setMostrarAnteriores(!mostrarAnteriores)}
                style={estilos.botonToggleAnteriores}
                accessibilityRole="button"
                accessibilityLabel="Mostrar u ocultar recibos anteriores"
              >
                <View style={estilos.filaToggle}>
                  <Ionicons name="time-outline" size={20} color="#0F2540" style={{ marginRight: 8 }} />
                  <Text style={estilos.tituloAnteriores}>Recibos Anteriores</Text>
                  <View style={estilos.badgeContador}>
                    <Text style={estilos.badgeContadorTexto}>{recibosAnterioresResidente.length}</Text>
                  </View>
                </View>

                <Ionicons
                  name={mostrarAnteriores ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color="#0F2540"
                />
              </Pressable>

              {/* Si está desplegado, mostramos el buscador y los recibos pasados */}
              {mostrarAnteriores && (
                <View style={estilos.contenedorDesplegado}>
                  {/* Buscador de recibos anteriores */}
                  <View style={estilos.cajaBusqueda}>
                    <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                    <TextInput
                      style={estilos.inputBusqueda}
                      value={busquedaResidente}
                      onChangeText={setBusquedaResidente}
                      placeholder="Buscar por mes, estado o referencia..."
                      placeholderTextColor="#94A3B8"
                    />
                    {busquedaResidente ? (
                      <Pressable onPress={() => setBusquedaResidente('')}>
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                      </Pressable>
                    ) : null}
                  </View>

                  {/* Lista de recibos pasados filtrados */}
                  {recibosAnterioresFiltrados.length === 0 ? (
                    <View style={estilos.vacioBusqueda}>
                      <Text style={estilos.textoVacioBusqueda}>
                        No se encontraron recibos anteriores con esa búsqueda.
                      </Text>
                    </View>
                  ) : (
                    recibosAnterioresFiltrados.map((item) => (
                      <TarjetaRecibo
                        key={item.id}
                        recibo={item}
                        alTocar={() => router.push(`/recibo/${item.id}`)}
                      />
                    ))
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      <BarraNavegacionModulos />

      <ModalPrivacidadLey1581
        visible={Boolean(usuarioActual && !usuarioActual.aceptoLey1581)}
        alAceptar={aceptarLey1581}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    backgroundColor: '#0F2540',
    paddingBottom: 22,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextos: { flex: 1, paddingRight: 12 },
  headerTitulo: { color: '#FFF', fontSize: 24, fontWeight: '900', fontFamily: 'Inter_900Black' },
  headerSub: { color: '#94A3B8', fontSize: 13, marginTop: 4, fontFamily: 'Inter_500Medium' },

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

  bannerAlDia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#86EFAC',
  },
  bannerAlDiaTexto: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  bannerMora: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
  },
  bannerMoraTexto: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
    fontFamily: 'Inter_600SemiBold',
  },

  scrollContent: { padding: 20 },

  // Estilos Modo Administrador
  cardAdminResumen: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  filaAdminResumenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  adminResumenTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },
  adminResumenSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  badgeAdminRol: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeAdminRolTexto: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },

  filaPillsStats: {
    flexDirection: 'row',
    gap: 8,
  },
  pillStat: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pillStatNumero: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F2540',
    fontFamily: 'Inter_900Black',
  },
  pillStatLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'Inter_700Bold',
  },

  seccionFiltroClientes: {
    marginBottom: 14,
  },
  subtituloSeccionAdmin: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  scrollChipsClientes: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chipCliente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipClienteActivo: {
    backgroundColor: '#0F2540',
    borderColor: '#0F2540',
  },
  chipClienteTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Inter_600SemiBold',
  },
  chipClienteTextoActivo: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  listaAdminRecibos: {
    marginTop: 4,
  },
  filaTituloListaAdmin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tituloListaAdmin: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },
  btnLimpiarFiltro: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },

  cardReciboAdmin: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardReciboAdminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarClienteMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  nombreClienteAdmin: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
  },
  aptoClienteAdmin: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
  },

  cardReciboAdminBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodoAdminTexto: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  montoAdminTexto: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F2540',
    fontFamily: 'Inter_900Black',
  },
  monedaAdminTexto: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Inter_600SemiBold',
  },
  btnGestionarAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2540',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnGestionarAdminTexto: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 4,
    fontFamily: 'Inter_700Bold',
  },

  cardReciboAdminFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    flexWrap: 'wrap',
    gap: 8,
  },
  fechaVenceAdmin: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
  },
  refAdmin: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  chipFotoSoporte: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipFotoSoporteTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    fontFamily: 'Inter_700Bold',
  },

  chipMesActual: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 6,
  },
  chipMesActualTexto: {
    color: '#0369A1',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },

  btnToggleMesesAnteriores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  textoToggleMesesAnteriores: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
  },
  contenedorMesesAnteriores: {
    marginTop: 8,
    gap: 8,
    paddingLeft: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#CBD5E1',
  },
  cardReciboAnteriorAdmin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodoAnteriorTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    fontFamily: 'Inter_700Bold',
    marginRight: 6,
  },
  montoAnteriorTexto: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
    marginTop: 2,
  },
  refAnteriorTexto: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
    marginTop: 1,
  },
  badgeEstadoMini: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeEstadoMiniTexto: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
  },
  btnVerDetalleMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  btnVerDetalleMiniTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2540',
    fontFamily: 'Inter_700Bold',
    marginRight: 2,
  },
  vacioAdmin: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vacioAdminTexto: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },

  // Hero Card Recibo Actual Residente
  seccionHero: { marginBottom: 20 },
  heroEtiquetaFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  badgeReciboActual: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeReciboActualTexto: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2540',
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.5,
  },
  periodoHero: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Inter_700Bold',
  },

  cardHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#0F2540',
    elevation: 3,
    shadowColor: '#0F2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  labelTotalHero: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  montoHero: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F2540',
    fontFamily: 'Inter_900Black',
  },
  monedaHero: { fontSize: 16, fontWeight: '600', color: '#64748B' },

  badgeEstado: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgePagado: { backgroundColor: '#DCFCE7' },
  badgeValidacion: { backgroundColor: '#FEF9C3' },
  badgeMora: { backgroundColor: '#FEE2E2' },
  badgeEstadoTexto: { fontSize: 12, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },

  heroDetalles: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 8,
  },
  filaHeroDato: { flexDirection: 'row', alignItems: 'center' },
  heroDatoTexto: { fontSize: 13, color: '#334155', fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1 },

  filaAccionesHero: { flexDirection: 'row', gap: 10 },
  btnHeroPrincipal: {
    flex: 1,
    backgroundColor: '#0F2540',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
  },
  btnHeroPrincipalTexto: { color: '#FFF', fontSize: 15, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  btnHeroSecundario: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sección Recibos Anteriores (Desplegable)
  seccionAnteriores: { marginTop: 8 },
  botonToggleAnteriores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  filaToggle: { flexDirection: 'row', alignItems: 'center' },
  tituloAnteriores: { fontSize: 16, fontWeight: '800', color: '#0F2540', fontFamily: 'Inter_800ExtraBold' },
  badgeContador: {
    backgroundColor: '#0F2540',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeContadorTexto: { color: '#FFF', fontSize: 11, fontWeight: '700', fontFamily: 'Inter_700Bold' },

  contenedorDesplegado: { marginTop: 14 },
  cajaBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 46,
    marginBottom: 14,
  },
  inputBusqueda: { flex: 1, fontSize: 14, color: '#0F2540', fontFamily: 'Inter_500Medium' },
  vacioBusqueda: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  textoVacioBusqueda: { color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium', textAlign: 'center' },
});
