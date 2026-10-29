// src/data/ServicioCamaraExpo.ts — Autor: Said Alexander Pacheco Moncada (TEC-04 #16)[cite: 1]
import * as ImagePicker from 'expo-image-picker';[cite: 1]
import * as ImageManipulator from 'expo-image-manipulator';[cite: 1]
import { IServicioCamara } from './contratos';[cite: 1]
import { ResultadoFoto } from '../domain/modelos';[cite: 1]

export class ServicioCamaraExpo implements IServicioCamara {
    [cite: 1]
    private async comprimirImagen(uriOriginal: string): Promise<ResultadoFoto> {
        [cite: 1]
        const manipulada = await ImageManipulator.manipulateAsync([cite: 1]
      uriOriginal, [cite: 1]
        [{ resize: { width: 1024 } }], [cite: 1]
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }[cite: 1]
        );[cite: 1]
        return {
            [cite: 1]
            uriLocal: manipulada.uri, [cite: 1]
            ancho: manipulada.width, [cite: 1]
            alto: manipulada.height, [cite: 1]
            pesoAproxKb: 180, [cite: 1]
        };[cite: 1]
    } [cite: 1]

    async tomarFotoComprimida(): Promise<ResultadoFoto | null> {
        [cite: 1]
        const permiso = await ImagePicker.requestCameraPermissionsAsync();[cite: 1]
        if (!permiso.granted) {
            [cite: 1]
            return this.elegirDeGaleriaComprimida();[cite: 1]
        } [cite: 1]
        const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });[cite: 1]
        if (res.canceled || !res.assets?.[0]?.uri) return null;[cite: 1]
        return this.comprimirImagen(res.assets[0].uri);[cite: 1]
    } [cite: 1]

    async elegirDeGaleriaComprimida(): Promise<ResultadoFoto | null> {
        [cite: 1]
        const permisoGaleria = await ImagePicker.requestMediaLibraryPermissionsAsync();[cite: 1]
        if (!permisoGaleria.granted) {
            [cite: 1]
            throw new Error('Necesitamos permiso para acceder a tus fotos y adjuntar el comprobante.');[cite: 1]
        } [cite: 1]
        const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });[cite: 1]
        if (res.canceled || !res.assets?.[0]?.uri) return null;[cite: 1]
        return this.comprimirImagen(res.assets[0].uri);[cite: 1]
    } [cite: 1]
} [cite: 1]