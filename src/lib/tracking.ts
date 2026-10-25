declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
}

const readCookie = (name: string): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
};

/**
 * Cookies de Meta (`_fbp`, `_fbc`) para que NexoBite pueda casar el pedido con el clic del anuncio.
 * Si `_fbc` todavía no existe (primer clic), se arma con el `fbclid` que llega en la URL.
 */
export function getMetaCookies(fbclid?: string): { fbp?: string; fbc?: string } {
  const fbp = readCookie('_fbp');
  const fbcCookie = readCookie('_fbc');
  const fbc = fbcCookie || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : '');

  return {
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
}

/**
 * Registra evento de inicio de checkout al enfocar por primera vez el formulario de pedido
 */
export function trackBeginCheckout(params: {
  pack: string;
  valor: number;
}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'COP',
      value: params.valor,
      items: [
        {
          item_name: `Malla LED RGB 135 cm - ${params.pack}`,
          price: params.valor,
          quantity: 1,
        },
      ],
    },
  });

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      content_name: params.pack,
      value: params.valor,
      currency: 'COP',
      num_items: 1,
    });
  }
}

/**
 * Registra lead/conversión en /gracias con deduplicación por pedidoId
 */
export function trackGenerateLead(params: {
  pedidoId: string;
  valor: number;
  pack: string;
}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'generate_lead',
    pedidoId: params.pedidoId,
    value: params.valor,
    currency: 'COP',
    items: [
      {
        item_name: `Malla LED RGB 135 cm - ${params.pack}`,
        price: params.valor,
        quantity: 1,
      },
    ],
  });

  if (typeof window.fbq === 'function') {
    window.fbq(
      'track',
      'Lead',
      {
        content_name: params.pack,
        value: params.valor,
        currency: 'COP',
      },
      { eventID: params.pedidoId }
    );
  }
}

/**
 * Registra verificación de llegada por ciudad
 */
export function trackArrivalCheck(params: {
  ciudad: string;
  aTiempo: boolean;
}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'arrival_check',
    checked_city: params.ciudad,
    arrives_on_time: params.aTiempo,
  });
}
