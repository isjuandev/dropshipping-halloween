import fs from 'node:fs';

const N8N_URL = 'https://n8n.nexobite.com';
const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNzA3MzU0Mi03OWIzLTQ3ZjYtYjAwZi1iYmQ1OTY1YzUyYWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMzU4ZDE2NzEtZDcyYy00ZGM4LWJkMTQtYjUyOTBiOWQ1ZGZiIiwiaWF0IjoxNzkwNzA2Nzk5fQ.pziK1NJ7Ps4HpGjxyrkL0q8vg0QiF5O5fy7Ryqkst1M';

const codeJs = fs.readFileSync('./scripts/dropi-hub-n8n-code.js', 'utf8');

const workflowPayload = {
  name: 'ViralyShop - Dropi Hub',
  nodes: [
    {
      parameters: {
        updates: ['callback_query'],
        additionalFields: {}
      },
      id: 'node-telegram-trigger',
      name: 'Telegram Callback Trigger',
      type: 'n8n-nodes-base.telegramTrigger',
      typeVersion: 1.2,
      position: [100, 160],
      webhookId: 'dropi-tg-trigger-0001',
      credentials: {
        telegramApi: {
          id: 'jd9tP3LVEuDaEf6l',
          name: 'Telegram ViralyShop'
        }
      }
    },
    {
      parameters: {
        resource: 'callback',
        operation: 'answerQuery',
        queryId: '={{ $json.callback_query.id }}',
        additionalFields: {
          text: '⚡ Consultando Dropi...',
          showAlert: false
        }
      },
      id: 'node-answer-callback',
      name: 'Responder Callback Telegram',
      type: 'n8n-nodes-base.telegram',
      typeVersion: 1.2,
      position: [400, 100],
      credentials: {
        telegramApi: {
          id: 'jd9tP3LVEuDaEf6l',
          name: 'Telegram ViralyShop'
        }
      }
    },
    {
      parameters: {
        httpMethod: 'GET',
        path: 'dropi-hub',
        responseMode: 'responseNode',
        options: {
          allowedOrigins: '*'
        }
      },
      id: 'node-webhook-dropi-hub',
      name: 'Webhook Dropi Hub',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 340],
      webhookId: 'e8d1a3f0-45bc-4e12-8901-dropihub0001'
    },
    {
      parameters: {
        httpMethod: 'GET',
        path: 'crear-orden-dropi',
        responseMode: 'responseNode',
        options: {
          allowedOrigins: '*'
        }
      },
      id: 'node-webhook-crear-legacy',
      name: 'Webhook Crear Legacy',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 500],
      webhookId: 'e8d1a3f0-45bc-4e12-8901-crearlegacy01'
    },
    {
      parameters: {
        jsCode: codeJs
      },
      id: 'node-dropi-hub-code',
      name: 'Dropi Hub Router',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [460, 300]
    },
    {
      parameters: {
        chatId: '={{ $json.chatId || "-1003981686470" }}',
        text: '={{ $json.telegramText }}',
        additionalFields: {
          disable_web_page_preview: true,
          parse_mode: 'HTML',
          message_thread_id: '={{ $json.threadId || 46 }}',
          reply_to_message_id: '={{ $json.replyToId ? $json.replyToId : undefined }}',
          appendAttribution: false
        }
      },
      id: 'node-notificar-telegram',
      name: 'Notificar a Telegram',
      type: 'n8n-nodes-base.telegram',
      typeVersion: 1.2,
      position: [740, 200],
      credentials: {
        telegramApi: {
          id: 'jd9tP3LVEuDaEf6l',
          name: 'Telegram ViralyShop'
        }
      }
    },
    {
      parameters: {
        respondWith: 'text',
        responseBody: '={{ $json.htmlResponse }}',
        options: {
          responseCode: 200,
          responseHeaders: {
            entries: [
              {
                name: 'Content-Type',
                value: 'text/html; charset=utf-8'
              }
            ]
          }
        }
      },
      id: 'node-responder-html',
      name: 'Responder HTML al Navegador',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [740, 400]
    }
  ],
  connections: {
    'Telegram Callback Trigger': {
      main: [
        [
          {
            node: 'Responder Callback Telegram',
            type: 'main',
            index: 0
          },
          {
            node: 'Dropi Hub Router',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Webhook Dropi Hub': {
      main: [
        [
          {
            node: 'Dropi Hub Router',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Webhook Crear Legacy': {
      main: [
        [
          {
            node: 'Dropi Hub Router',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Dropi Hub Router': {
      main: [
        [
          {
            node: 'Notificar a Telegram',
            type: 'main',
            index: 0
          },
          {
            node: 'Responder HTML al Navegador',
            type: 'main',
            index: 0
          }
        ]
      ]
    }
  },
  settings: {
    executionOrder: 'v1'
  }
};

async function updateWorkflow() {
  const res = await fetch(`${N8N_URL}/api/v1/workflows/mScV5OoZ5s9N89aO`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workflowPayload)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Error actualizando: ${JSON.stringify(json)}`);
  }
  console.log('Workflow ViralyShop - Dropi Hub actualizado con éxito! ID:', json.id);

  await fetch(`${N8N_URL}/api/v1/workflows/mScV5OoZ5s9N89aO/deactivate`, { method: 'POST', headers: { 'X-N8N-API-KEY': N8N_KEY } });
  const actRes = await fetch(`${N8N_URL}/api/v1/workflows/mScV5OoZ5s9N89aO/activate`, { method: 'POST', headers: { 'X-N8N-API-KEY': N8N_KEY } });
  console.log('Activado status:', actRes.status);
}

updateWorkflow().catch(console.error);
