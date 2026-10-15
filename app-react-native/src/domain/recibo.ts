// src/domain/recibo.ts

export type EstadoConciliacion = 'Pagado' | 'En validación' | 'En mora';

export interface ReciboPago {
  id: string;
  periodo: string;
  apartamento: string;
  monto: string;
  fechaLimite: string;
  estado: EstadoConciliacion;
  referencia: string;
}
