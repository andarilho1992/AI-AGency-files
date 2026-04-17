// ── GitHub API as database ─────────────────────────────────────
// Uses a private GitHub repo as persistent JSON storage.
// Each file is read/written via the Contents API.
// Rate limit: 5,000 req/hour — more than enough.

function b64encode(str) {
  // TextEncoder for proper UTF-8 / emoji support
  const bytes = new TextEncoder().encode(str);
  let binary  = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

function b64decode(b64) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes  = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function ghHeaders(env) {
  return {
    'Authorization': `token ${env.GITHUB_TOKEN}`,
    'Accept':        'application/vnd.github.v3+json',
    'User-Agent':    'andarilho-worker/1.0',
    'Content-Type':  'application/json',
  };
}

function ghUrl(env, filePath) {
  return `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${filePath}`;
}

// Returns { data, sha } — data is null if file doesn't exist yet
export async function dbRead(env, filePath) {
  const r = await fetch(ghUrl(env, filePath), { headers: ghHeaders(env) });
  if (r.status === 404) return { data: null, sha: null };
  if (!r.ok) throw new Error(`GitHub read error ${r.status}: ${await r.text()}`);
  const json = await r.json();
  return {
    data: JSON.parse(b64decode(json.content)),
    sha:  json.sha,
  };
}

// Writes data to filePath. Pass sha from dbRead to update, omit to create.
export async function dbWrite(env, filePath, data, sha = null) {
  const body = {
    message: `update ${filePath} [worker]`,
    content: b64encode(JSON.stringify(data, null, 2)),
    ...(sha && { sha }),
  };
  const r = await fetch(ghUrl(env, filePath), {
    method:  'PUT',
    headers: ghHeaders(env),
    body:    JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`GitHub write error ${r.status}: ${await r.text()}`);
  return r.json();
}

// Convenience: read → mutate → write in one call
// fn receives current data (or fallback) and returns new data
export async function dbUpdate(env, filePath, fn, fallback = []) {
  const { data, sha } = await dbRead(env, filePath);
  const current       = data ?? fallback;
  const updated       = await fn(current);
  await dbWrite(env, filePath, updated, sha);
  return updated;
}

// Shorthand helpers for leads and logs
export async function lerLeads(env) {
  const { data } = await dbRead(env, 'leads.json');
  return data ?? [];
}

export async function salvarLeads(env, leads, sha = null) {
  // If sha not passed, fetch it first (needed for update)
  if (!sha) {
    const current = await dbRead(env, 'leads.json');
    sha = current.sha;
  }
  await dbWrite(env, 'leads.json', leads, sha);
}

export async function appendLog(env, agente, status, resumo) {
  await dbUpdate(env, 'logs.json', logs => {
    if (!logs[agente]) logs[agente] = [];
    logs[agente].unshift({ ts: new Date().toISOString(), status, resumo });
    logs[agente] = logs[agente].slice(0, 100);
    return logs;
  }, {});
}
