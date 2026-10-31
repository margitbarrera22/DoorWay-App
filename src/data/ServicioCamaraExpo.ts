// src/data/ServicioCamaraExpo.ts — Autor: Said Alexander Pacheco Moncada (TEC-04 #16)
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { IServicioCamara } from './contratos';
import { ResultadoFoto } from '../domain/modelos';

export class ServicioCamaraExpo implements IServicioCamara {
  private async comprimirImagen(uriOriginal: string): Promise<ResultadoFoto> {
    const manipulada = await ImageManipulator.manipulateAsync(
      uriOriginal,
      [{ resize: { width: 1024 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );
    return {
      uriLocal: manipulada.uri,
      ancho: manipulada.width,
      alto: manipulada.height,
      pesoAproxKb: 180,
    };
  }

  async tomarFotoComprimida(): Promise<ResultadoFoto | null> {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      return this.elegirDeGaleriaComprimida();
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (res.canceled || !res.assets?.[0]?.uri) return null;
    return this.comprimirImagen(res.assets[0].uri);
  }

  async elegirDeGaleriaComprimida(): Promise<ResultadoFoto | null> {
    const permisoGaleria = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permisoGaleria.granted) {
      throw new Error('Necesitamos permiso para acceder a tus fotos y adjuntar el comprobante.');
    }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (res.canceled || !res.assets?.[0]?.uri) return null;
    return this.comprimirImagen(res.assets[0].uri);
  }
}