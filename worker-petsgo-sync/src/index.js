const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const MAX_LOG = 20;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS }
  });
}

function authOk(req, env) {
  return req.headers.get('Authorization') === `Bearer ${env.SYNC_TOKEN}`;
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (!authOk(req, env))        return json({ ok: false, error: 'unauthorized' }, 401);

    const url   = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts[0] === 'health') return json({ ok: true });

    if (parts[0] !== 'sync' || !parts[1])
      return json({ ok: false, error: 'not_found' }, 404);

    const shopId = parts[1];

    // GET /sync/:shop_id/log
    if (req.method === 'GET' && parts[2] === 'log') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
      const rows  = await env.DB.prepare(
        'SELECT version, saved_by, saved_at, id FROM sync_log WHERE shop_id=? ORDER BY version DESC LIMIT ?'
      ).bind(shopId, limit).all();
      return json({ ok: true, entries: rows.results });
    }

    // GET /sync/:shop_id
    if (req.method === 'GET') {
      const row = await env.DB.prepare(
        'SELECT data, version, updated_at, updated_by FROM snapshots WHERE shop_id=?'
      ).bind(shopId).first();
      if (!row) return json({ ok: false, error: 'shop_not_found' }, 404);
      return json({
        ok: true,
        version:    row.version,
        updated_at: row.updated_at,
        updated_by: row.updated_by,
        data:       JSON.parse(row.data)
      });
    }

    // POST /sync/:shop_id/migrate  — cria shop sem checar versão
    if (req.method === 'POST' && parts[2] === 'migrate') {
      const body = await req.json().catch(() => ({}));
      if (!body.data) return json({ ok: false, error: 'missing_data' }, 400);
      const now = new Date().toISOString();
      await env.DB.prepare(`
        INSERT INTO snapshots (shop_id, data, version, updated_at, updated_by)
        VALUES (?, ?, 1, ?, ?)
        ON CONFLICT(shop_id) DO NOTHING
      `).bind(shopId, JSON.stringify(body.data), now, body.saved_by || 'migration').run();

      await env.DB.prepare(
        'INSERT INTO sync_log (shop_id, version, data, saved_by, saved_at, device_hint) VALUES (?,1,?,?,?,?)'
      ).bind(shopId, JSON.stringify(body.data), body.saved_by || 'migration', now, 'migrate').run();

      return json({ ok: true, version: 1, shop_id: shopId });
    }

    // POST /sync/:shop_id  — salva snapshot com controle de versão
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (!body.data) return json({ ok: false, error: 'missing_data' }, 400);

      const current       = await env.DB.prepare(
        'SELECT version, updated_by, updated_at FROM snapshots WHERE shop_id=?'
      ).bind(shopId).first();

      const clientVersion = body.version ?? 0;
      const serverVersion = current?.version ?? 0;
      const now           = new Date().toISOString();

      // Conflito: cliente tem versão menor que servidor (e não é force overwrite)
      if (current && clientVersion !== -1 && clientVersion < serverVersion) {
        return json({
          ok:                false,
          error:             'conflict',
          server_version:    serverVersion,
          server_updated_by: current.updated_by,
          server_updated_at: current.updated_at
        }, 409);
      }

      const newVersion = serverVersion + 1;
      const dataStr    = JSON.stringify(body.data);

      if (current) {
        await env.DB.prepare(
          'UPDATE snapshots SET data=?, version=?, updated_at=?, updated_by=? WHERE shop_id=?'
        ).bind(dataStr, newVersion, now, body.saved_by || '', shopId).run();
      } else {
        await env.DB.prepare(
          'INSERT INTO snapshots (shop_id, data, version, updated_at, updated_by) VALUES (?,?,?,?,?)'
        ).bind(shopId, dataStr, newVersion, now, body.saved_by || '').run();
      }

      // Log + limpeza de entradas antigas
      await env.DB.prepare(
        'INSERT INTO sync_log (shop_id, version, data, saved_by, saved_at, device_hint) VALUES (?,?,?,?,?,?)'
      ).bind(shopId, newVersion, dataStr, body.saved_by || '', now, (body.device_hint || '').slice(0, 100)).run();

      await env.DB.prepare(`
        DELETE FROM sync_log WHERE shop_id=? AND id NOT IN (
          SELECT id FROM sync_log WHERE shop_id=? ORDER BY version DESC LIMIT ?
        )
      `).bind(shopId, shopId, MAX_LOG).run();

      return json({ ok: true, version: newVersion, updated_at: now });
    }

    return json({ ok: false, error: 'method_not_allowed' }, 405);
  }
};
