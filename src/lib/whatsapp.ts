import { tiendaConfig } from '../config/tienda';

export interface UnidadItem {
  modelo: string; // 'Clásica blanca' | 'Con sangre'
  talla: string;  // 'Adulto' | 'Niño'
}

export interface WhatsAppUrlParams {
  producto?: string;
  packNombre?: string;
  precioTotal?: number;
  unidades?: UnidadItem[];
  ciudad?: string;
  tipo?: 'pedido' | 'express';
  origen?: string;
  utm?: string;
}

export const formatCOP = (valor: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
};

export function buildWhatsAppMessage(params: WhatsAppUrlParams): string {
  const {
    producto = 'Máscara Fantasma del Grito',
    packNombre = 'Individual',
    precioTotal = 29900,
    unidades = [{ modelo: 'Clásica blanca', talla: 'Adulto' }],
    ciudad = '',
    tipo = 'pedido',
    origen = 'landing',
    utm = '',
  } = params;

  if (tipo === 'express') {
    const ciudadTexto = ciudad ? `estoy en ${ciudad}` : 'estoy en mi ciudad';
    let msg = `Hola ${tiendaConfig.nombreTienda}, ${ciudadTexto} y necesito la máscara antes del 31. ¿Hay envío express?`;
    if (utm) {
      msg += ` Ref: ${utm}`;
    }
    return msg;
  }

  // Formato de unidades numeradas
  const unidadesTexto = unidades
    .map((u, i) => `${i + 1}) ${u.modelo} - ${u.talla}`)
    .join(' ');

  const totalFormateado = formatCOP(precioTotal);
  const ciudadTexto = ciudad ? ciudad : 'Por coordinar';

  let mensaje = `Hola ${tiendaConfig.nombreTienda}, quiero pedir: ${producto} | Pack: ${packNombre} | ${unidadesTexto} | Total: ${totalFormateado}. Pago contra entrega. Mi ciudad es: ${ciudadTexto}. La necesito antes del 31 de octubre.`;

  const refParts: string[] = [];
  if (origen) refParts.push(`origen=${origen}`);
  if (utm) refParts.push(`ref=${utm}`);

  if (refParts.length > 0) {
    mensaje += ` [${refParts.join(' & ')}]`;
  }

  return mensaje;
}

export function buildWhatsAppUrl(params: WhatsAppUrlParams, telefono = tiendaConfig.whatsapp): string {
  const mensaje = buildWhatsAppMessage(params);
  const cleanPhone = telefono.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`;
}
