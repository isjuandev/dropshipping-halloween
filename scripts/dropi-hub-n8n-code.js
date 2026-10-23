// Dropi Hub Router para n8n Code Node
// Soporta Callback Queries nativas de Telegram Y Webhooks HTTP

let cb = null;
try {
  cb = $input.item.json.callback_query || $('Telegram Callback Trigger').first()?.json?.callback_query;
} catch (_) {
  cb = $input.item.json.callback_query;
}

let action = '';
let orderId = 'PED-DESCONOCIDO';
let name = 'Cliente';
let surname = '';
let customerName = 'Cliente';
let phone = '';
let state = 'ANTIOQUIA';
let city = 'MEDELLIN';
let dir = 'Dirección no provista';
let total = 29900;
let quantity = 1;
let notes = '';
let selectedCarrierId = null;
let chatId = '-1003981686470';
let threadId = 46;
let replyToId = null;

if (cb && cb.data) {
  chatId = String(cb.message?.chat?.id || chatId);
  threadId = Number(cb.message?.message_thread_id || threadId);
  replyToId = cb.message?.message_id || null;

  const data = cb.data || '';
  const parts = data.split(':');
  const code = parts[1] || '';
  if (code === 'fp') action = 'fingerprint';
  else if (code === 'qt') action = 'quote';
  else if (code === 'cr') action = 'create_order';
  else if (code === 'gt') action = 'get_order';
  else if (code === 'ls') action = 'list_orders';
  else action = code || '';

  if (parts[2]) orderId = parts[2];
  if (parts[3] && !isNaN(Number(parts[3]))) selectedCarrierId = Number(parts[3]);

  const msgText = cb.message?.text || '';
  
  if (!orderId || orderId === 'PED-DESCONOCIDO') {
    const oMatch = msgText.match(/Pedido:\s*#?([A-Za-z0-9\-]+)/i);
    if (oMatch) orderId = oMatch[1].trim();
  }

  const pMatch = msgText.match(/Celular:\s*([0-9+]+)/i);
  if (pMatch) phone = pMatch[1].replace(/\D/g, '').slice(-10);

  const cMatch = msgText.match(/Ciudad:\s*([^\n\r]+)/i);
  if (cMatch) city = cMatch[1].trim();

  const sMatch = msgText.match(/Departamento:\s*([^\n\r]+)/i);
  if (sMatch) state = sMatch[1].trim();

  const dMatch = msgText.match(/Dirección:\s*([^\n\r]+)/i);
  if (dMatch) dir = dMatch[1].trim();

  const nMatch = msgText.match(/Nombre:\s*([^\n\r]+)/i);
  if (nMatch) name = nMatch[1].trim();

  const snMatch = msgText.match(/Apellidos:\s*([^\n\r]+)/i);
  if (snMatch) surname = snMatch[1].trim();

  const tMatch = msgText.match(/TOTAL A COBRAR:\s*\$?([\d\.]+)/i);
  if (tMatch) total = Number(tMatch[1].replace(/\./g, ''));

  customerName = (name + ' ' + surname).trim() || 'Cliente';
} else {
  const q = $input.item.json.query || {};
  const b = $input.item.json.body || {};
  const p = { ...b, ...q };

  action = (p.action || '').toLowerCase();
  orderId = p.id || 'PED-DESCONOCIDO';
  name = p.name || 'Cliente';
  surname = p.surname || '';
  customerName = (name + ' ' + surname).trim();
  phone = String(p.phone || '').replace(/\D/g, '').slice(-10);
  state = (p.state || 'ANTIOQUIA').toUpperCase();
  city = (p.city || 'MEDELLIN').toUpperCase();
  dir = p.dir || 'Dirección no provista';
  total = Number(p.total) || 29900;
  quantity = Number(p.quantity) || 1;
  notes = p.notes || '';
  if (p.carrier_id) selectedCarrierId = Number(p.carrier_id);
}

if (!action) {
  return {
    action: 'none',
    telegramText: '⚠️ No se reconoció la acción solicitada para Dropi.',
    htmlResponse: 'Acción no reconocida',
    chatId,
    threadId,
    replyToId
  };
}

const productId = 2289560;
const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJtY3AtY2xpLXByb3h5LTg0ODc0NTc4IiwiY291bnRyeV9jb2RlIjoiQ08iLCJwZXJtaXNzaW9ucyI6InJlYWQ6aW52ZW50b3J5LHdyaXRlOmludmVudG9yeSxyZWFkOm9yZGVycyx3cml0ZTpvcmRlcnMscmVhZDpiaWxsaW5nLHJlYWQ6cmVwb3J0cyIsIndoaXRlX2JyYW5kX2lkIjoxLCJ1c2VyX3R5cGUiOiJEUk9QU0hJUFBFUiIsInVzZXJfbmFtZSI6Ikp1YW4iLCJpc3MiOiJodHRwOi8vYXBpLWNvcmUucHJvZC5pbnRlcm5hbCIsInN1YiI6Ijg1Mzk2MyIsImF1ZCI6WyJodHRwczovL21jcC5kcm9waS5jby9tY3AiXSwiZXhwIjoxNzkyNzc3NDM0LCJuYmYiOjE3OTI3NzM4MzQsImlhdCI6MTc5Mjc3MzgzNCwianRpIjoiUFRZM21xUE82V2RUaTdhRFdyUkRuUSJ9.k4iKu1uip3PiRzjs0pfLJgV4yfqnDcrvVx5Ccvgff8jIsP5MSw1n6QmvFbDlybzKi1ICJR24XIo4xHSoyzy6_IwZVsrYjnrAAkPTRbtG8bgM_7uo262vs5jqBpD9gmuB2peZLjlX2_nmBVtHLFZxWRjbGxY-bQSP7DByCUio00ykNebWUC0j9ZGy-PO2QddHJYrx9gjL7t9LcEKKnya07k-ccRUH24vgTsZRmKc8R1-dyuM-Gx47lcmfOal7b7uZe6o8YmUOBtpLMBn4au0TZoz4GoW7Ivl7gb6UtzmVqAdICFxbH94dZfX3fEK5APbLbbu8BfOGKO8t8kMVwbMf9g";

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

// 2. ACCIÓN: COTIZAR FLETES / QUOTE
} else if (action === 'quote' || action === 'cotizar') {
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
      carriers.push({ name: cName, cost: Math.round(cCost), formatted: '$' + Math.round(cCost).toLocaleString('es-CO') });
    }
  }

  const available = carriers.sort((a,b) => a.cost - b.cost);
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

