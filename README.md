# 🎃 Landing Page CRO "Grito" — Halloween Dropshipping Colombia
### Pedido Contraentrega + Automatización n8n + Bot de Telegram (Listo para Dropi)

> **Integración activa (2026):** los pedidos se envían **directo desde el navegador** al endpoint público de dropshipping de NexoBite (`PUBLIC_NEXOBITE_API_URL`). Las secciones de n8n/Telegram de este README se conservan como histórico y ya no están en el camino crítico de los pedidos.

Landing page de producto único de alta conversión (CRO) diseñada para campañas de Halloween en Colombia. Todos los pedidos se gestionan a través de un **formulario directo contraentrega** integrado con un webhook de **n8n**, el cual valida el pedido, detecta spam y envía una notificación formateada a **Telegram** con campos en `<code>` listos para copiar con un toque y cargar en la plataforma de dropshipping (**Dropi**).

---

## 🚀 Inicio Rápido (Desarrollo y Scripts con pnpm)

El gestor de paquetes oficial y obligatorio es **pnpm**.

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servidor de desarrollo en http://localhost:4321
pnpm dev

# 3. Compilar para producción (Output estático con endpoint de pedido)
pnpm build

# 4. Previsualizar el build de producción localmente
pnpm preview

# 5. Probar envío de pedido contraentrega con payload de prueba
pnpm test:pedido
```

---

## 🤖 Pedidos por Formulario + n8n + Telegram

El flujo de conversión opera de la siguiente manera:
1. El usuario toca cualquier CTA (`Pedir ahora — pago contraentrega`) y es desplazado suavemente a la sección `#pedido` con la variante y pack seleccionados.
2. Llena los 6 campos del formulario contraentrega: Nombre, Celular (WhatsApp de 10 dígitos), Departamento (32 departamentos + Bogotá D.C.), Ciudad/Municipio (búsqueda con DIVIPOLA DANE), Dirección con número e Indicaciones.
3. El pedido se envía al webhook (vía proxy `/api/pedido` o directo a n8n) y redirige a la página `/gracias?id=PED-...`.
4. n8n procesa la solicitud, previene duplicados, valida campos y envía una tarjeta a Telegram con botones de acción rápida.

### Pasos de Configuración (Guía Paso a Paso)

1. **Crear el Bot de Telegram con @BotFather:**
   - Abre Telegram y busca `@BotFather`.
   - Envía `/newbot`, asigna un nombre (ej. `Dropi Pedidos Grito`) y un usuario (ej. `DropiGritoPedidosBot`).
   - Copia el **HTTP API Token** generado (ej. `7123456789:AAH...`). *Nunca subas este token al frontend ni al repositorio Git.*

2. **Obtener el `chat_id` de Telegram:**
   - Para chat privado: Inicia conversación con tu bot enviándole `/start`. Luego abre en tu navegador `https://api.telegram.org/bot<TU_TOKEN>/getUpdates` y busca `"chat":{"id":123456789}`.
   - Para grupo (equipo de trabajo): Agrega el bot al grupo, hazlo administrador si es necesario, envía un mensaje al grupo y revisa `getUpdates`. El ID empezará por `-100...`.

3. **Crear Credenciales en n8n:**
   - Ve a **Credentials → New Credential**.
   - Busca **Telegram API** y pega el token de `@BotFather`. Llámala `Telegram Bot Dropi`.
   - Si usas el modo proxy con cabecera secreta, crea una credencial de tipo **Header Auth** llamada `X-Webhook-Secret` con un valor secreto seguro.

