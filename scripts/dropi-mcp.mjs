/**
 * Dropi MCP Client Library
 * Conecta con el servidor oficial MCP de Dropi (https://mcp.dropi.co/mcp)
 * usando el protocolo Streamable HTTP y el token OAuth autorizado.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const MCP_URL = 'https://mcp.dropi.co/mcp';
const TOKEN_URL = 'https://integrations.dropi.co/oauth/token';
const CLIENT_ID = 'mcp-cli-proxy-fe1f8c7f';

/**
 * Obtiene el token de acceso actual o lo refresca si es necesario
 */
export async function getDropiTokens() {
  // 1. Si están en variables de entorno, usarlas
  if (process.env.DROPI_ACCESS_TOKEN) {
    return {
      access_token: process.env.DROPI_ACCESS_TOKEN,
      refresh_token: process.env.DROPI_REFRESH_TOKEN,
    };
  }

  // 2. Leer desde el almacén local de mcp-auth
  try {
    const authDir = path.join(os.homedir(), '.mcp-auth', 'mcp-remote-v1');
    if (fs.existsSync(authDir)) {
      const files = fs.readdirSync(authDir);
      const tokenFile = files.find((f) => f.endsWith('_tokens.json'));
      if (tokenFile) {
        const fullPath = path.join(authDir, tokenFile);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

        // Si faltan menos de 60 segundos para expirar, refrescar
        const now = Date.now();
        if (data.expires_at && data.expires_at - now < 60000 && data.refresh_token) {
          const refreshed = await refreshDropiToken(data.refresh_token);
          if (refreshed.access_token) {
            data.access_token = refreshed.access_token;
            if (refreshed.refresh_token) data.refresh_token = refreshed.refresh_token;
            data.expires_at = now + (refreshed.expires_in || 3600) * 1000;
            fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
          }
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('[Dropi MCP] Error leyendo tokens locales:', err.message);
  }

  throw new Error('No se encontraron tokens de Dropi MCP. Ejecuta la autorización previa.');
}

export async function refreshDropiToken(refreshToken) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });
  return await res.json();
}

/**
 * Invoca una herramienta en el servidor MCP de Dropi mediante Streamable HTTP
 */
export async function callDropiTool(toolName, args = {}) {
  const tokens = await getDropiTokens();
  const bearerToken = tokens.access_token;

  // 1. Inicializar sesión Streamable HTTP
  const initRes = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'antigravity-dropi-client', version: '1.0.0' },
      },
    }),
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`Fallo inicialización MCP Dropi (${initRes.status}): ${errText}`);
  }

  const sessionId = initRes.headers.get('mcp-session-id');

  // 2. Enviar notificación initialized
  await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      ...(sessionId ? { 'mcp-session-id': sessionId } : {}),
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    }),
  });

  // 3. Ejecutar la herramienta deseada
  const toolRes = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      ...(sessionId ? { 'mcp-session-id': sessionId } : {}),
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  const rawText = await toolRes.text();

  // El endpoint responde en formato SSE: "event: message\ndata: {json}"
  const lines = rawText.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const payload = JSON.parse(line.slice(6));
      if (payload.error) {
        throw new Error(payload.error.message || JSON.stringify(payload.error));
      }
      return payload.result;
    }
  }

  throw new Error(`Respuesta MCP inesperada: ${rawText.slice(0, 300)}`);
}

/**
 * Consulta la huella digital del comprador por teléfono
 */
export async function getCustomerRiskProfile(phone) {
  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  try {
    const result = await callDropiTool('get_customer_fingerprint_profile', { phone: cleanPhone });
    const text = result?.content?.[0]?.text || '';
    
    // Parsear respuesta texto a objeto
    const profile = {
      buyer_type: 'No determinado',
      risk_label: 'Sin evaluar',
      delivery_probability: 0,
      return_probability: 0,
      raw: text,
    };

    text.split('\n').forEach((l) => {
      const [k, v] = l.split(':').map((s) => s.trim());
      if (k === 'buyer_type') profile.buyer_type = v;
      if (k === 'risk_label') profile.risk_label = v;
      if (k === 'delivery_probability') profile.delivery_probability = Number(v) || 0;
      if (k === 'return_probability') profile.return_probability = Number(v) || 0;
    });

    return profile;
  } catch (err) {
    console.warn(`[Dropi MCP] No se pudo obtener huella para ${cleanPhone}:`, err.message);
    return null;
  }
}

/**
 * Busca y normaliza una ciudad en Dropi
 */
export async function resolveDropiCity(departmentName, cityName) {
  const cleanCity = cityName.trim();
  const result = await callDropiTool('search_cities', { name: cleanCity });
  const text = result?.content?.[0]?.text || '';
  
  // Extraer líneas de items
  const lines = text.split('\n').filter((l) => l.trim().match(/^\d+,/));
  if (lines.length === 0) {
    return { name: cleanCity, id: null };
  }

  // Si hay más de una, intentar buscar la que coincida o tenga sufijo
  const deptNorm = departmentName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let chosen = lines[0];

  for (const l of lines) {
    if (deptNorm.includes('quindio') && l.includes('(Q)')) {
      chosen = l;
      break;
    }
    if (deptNorm.includes('valle') && l.includes('(V)')) {
      chosen = l;
      break;
    }
    if (deptNorm.includes('antioquia') && l.includes('(A)')) {
      chosen = l;
      break;
    }
  }

  // Parsear formato: id,department_id,name,cod_dane,zip_code
  const parts = chosen.split(',');
  const id = Number(parts[0]);
  const name = parts[2].replace(/"/g, '').trim();

  return { id, name };
}

/**
 * Crea una orden de venta en Dropi contraentrega
 */
export async function createDropiOrder({
  orderId,
  customer,
  productPrice,
  quantity = 1,
  productId = 2289560,
  notes = '',
}) {
  const phone = String(customer.celular || customer.phone).replace(/\D/g, '').slice(-10);
  const cityInfo = await resolveDropiCity(customer.departamento, customer.ciudad);

  const dropiState = customer.departamento.toUpperCase().trim();
  const dropiCity = cityInfo.name || customer.ciudad.toUpperCase().trim();

  const unitPrice = Math.round(productPrice / quantity);

  const payload = {
    name: customer.primerNombre || customer.nombre || customer.nombreCompleto.split(' ')[0],
    surname: customer.apellidos || customer.apellido || customer.nombreCompleto.split(' ').slice(1).join(' ') || 'Cliente',
    dir: customer.direccion || customer.dir,
    state: dropiState,
    city: dropiCity,
    phone: phone,
    rate_type: 'CON RECAUDO',
    notes: notes || customer.indicaciones || '',
    shop_order_id: orderId,
    products: [
      {
        id: productId,
        price: unitPrice,
        quantity: quantity,
      },
    ],
  };

  console.log(`[Dropi MCP] Creando orden para ${orderId} (Producto ${productId}, Total: $${productPrice})...`);
  const result = await callDropiTool('create_order', payload);
  return result;
}