// 3. ACCIÓN: CREAR ORDEN / CREATE_ORDER
} else if (action === 'create_order' || action === 'crear') {
  const unitPrice = Math.round(total / quantity);
  
  // Si no se especificó transportadora manualmente, cotizar y seleccionar la más económica automáticamente
  let carrierId = selectedCarrierId || null;
  let carrierName = '';
  const carrierMap = { 'VELOCES': 6, 'ENVIA': 2, 'TCC': 10, 'DOMINA': 4, 'COORDINADORA': 5, 'INTERRAPIDISIMO': 3, '99MINUTOS': 7 };

  if (!carrierId) {
    try {
      const cityRes = await callMcp('search_cities', { name: city });
      const cityText = cityRes?.content?.[0]?.text || '';
      const lines = cityText.split('\n').filter(l => l.trim().match(/^\d+,/));
      if (lines.length > 0) {
        const parts = lines[0].split(',').map(s => s.replace(/"/g, '').trim());
        const quoteRes = await callMcp('quote_shipping', {
          cash_on_delivery: true,
          destination_city: { id: Number(parts[0]), dane_code: parts[3], zip_code: parts[4] || '050001' },
          products: [{ id: productId, type: 'SIMPLE', quantity, price: total }]
        });
        const qText = quoteRes?.content?.[0]?.text || '';
        const found = [];
        for (const [cName, cId] of Object.entries(carrierMap)) {
          const m = qText.match(new RegExp(`${cName},normal,([0-9.]+)`));
          if (m && Number(m[1]) > 0) found.push({ id: cId, name: cName, cost: Number(m[1]) });
        }
        found.sort((a,b) => a.cost - b.cost);
        if (found.length > 0) {
          carrierId = found[0].id;
          carrierName = found[0].name;
        }
      }
    } catch (_) {}
  } else {
    for (const [cName, cId] of Object.entries(carrierMap)) {
      if (cId === carrierId) carrierName = cName;
    }
  }

  const orderPayload = {
    name, surname: surname || 'Cliente', dir, state, city, phone,
    rate_type: 'CON RECAUDO',
    notes: notes || `Pedido ${orderId}`,
    shop_order_id: orderId,
    products: [{ id: productId, price: unitPrice, quantity }]
  };

  if (carrierId) {
    orderPayload.distribution_company_id = carrierId;
  }

  const mcpRes = await callMcp('create_order', orderPayload);
  const resultText = mcpRes?.content?.[0]?.text || '';

  telegramText = `🎉 <b>¡ORDEN CREADA EN DROPI CON ÉXITO!</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Pedido Tienda:</b> <code>#${orderId}</code>
👤 <b>Cliente:</b> ${customerName} (<code>${phone}</code>)
📍 <b>Destino:</b> ${city}, ${state} — <code>${dir}</code>
📦 <b>Producto:</b> Máscara Scream (#${productId}) × ${quantity} un.
💰 <b>Total a Recaudar:</b> <code>${totalFormateado}</code>
${carrierName ? `🚚 <b>Transportadora seleccionada:</b> <b>${carrierName}</b> (Opción más económica)` : '🚚 <b>Transportadora:</b> Asignación inteligente Dropi'}

<i>El proveedor ya fue notificado y la transportadora preparará la guía.</i>`;

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

// 5. ACCIÓN: LISTAR ÚLTIMAS ÓRDENES / LIST_ORDERS
} else if (action === 'list_orders' || action === 'listar') {
  const mcpRes = await callMcp('list_orders', { start: 0, result_number: 5 });
  const rawText = mcpRes?.content?.[0]?.text || '';

  telegramText = `📦 <b>ÚLTIMAS ÓRDENES EN DROPI</b>
━━━━━━━━━━━━━━━━━━━━
Mostrando las órdenes más recientes registradas en tu cuenta:

<pre>${rawText.slice(0, 500) || 'No hay órdenes registradas aún.'}</pre>

🔗 <a href="https://app.dropi.co/orders">Abrir Dropi Orders</a>`;
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
  chatId,
  threadId,
  replyToId,
  telegramText,
  htmlResponse: telegramText
};
