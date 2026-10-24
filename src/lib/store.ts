import { signal, computed } from '@preact/signals';

// Identidad del producto que viaja en el payload del pedido (n8n / Dropi)
export const PRODUCTO = {
  nombre: 'Malla LED RGB Inteligente 135 cm',
  nombreCorto: 'Malla LED RGB 135 cm',
  sku: 'MALLA-LED-RGB-135',
  variante: 'Multicolor RGB · 135 cm · 120 LEDs',
};

export interface PackItemDef {
  id: string;
  nombre: string;
  subtitulo: string;
  unidades: number;
  precio: number;
  precioAntes: number;
  precioPorUnidad: number;
  ahorro: number;
  incluye: string;
  badge?: string;
}

export const PACKS_DATA: PackItemDef[] = [
  {
    id: 'pack-1',
    nombre: 'Pack 1 Malla',
    subtitulo: 'Ventana o Sala',
    unidades: 1,
    precio: 89900,
    precioAntes: 149900,
    precioPorUnidad: 89900,
    ahorro: 60000,
    incluye: '1x Malla LED RGB 135 cm + Control Remoto + App',
  },
  {
    id: 'pack-2',
    nombre: 'Pack 2 Mallas',
    subtitulo: 'Decoración Doble',
    unidades: 2,
    precio: 159900,
    precioAntes: 299800,
    precioPorUnidad: 79950,
    ahorro: 139900,
    incluye: '2x Mallas LED RGB 135 cm + 2x Controles Remotos · Ideal para Ventana + Puerta/Sala, sincronizables desde la misma App',
    badge: 'MÁS VENDIDO — DECORACIÓN DOBLE',
  },
  {
    id: 'pack-3',
    nombre: 'Pack 3 Mallas',
    subtitulo: 'Fachada & Casa Completa',
    unidades: 3,
    precio: 219900,
    precioAntes: 449700,
    precioPorUnidad: 73300,
    ahorro: 229800,
    incluye: '3x Mallas LED RGB 135 cm + 3x Controles Remotos con máximo ahorro por unidad',
    badge: 'MÁXIMO AHORRO',
  },
];

// Señal: pack seleccionado (por defecto 'pack-1'; el cliente decide si sube la cantidad)
export const selectedPackId = signal<string>('pack-1');

// Señal: ciudad seleccionada desde el ArrivalChecker o vacío
export const selectedCity = signal<string>('Bogotá D.C.');

// Computed: pack actual
export const currentPack = computed(() => {
  return PACKS_DATA.find((p) => p.id === selectedPackId.value) || PACKS_DATA[0];
});

// Cambiar de pack
export function selectPack(packId: string) {
  if (PACKS_DATA.some((p) => p.id === packId)) {
    selectedPackId.value = packId;
  }
}

/**
 * Desplaza suavemente hacia la sección de pedido y enfoca el primer campo vacío
 */
export function scrollToOrderForm(packId?: string) {
  if (packId) {
    selectPack(packId);
  }

  const section = document.getElementById('pedido');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Foco en el primer campo vacío después del scroll suave
    setTimeout(() => {
      const inputs = section.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        'input:not([type="hidden"]):not([tabindex="-1"]), select, textarea'
      );
      for (const input of Array.from(inputs)) {
        if (!input.value.trim() && !input.disabled) {
          input.focus();
          break;
        }
      }
    }, 450);
  } else {
    // Si no estamos en la landing (por ejemplo en /gracias), redirigir a la landing al formulario
    window.location.href = '/malla-led-rgb-135cm#pedido';
  }
}
