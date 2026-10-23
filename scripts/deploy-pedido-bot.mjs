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

  // 1. Actualizar nodo Telegram con botones NATIVOS callback_data
  const nodeTelegram = wf.nodes.find((n) => n.id === 'node-enviar-telegram');
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
                  callback_data: '={{ "act:fp:" + $json.pedidoId }}'
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
                  callback_data: '={{ "act:qt:" + $json.pedidoId }}'
                }
              },
              {
                text: '=⚡ Crear en Dropi ({{ $json.producto.totalFormateado }})',
                additionalFields: {
                  callback_data: '={{ "act:cr:" + $json.pedidoId }}'
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
                  callback_data: '={{ "act:gt:" + $json.pedidoId }}'
                }
              },
              {
                text: '📦 Últimas Órdenes',
                additionalFields: {
                  callback_data: 'act:ls'
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

  console.log('Workflow Pedido - Bot actualizado con botones nativos callback_data!');

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
