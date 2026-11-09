// src/app/login.tsx — Autor: Said Alexander Pacheco Moncada (HU-01 #1)
import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useLoginFormulario } from '../hooks/useLoginFormulario';

export default function LoginScreen() {
    const {
        apartamento,
        setApartamento,
        password,
        setPassword,
        cargando,
        errorMensaje,
        manejarSubmit,
    } = useLoginFormulario();

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Text style={styles.logoTitle}>DoorWay App</Text>
                    <Text style={styles.subTitle}>Gestión Residencial Inteligente</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Apartamento / Torre</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. 101A o 204B"
                        placeholderTextColor="#A0AEC0"
                        value={apartamento}
                        onChangeText={setApartamento}
                        autoCapitalize="characters"
                    />

                    <Text style={styles.label}>Contraseña</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#A0AEC0"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    {errorMensaje && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{errorMensaje}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.button, cargando && styles.buttonDisabled]}
                        onPress={manejarSubmit}
                        disabled={cargando}
                        accessibilityRole="button"
                        accessibilityLabel="Iniciar sesión en DoorWay App"
                    >
                        {cargando ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Iniciar Sesión</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F2540',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 36,
    },
    logoTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    subTitle: {
        fontSize: 14,
        color: '#CBD5E0',
        marginTop: 6,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1A202C',
    },
    errorBox: {
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#FEB2B2',
        borderRadius: 8,
        padding: 10,
        marginTop: 14,
    },
    errorText: {
        color: '#C53030',
        fontSize: 13,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#0F2540',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});