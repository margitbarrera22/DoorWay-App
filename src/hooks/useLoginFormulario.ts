// src/hooks/useLoginFormulario.ts — Autor: Said Alexander Pacheco Moncada (HU-01 #1 / Login Híbrido)
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from './AuthContext';

export function useLoginFormulario() {
  const [apartamento, setApartamento] = useState('martha@doorway.com');
  const [password, setPassword] = useState('3020');
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const { iniciarSesion } = useAuth();
  const router = useRouter();

  const manejarSubmit = async () => {
    const entrada = apartamento.trim();
    const clave = password.trim();

    if (!entrada || !clave) {
      setErrorMensaje('Por favor ingresa tu correo (o unidad) y tu PIN de acceso.');
      return;
    }

    // Soporta tanto el correo directo como atajos de unidad ("302" -> martha@doorway.com, "admin" -> admin@doorway.com)
    let correoNormalizado = entrada;
    if (!entrada.includes('@')) {
      if (entrada.toLowerCase().includes('admin')) {
        correoNormalizado = 'admin@doorway.com';
      } else {
        correoNormalizado = 'martha@doorway.com';
      }
    }

    try {
      setCargando(true);
      setErrorMensaje(null);
      const exito = await iniciarSesion(correoNormalizado, clave);
      if (exito) {
        router.replace('/');
      } else {
        setErrorMensaje('Credenciales inválidas. Verifica tu correo y PIN (Ej: martha@doorway.com / 3020).');
      }
    } catch (err: any) {
      setErrorMensaje(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setCargando(false);
    }
  };

  const accesoRapidoResidente = async () => {
    setApartamento('martha@doorway.com');
    setPassword('3020');
    setCargando(true);
    setErrorMensaje(null);
    try {
      const exito = await iniciarSesion('martha@doorway.com', '3020');
      if (exito) router.replace('/');
    } finally {
      setCargando(false);
    }
  };

  const accesoRapidoAdmin = async () => {
    setApartamento('admin@doorway.com');
    setPassword('1234');
    setCargando(true);
    setErrorMensaje(null);
    try {
      const exito = await iniciarSesion('admin@doorway.com', '1234');
      if (exito) router.replace('/');
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
    accesoRapidoResidente,
    accesoRapidoAdmin,
  };
}
