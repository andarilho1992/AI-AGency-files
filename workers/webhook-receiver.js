/**
 * Cloudflare Worker — Webhook Receiver
 * Deploy: npx wrangler deploy workers/webhook-receiver.js --name webhook-receiver
 *
 * Handles webhooks from: Stripe, HubSpot, n8n, Typeform, Evolution API
 * Routes each to appropriate handler, logs to KV, forwards to n8n if configured
 */

const N8N_WEBHOOK_URL = "https://your-n8n.cloud/webhook/inbound"; // replace with real URL

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === "/health") {
      return json({ status: "ok", timestamp: new Date().toISOString() });
    }

    // Only accept POST
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const source = detectSource(path, request.headers);
    const payload = { source, path, body, receivedAt: new Date().toISOString() };

    // Log to KV (if configured)
    if (env.WEBHOOK_LOG) {
      const key = `${source}-${Date.now()}`;
      await env.WEBHOOK_LOG.put(key, JSON.stringify(payload), { expirationTtl: 604800 }); // 7 days
    }

    // Route handlers
    switch (source) {
      case "stripe":
        return handleStripe(body, env);
      case "evolution":
        return handleEvolution(body, env);
      case "typeform":
        return handleTypeform(body, env);
      case "n8n":
        return handleN8n(body, env);
      default:
        // Forward everything else to n8n
        await forwardToN8n(payload);
        return json({ status: "received", source });
    }
  }
};

function detectSource(path, headers) {
  if (path.includes("stripe")) return "stripe";
  if (path.includes("evolution") || path.includes("whatsapp")) return "evolution";
  if (path.includes("typeform")) return "typeform";
  if (path.includes("n8n")) return "n8n";
  if (headers.get("user-agent")?.includes("Stripe")) return "stripe";
  return "unknown";
}

async function handleStripe(body, env) {
  const event = body.type;
  if (event === "payment_intent.succeeded") {
    await forwardToN8n({ trigger: "payment_received", data: body.data.object });
  }
  return json({ received: true });
}

async function handleEvolution(body, env) {
  // WhatsApp message from Evolution API
  const message = body?.data?.message?.conversation || body?.data?.message?.extendedTextMessage?.text;
  const from = body?.data?.key?.remoteJid;
  if (message && from) {
    await forwardToN8n({ trigger: "whatsapp_message", from, message });
  }
  return json({ received: true });
}

async function handleTypeform(body, env) {
  const answers = body?.form_response?.answers || [];
  await forwardToN8n({ trigger: "form_submission", answers, submitted_at: body?.form_response?.submitted_at });
  return json({ received: true });
}

async function handleN8n(body, env) {
  // n8n calling back — just acknowledge
  return json({ status: "ok" });
}

async function forwardToN8n(payload) {
  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("n8n forward failed:", e.message);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
