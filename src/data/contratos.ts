// src/data/contratos.ts — Autora: Michel Daniela Bayona Díaz
import {
    Recibo,
    EstadoRecibo,
    ResultadoFoto,
    Reserva,
    AreaComun,
    BloqueHorario,
    Anuncio,
    ContactoEmergencia,
    UsuarioSesion,
} from '../domain/modelos';

export interface IRecibosRepository {
    obtenerTodos(): Promise<Recibo[]>;
    obtenerPorId(id: string): Promise<Recibo | null>;
    subirComprobante(idRecibo: string, referencia: string, uriFotoLocal: string): Promise<Recibo>;
    conciliarReciboAdmin(idRecibo: string, nuevoEstado: EstadoRecibo, observacion?: string): Promise<Recibo>;
}

export interface IServicioCamara {
    tomarFotoComprimida(): Promise<ResultadoFoto | null>;
    elegirDeGaleriaComprimida(): Promise<ResultadoFoto | null>;
}

export interface IReservasRepository {
    obtenerPorAreaYFecha(area: AreaComun, fecha: string): Promise<Reserva[]>;
    crearReserva(apartamento: string, area: AreaComun, fecha: string, bloque: BloqueHorario): Promise<Reserva>;
    cancelarReserva(idReserva: string): Promise<void>;
}

export interface IAuthRepository {
    iniciarSesion(correo: string, pin: string): Promise<UsuarioSesion>;
    obtenerSesionActivaLocal(): Promise<UsuarioSesion | null>;
    registrarAceptacionLey1581(idUsuario: string): Promise<UsuarioSesion>;
    cerrarSesion(): Promise<void>;
}

export interface IComunidadRepository {
    obtenerAnuncios(): Promise<Anuncio[]>;
    crearAnuncioAdmin(titulo: string, contenido: string, categoria: Anuncio['categoria']): Promise<Anuncio>;
    obtenerDirectorioEmergencias(): Promise<ContactoEmergencia[]>;
}
