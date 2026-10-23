// Dropi Hub Router para n8n Code Node
const q = $input.item.json.query || {};
const body = $input.item.json.body || {};
const p = { ...body, ...q };

const action = (p.action || 'create_order').toLowerCase();
const orderId = p.id || 'PED-DESCONOCIDO';
const name = p.name || 'Cliente';
const surname = p.surname || '';
const customerName = (name + ' ' + surname).trim();
const phone = String(p.phone || '').replace(/\D/g, '').slice(-10);
const state = (p.state || 'ANTIOQUIA').toUpperCase();
const city = (p.city || 'MEDELLIN').toUpperCase();
const dir = p.dir || 'Dirección no provista';
const total = Number(p.total) || 29900;
const quantity = Number(p.quantity) || 1;
const notes = p.notes || '';
const productId = 2289560;

const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJtY3AtY2xpLXByb3h5LTg0ODc0NTc4IiwiY291bnRyeV9jb2RlIjoiQ08iLCJwZXJtaXNzaW9ucyI6InJlYWQ6aW52ZW50b3J5LHdyaXRlOmludmVudG9yeSxyZWFkOm9yZGVycyx3cml0ZTpvcmRlcnMscmVhZDpiaWxsaW5nLHJlYWQ6cmVwb3J0cyIsIndoaXRlX2JyYW5kX2lkIjoxLCJ1c2VyX3R5cGUiOiJEUk9QU0hJUFBFUiIsInVzZXJfbmFtZSI6Ikp1YW4iLCJpc3MiOiJodHRwOi8vYXBpLWNvcmUucHJvZC5pbnRlcm5hbCIsInN1YiI6Ijg1Mzk2MyIsImF1ZCI6WyJodHRwczovL21jcC5kcm9waS5jby9tY3AiXSwiZXhwIjoxNzkyNzMxNTIwLCJuYmYiOjE3OTI3Mjc5MjAsImlhdCI6MTc5MjcyNzkyMCwianRpIjoiRlZEenJ1dUg4QnJfNVRJRkc4NDE0QSJ9.nt-YbSFBo_7I-MbJV37SSxEtlyV5yCIULT4cx5sz1hrCi_iSnJlncBHVlVB-4T7zBGwx0_CcDI-cj13GkNR6WWMRW6usE26es6DVmQRWyqFk_D43HkDm_qwh59vWQxxbn8H2adVSrqVF2kiaIaD8DQ0L5SuNmEmiHPJxioMLdv3wF5ZuGnJE41uqZO4QgEaD49T1ACcVLDURYEvX_D78_o6EKNAhsKjKFadB7WVA7f5G2seAZBsih2UeZMx7hUrcvqs4TxGC1NVh0S6a-QYdF3PzJp7La6w2_1ZkzxZ7UovNoAMHHpu098NuNr9NH6J4GiEkrq1_UD4SlI065zydpQ";

const httpRequest = this.helpers.httpRequest.bind(this.helpers);

async function callMcp(toolName, args = {}) {
  // 1. Initialize session
  const initRes = await httpRequest({
    url: "https://mcp.dropi.co/mcp",
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "n8n", version: "1.0" } }
    }),
    json: false,
    returnFullResponse: true
  });

  const sessionId = initRes.headers["mcp-session-id"];

  // 2. Initialized Notification
  await httpRequest({
    url: "https://mcp.dropi.co/mcp",
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      ...(sessionId ? { "mcp-session-id": sessionId } : {})
    },
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
    json: false
  });

  // 3. Tools Call
  const toolRes = await httpRequest({
    url: "https://mcp.dropi.co/mcp",
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      ...(sessionId ? { "mcp-session-id": sessionId } : {})
    },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: toolName, arguments: args }
    }),
    json: false,
    returnFullResponse: true
  });

  const rawText = typeof toolRes.body === 'string' ? toolRes.body : JSON.stringify(toolRes.body);
  for (const line of rawText.split("\n")) {
    if (line.startsWith("data: ")) {
      try {
        const parsed = JSON.parse(line.slice(6));
        return parsed.result || parsed.error || {};
      } catch (_) {}
    }
  }
  return {};
}

