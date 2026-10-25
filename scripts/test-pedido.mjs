/**
 * Envía un pedido de prueba directo al endpoint público de dropshipping de NexoBite.
 * Uso: pnpm test:pedido [url_endpoint]
 *
 * La llamada es servidor-a-servidor (Node), así que no depende de CORS.
 */

const endpoint =
  process.argv[2] ||
  process.env.PUBLIC_NEXOBITE_API_URL ||
  'https://api.nexobite.com/api/v1/public/dropshipping/viralyshop/leads';

const productId = process.env.PUBLIC_NEXOBITE_PRODUCT_ID || '2243235';
const campaignSlug = process.env.PUBLIC_NEXOBITE_CAMPAIGN_SLUG || 'viralyshop';

const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

const payload = {
  pedidoId: `PED-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomSuffix}`,
  fecha: new Date().toISOString(),
  tienda: 'ViralyShop Colombia',
  landing: 'https://www.shopviraly.shop/malla-led-rgb-135cm',
  ...(campaignSlug ? { campaignSlug } : {}),
  producto: {
    ...(productId ? { providerProductId: productId } : {}),
    nombre: 'Malla LED RGB Inteligente 135 cm · Pack 2 Mallas',
    sku: 'MALLA-LED-RGB-135',
    variante: 'Multicolor RGB · 135 cm · 120 LEDs',
    paquete: 'Pack 2 Mallas',
    cantidad: 2,
    extras: ['2x Control remoto 20 botones'],
    precioUnitario: 79950,
    total: 159900,
  },
  cliente: {
    nombreCompleto: 'Ana Restrepo',
    celular: '+573001234567',
    departamento: 'Antioquia',
    ciudad: 'Medellín',
    direccion: 'Calle 45 #12-30, apto 302, barrio Laureles',
    indicaciones: 'Entregar después de las 2 p. m.',
  },
  consentimiento: true,
  origen: {
    utm_source: 'test_script',
    utm_medium: 'local',
    utm_campaign: 'qa_verification',
    utm_content: 'unit_test',
    fbclid: '',
    referrer: 'https://localhost:4321',
  },
  antispam: {
    empresa: '',
    segundos: 18,
  },
};

async function run() {
  try {
    console.log(`\n🚀 Enviando pedido de prueba a NexoBite: ${endpoint}`);
    console.log(`   pedidoId: ${payload.pedidoId}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await response.json().catch(() => null);
    console.log(`📡 Respuesta (HTTP ${response.status}):`);
    console.dir(json, { depth: null, colors: true });

    if (!response.ok) {
      console.error('\n❌ NexoBite rechazó el pedido. Revisa el detalle de arriba.');
      process.exit(1);
    }

    console.log(`\n✅ Pedido registrado: ${json?.data?.orderId ?? 'sin id'} (${json?.data?.status ?? 'sin estado'})\n`);
  } catch (error) {
    console.error('\n❌ Error de conexión con NexoBite:', error.message);
    console.log('💡 Verifica PUBLIC_NEXOBITE_API_URL y que api.nexobite.com responda.\n');
    process.exit(1);
  }
}

run();
