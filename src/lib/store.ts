import { signal, computed } from '@preact/signals';

export interface UnidadItem {
  modelo: string; // 'Clásica blanca' | 'Con sangre'
  talla: string;  // 'Adulto' | 'Niño'
}

export interface PackItemDef {
  id: string;
  nombre: string;
  unidades: number;
  precio: number;
  precioAntes: number;
  precioPorMascara: number;
  ahorro: number;
  etiqueta?: string;
  incluyeExtras?: boolean;
  descripcionExtras?: string;
  badge?: string;
}

export const PACKS_DATA: PackItemDef[] = [
  {
    id: 'individual',
    nombre: 'Individual',
    unidades: 1,
    precio: 29900,
    precioAntes: 49900,
    precioPorMascara: 29900,
    ahorro: 20000,
    etiqueta: 'Básico',
  },
  {
    id: 'pareja',
    nombre: 'Pareja',
    unidades: 2,
    precio: 49900,
    precioAntes: 99800,
    precioPorMascara: 24950,
    ahorro: 49900,
    etiqueta: 'MÁS VENDIDO',
    badge: 'MÁS VENDIDO',
  },
  {
    id: 'grupo',
    nombre: 'Grupo',
    unidades: 4,
    precio: 89900,
    precioAntes: 199600,
    precioPorMascara: 22475,
    ahorro: 109700,
    etiqueta: 'PARA LA FIESTA',
    badge: 'PARA LA FIESTA',
  },
  {
    id: 'kit',
    nombre: 'Kit Disfraz Completo',
    unidades: 1,
    precio: 69900,
    precioAntes: 119900,
    precioPorMascara: 69900,
    ahorro: 50000,
    etiqueta: 'KIT COMPLETO',
    incluyeExtras: true,
    descripcionExtras: 'Máscara + Túnica negra larga + Guantes negros',
    badge: 'LISTO PARA SALIR',
  },
];

// Señal: pack seleccionado (por defecto 'pareja' - el MÁS VENDIDO)
export const selectedPackId = signal<string>('pareja');

// Señal: ciudad seleccionada desde el ArrivalChecker o vacío
export const selectedCity = signal<string>('Bogotá D.C.');

// Señal: variantes por cada unidad del pack activo
export const unitVariants = signal<UnidadItem[]>([
  { modelo: 'Clásica blanca', talla: 'Adulto' },
  { modelo: 'Con sangre', talla: 'Adulto' },
]);

// Computed: pack actual
export const currentPack = computed(() => {
  return PACKS_DATA.find((p) => p.id === selectedPackId.value) || PACKS_DATA[1];
});

// Cambiar de pack
export function selectPack(packId: string) {
  selectedPackId.value = packId;
  const pack = PACKS_DATA.find((p) => p.id === packId);
  const count = pack ? pack.unidades : 1;

  // Ajustar la cantidad de unidades en unitVariants manteniendo selecciones previas si es posible
  const current = [...unitVariants.value];
  if (current.length < count) {
    while (current.length < count) {
      current.push({
        modelo: current.length % 2 === 0 ? 'Clásica blanca' : 'Con sangre',
        talla: 'Adulto',
      });
    }
  } else if (current.length > count) {
    current.splice(count);
  }
  unitVariants.value = current;
}

// Actualizar variante de una unidad específica
export function updateUnitVariant(index: number, modelo: string, talla: string) {
  const next = [...unitVariants.value];
  if (next[index]) {
    next[index] = { modelo, talla };
    unitVariants.value = next;
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
    window.location.href = '/#pedido';
  }
}
