// src/data/repositorioSimulado.ts
import { ReciboPago } from '../domain/recibo';

export type Escenario = 'conDatos' | 'vacio' | 'falla' | 'cargando';

const EJEMPLOS_DOORWAY: ReciboPago[] = [
  {
    id: 'REC-101',
    periodo: 'Octubre 2026 · Cuota Administración',
    apartamento: 'Torre B - Apto 302',
    monto: '.000 COP',
    fechaLimite: '10/10/2026',
    estado: 'En validación',
    referencia: 'Corresponsal Bancolombia #88412',
  },
  {
    id: 'REC-102',
    periodo: 'Septiembre 2026 · Cuota Administración',
    apartamento: 'Torre B - Apto 302',
    monto: '.000 COP',
    fechaLimite: '10/09/2026',
    estado: 'Pagado',
    referencia: 'Transferencia Nequi #77104',
  },
  {
    id: 'REC-103',
    periodo: 'Agosto 2026 · Cuota Extraordinaria Fachada',
    apartamento: 'Torre B - Apto 302',
    monto: '.000 COP',
    fechaLimite: '15/08/2026',
    estado: 'En mora',
    referencia: 'Sin soporte registrado aún',
  },
  {
    id: 'REC-104',
    periodo: 'Julio 2026 · Reserva Salón Social',
    apartamento: 'Torre B - Apto 302',
    monto: '.000 COP',
    fechaLimite: '20/07/2026',
    estado: 'Pagado',
    referencia: 'Recibo de Caja #44210',
  },
  {
    id: 'REC-105',
    periodo: 'Junio 2026 · Cuota Administración',
    apartamento: 'Torre B - Apto 302',
    monto: '.000 COP',
    fechaLimite: '10/06/2026',
    estado: 'Pagado',
    referencia: 'Corresponsal Bancolombia #31900',
  },
];

class RepositorioSimulado {
  public escenario: Escenario = 'conDatos';

  public async obtenerTodos(): Promise<ReciboPago[]> {
    if (this.escenario === 'cargando') {
      return new Promise<ReciboPago[]>(() => {});
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 1500));

    if (this.escenario === 'falla') {
      throw new Error('Falla simulada al conectar con el servidor de cartera');
    }

    if (this.escenario === 'vacio') {
      return [];
    }

    return EJEMPLOS_DOORWAY;
  }
}

export const repositorioSimulado = new RepositorioSimulado();
