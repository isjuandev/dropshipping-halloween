declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
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
          item_name: `Máscara Fantasma del Grito - Pack ${params.pack}`,
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
        item_name: `Máscara Fantasma del Grito - Pack ${params.pack}`,
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
