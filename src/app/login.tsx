// src/app/login.tsx — Autor: Said Alexander Pacheco Moncada (HU-01 #1 y Elemento Transversal #2)
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
    Image,
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
        accesoRapidoResidente,
        accesoRapidoAdmin,
    } = useLoginFormulario();

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Image
                        source={require('../../assets/icon.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.logoTitle}>DoorWay-App</Text>
                    <Text style={styles.subTitle}>Gestión Residencial y Financiera · UNIPAZ</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Correo o Apartamento</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. martha@doorway.com o admin@doorway.com"
                        placeholderTextColor="#A0AEC0"
                        value={apartamento}
                        onChangeText={setApartamento}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>PIN de Acceso</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••"
                        placeholderTextColor="#A0AEC0"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        keyboardType="numeric"
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

                    {/* Botones de Acceso Rápido Demo (Residente vs Administrador) */}
                    <View style={styles.demoDivider}>
                        <Text style={styles.demoLabel}>ACCESO RÁPIDO DEMO POR ROL</Text>
                    </View>

                    <View style={styles.demoButtonsRow}>
                        <TouchableOpacity
                            style={styles.demoBtnResidente}
                            onPress={accesoRapidoResidente}
                            disabled={cargando}
                            accessibilityRole="button"
                            accessibilityLabel="Ingresar como Residente Doña Martha"
                        >
                            <Text style={styles.demoBtnTitle}>👤 Doña Martha</Text>
                            <Text style={styles.demoBtnSub}>Residente · Apto 302</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.demoBtnAdmin}
                            onPress={accesoRapidoAdmin}
                            disabled={cargando}
                            accessibilityRole="button"
                            accessibilityLabel="Ingresar como Administrador Carlos Mendoza"
                        >
                            <Text style={styles.demoBtnTitle}>🛡️ Administrador</Text>
                            <Text style={styles.demoBtnSub}>Carlos Mendoza</Text>
                        </TouchableOpacity>
                    </View>
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
        marginBottom: 24,
    },
    logoImage: {
        width: 88,
        height: 88,
        borderRadius: 20,
        marginBottom: 10,
    },
    logoTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    subTitle: {
        fontSize: 13,
        color: '#CBD5E0',
        marginTop: 4,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 22,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 6,
        marginTop: 10,
    },
    input: {
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
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
        backgroundColor: '#0D9488',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
        minHeight: 50,
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    demoDivider: {
        marginTop: 20,
        marginBottom: 10,
        alignItems: 'center',
    },
    demoLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 0.7,
    },
    demoButtonsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    demoBtnResidente: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        minHeight: 52,
        justifyContent: 'center',
    },
    demoBtnAdmin: {
        flex: 1,
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        minHeight: 52,
        justifyContent: 'center',
    },
    demoBtnTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#0F2540',
    },
    demoBtnSub: {
        fontSize: 11,
        color: '#475569',
        marginTop: 2,
    },
});
