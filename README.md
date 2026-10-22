# 🎃 Landing Page CRO "Grito" — Halloween Dropshipping Colombia

Landing page de producto único de alta conversión (CRO) diseñada específicamente para campañas estacionales de Halloween en Colombia con cierre de ventas directo por WhatsApp y modalidad **Pago Contra Entrega**.

---

## 🚀 Inicio Rápido (Desarrollo y Build con pnpm)

El proyecto utiliza **Astro 7**, **Tailwind CSS v4**, **TypeScript estricto** e **Islas Preact**. El gestor de paquetes oficial y obligatorio es **pnpm**.

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servidor de desarrollo en http://localhost:4321
pnpm dev

# 3. Compilar para producción (Output estático ultraliviano en /dist)
pnpm build

# 4. Previsualizar el build de producción localmente
pnpm preview
```

---

## ⚙️ Configuración de la Tienda (`src/config/tienda.ts`)

Todos los parámetros clave del negocio se configuran en un único archivo centralizado: [`src/config/tienda.ts`](file:///Users/isjuandev/Documents/WS%20NEXOBITE/DropShipping/Halloween/src/config/tienda.ts).

### 1. Cambiar Número de WhatsApp y Nombre de Tienda
```typescript
export const tiendaConfig: TiendaConfig = {
  nombreTienda: 'Tu Nombre de Tienda',     // Aparece en títulos, header, microcopy y mensajes
  whatsapp: '573001234567',                // Código de país 57 + número de 10 dígitos sin espacios ni signos
  horarioAtencion: 'Lunes a Domingo · 8:00 AM a 10:00 PM',
  razonSocial: 'TU EMPRESA O NOMBRE S.A.S.',
  nit: '901.123.456-7',
  // ...
};
```

### 2. Fechas de Temporada y Límite de Envío
```typescript
  moneda: 'COP',
  fechaHalloween: '2026-10-31',            // Fecha del evento (YYYY-MM-DD)
  fechaLimitePedido: '2026-10-27T23:59:59',// Fecha límite para garantizar entrega antes de Halloween
```

### 3. Modos de Temporada (`temporada: 'auto' | 'preventa' | 'ultimos-dias' | 'liquidacion'`)
- `'auto'` (por defecto): La landing detecta automáticamente la fecha y hora en zona horaria **America/Bogota**:
  - **Antes de la fecha límite:** Modo preventa regular con cuenta regresiva en calabaza y cálculo de entrega a tiempo.
  - **Entre la fecha límite y el 31 de octubre:** Modo **últimos días** con barra de alerta roja y prioridad a consulta de envío express.
  - **Desde el 1 de noviembre:** Modo **liquidación** automática al -60%, ocultando contadores de Halloween y adaptando el mensaje para fiestas temáticas y eventos.
- También puedes forzar manualmente cualquier temporada configurando `temporada: 'ultimos-dias'` o `'liquidacion'`.

### 4. Configurar Ciudades y Tiempos de Entrega
```typescript
  ciudades: [
    { nombre: 'Bogotá D.C.', diasEnvio: 1, express: true },
    { nombre: 'Medellín', diasEnvio: 1, express: true },
    { nombre: 'Cali', diasEnvio: 2, express: true },
    { nombre: 'Barranquilla', diasEnvio: 2, express: true },
    { nombre: 'Bucaramanga', diasEnvio: 2, express: true },
    // ...
  ],
  diasEnvioOtras: 4,                       // Para municipios fuera de la lista principal
  festivos: [                              // Días festivos de Colombia que no cuentan como hábiles
    '2026-10-12',
    '2026-11-02',
    '2026-11-16',
  ],
```

### 5. Configurar Envío Express y Stock
```typescript
  envioExpress: {
    activo: true,
    recargo: 15000,                        // COP
    dias: 1,
  },
  stock: {
    activo: true,
    unidades: 38,                          // Unidades dinámicas en la barra de stock
    totalInicial: 250,
  },
