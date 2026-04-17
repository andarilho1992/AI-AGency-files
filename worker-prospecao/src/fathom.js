// ── Fathom API client ──────────────────────────────────────────
// Docs: https://developers.fathom.ai/api
// Auth: Bearer token via FATHOM_API_KEY secret

const FATHOM_BASE = 'https://api.fathom.ai/v1';

function fathomHeaders(env) {
  return {
    'Authorization': `Bearer ${env.FATHOM_API_KEY}`,
    'Content-Type':  'application/json',
  };
}

// Returns list of calls, newest first. limit = max results.
export async function listCalls(env, limit = 20) {
  const r = await fetch(`${FATHOM_BASE}/calls?limit=${limit}`, {
    headers: fathomHeaders(env),
  });
  if (!r.ok) throw new Error(`Fathom listCalls ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data.calls ?? data.data ?? data ?? [];
}

// Returns full transcript for a call as plain text lines.
export async function getTranscript(env, callId) {
  const r = await fetch(`${FATHOM_BASE}/calls/${callId}/transcript`, {
    headers: fathomHeaders(env),
  });
  if (!r.ok) throw new Error(`Fathom transcript ${r.status}: ${await r.text()}`);
  const data = await r.json();

  // Fathom returns transcript as array of { speaker, text, timestamp } objects
  const segments = data.transcript ?? data.segments ?? data ?? [];
  if (typeof segments === 'string') return segments;

  return segments
    .map(s => `[${s.speaker ?? s.speakerName ?? 'Speaker'}] ${s.text ?? s.content ?? ''}`)
    .join('\n');
}

// Returns call summary if Fathom generated one already.
export async function getCallSummary(env, callId) {
  const r = await fetch(`${FATHOM_BASE}/calls/${callId}/summary`, {
    headers: fathomHeaders(env),
  });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  const data = await r.json();
  return data.summary ?? data.content ?? null;
}
