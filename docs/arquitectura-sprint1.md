# Arquitectura y Diseño Técnico · Sprint 1 (DoorWay-App)
**Autora:** Michel Daniela Bayona Díaz (Product Owner & Backend Developer)  
**Semestre:** Ingeniería Informática VIII Semestre · UNIPAZ  
**Stack Oficial:** React Native + Expo + SQLite Local + Supabase (Cloud) | Patrón MVVM  

---

## 1. Tabla de Actores del Sistema (Sprint 1)

| Actor | Tipo | Qué hace en DoorWay-App | Qué espera |
| :--- | :--- | :--- | :--- |
| **Residente (Doña Martha)** | Primario, usa la app | Consulta estado de cuenta y recibos (HU-03), toma foto y sube comprobante de pago (HU-01). | Saber al instante si está al día y no depender de soportes físicos o WhatsApp. |
| **Administrador(a) del Conjunto** | Primario, usa la app | Revisa soportes bancarios subidos, aprueba o rechaza pagos (HU-04). | Trazabilidad financiera sin Excel y control de morosidad automático. |
| **Android (Permisos y Red)** | Sistema | Concede/niega permisos de cámara y notifica estado de conexión a Internet. | Proveer acceso a hardware seguro y transparente. |
| **Cámara y Galería (expo-image-picker)** | Sistema | Captura foto del voucher bancario y la comprime (< 300 KB con expo-image-manipulator). | Reducir consumo de datos y almacenamiento en la nube. |
| **SQLite Local (expo-sqlite)** | Sistema | Almacena en el teléfono el caché de recibos (HU-03) para consulta offline. | Disponibilidad de datos sin conexión a la red. |
| **Supabase (Postgres + Storage)** | Sistema | Aloja la base de datos central relacional y guarda fotos en el bucket `soportes`. | Consistencia, persistencia en la nube y sincronización multiusuario. |

---

## 2. Eventos de Dominio (Sprint 1 · En orden cronológico)

| # | Evento de Dominio | Lo dispara | Qué cambia en el estado / datos | Issue / Historia |
| :-: | :--- | :--- | :--- | :--- |
| **1** | App abierta y base local lista | Residente / Admin + Android | Crea tablas en `expo-sqlite` si no existen, carga sesión y muestra pantalla inicial. | TEC-01 (#13), TEC-03 (#15) |
| **2** | Aviso de privacidad aceptado (Ley 1581) | Residente en su primer ingreso | Se guarda aceptación en SQLite/preferencias; no vuelve a bloquear el flujo. | TEC-05 (#17) |
| **3** | Estado de cuenta consultado | Residente | Lee de Supabase (o caché SQLite si no hay red); muestra: cargando, vacía, error o con datos. | HU-03 (#3), TEC-05 (#17) |
| **4** | Detalle de recibo abierto | Residente | Abre ruta `/recibo/[id]` con periodo, monto, estado, referencia y foto. | HU-03 (#3) |
| **5** | Foto capturada y comprimida (o negada) | Residente + Cámara/Galería | `expo-image-picker` entrega foto y comprime al 60%; si niega cámara, ofrece galería. | HU-01 (#1), TEC-04 (#16) |
| **6** | Envío rechazado por datos faltantes | App (ViewModel) | Indica qué falta (foto o referencia) sin borrar lo ya digitado en el formulario. | HU-01 (#1) |
| **7** | Comprobante de pago registrado | Residente | Sube imagen a Supabase, cambia estado a 'En validación' y actualiza caché SQLite. | HU-01 (#1), TEC-03 (#15) |
| **8** | Comprobante conciliado por Admin | Administrador(a) | Cambia recibo a 'Pagado' (o lo devuelve a 'En mora' con observación); actualiza derecho a reservar. | HU-04 (#4) |

---

## 3. Arquitectura en 4 Capas (Patrón MVVM con Contratos)

| Capa | Carpeta en el Repo | Responde por | Depende de | Cómo se prueba |
| :--- | :--- | :--- | :--- | :--- |
| **1. Presentación** | `src/app/` y `src/components/` | Pantallas JSX, estilos, navegación Expo Router y accesibilidad (botones ≥ 48dp). | ViewModels (`src/hooks/`) | Ficha de prueba en teléfono Android físico real. |
| **2. ViewModels** | `src/hooks/` | Estado de pantalla (cargando, vacío, error, conDatos), bloqueo de doble toque y validación. | Dominio y Contratos (`src/domain/`, `src/data/contratos.ts`) | Inyección de repositorio simulado / dobles de prueba. |
| **3. Dominio** | `src/domain/` | Entidades TypeScript (`Recibo`, etc.) y reglas de negocio puras (`tieneMoraActiva`). | Nada (TypeScript puro, sin dependencias externas) | Pruebas unitarias de funciones puras. |
| **4. Datos** | `src/data/` | Implementaciones: `RepositorioRecibosHibrido`, `dbLocalSqlite.ts` y `ServicioCamaraExpo.ts`. | Contratos e interfaces + paquetes de Expo y Supabase. | Pruebas de integración SQLite / Supabase y mocks. |
| **Plataforma** | `node_modules` / Android | `expo-sqlite`, `@supabase/supabase-js`, `expo-image-picker`, `expo-image-manipulator`, `expo-router`. | Sistema Operativo Android | Ejecución directa en celular Android vía Expo Go / APK. |