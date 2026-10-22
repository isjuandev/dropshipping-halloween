import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const producto = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/producto' }),
  schema: z.object({
    nombre: z.string(),
    precio: z.number(),
    precioAnterior: z.number(),
    precioLiquidacion: z.number(),
    variantes: z.object({
      modelos: z.array(z.string()),
      tallas: z.array(z.string()),
    }),
    imagenes: z.array(z.string()),
    video: z.object({
      url: z.string(),
      poster: z.string(),
    }),
    medidas: z.object({
      alto: z.string(),
      ancho: z.string(),
      profundidad: z.string(),
      capucha: z.string(),
    }),
    material: z.object({
      mascara: z.string(),
      capucha: z.string(),
      peso: z.string(),
      cuidado: z.string(),
    }),
    incluye: z.array(z.string()),
    packs: z.array(
      z.object({
        id: z.string(),
        nombre: z.string(),
        unidades: z.number(),
        precio: z.number(),
        etiqueta: z.string().optional(),
        incluyeExtras: z.boolean().optional(),
      })
    ),
    rating: z.number(),
    numResenas: z.number(),
    stock: z.number(),
  }),
});

const testimonios = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonios' }),
  schema: z.object({
    nombre: z.string(),
    ciudad: z.string(),
    foto: z.string(),
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

const ideasDisfraz = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/ideasDisfraz' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    foto: z.string(),
    packId: z.string(),
    etiqueta: z.string(),
  }),
});

export const collections = {
  producto,
  testimonios,
  faqs,
  ideasDisfraz,
};
