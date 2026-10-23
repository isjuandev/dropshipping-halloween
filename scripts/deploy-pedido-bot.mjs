import fs from 'node:fs';

const N8N_URL = 'https://n8n.nexobite.com';
const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNzA3MzU0Mi03OWIzLTQ3ZjYtYjAwZi1iYmQ1OTY1YzUyYWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMzU4ZDE2NzEtZDcyYy00ZGM4LWJkMTQtYjUyOTBiOWQ1ZGZiIiwiaWF0IjoxNzkwNzA2Nzk5fQ.pziK1NJ7Ps4HpGjxyrkL0q8vg0QiF5O5fy7Ryqkst1M';
const WORKFLOW_ID = 'O7f8JIf32lv3Uipl';

async function updatePedidoBot() {
  const getRes = await fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': N8N_KEY }
  });
  const data = await getRes.json();
  const wf = data.data || data;

  // 1. Actualizar nodo Validar y normalizar
  const nodeNormalizar = wf.nodes.find((n) => n.id === 'node-validar-normalizar');
  if (nodeNormalizar) {
    nodeNormalizar.parameters.jsCode = `const item = $input.item.json.body || $input.item.json;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const hasPedidoId = Boolean(item.pedidoId);
const hasProducto = Boolean(item.producto && item.producto.nombre && typeof item.producto.total === 'number');
const cliente = item.cliente || {};
const hasCliente = Boolean(cliente.nombreCompleto && cliente.celular && cliente.departamento && cliente.ciudad && cliente.direccion);
const hasConsentimiento = item.consentimiento === true;

const antispam = item.antispam || {};
const isSpam = Boolean(antispam.empresa && antispam.empresa.trim().length > 0) || (typeof antispam.segundos === 'number' && antispam.segundos < 4);

const partesNombre = (cliente.nombreCompleto || '').trim().split(/\\s+/);
const primerNombre = partesNombre.length > 0 ? partesNombre[0] : '';
const apellidos = partesNombre.length > 1 ? partesNombre.slice(1).join(' ') : '';

const celularLimpio = String(cliente.celular || '').replace(/\\D/g, '').slice(-10);

const totalNum = item.producto?.total || 0;
const totalFormateado = '$' + totalNum.toLocaleString('es-CO');

let fechaTexto = '';
try {
  const d = item.fecha ? new Date(item.fecha) : new Date();
  fechaTexto = d.toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'short', timeStyle: 'short' });
} catch (e) {
  fechaTexto = new Date().toISOString();
}

const msgWa = \`Hola \${cliente.nombreCompleto}, confirmamos tu pedido de \${item.producto?.nombre} (\${item.producto?.paquete}) por valor de \${totalFormateado} para entregar en \${cliente.direccion}, \${cliente.ciudad}. ¿Nos confirmas para proceder con el despacho?\`;
const waUrlEncoded = encodeURIComponent(msgWa);

const isValid = hasPedidoId && hasProducto && hasCliente && hasConsentimiento;

const hubBase = 'https://n8n.nexobite.com/webhook/dropi-hub';
const commonParams = \`id=\${encodeURIComponent(item.pedidoId || '')}&name=\${encodeURIComponent(primerNombre)}&surname=\${encodeURIComponent(apellidos)}&phone=\${celularLimpio}&state=\${encodeURIComponent(cliente.departamento || '')}&city=\${encodeURIComponent(cliente.ciudad || '')}&dir=\${encodeURIComponent(cliente.direccion || '')}&total=\${totalNum}&quantity=\${item.producto?.cantidad || 1}&notes=\${encodeURIComponent(cliente.indicaciones || '')}\`;

return {
  pedidoId: item.pedidoId || 'SIN-ID',
  isValid,
  isSpam,
  fechaTexto,
  tienda: escapeHtml(item.tienda || 'Tienda'),
  landing: item.landing || {},
  producto: {
    nombre: escapeHtml(item.producto?.nombre || ''),
    variante: escapeHtml(item.producto?.variante || ''),
    paquete: escapeHtml(item.producto?.paquete || ''),
    cantidad: item.producto?.cantidad || 1,
    extras: (item.producto?.extras || []).map(escapeHtml),
    precioUnitario: item.producto?.precioUnitario || 0,
    total: totalNum,
    totalFormateado
  },
  cliente: {
    nombreCompleto: escapeHtml(cliente.nombreCompleto || ''),
    primerNombre: escapeHtml(primerNombre),
    apellidos: escapeHtml(apellidos),
    celular: celularLimpio,
    departamento: escapeHtml(cliente.departamento || ''),
    ciudad: escapeHtml(cliente.ciudad || ''),
    codigoDane: cliente.codigoDane || '',
    direccion: escapeHtml(cliente.direccion || ''),
    indicaciones: escapeHtml(cliente.indicaciones || '')
  },
  origen: item.origen || {},
  whatsappConfirmUrl: \`https://wa.me/57\${celularLimpio}?text=\${waUrlEncoded}\`,
  huellaDropiUrl: \`\${hubBase}?action=fingerprint&\${commonParams}\`,
  cotizarFletesUrl: \`\${hubBase}?action=quote&\${commonParams}\`,
  crearDropiUrl: \`\${hubBase}?action=create_order&\${commonParams}\`,
  consultarOrdenUrl: \`\${hubBase}?action=get_order&\${commonParams}\`,
  ultimasOrdenesUrl: \`\${hubBase}?action=list_orders\`
};`;
  }

  // 2. Actualizar nodo Telegram con los nuevos botones
  const nodeTelegram = wf.nodes.find((n) => n.id === 'node-notificar-telegram');
  if (nodeTelegram) {
    nodeTelegram.parameters.replyMarkup = 'inlineKeyboard';
    nodeTelegram.parameters.inlineKeyboard = {
      rows: [
        {
          row: {
            buttons: [
              {
                text: '💬 WhatsApp',
                additionalFields: {
                  url: '={{ $json.whatsappConfirmUrl }}'
                }
              },
              {
                text: '🛡️ Huella Cliente',
                additionalFields: {
                  url: '={{ $json.huellaDropiUrl }}'
                }
              }
            ]
          }
        },
        {
          row: {
            buttons: [
              {
                text: '🚚 Cotizar Fletes',
                additionalFields: {
                  url: '={{ $json.cotizarFletesUrl }}'
                }
              },
              {
                text: '=⚡ Crear en Dropi ({{ $json.producto.totalFormateado }})',
                additionalFields: {
                  url: '={{ $json.crearDropiUrl }}'
                }
              }
            ]
          }
        },
        {
          row: {
            buttons: [
              {
                text: '🔍 Consultar Orden',
                additionalFields: {
                  url: '={{ $json.consultarOrdenUrl }}'
                }
              },
              {
                text: '📦 Últimas Órdenes',
                additionalFields: {
                  url: '={{ $json.ultimasOrdenesUrl }}'
                }
              }
            ]
          }
        }
      ]
    };
  }

  const putRes = await fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: wf.name,
      nodes: wf.nodes,
      connections: wf.connections,
      settings: wf.settings
    })
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`Error en PUT: ${errText}`);
  }

  console.log('Workflow Pedido - Bot actualizado con éxito!');

  await fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}/deactivate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': N8N_KEY }
  });
  await fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}/activate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': N8N_KEY }
  });

  console.log('Workflow Pedido - Bot reactivado!');
}

updatePedidoBot().catch(console.error);
