// src/hooks/useLoginFormulario.ts — Autor: Said Alexander Pacheco Moncada (HU-01 #1)
import { useState } from 'react';
import { useAuth } from './AuthContext';

export function useLoginFormulario() {
    const [apartamento, setApartamento] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
    const { iniciarSesion } = useAuth();

    const manejarSubmit = async () => {
        if (!apartamento.trim() || !password.trim()) {
            setErrorMensaje('Por favor ingresa tu apartamento y contraseña.');
            return;
        }

        try {
            setCargando(true);
            setErrorMensaje(null);
            await iniciarSesion(apartamento.trim(), password.trim());
        } catch (err: any) {
            setErrorMensaje(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setCargando(false);
        }
    };

    return {
        apartamento,
        setApartamento,
        password,
        setPassword,
        cargando,
        errorMensaje,
        manejarSubmit,
    };
}