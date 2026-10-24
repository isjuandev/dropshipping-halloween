/**
 * Script de prueba de envío de pedido contraentrega
 * Uso: pnpm test:pedido [url_endpoint]
 */

const explicitEndpoint = process.argv[2] || process.env.PUBLIC_PEDIDO_WEBHOOK_URL;
let endpointsToTry = explicitEndpoint
  ? [explicitEndpoint]
  : ['http://localhost:4321/api/pedido', 'http://localhost:4322/api/pedido'];

const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

const payloadPrueba = {
  pedidoId: `PED-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomSuffix}`,
  fecha: new Date().toISOString(),
  tienda: "LumiHogar Colombia",
  landing: {
    url: "https://mascaradelgrito.co",
    plantilla: "malla-led"
  },
  producto: {
    nombre: "Malla LED RGB Inteligente 135 cm",
    sku: "MALLA-LED-RGB-135",
    variante: "Multicolor RGB · 135 cm · 120 LEDs",
    paquete: "Pack 2 Mallas",
    cantidad: 2,
    extras: ["2x Control remoto 20 botones"],
    precioUnitario: 79950,
    total: 159900
  },
  cliente: {
    nombreCompleto: "Ana Restrepo",
    celular: "+573001234567",
    departamento: "Antioquia",
    ciudad: "Medellín",
    codigoDane: "05001",
    direccion: "Calle 45 #12-30, apto 302, barrio Laureles",
    indicaciones: "Entregar después de las 2 p. m."
  },
  consentimiento: true,
  origen: {
    utm_source: "test_script",
    utm_medium: "local",
    utm_campaign: "qa_verification",
    utm_content: "unit_test",
    fbclid: "",
    referrer: "https://localhost:4321"
  },
  antispam: {
    empresa: "",
    segundos: 18
  }
};

async function run() {
  for (const endpoint of endpointsToTry) {
    try {
      console.log(`\n🚀 Enviando pedido de prueba contraentrega a: ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.N8N_WEBHOOK_SECRET ? { 'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET } : {})
        },
        body: JSON.stringify(payloadPrueba)
      });

      const status = response.status;
      const json = await response.json().catch(() => null);

      console.log(`📡 Respuesta del servidor (Status ${status}):`);
      console.dir(json, { depth: null, colors: true });

      if (response.ok && json?.ok) {
        console.log(`\n✅ ¡Prueba exitosa! Pedido ${json.pedidoId} procesado correctamente.\n`);
        return;
      } else {
        console.error(`\n❌ Error en la respuesta del endpoint ${endpoint}:`, json);
        process.exit(1);
      }
    } catch (error) {
      if (endpoint === endpointsToTry[endpointsToTry.length - 1]) {
        console.error(`\n❌ Error de conexión al endpoint:`, error.message);
        console.log(`💡 Tip: Si estás probando localmente, asegúrate de tener el servidor corriendo con "pnpm dev".\n`);
        process.exit(1);
      }
    }
  }
}

run();