let telegramText = '';
let htmlResponse = '';
const totalFormateado = '$' + total.toLocaleString('es-CO');

// 1. ACCIÓN: HUELLA / RISK PROFILE
if (action === 'fingerprint' || action === 'huella') {
  const mcpRes = await callMcp('get_customer_fingerprint_profile', { phone });
  const rawContent = mcpRes?.content?.[0]?.text || '';
  
  const risk = {
    buyer_type: 'No determinado',
    risk_label: 'Sin evaluar',
    delivery_probability: 0,
    return_probability: 0
  };

  rawContent.split('\n').forEach(l => {
    const [k, v] = l.split(':').map(s => s.trim());
    if (k === 'buyer_type') risk.buyer_type = v;
    if (k === 'risk_label') risk.risk_label = v;
    if (k === 'delivery_probability') risk.delivery_probability = Number(v) || 0;
    if (k === 'return_probability') risk.return_probability = Number(v) || 0;
  });

  let riskIcon = '🟢';
  let advice = '✅ <b>Comprador Confiable:</b> El cliente cuenta con buena probabilidad de recepción. Se recomienda despachar.';
  if (risk.return_probability > 40 || risk.delivery_probability < 50) {
    riskIcon = '🔴';
    advice = '⚠️ <b>Alerta de Devolución:</b> El comprador tiene alta tasa de devoluciones. Confirma bien por WhatsApp antes de despachar.';
  } else if (risk.delivery_probability < 80) {
    riskIcon = '🟡';
    advice = 'ℹ️ <b>Riesgo Medio:</b> Pedido habitual, valida la dirección antes de generar la guía.';
  }

  telegramText = `🛡️ <b>REPORTE DE HUELLA & ANTIFRAUDE DROPI</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Pedido:</b> <code>#${orderId}</code>
👤 <b>Cliente:</b> ${customerName || 'Cliente'} (<code>${phone}</code>)

📊 <b>HISTORIAL EN DROPI:</b>
• <b>Nivel de Riesgo:</b> ${riskIcon} <b>${risk.risk_label}</b>
• <b>Probabilidad de Entrega:</b> <b>${risk.delivery_probability}%</b>
• <b>Tasa de Devolución:</b> <b>${risk.return_probability}%</b>
• <b>Perfil de Comprador:</b> ${risk.buyer_type}

💡 ${advice}`;

  htmlResponse = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Huella Antifraude - Dropi</title>
<style>
body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0A0A0B;color:#F2EFE9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;box-sizing:border-box;}
.card{background:#16141A;border:1px solid rgba(255,106,0,0.3);max-width:480px;width:100%;border-radius:20px;padding:32px 24px;text-align:center;}
.icon{font-size:44px;margin-bottom:12px;}
h1{margin:0 0 8px;font-size:22px;color:#FF6A00;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0;text-align:left;}
.box{background:#0A0A0B;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);}
.box small{display:block;color:#9A96A0;font-size:11px;text-transform:uppercase;margin-bottom:4px;}
.box strong{font-size:18px;color:#FFF;}
.advice{background:rgba(255,106,0,0.1);border:1px solid rgba(255,106,0,0.3);border-radius:12px;padding:14px;font-size:13px;line-height:1.5;text-align:left;margin-bottom:20px;}
.btn{display:inline-block;width:100%;box-sizing:border-box;background:#FF6A00;color:#0A0A0B;font-weight:bold;text-decoration:none;padding:14px;border-radius:12px;text-transform:uppercase;font-size:13px;}
</style></head><body>
<div class="card">
  <div class="icon">${riskIcon}</div>
  <h1>Perfil Antifraude de Comprador</h1>
  <p style="color:#9A96A0;margin:0 0 16px;font-size:14px;">Pedido <strong>#${orderId}</strong> — ${customerName} (${phone})</p>
  <div class="grid">
    <div class="box"><small>Calificación</small><strong>${risk.risk_label}</strong></div>
    <div class="box"><small>Perfil</small><strong>${risk.buyer_type}</strong></div>
    <div class="box"><small>Prob. Entrega</small><strong style="color:#10B981">${risk.delivery_probability}%</strong></div>
    <div class="box"><small>Tasa Devolución</small><strong style="color:${risk.return_probability > 30 ? '#EF4444' : '#10B981'}">${risk.return_probability}%</strong></div>
  </div>
  <div class="advice">${advice}</div>
  <a href="https://n8n.nexobite.com/webhook/dropi-hub?action=create_order&id=${encodeURIComponent(orderId)}&name=${encodeURIComponent(name)}&surname=${encodeURIComponent(surname)}&phone=${phone}&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&dir=${encodeURIComponent(dir)}&total=${total}&quantity=${quantity}&notes=${encodeURIComponent(notes)}" class="btn">⚡ Proceder y Crear en Dropi</a>
</div></body></html>`;

// 2. ACCIÓN: COTIZAR FLETES / QUOTE
} else if (action === 'quote' || action === 'cotizar') {
  // A. Resolver código ciudad
  const cityRes = await callMcp('search_cities', { name: city });
  const cityText = cityRes?.content?.[0]?.text || '';
  const lines = cityText.split('\n').filter(l => l.trim().match(/^\d+,/));
  let cityId = 266;
  let codDane = '05001000';
  let zipCode = '';

  if (lines.length > 0) {
    const parts = lines[0].split(',').map(s => s.replace(/"/g, '').trim());
    cityId = Number(parts[0]) || cityId;
    codDane = parts[3] || codDane;
    zipCode = parts[4] || '';
  }

  // B. Cotizar flete
  const quoteRes = await callMcp('quote_shipping', {
    cash_on_delivery: true,
    destination_city: {
      id: cityId,
      dane_code: codDane,
      zip_code: zipCode || '050001'
    },
    products: [
      { id: productId, type: 'SIMPLE', quantity, price: total }
    ]
  });

  const quoteText = quoteRes?.content?.[0]?.text || '';
  const carrierLines = quoteText.split('\n').filter(l => 
    l.includes('COORDINADORA') || l.includes('TCC') || l.includes('ENVIA') || 
    l.includes('DOMINA') || l.includes('VELOCES') || l.includes('INTERRAPIDISIMO') || l.includes('99MINUTOS')
  );

  const carriers = [];
  for (const cl of carrierLines) {
    const p = cl.trim().split(',');
    const cName = p[0].trim();
    const cCost = Number(p[2]);
    const cError = p.slice(5).join(',').replace(/"/g, '').trim();
    if (!isNaN(cCost) && cCost > 0) {
      carriers.push({ name: cName, cost: Math.round(cCost), formatted: '$' + Math.round(cCost).toLocaleString('es-CO'), status: 'Disponible' });
    } else {
      carriers.push({ name: cName, cost: 999999, formatted: 'No disponible', status: cError || 'Sin cobertura' });
    }
  }

  const available = carriers.filter(c => c.cost < 999999).sort((a,b) => a.cost - b.cost);
  const best = available.length > 0 ? available[0] : null;

  let listText = '';
  if (available.length > 0) {
    listText = available.map(c => `• <b>${c.name}:</b> <code>${c.formatted}</code>`).join('\n');
  } else {
    listText = '<i>No se encontraron fletes contraentrega activos para este destino.</i>';
  }

  telegramText = `🚚 <b>COTIZACIÓN DE TRANSPORTADORAS DROPI</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Pedido:</b> <code>#${orderId}</code>
📍 <b>Destino:</b> ${city}, ${state}
💰 <b>Recaudo Contraentrega:</b> <code>${totalFormateado}</code>

📦 <b>FLETES DISPONIBLES:</b>
${listText}

${best ? `💡 <i>Transportadora más económica: <b>${best.name} (${best.formatted})</b></i>` : ''}`;

  let carrierRows = available.map(c => `
    <div style="display:flex;justify-content:space-between;padding:12px;background:#0A0A0B;border-radius:10px;margin-bottom:8px;border:1px solid rgba(255,255,255,0.06);">
      <strong>${c.name}</strong>
      <span style="color:#FF6A00;font-weight:bold;">${c.formatted}</span>
    </div>
  `).join('');

  htmlResponse = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cotización de Fletes - Dropi</title>
<style>
body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0A0A0B;color:#F2EFE9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;box-sizing:border-box;}
.card{background:#16141A;border:1px solid rgba(255,106,0,0.3);max-width:480px;width:100%;border-radius:20px;padding:32px 24px;text-align:center;}
.icon{font-size:44px;margin-bottom:12px;}
h1{margin:0 0 8px;font-size:22px;color:#FF6A00;}
.btn{display:inline-block;width:100%;box-sizing:border-box;background:#FF6A00;color:#0A0A0B;font-weight:bold;text-decoration:none;padding:14px;border-radius:12px;text-transform:uppercase;font-size:13px;margin-top:16px;}
</style></head><body>
<div class="card">
  <div class="icon">🚚</div>
  <h1>Cotización en Tiempo Real</h1>
  <p style="color:#9A96A0;margin:0 0 20px;font-size:14px;">Destino: <strong>${city}, ${state}</strong> | Recaudo: <strong>${totalFormateado}</strong></p>
  <div style="text-align:left;margin-bottom:20px;">${carrierRows}</div>
  <a href="https://n8n.nexobite.com/webhook/dropi-hub?action=create_order&id=${encodeURIComponent(orderId)}&name=${encodeURIComponent(name)}&surname=${encodeURIComponent(surname)}&phone=${phone}&state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&dir=${encodeURIComponent(dir)}&total=${total}&quantity=${quantity}&notes=${encodeURIComponent(notes)}" class="btn">⚡ Crear Pedido en Dropi</a>
</div></body></html>`;

// 3. ACCIÓN: CREAR ORDEN / CREATE_ORDER
} else if (action === 'create_order' || action === 'crear') {
  const unitPrice = Math.round(total / quantity);
  const mcpRes = await callMcp('create_order', {
    name, surname: surname || 'Cliente', dir, state, city, phone,
    rate_type: 'CON RECAUDO',
    notes: notes || `Pedido ${orderId}`,
    shop_order_id: orderId,
    products: [{ id: productId, price: unitPrice, quantity }]
  });

  telegramText = `🎉 <b>¡ORDEN CREADA EN DROPI CON ÉXITO!</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Pedido Tienda:</b> <code>#${orderId}</code>
👤 <b>Cliente:</b> ${customerName} (<code>${phone}</code>)
📍 <b>Destino:</b> ${city}, ${state} — <code>${dir}</code>
📦 <b>Producto:</b> Máscara Scream (#${productId}) × ${quantity} un.
💰 <b>Total a Recaudar:</b> <code>${totalFormateado}</code>

🚚 <i>El proveedor ya fue notificado y la transportadora preparará la guía.</i>`;

  htmlResponse = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Orden Creada en Dropi</title>
<style>
body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0A0A0B;color:#F2EFE9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;box-sizing:border-box;}
.card{background:#16141A;border:1px solid rgba(255,106,0,0.4);max-width:460px;width:100%;border-radius:20px;padding:32px 24px;text-align:center;}
.icon{width:64px;height:64px;background:rgba(16,185,129,0.15);border:2px solid #10B981;color:#10B981;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 16px;}
h1{margin:0 0 8px;font-size:24px;color:#FF6A00;}
.info{background:#0A0A0B;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;text-align:left;font-size:13px;margin:20px 0;line-height:1.6;}
.btn{display:inline-block;width:100%;box-sizing:border-box;background:#FF6A00;color:#0A0A0B;font-weight:bold;text-decoration:none;padding:14px;border-radius:12px;text-transform:uppercase;font-size:14px;}
</style></head><body>
<div class="card">
  <div class="icon">✓</div>
  <h1>¡Orden Registrada en Dropi!</h1>
  <p style="color:#9A96A0;font-size:14px;">El pedido para <strong>${customerName}</strong> fue creado con éxito en Dropi bajo la modalidad de Pago Contraentrega.</p>
  <div class="info">
    <div><strong>Pedido Tienda:</strong> ${orderId}</div>
    <div><strong>Destino:</strong> ${city}, ${state}</div>
    <div><strong>Dirección:</strong> ${dir}</div>
    <div><strong>Cobrar al entregar:</strong> ${totalFormateado}</div>
  </div>
  <a href="https://app.dropi.co/orders" class="btn" target="_blank">Ver Pedido en Dropi</a>
</div></body></html>`;

// 4. ACCIÓN: CONSULTAR ORDEN / GET_ORDER
} else if (action === 'get_order' || action === 'consultar') {
  const mcpRes = await callMcp('list_orders', { text_to_search: orderId || phone, result_number: 1 });
  const rawText = mcpRes?.content?.[0]?.text || '';

  telegramText = `🔍 <b>ESTADO DE ORDEN EN DROPI</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Pedido:</b> <code>#${orderId}</code>
👤 <b>Cliente:</b> ${customerName || phone}

📋 <b>DETALLES DE DROPI:</b>
<pre>${rawText.slice(0, 400) || 'Sin registros en Dropi aún.'}</pre>

🔗 <a href="https://app.dropi.co/orders">Abrir Panel de Pedidos en Dropi</a>`;

  htmlResponse = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Estado de Orden - Dropi</title>
<style>
body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0A0A0B;color:#F2EFE9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;box-sizing:border-box;}
.card{background:#16141A;border:1px solid rgba(255,106,0,0.3);max-width:520px;width:100%;border-radius:20px;padding:32px 24px;text-align:center;}
h1{margin:0 0 8px;font-size:22px;color:#FF6A00;}
pre{background:#0A0A0B;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);text-align:left;font-size:12px;overflow-x:auto;color:#A3E635;}
.btn{display:inline-block;width:100%;box-sizing:border-box;background:#FF6A00;color:#0A0A0B;font-weight:bold;text-decoration:none;padding:14px;border-radius:12px;text-transform:uppercase;font-size:13px;margin-top:16px;}
</style></head><body>
<div class="card">
  <h1>Estado de Orden Dropi</h1>
  <p style="color:#9A96A0;font-size:14px;">Búsqueda para <strong>#${orderId}</strong></p>
  <pre>${rawText || 'No se encontró orden registrada aún con este identificador.'}</pre>
  <a href="https://app.dropi.co/orders" class="btn" target="_blank">Abrir en Panel Dropi</a>
</div></body></html>`;

// 5. ACCIÓN: LISTAR ÚLTIMAS ÓRDENES / LIST_ORDERS
} else if (action === 'list_orders' || action === 'listar') {
  const mcpRes = await callMcp('list_orders', { start: 0, result_number: 5 });
  const rawText = mcpRes?.content?.[0]?.text || '';

  telegramText = `📦 <b>ÚLTIMAS ÓRDENES EN DROPI</b>
━━━━━━━━━━━━━━━━━━━━
Mostrando las órdenes más recientes registradas en tu cuenta:

<pre>${rawText.slice(0, 500) || 'No hay órdenes registradas aún.'}</pre>

🔗 <a href="https://app.dropi.co/orders">Abrir Dropi Orders</a>`;

  htmlResponse = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Últimas Órdenes - Dropi</title>
<style>
body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0A0A0B;color:#F2EFE9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;box-sizing:border-box;}
.card{background:#16141A;border:1px solid rgba(255,106,0,0.3);max-width:540px;width:100%;border-radius:20px;padding:32px 24px;text-align:center;}
h1{margin:0 0 8px;font-size:22px;color:#FF6A00;}
pre{background:#0A0A0B;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);text-align:left;font-size:12px;overflow-x:auto;color:#A3E635;}
.btn{display:inline-block;width:100%;box-sizing:border-box;background:#FF6A00;color:#0A0A0B;font-weight:bold;text-decoration:none;padding:14px;border-radius:12px;text-transform:uppercase;font-size:13px;margin-top:16px;}
</style></head><body>
<div class="card">
  <h1>Últimas Órdenes en Dropi</h1>
  <pre>${rawText || 'No hay órdenes recientes registradas.'}</pre>
  <a href="https://app.dropi.co/orders" class="btn" target="_blank">Ir al Administrador Dropi</a>
</div></body></html>`;
}

return {
  action,
  orderId,
  customerName,
  phone,
  state,
  city,
  dir,
  total,
  quantity,
  telegramText,
  htmlResponse
};
