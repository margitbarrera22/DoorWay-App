// src/data/RepositorioComunidadHibrido.ts — Autor: Said Alexander Pacheco Moncada (TEC-05 #17)
import { supabase } from './RepositorioRecibos';
import { Anuncio, ContactoEmergencia } from '../domain/modelos';
import { IComunidadRepository } from './contratos';
import {
  guardarAnunciosEnSqlite,
  leerAnunciosDeSqlite,
  leerDirectorioDeSqlite,
} from './dbLocalSqlite';

export class RepositorioComunidadHibrido implements IComunidadRepository {
  async cargarComunidadCompleta(): Promise<{
    anuncios: Anuncio[];
    contactos: ContactoEmergencia[];
    desdeCacheSqlite: boolean;
  }> {
    const contactosLocales = leerDirectorioDeSqlite();

    try {
      // 1. Intenta obtener los anuncios desde Supabase
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .order('fecha_publicacion', { ascending: false });

      if (error) throw error;

      const anunciosMapeados: Anuncio[] = (data || []).map((f: any) => ({
        id: f.id,
        titulo: f.titulo,
        contenido: f.contenido,
        categoria: f.categoria,
        fechaPublicacion: f.fecha_publicacion,
      }));

      if (anunciosMapeados.length > 0) {
        // 2. Guarda la copia en SQLite local para acceso offline
        guardarAnunciosEnSqlite(anunciosMapeados);
        return {
          anuncios: anunciosMapeados,
          contactos: contactosLocales,
          desdeCacheSqlite: false,
        };
      }

      const anunciosSemillaLocal = leerAnunciosDeSqlite();
      return {
        anuncios: anunciosSemillaLocal,
        contactos: contactosLocales,
        desdeCacheSqlite: false,
      };
    } catch {
      // 3. Si no hay conexión (Modo Avión), rescata los anuncios desde la caché SQLite local
      const anunciosCache = leerAnunciosDeSqlite();
      return {
        anuncios: anunciosCache,
        contactos: contactosLocales,
        desdeCacheSqlite: true,
      };
    }
  }

  async obtenerAnuncios(): Promise<Anuncio[]> {
    const resultado = await this.cargarComunidadCompleta();
    return resultado.anuncios;
  }

  async crearAnuncioAdmin(
    titulo: string,
    contenido: string,
    categoria: Anuncio['categoria']
  ): Promise<Anuncio> {
    const nuevoAnuncio: Anuncio = {
      id: `anu-${Date.now()}`,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      categoria,
      fechaPublicacion: new Date().toISOString().split('T')[0],
    };

    try {
      const { data, error } = await supabase
        .from('anuncios')
        .insert({
          id: nuevoAnuncio.id,
          titulo: nuevoAnuncio.titulo,
          contenido: nuevoAnuncio.contenido,
          categoria: nuevoAnuncio.categoria,
          fecha_publicacion: nuevoAnuncio.fechaPublicacion,
        })
        .select()
        .single();

      if (!error && data) {
        nuevoAnuncio.id = data.id;
      }
    } catch {
      // Respaldo local en SQLite si está offline
    }

    const actuales = leerAnunciosDeSqlite();
    guardarAnunciosEnSqlite([nuevoAnuncio, ...actuales]);
    return nuevoAnuncio;
  }

  async obtenerDirectorioEmergencias(): Promise<ContactoEmergencia[]> {
    return leerDirectorioDeSqlite();
  }
}
