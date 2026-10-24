# 🕸️✨ Landing Page CRO "Malla LED RGB Inteligente 135 cm"
### Viraly Shop Colombia — Dropshipping Contra Entrega (Halloween & Navidad)

Landing page de producto único de alta conversión (CRO) diseñada para la temporada de **Halloween y Navidad** en Colombia. Optimizada para tráfico pago (Meta Ads / TikTok Ads), con selector de paquetes de ahorro, verificador de tiempos de entrega por ciudad (DANE), reseñas con video UGC y checkout contra entrega directo integrado con **NexoBite** y **Dropi**.

* **Dominio oficial:** [https://www.shopviraly.shop/](https://www.shopviraly.shop/)
* **Ruta de la landing:** [https://www.shopviraly.shop/malla-led-rgb-135cm](https://www.shopviraly.shop/malla-led-rgb-135cm) *(redirección 301 automática desde la raíz)*

---

## 📦 Acerca del Producto

* **Producto:** Malla LED RGB Inteligente 135 cm (120 LEDs alto brillo).
* **Versatilidad dual:**
  * 🎃 **Halloween:** Forma de telaraña neón brillante para ventanas, balcones y puertas.
  * 🎄 **Navidad:** Transformable en estrella, dosel o cascada decorativa para fiestas decembrinas.
* **Control Dual:** App para celular (Bluetooth con ritmo musical y sincronización) + Control remoto infrarrojo de 20 botones.
* **Alimentación:** Conexión USB 5V de bajo voltaje (segura para niños, mascotas y apta para powerbanks).
* **ID en Dropi / NexoBite:** `#2272533`
* **Campaña:** `viralyshop`

---

## 🚀 Inicio Rápido (Desarrollo y Scripts)

El gestor de paquetes del proyecto es **pnpm**.

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servidor de desarrollo en http://localhost:4321
pnpm dev

# 3. Compilar para producción (Build 100% estático con adaptador Vercel)
pnpm build

# 4. Previsualizar la build de producción
pnpm preview

# 5. Probar envío de pedido contra entrega directo a la API de NexoBite
pnpm test:pedido
```

---

## 🛒 Flujo de Compra y Pedidos (Checkout Contra Entrega)

1. **Selección de Pack:** El cliente elige entre Pack 1 Malla, Pack 2 Mallas (MÁS VENDIDO) o Pack 3 Mallas.
2. **CTA Dinámico:** El botón flotante inferior (*StickyBar*) aparece únicamente cuando no hay otro botón de compra visible en pantalla.
3. **Formulario Contra Entrega (`#pedido`):**
   * Nombre completo y celular de 10 dígitos (formato colombiano +57).
   * Selección de Departamento y Municipio con autocompletado y código DANE oficial.
   * Elección de entrega a domicilio o **"Reclamar en oficina principal de transportadora"** (Coordinadora / Interrapidísimo).
   * Filtro antispam invisible (campo honeypot y temporizador mínimo de llenado).
4. **Despacho directo a NexoBite:**
   * La orden se transmite **directo desde el navegador** (Node client fetch) hacia la API pública de NexoBite (`PUBLIC_NEXOBITE_API_URL`).
   * No requiere servidor intermedio ni backend dinámico (arquitectura SSG estática).
   * Detección de leads duplicados en tiempo real.
5. **Página de Éxito (`/gracias`):**
   * Confirmación con resumen del pedido y botón para soporte inmediato vía WhatsApp.

---

## ⚙️ Variables de Entorno (`.env`)

Copia `.env.example` a `.env` si necesitas sobreescribir valores:

```env
# Endpoint público de recepción de pedidos en NexoBite
PUBLIC_NEXOBITE_API_URL=https://api.nexobite.com/api/v1/public/dropshipping/viralyshop/leads

# ID del producto en Dropi / NexoBite
PUBLIC_NEXOBITE_PRODUCT_ID=2272533

# Campaña de dropshipping activa
PUBLIC_NEXOBITE_CAMPAIGN_SLUG=viralyshop

# Cloudflare Turnstile (Opcional, antispam)
PUBLIC_TURNSTILE_SITE_KEY=

# Analítica y Píxeles de Conversión (Opcionales)
PUBLIC_GTM_ID=
PUBLIC_PIXEL_ID=
```

> **Nota para Astro/Vite:** En el frontend todas las variables públicas se leen mediante `import.meta.env.PUBLIC_*` (tipadas en [`src/env.d.ts`](file:///Users/isjuandev/Documents/Dropshipping/dropshipping-halloween/src/env.d.ts)).

---

## 🏛️ Estructura del Proyecto

```
├── public/
│   ├── favicon.svg                         # Favicon vectorial con isotipo del avión
│   ├── favicon.ico                         # Favicon multi-resolución para legacy
│   ├── logo.svg                            # Logotipo vectorial oficial Viraly Shop
│   ├── logo-icon.svg                       # Isotipo vectorial transparente
│   ├── videos/resenas/                     # Videos UGC de clientes en loop sin sonido
│   └── robots.txt                          # Sitemap y directivas de rastreo
├── scripts/
│   └── test-pedido.mjs                     # Script Node de prueba directa con NexoBite
├── src/
│   ├── assets/images/                      # Fotografías de alta resolución optimizadas
│   │   ├── beneficios/                     # 120 leds, USB 5V, estructura moldeable
│   │   ├── bloques/                        # Control dual, comparativa, instalación
│   │   ├── espacios/                       # Pared, balcón, ventana, techo
│   │   ├── hero/                           # Tomas principales del producto
│   │   ├── packs/                          # Imágenes de kits de compra
│   │   └── resenas/                        # Fotos de clientes reales
│   ├── components/
│   │   ├── islas/                          # Preact Islands reactivas con Signals
│   │   │   ├── ArrivalChecker.tsx          # Calculador de tiempos de entrega por ciudad
│   │   │   ├── HalloweenCountdown.tsx      # Contador regresivo estacional
│   │   │   ├── OrderForm.tsx               # Checkout contra entrega directo
│   │   │   ├── PackSelector.tsx            # Selector interactivo de packs
│   │   │   ├── StickyBar.tsx               # Botón flotante condicional (data-cta)
│   │   │   └── ThankYouDetails.tsx         # Resumen dinámico en /gracias
│   │   ├── secciones/                      # Secciones de la landing page
│   │   │   ├── Hero.astro                  # Galería, propuesta de valor y badges
│   │   │   ├── TrustBar.astro              # 4 garantías (envío, garantía, soporte)
│   │   │   ├── DualSeason.astro            # Transición Halloween a Navidad
│   │   │   ├── DualControl.astro           # App Bluetooth + Control Remoto
│   │   │   ├── KeyBenefits.astro           # 3 beneficios técnicos esenciales
│   │   │   ├── DecorSpaces.astro           # 4 ideas de decoración en el hogar
│   │   │   ├── Installation.astro          # Instalación rápida con ventosas
│   │   │   ├── Comparison.astro            # Comparativa vs luces tradicionales
│   │   │   ├── TechSpecs.astro             # Ficha técnica y contenido de la caja
│   │   │   ├── SocialProof.astro           # Reseñas UGC con videos y acordeón
│   │   │   ├── PacksSection.astro          # Cuadrícula de packs de oferta
│   │   │   ├── HowToOrder.astro            # Pasos para comprar contra entrega
│   │   │   ├── FaqSection.astro            # Preguntas frecuentes con Schema FAQ
│   │   │   └── FinalCta.astro              # Llamado a la acción de cierre
│   │   └── ui/
│   │       ├── Header.astro                # Barra superior con logo oficial
│   │       ├── Footer.astro                # Políticas, métodos de pago y datos legales
│   │       └── ResenaCard.astro            # Tarjeta de testimonio con soporte de video
│   ├── config/
│   │   └── tienda.ts                       # Parámetros de tienda, envíos y NexoBite
│   ├── content/                            # Content Collections de Astro
│   │   ├── faqs/                           # Preguntas frecuentes en JSON
│   │   ├── producto/malla-led.json         # Datos maestros del producto y packs
│   │   └── testimonios/                    # 23 reseñas reales de clientes
│   ├── data/
│   │   └── colombia.json                   # Municipios y códigos DIVIPOLA DANE
│   ├── layouts/
│   │   └── Base.astro                      # Plantilla HTML con SEO y OpenGraph
│   ├── lib/
│   │   ├── pedido-schema.ts                # Validación Zod y tipos de NexoBite
│   │   ├── store.ts                        # Preact Signals (pack activo, ciudad)
│   │   └── tracking.ts                     # Eventos de analítica y pixel
│   └── pages/
│       ├── index.astro                     # Redirección 301 a /malla-led-rgb-135cm
│       ├── malla-led-rgb-135cm.astro       # Landing page oficial del producto
│       ├── gracias.astro                   # Página de confirmación post-checkout
│       ├── envios.astro                    # Políticas de despacho y transportadoras
│       ├── devoluciones.astro              # Políticas de garantía (Ley 1480 de 2011)
│       ├── terminos.astro                  # Términos del servicio contra entrega
│       └── privacidad.astro                # Política de tratamiento de datos (Ley 1581)
├── astro.config.mjs                        # Configuración Astro, Vercel y Tailwind v4
└── package.json
```

---

## ⚖️ Marco Legal y Cumplimiento en Colombia

* **Ley 1480 de 2011 (Estatuto del Consumidor):** Garantía legal por defectos de fábrica o transporte y derecho de retracto dentro de los 5 días hábiles siguientes a la entrega.
* **Ley 1581 de 2012 (Habeas Data):** Consentimiento explícito en el formulario para el tratamiento de datos personales exclusivamente con fines logísticos de entrega.
* **Razón Social:** ViralyShop S.A.S. — Despachos a nivel nacional con pago contra entrega.
