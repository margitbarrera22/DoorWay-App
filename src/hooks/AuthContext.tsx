// src/hooks/AuthContext.tsx — Contexto de autenticación y roles de usuario (HU-01)
import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'expo-router';

export interface Usuario {
    apartamento: string;
    nombre: string;
    rol: 'residente' | 'administrador';
}

export interface AuthContextType {
    usuario: Usuario | null;
    estaAutenticado: boolean;
    iniciarSesion: (apartamento: string, contrasena: string) => Promise<void>;
    cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const router = useRouter();

    const iniciarSesion = async (apartamento: string, contrasena: string): Promise<void> => {
        const aptoNormalizado = apartamento.trim();
        const clave = contrasena.trim();

        if (!aptoNormalizado || !clave) {
            throw new Error('Por favor ingresa tu apartamento y contraseña.');
        }

        // Simulación / Validación de autenticación
        if (aptoNormalizado.toLowerCase() === 'admin' && clave === 'admin123') {
            setUsuario({
                apartamento: 'Administración',
                nombre: 'Administrador(a) del Conjunto',
                rol: 'administrador',
            });
        } else {
            // Usuario residente por defecto
            setUsuario({
                apartamento: aptoNormalizado,
                nombre: 'Doña Martha Gómez',
                rol: 'residente',
            });
        }

        router.replace('/');
    };

    const cerrarSesion = () => {
        setUsuario(null);
        router.replace('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                estaAutenticado: usuario !== null,
                iniciarSesion,
                cerrarSesion,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
    }
    return context;
}

