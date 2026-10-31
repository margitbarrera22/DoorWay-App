import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRecibos } from '../../hooks/RecibosContext';
import { COLORES } from '../../theme/tema';

const colorFondo: string = (COLORES as any)?.fondo || (COLORES as any)?.background || '#F5F5F5';
const colorTexto: string = (COLORES as any)?.texto || (COLORES as any)?.text || '#111111';
const colorPrimario: string = (COLORES as any)?.primario || (COLORES as any)?.primary || '#007AFF';

export default function SubirReciboScreen() {
    const router = useRouter();
    const context = useRecibos() as any;

    const [monto, setMonto] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [comprobanteUrl, setComprobanteUrl] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleGuardar = async () => {
        if (!monto.trim() || !periodo.trim()) {
            Alert.alert('Campos incompletos', 'Por favor ingresa el monto y el período.');
            return;
        }

        const montoNum = parseFloat(monto);
        if (isNaN(montoNum) || montoNum <= 0) {
            Alert.alert('Monto inválido', 'Ingresa un valor numérico válido.');
            return;
        }

        try {
            setCargando(true);

            const nuevoRecibo = {
                id: Date.now().toString(),
                periodo: periodo.trim(),
                monto: montoNum,
                comprobanteUrl: comprobanteUrl.trim() || undefined,
                fecha: new Date().toISOString(),
                estado: 'PENDIENTE',
            };

            if (context && typeof context.agregarRecibo === 'function') {
                await context.agregarRecibo(nuevoRecibo);
            } else if (context && typeof context.subirRecibo === 'function') {
                await context.subirRecibo(nuevoRecibo);
            }

            Alert.alert('Éxito', 'El recibo ha sido guardado correctamente.', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar el recibo.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.titulo}>Subir Nuevo Recibo</Text>

            <View style={styles.grupo}>
                <Text style={styles.label}>Período / Mes *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej. Octubre 2026"
                    placeholderTextColor="#888888"
                    value={periodo}
                    onChangeText={setPeriodo}
                />
            </View>

            <View style={styles.grupo}>
                <Text style={styles.label}>Monto ($) *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#888888"
                    keyboardType="decimal-pad"
                    value={monto}
                    onChangeText={setMonto}
                />
            </View>

            <View style={styles.grupo}>
                <Text style={styles.label}>Comprobante (URL o Ruta)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej. https://... o ruta del archivo"
                    placeholderTextColor="#888888"
                    value={comprobanteUrl}
                    onChangeText={setComprobanteUrl}
                />
            </View>

            <TouchableOpacity
                style={[styles.botonSubmit, cargando && styles.botonDeshabilitado]}
                onPress={handleGuardar}
                disabled={cargando}
            >
                {cargando ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.textoBoton}>Guardar Recibo</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorFondo,
    },
    content: {
        padding: 20,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colorTexto,
        marginBottom: 24,
    },
    grupo: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444444',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#000000',
    },
    botonSubmit: {
        backgroundColor: colorPrimario,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    botonDeshabilitado: {
        opacity: 0.6,
    },
    textoBoton: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});