4. **Importar los Dos Flujos en n8n:**
   - **Flujo Principal:** Ve a **Workflows → Import from file** y sube [`n8n/pedido-contraentrega-telegram.json`](file:///Users/isjuandev/Documents/WS%20NEXOBITE/DropShipping/Halloween/n8n/pedido-contraentrega-telegram.json).
   - **Flujo de Alerta de Errores:** Importa [`n8n/alerta-errores.json`](file:///Users/isjuandev/Documents/WS%20NEXOBITE/DropShipping/Halloween/n8n/alerta-errores.json) para recibir alertas inmediatas si ocurre algún fallo en la automatización.

5. **Configurar Variables y Credenciales en el Flujo:**
   - En el nodo **"Enviar a Telegram"**, asigna la credencial creada en el paso 3.
   - Configura el `chatId` con tu ID de chat o grupo obtenido en el paso 2.
   - En la variable del flujo `$vars.DROPI_PANEL_URL`, coloca la URL de acceso a tu panel de Dropi (por defecto `https://app.dropi.co`).

6. **Activar el Flujo y Copiar la URL de Producción:**
   - Haz clic en el interruptor **Active** (arriba a la derecha).
   - En el nodo **"Webhook pedido"**, copia la **Production URL** (ej. `https://n8n.tudominio.com/webhook/pedido-contraentrega`). *No uses la Test URL en producción.*

7. **Configurar Variables de Entorno en el Hosting:**
   - En tu proveedor (Vercel, Netlify o Cloudflare Pages), añade las siguientes variables:
     ```env
     PUBLIC_PEDIDO_MODO=proxy
     N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/pedido-contraentrega
     N8N_WEBHOOK_SECRET=tu_secreto_seguro_aqui
     ```

8. **Probar con un Pedido de Prueba:**
   - Ejecuta localmente `pnpm test:pedido` o realiza un pedido desde la web en tu navegador.
   - Comprueba que llegue el mensaje a Telegram con el formato exacto:

   ```html
   🛒 NUEVO PEDIDO CONTRAENTREGA
   #PED-20261022-7KQ4 · 22/10/2026 2:55 p. m.

   📦 PRODUCTO
   Máscara Fantasma del Grito — Clásica blanca
   Paquete: Pareja
   Cantidad: 2
   Cobrar al entregar: $49.900

   👤 CLIENTE (para Dropi)
   Nombre: Ana
   Apellidos: Restrepo
   Celular: 3001234567
   Departamento: Antioquia
   Ciudad: Medellín
   Dirección: Calle 45 #12-30, apto 302, barrio Laureles
   Notas: Entregar después de las 2 p. m.

   📊 ORIGEN
   facebook / paid / halloween_grito · plantilla grito
   ```

   - Toca cualquier dato del cliente en Telegram para copiarlo de inmediato en Dropi.
   - Usa los botones interactivos:
     - **💬 Confirmar por WhatsApp:** Abre WhatsApp con el mensaje de confirmación prellenado hacia el cliente.
     - **📋 Abrir Dropi:** Abre la plataforma de despacho en un clic.

9. **Checklist de Solución de Problemas:**
   - ¿No llega el mensaje a Telegram? Verifica que el workflow esté en modo **Active** (no inactivo).
   - ¿El bot responde 403 Forbidden? Asegúrate de haber iniciado conversación previa con el bot (`/start`).
   - ¿Webhook devuelve 404? Verifica que estés usando la URL de **Production** y no la de Test.
   - ¿Reintentos de envío no generan duplicados? El nodo `¿Duplicado?` almacena en memoria los últimos 500 `pedidoId` para evitar spam o dobles cobros.

---

## 🔄 Modos de Webhook: 'proxy' vs 'directo'

Configurable en `src/config/tienda.ts` o mediante `PUBLIC_PEDIDO_MODO`:

| Característica | Modo `proxy` (Recomendado) | Modo `directo` (100% Estático) |
| :--- | :--- | :--- |
| **Ruta del Formulario** | `/api/pedido` (servidor Astro) | `PUBLIC_PEDIDO_WEBHOOK_URL` (n8n directo) |
| **Seguridad de Webhook** | Secreto protegido en servidor (`N8N_WEBHOOK_SECRET`) | Sin cabecera secreta visible en cliente |
| **Metadatos del Cliente** | Captura IP real y User Agent del navegador | IP de la petición del navegador |
| **Protección Antispam** | Honeypot, tiempo mínimo (4s) y Zod en servidor | Honeypot, tiempo mínimo (4s) y filtro en n8n |
| **Hosting Requerido** | Vercel, Netlify, Cloudflare o Node.js | Cualquier hosting o CDN estático (S3, GitHub Pages) |

---

## ⚙️ Configuración de la Tienda (`src/config/tienda.ts`)

```typescript
export const tiendaConfig: TiendaConfig = {
  nombreTienda: 'ViralyShop Colombia',
  horarioAtencion: 'Lunes a Domingo · 8:00 AM a 10:00 PM',
  moneda: 'COP',
  fechaHalloween: '2026-10-31',
  fechaLimitePedido: '2026-10-27T23:59:59',
  pedido: {
    modo: 'proxy',                          // 'proxy' | 'directo'
    endpoint: '/api/pedido',
    horarioConfirmacion: 'lunes a sábado, 8 a. m. a 6 p. m.',
    tiempoConfirmacion: 'en menos de 2 horas hábiles',
  },
  // ...
};
```

---

## 🏛️ Estructura del Código

```
├── n8n/
│   ├── pedido-contraentrega-telegram.json  # Flujo principal de recepción, validación y Telegram
│   └── alerta-errores.json                 # Flujo de captura de errores para soporte
├── public/
│   ├── fonts/                              # Bebas Neue y Creepster WOFF2
│   ├── images/                             # Fotografías y UGC optimizadas
│   └── robots.txt
├── scripts/
│   └── test-pedido.mjs                     # Script de prueba pnpm test:pedido
├── src/
│   ├── components/
│   │   ├── islas/                          # Preact Islands con @preact/signals
│   │   │   ├── OrderForm.tsx               # Formulario contraentrega (#pedido)
│   │   │   ├── ThankYouDetails.tsx         # Resumen y tracking en /gracias
│   │   │   ├── HalloweenCountdown.tsx      # Contador regresivo de urgencia
│   │   │   ├── ArrivalChecker.tsx          # Verificador de entrega por ciudad
│   │   │   ├── VariantSelector.tsx         # Selector de modelo y talla en Hero
│   │   │   ├── PackSelector.tsx            # Selector de paquetes de ahorro
│   │   │   └── StickyBar.tsx               # Barra fija inferior hacia el formulario
│   │   ├── secciones/                      # Secciones de la landing
│   │   └── ui/                             # Header y Footer legal
│   ├── config/
│   │   └── tienda.ts                       # Configuración general y de pedido
│   ├── data/
│   │   └── colombia.json                   # 32 departamentos + Bogotá D.C. con DIVIPOLA DANE
│   ├── lib/
│   │   ├── pedido-schema.ts                # Esquemas Zod compartidos y formateadores
│   │   ├── store.ts                        # Señales compartidas de pedido y variantes
│   │   ├── tracking.ts                     # Eventos DataLayer y Meta Pixel (Lead, InitiateCheckout)
│   │   └── fechas.ts                       # Días hábiles y festivos en Colombia
│   └── pages/
│       ├── api/pedido.ts                   # Endpoint proxy para n8n con prerender = false
│       ├── index.astro                     # Landing completa con sección #pedido
│       ├── gracias.astro                   # Página de confirmación post-pedido
│       ├── envios.astro                    # Políticas de despacho
│       ├── devoluciones.astro              # Garantías y Ley 1480 de 2011
│       ├── terminos.astro                  # Términos del servicio contraentrega
│       └── privacidad.astro                # Ley 1581 de 2012 (Habeas Data)
└── .env.example                            # Plantilla de variables de entorno
```

---

## ⚖️ Cumplimiento Legal en Colombia
- **Ley 1480 de 2011 (Estatuto del Consumidor):** Garantía legal de cambio por daño de transporte y derecho de retracto de 5 días hábiles.
- **Ley 1581 de 2012 (Habeas Data):** Casilla obligatoria de autorización de tratamiento de datos personales para gestión de despacho contraentrega.
- **Sin marcas registradas:** Denominación genérica "Máscara Fantasma del Grito" sin uso de marcas protegidas.
