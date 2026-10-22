declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
}

export function trackWhatsAppClick(params: {
  pack: string;
  valor: number;
  ciudad?: string;
  origen: string;
}): void {
  if (typeof window === 'undefined') return;

  // Google Tag Manager dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'whatsapp_click',
    pack_name: params.pack,
    value: params.valor,
    currency: 'COP',
    city: params.ciudad || 'no_especificada',
    button_origin: params.origen,
  });

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Contact', {
      content_name: params.pack,
      value: params.valor,
      currency: 'COP',
      content_category: 'halloween_mask',
    });
  }
}

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