```

---

## 🎭 Packs y Variantes (`src/lib/store.ts` y `src/content/producto/grito.json`)

El producto cuenta con dos modelos y dos tallas:
- **Modelos:** `Clásica blanca` y `Con sangre`.
- **Tallas:** `Adulto` (ajuste elástico) y `Niño` (6 a 12 años).

Packs disponibles:
1. **Individual (1 máscara):** $29.900 COP (antes $49.900).
2. **Pareja (2 máscaras):** $49.900 COP (antes $99.800) — **MÁS VENDIDO**. Permite elegir modelo y talla independientes para cada máscara.
3. **Grupo (4 máscaras):** $89.900 COP (antes $199.600) — **PARA LA FIESTA**. Permite elegir modelo y talla para cada una de las 4 máscaras.
4. **Kit Disfraz Completo:** $69.900 COP (antes $119.900) — Incluye máscara con capucha + túnica negra larga + guantes negros.

Los pedidos generan enlaces automáticos con mensaje prellenado en WhatsApp:
```
Hola [NOMBRE_TIENDA], quiero pedir: Máscara Fantasma del Grito | Pack: Pareja | 1) Clásica blanca - Adulto 2) Con sangre - Adulto | Total: $ 49.900. Pago contra entrega. Mi ciudad es: Bogotá D.C.. La necesito antes del 31 de octubre. [origen=hero_cta]
```

---

## 🚢 Despliegue en Producción

El proyecto genera un sitio estático puro (`output: 'static'`) en la carpeta `dist/`. No requiere Node.js en el servidor de producción.

### Opción 1: Despliegue en Vercel
1. Conecta tu repositorio de GitHub / GitLab a [Vercel](https://vercel.com).
2. Framework Preset: **Astro**.
3. Build Command: `pnpm build`.
4. Output Directory: `dist`.
5. Install Command: `pnpm install`.
6. Variables de Entorno (opcionales): `PUBLIC_GTM_ID`, `PUBLIC_PIXEL_ID`.

### Opción 2: Despliegue en Netlify
1. Conecta el repositorio en [Netlify](https://netlify.com).
2. Build command: `pnpm build`.
3. Publish directory: `dist`.
4. Asegúrate de que `packageManager: "pnpm@12.11.2"` en `package.json` sea detectado por el build container.

### Opción 3: Despliegue en Cloudflare Pages
1. Crea un nuevo proyecto en **Cloudflare Pages** conectado a tu Git.
2. Framework preset: **Astro**.
3. Build command: `pnpm build`.
4. Build output directory: `dist`.

---

## 🏛️ Estructura del Código

```
├── public/
│   ├── fonts/              # Bebas Neue y Creepster WOFF2 preloaded
│   ├── images/             # Imágenes optimizadas de producto, UGC y disfraces
│   ├── videos/             # Video preview vertical
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── islas/          # Preact Islands con @preact/signals (solo 5)
│   │   │   ├── HalloweenCountdown.tsx
│   │   │   ├── ArrivalChecker.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── PackSelector.tsx
│   │   │   └── StickyBar.tsx
│   │   ├── secciones/      # Secciones estáticas en orden CRO (.astro)
│   │   │   ├── Hero.astro
│   │   │   ├── TrustBar.astro
│   │   │   ├── WhyThisMask.astro
│   │   │   ├── Details.astro
│   │   │   ├── UgcGallery.astro
│   │   │   ├── PacksSection.astro
│   │   │   ├── CostumeIdeas.astro
│   │   │   ├── Testimonials.astro
│   │   │   ├── SafetyAndKids.astro
│   │   │   ├── HowToOrder.astro
│   │   │   ├── FaqSection.astro
│   │   │   └── FinalCta.astro
│   │   └── ui/             # Header mínimo y Footer legal
│   │       ├── Header.astro
│   │       └── Footer.astro
│   ├── config/
│   │   └── tienda.ts       # Configuración global y cálculo de temporada
│   ├── content/            # Colecciones de contenido tipadas con Zod
│   │   ├── producto/
│   │   ├── testimonios/
│   │   ├── faqs/
│   │   └── ideasDisfraz/
│   ├── layouts/
│   │   └── Base.astro      # Layout base, SEO, JSON-LD, linterna y microinteracciones
│   ├── lib/
│   │   ├── fechas.ts       # Días hábiles y zona horaria America/Bogota
│   │   ├── store.ts        # Estado compartido reactivo de Preact Signals
│   │   ├── tracking.ts     # DataLayer GTM y Meta Pixel
│   │   └── whatsapp.ts     # Generador de URLs y mensajes codificados
│   └── styles/
│       └── global.css      # Tailwind v4 @theme, tokens, niebla y grano
└── astro.config.mjs
```

---

## ⚖️ Páginas Legales Incluidas

Cumplimiento estricto de la legislación de comercio electrónico y protección al consumidor en Colombia:
- [`/envios`](file:///Users/isjuandev/Documents/WS%20NEXOBITE/DropShipping/Halloween/src/pages/envios.astro): Políticas de despacho, transportadoras aliadas y tiempos por ciudad.
- [`/devoluciones`](file:///Users/isjuandev/Documents/WS%20NEXOBITE/DropShipping/Halloween/src/pages/devoluciones.astro): Derecho de retracto de 5 días hábiles conforme a la **Ley 1480 de 2011** (Estatuto del Consumidor) y garantía inmediata por daño de transporte.
- [`/terminos`](file:///Users/isjuandev/Documents/WS%20NEXOBITE/DropShipping/Halloween/src/pages/terminos.astro): Términos y condiciones del servicio, modelo sin pasarela bancaria y compra por WhatsApp.
- [`/privacidad`](file:///Users/isjuandev/Documents/WS%20NEXOBITE/DropShipping/Halloween/src/pages/privacidad.astro): Protección de datos personales conforme a la **Ley 1581 de 2012** (Habeas Data).

---

## 🛡️ Reglas de Marca y Cumplimiento
- **Sin marcas registradas:** No se utilizan nombres de películas, sagas cinematográficas o marcas protegidas. El producto se comercializa estrictamente como *"Máscara Fantasma del Grito"* o *"Máscara de terror"*.
- **Precios e impuestos:** Moneda COP con formateador nativo `Intl.NumberFormat('es-CO')`.
- **Rendimiento:** Cero dependencias pesadas en cliente. Tamaño total JS gzipped menor a 25 KB.
