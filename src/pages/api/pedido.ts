export const prerender = false;

import type { APIRoute } from 'astro';
import { pedidoPayloadSchema } from '../../lib/pedido-schema';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const rawBody = await request.json().catch(() => null);

    if (!rawBody) {
      return new Response(
        JSON.stringify({ ok: false, error: 'cuerpo_vacio' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validación estricta con Zod
    const validation = pedidoPayloadSchema.safeParse(rawBody);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'datos_invalidos',
          detalles: validation.error.flatten(),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = validation.data;

    // Filtro antispam: si llenó el honeypot o tardó menos de 4s, responder 200 silencioso
    if (payload.antispam.empresa.trim() !== '' || payload.antispam.segundos < 4) {
      console.warn(`[AntiSpam] Pedido ${payload.pedidoId} descartado silenciosamente (empresa="${payload.antispam.empresa}", segundos=${payload.antispam.segundos})`);
      return new Response(
        JSON.stringify({ ok: true, pedidoId: payload.pedidoId, spam: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Capturar IP y User Agent
    const ip =
      clientAddress ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('cf-connecting-ip') ||
      '';
    const userAgent = request.headers.get('user-agent') || '';

    const enrichedPayload = {
      ...payload,
      meta: {
        ip,
        userAgent,
      },
    };

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!n8nWebhookUrl) {
      console.warn(
        `[Proxy Pedido] N8N_WEBHOOK_URL no está configurada en el entorno. Pedido ${payload.pedidoId} simulado como exitoso.`
      );
      return new Response(
        JSON.stringify({ ok: true, pedidoId: payload.pedidoId }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Reenviar al webhook de n8n con timeout de 12s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (n8nWebhookSecret) {
      headers['X-Webhook-Secret'] = n8nWebhookSecret;
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(enrichedPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!n8nResponse.ok) {
      console.error(
        `[Proxy Pedido] Error webhook n8n: ${n8nResponse.status} ${n8nResponse.statusText}`
      );
      return new Response(
        JSON.stringify({ ok: false, error: 'fallo_n8n' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, pedidoId: payload.pedidoId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[Proxy Pedido] Error procesando petición:', err);
    return new Response(
      JSON.stringify({ ok: false, error: 'error_interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
