import { z } from 'zod';

export const clienteFormSchema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(3, 'Escribe tu nombre y apellido')
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length >= 2,
      'Escribe tu nombre y apellido completo (mínimo 2 palabras)'
    ),
  celular: z
    .string()
    .trim()
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length === 10 && digits.startsWith('3');
    }, 'Escribe tu celular de 10 dígitos, empieza por 3'),
  departamento: z
    .string()
    .trim()
    .min(1, 'Selecciona un departamento'),
  ciudad: z
    .string()
    .trim()
    .min(1, 'Selecciona tu ciudad o municipio'),
  codigoDane: z
    .string()
    .trim()
    .default('00000'),
  direccion: z
    .string()
    .trim()
    .min(3, 'Escribe tu dirección o punto de recogida'),
  indicaciones: z
    .string()
    .max(300, 'Máximo 300 caracteres')
    .optional()
    .default(''),
  consentimiento: z
    .boolean()
    .refine((val) => val === true, 'Debes autorizar el tratamiento de datos para gestionar tu pedido'),
});

export const pedidoPayloadSchema = z.object({
  pedidoId: z.string().regex(/^PED-\d{8}-[A-Za-z0-9]{4}$/),
  fecha: z.string(),
  tienda: z.string(),
  landing: z.object({
    url: z.string(),
    plantilla: z.string(),
  }),
  producto: z.object({
    nombre: z.string(),
    sku: z.string(),
    variante: z.string(),
    paquete: z.string(),
    cantidad: z.number().int().positive(),
    extras: z.array(z.string()).default([]),
    precioUnitario: z.number().positive(),
    total: z.number().positive(),
  }),
  cliente: z.object({
    nombreCompleto: z.string().min(2),
    celular: z.string(),
    departamento: z.string().min(1),
    ciudad: z.string().min(1),
    codigoDane: z.string().default('00000'),
    direccion: z.string().min(3),
    indicaciones: z.string().optional().default(''),
  }),
  consentimiento: z.literal(true),
  origen: z.object({
    utm_source: z.string().optional().default(''),
    utm_medium: z.string().optional().default(''),
    utm_campaign: z.string().optional().default(''),
    utm_content: z.string().optional().default(''),
    fbclid: z.string().optional().default(''),
    referrer: z.string().optional().default(''),
  }),
  antispam: z.object({
    empresa: z.string().default(''),
    segundos: z.number().default(0),
  }),
  turnstileToken: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteFormSchema>;
export type PedidoPayload = z.infer<typeof pedidoPayloadSchema>;

export interface PedidoResponse {
  ok: boolean;
  pedidoId?: string;
  error?: string;
}

/**
 * Formatea el número celular mientras se escribe: 300 000 0000
 */
export function formatCelularInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/**
 * Retorna solo los 10 dígitos limpios
 */
export function cleanCelularDigits(formatted: string): string {
  return formatted.replace(/\D/g, '').slice(0, 10);
}

/**
 * Convierte a formato internacional colombiano (+57XXXXXXXXXX)
 */
export function toInternationalPhone(celular: string): string {
  const digits = cleanCelularDigits(celular);
  return `+57${digits}`;
}

/**
 * Genera pedidoId en hora de Bogotá con formato PED-AAAAMMDD-XXXX
 * (4 caracteres alfanuméricos en mayúsculas sin ambiguos como 0, O, 1, I)
 */
export function generatePedidoId(fechaBase?: Date): string {
  const now = fechaBase || new Date();
  const bogotaStr = now.toLocaleString('en-US', { timeZone: 'America/Bogota' });
  const bogotaDate = new Date(bogotaStr);

  const yyyy = bogotaDate.getFullYear();
  const mm = String(bogotaDate.getMonth() + 1).padStart(2, '0');
  const dd = String(bogotaDate.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;

  // Conjunto alfanumérico sin caracteres ambiguos (sin 0, O, 1, I, L)
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    randomPart += chars[idx];
  }

  return `PED-${datePart}-${randomPart}`;
}

/**
 * Formateador de moneda colombiana COP
 */
export const formatCOP = (valor: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
};
