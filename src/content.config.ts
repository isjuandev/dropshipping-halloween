import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const producto = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/producto' }),
  schema: z.object({
    nombre: z.string(),
    sku: z.string(),
    descripcion: z.string(),
    precio: z.number(),
    precioAnterior: z.number(),
    especificaciones: z.object({
      diametro: z.string(),
      leds: z.number(),
      alimentacion: z.string(),
      control: z.array(z.string()),
    }),
    incluye: z.array(z.string()),
    rating: z.number(),
    numResenas: z.number(),
  }),
});

const testimonios = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonios' }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      ciudad: z.string(),
      // Foto UGC opcional (4:5) desde src/assets/images/resenas
      foto: image().optional(),
      texto: z.string(),
      estrellas: z.number(),
      packComprado: z.string(),
      fecha: z.string(),
    }),
});

const faqs = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faqs' }),
  schema: z.object({
    pregunta: z.string(),
    respuesta: z.string(),
    orden: z.number(),
  }),
});

export const collections = {
  producto,
  testimonios,
  faqs,
};
