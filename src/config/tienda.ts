export interface CiudadEnvio {
  nombre: string;
  diasEnvio: number;
  express: boolean;
}

export interface TiendaConfig {
  nombreTienda: string;
  horarioAtencion: string;
  moneda: 'COP';
  fechaHalloween: string; // ISO 8601 YYYY-MM-DD
  fechaLimitePedido: string; // ISO 8601 YYYY-MM-DDTHH:mm:ss
  ciudades: CiudadEnvio[];
  diasEnvioOtras: number;
  festivos: string[]; // YYYY-MM-DD
  envioExpress: {
    activo: boolean;
    recargo: number;
    dias: number;
  };
  temporada: 'auto' | 'preventa' | 'ultimos-dias' | 'liquidacion';
  stock: {
    activo: boolean;
    unidades: number;
    totalInicial: number;
  };
  metodosPago: string[];
  redes: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
  pedido: {
    modo: 'directo';
    endpoint: string;
    productId: string;
    storeSlug: string;
    horarioConfirmacion: string;
    tiempoConfirmacion: string;
  };
  turnstileSiteKey?: string;
  gtmId?: string;
  pixelId?: string;
  razonSocial: string;
  nit: string;
}

export const tiendaConfig: TiendaConfig = {
  nombreTienda: 'TerrorExpress Colombia',
  horarioAtencion: 'Lunes a Domingo · 8:00 AM a 10:00 PM',
  moneda: 'COP',
  fechaHalloween: '2026-10-31',
  fechaLimitePedido: '2026-10-27T23:59:59',
  ciudades: [
    { nombre: 'Bogotá D.C.', diasEnvio: 1, express: true },
    { nombre: 'Medellín', diasEnvio: 1, express: true },
    { nombre: 'Cali', diasEnvio: 2, express: true },
    { nombre: 'Barranquilla', diasEnvio: 2, express: true },
    { nombre: 'Bucaramanga', diasEnvio: 2, express: true },
    { nombre: 'Cartagena', diasEnvio: 2, express: true },
    { nombre: 'Pereira / Eje Cafetero', diasEnvio: 2, express: true },
    { nombre: 'Cúcuta', diasEnvio: 3, express: false },
    { nombre: 'Ibagué', diasEnvio: 2, express: true },
    { nombre: 'Santa Marta', diasEnvio: 3, express: false },
    { nombre: 'Pasto', diasEnvio: 3, express: false },
    { nombre: 'Villavicencio', diasEnvio: 2, express: true },
  ],
  diasEnvioOtras: 4,
  festivos: [
    '2026-10-12', // Día de la Raza
    '2026-11-02', // Todos los Santos
    '2026-11-16', // Independencia de Cartagena
  ],
  envioExpress: {
    activo: true,
    recargo: 15000,
    dias: 1,
  },
  temporada: 'auto',
  stock: {
    activo: true,
    unidades: 38,
    totalInicial: 250,
  },
  metodosPago: [
    'Pago Contra Entrega en efectivo al recibir',
    'Transferencia Bancolombia / Nequi / Daviplata al recibir',
  ],
  redes: {
    instagram: 'https://instagram.com/terrorexpress.co',
    tiktok: 'https://tiktok.com/@terrorexpress.co',
  },
  pedido: {
    modo: 'directo',
    endpoint:
      process.env.PUBLIC_NEXOBITE_API_URL ||
      'https://api.nexobite.com/api/v1/public/dropshipping/viralyshop/leads',
    productId: process.env.PUBLIC_NEXOBITE_PRODUCT_ID || '2289560',
    storeSlug: process.env.PUBLIC_NEXOBITE_STORE_SLUG || '',
    horarioConfirmacion: 'lunes a sábado, 8 a. m. a 6 p. m.',
    tiempoConfirmacion: 'en menos de 2 horas hábiles',
  },
  turnstileSiteKey: process.env.PUBLIC_TURNSTILE_SITE_KEY || '',
  gtmId: process.env.PUBLIC_GTM_ID || '',
  pixelId: process.env.PUBLIC_PIXEL_ID || '',
  razonSocial: 'NEXOBITE E-COMMERCE S.A.S.',
  nit: '901.789.432-1',
};

/**
 * Calcula la temporada activa según la fecha en zona America/Bogota
 */
export function getTemporadaActiva(config: TiendaConfig = tiendaConfig, fechaReferencia?: Date): 'preventa' | 'ultimos-dias' | 'liquidacion' {
  if (config.temporada !== 'auto') {
    return config.temporada;
  }

  // Obtener fecha actual en zona America/Bogota
  const now = fechaReferencia || new Date();
  const bogotaDateStr = now.toLocaleString('en-US', { timeZone: 'America/Bogota' });
  const bogotaDate = new Date(bogotaDateStr);

  const limite = new Date(config.fechaLimitePedido);
  const halloween = new Date(config.fechaHalloween + 'T23:59:59');

  if (bogotaDate > halloween) {
    return 'liquidacion';
  } else if (bogotaDate > limite) {
    return 'ultimos-dias';
  } else {
    return 'preventa';
  }
}
