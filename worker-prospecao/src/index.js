// ═══════════════════════════════════════════════════════════════
//  WORKER DE PROSPECÇÃO — Andarilho Digital
//  Cloudflare Workers + GitHub como banco de dados
//
//  Deploy:  npm run deploy
//  Dev:     npm run dev
//  Logs:    npm run logs
//
//  Secrets (wrangler secret put <NAME>):
//    SYNC_SECRET           autenticação dos endpoints
//    ANTHROPIC_API_KEY     mensagens com Claude (opcional)
//    GOOGLE_PLACES_API_KEY busca real Google Maps (opcional)
//    EVOLUTION_API_URL     WhatsApp real (opcional)
//    EVOLUTION_API_KEY     autenticação Evolution
//    EVOLUTION_INSTANCE    instância WA (padrão: andarilho)
//    GITHUB_TOKEN          Personal Access Token (repo:read+write)
//    GH_OWNER              seu username no GitHub
//    GH_REPO               repo privado de dados (ex: andarilho-data)
//    FATHOM_API_KEY        Meeting intel — Fathom API key
// ═══════════════════════════════════════════════════════════════

import { lerLeads, salvarLeads, appendLog, dbRead, dbUpdate } from './db.js';
import { listCalls, getTranscript, getCallSummary } from './fathom.js';

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
const sleep  = ms => new Promise(r => setTimeout(r, ms));
const uid    = ()  => Date.now().toString(36) + Math.random().toString(36).slice(2);
const CORS   = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-sync-secret',
};

const FRANQUIAS = ['petz','cobasi','petlove','botoclinic','royal face','hof clinic','face doctor','botocenter','botoesthetic'];
const ehFranquia = nome => FRANQUIAS.some(f => nome.toLowerCase().includes(f));

const BUSCAS_PADRAO = [
  { nicho: 'clínica',  query: 'clínica botox harmonização facial', cidade: 'Moema São Paulo' },
  { nicho: 'clínica',  query: 'clínica harmonização facial',       cidade: 'Batel Curitiba' },
  { nicho: 'clínica',  query: 'clínica botox harmonização facial', cidade: 'Moinhos de Vento Porto Alegre' },
  { nicho: 'pet shop', query: 'pet shop banho tosa',               cidade: 'Moema São Paulo' },
  { nicho: 'pet shop', query: 'pet shop banho tosa',               cidade: 'Batel Curitiba' },
  { nicho: 'pet shop', query: 'pet shop banho tosa',               cidade: 'Porto Alegre' },
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// ─────────────────────────────────────────────────────────────
// MOCK DATA (sem GOOGLE_PLACES_API_KEY)
// ─────────────────────────────────────────────────────────────
const MOCK_LEADS = {
  'clínica': [
    { nome: 'Clínica Dra. Ana Lima',       site: 'clinicaanalima.com.br',   instagram: '@clinica.analima',       telefone: '(11) 9 9123-4567', reviews: 38, rating: 4.7 },
    { nome: 'Instituto Facial Premium',    site: '',                         instagram: '@institutofacialpremium', telefone: '',               reviews: 12, rating: 4.5 },
    { nome: 'Centro Estético Bellaforma',  site: 'bellaforma.com.br',       instagram: '@bellaforma.estetica',   telefone: '(41) 9 8765-4321', reviews: 67, rating: 4.8 },
  ],
  'pet shop': [
    { nome: 'PetCare Banho & Tosa',  site: 'petcarebatosa.com.br', instagram: '@petcarebatosa',  telefone: '(11) 9 9876-5432', reviews: 22, rating: 4.6 },
    { nome: 'Mundo Animal Pet Shop', site: '',                      instagram: '@mundoanimalpet', telefone: '',               reviews: 8,  rating: 4.3 },
    { nome: 'VetAmigo Petshop',      site: 'vetamigo.com.br',      instagram: '@vetamigo',       telefone: '(51) 9 8234-5678', reviews: 45, rating: 4.9 },
  ],
};

function gerarMockLeads(nicho, cidade) {
  const base = MOCK_LEADS[nicho] || MOCK_LEADS['clínica'];
  return base.map(b => ({
    place_id: uid(), name: b.nome, _site: b.site, _instagram: b.instagram,
    _telefone: b.telefone, rating: b.rating, user_ratings_total: b.reviews,
    formatted_address: `${cidade}, Brasil`, _mock: true,
  }));
}

// ─────────────────────────────────────────────────────────────
// GOOGLE PLACES
// ─────────────────────────────────────────────────────────────
async function buscarPlaces(env, query, cidade) {
  if (!env.GOOGLE_PLACES_API_KEY) {
    console.log(`[SIMULADO] Buscando "${query}" em ${cidade}`);
    return gerarMockLeads(query.includes('pet') ? 'pet shop' : 'clínica', cidade);
  }
  const q = encodeURIComponent(`${query} em ${cidade}`);
  const r = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&language=pt-BR&region=br&key=${env.GOOGLE_PLACES_API_KEY}`);
  const d = await r.json();
  return d.results || [];
}

async function buscarDetalhes(env, placeId) {
  if (!env.GOOGLE_PLACES_API_KEY) return {};
  const fields = 'name,formatted_phone_number,website,rating,user_ratings_total,formatted_address';
  const r = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=pt-BR&key=${env.GOOGLE_PLACES_API_KEY}`);
  const d = await r.json();
  return d.result || {};
}

// ─────────────────────────────────────────────────────────────
// SCRAPING
// ─────────────────────────────────────────────────────────────
const HEADERS_BROWSER = {
  'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept':          'text/html,application/xhtml+xml,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9',
};

async function rasparSite(url) {
  const vazio = { telefone: '', instagram: '', whatsappDireto: '' };
  if (!url) return vazio;
  try {
    const ctrl = new AbortController();
    const to   = setTimeout(() => ctrl.abort(), 8000);
    const r    = await fetch(url, { signal: ctrl.signal, headers: HEADERS_BROWSER });
    clearTimeout(to);
    if (!r.ok) return vazio;
    const html = await r.text();
    const telMatch   = html.match(/\(?\d{2}\)?\s?(?:9\d{4}|\d{4,5})[-.\s]?\d{4}(?!\d)/);
    const instaMatch = html.match(/instagram\.com\/(?!p\/|reel\/|explore\/|accounts\/)([a-zA-Z0-9_.]{2,})/);
    const waMatch    = html.match(/wa\.me\/(55\d{10,11})/);
    return {
      telefone:       telMatch   ? telMatch[0].trim()                      : '',
      instagram:      instaMatch ? '@' + instaMatch[1].replace(/\/$/, '')  : '',
      whatsappDireto: waMatch    ? waMatch[1]                               : '',
    };
  } catch { return vazio; }
}

// ─────────────────────────────────────────────────────────────
// PRESENÇA DIGITAL
// ─────────────────────────────────────────────────────────────
function compilarPresenca(lead, site) {
  const handle    = site.instagram || lead.instagram || '';
  const melhorTel = lead.telefone  || site.telefone  || '';
  const melhorWA  = lead.whatsapp  || site.whatsappDireto
    || (site.telefone  ? site.telefone.replace(/\D/g,'').replace(/^0/,'55')  : '')
    || (lead.telefone  ? lead.telefone.replace(/\D/g,'').replace(/^0/,'55') : '');

  const pontos = [!!lead.site, !!handle, !!melhorTel, lead.reviews > 20].filter(Boolean).length;
  const score  = pontos >= 3 ? 'forte' : pontos >= 2 ? 'média' : 'fraca';

  let descContato = 'contato só via DM';
  if      (lead.telefone)          descContato = `telefone Google: ${lead.telefone}`;
  else if (site.whatsappDireto)    descContato = `WhatsApp no site: ${site.whatsappDireto}`;
  else if (site.telefone)          descContato = `telefone no site: ${site.telefone}`;
  else if (handle)                 descContato = 'contato só via Instagram DM';

  let descGoogle = 'sem avaliações';
  if      (lead.reviews > 50)  descGoogle = `${lead.rating}⭐ ${lead.reviews} avaliações`;
  else if (lead.reviews > 15)  descGoogle = `${lead.rating}⭐ ${lead.reviews} avaliações (poucas)`;
  else if (lead.reviews > 0)   descGoogle = `${lead.rating}⭐ ${lead.reviews} avaliações — oportunidade`;

  return {
    score,
    canalSugerido:   melhorTel ? 'whatsapp' : handle ? 'instagram' : 'instagram',
    melhorWhatsApp:  melhorWA,
    melhorTelefone:  melhorTel,
    instagramHandle: handle,
    resumo: [
      lead.site ? `site (${lead.site})` : 'sem site',
      handle    || 'sem Instagram',
      descContato,
      descGoogle,
    ].join(' | '),
  };
}

// ─────────────────────────────────────────────────────────────
// CLAUDE — raw fetch, sem SDK (compatível com Workers)
// ─────────────────────────────────────────────────────────────
const MENSAGEM_TEMPLATE = {
  'clínica':  (nome, p) => `Oi! Vi o trabalho d${p.instagramHandle ? `a ${nome}` : 'e vocês'} — presença digital ${p.score}. Curiosidade: como estão gerenciando as confirmações de agenda? Ainda é tudo manual no WhatsApp?`,
  'pet shop': (nome)    => `Oi! Passei pelo ${nome} e fiquei curioso — o agendamento de banho ainda chega tudo pelo WhatsApp na mão? Pergunto porque é exatamente onde as petshops perdem mais cliente sem perceber.`,
};

async function gerarMensagem(env, lead, nicho, presenca) {
  const fallback = () => {
    const fn = MENSAGEM_TEMPLATE[nicho] || MENSAGEM_TEMPLATE['clínica'];
    return { dor: 'gestão manual de agenda', canal: presenca.canalSugerido, mensagem: fn(lead.nome, presenca) };
  };

  if (!env.ANTHROPIC_API_KEY) return fallback();

  const prompt = `Você é especialista em vendas B2B para agência de automação.
NEGÓCIO: ${lead.nome} | NICHO: ${nicho} | CIDADE: ${lead.cidade}
PRESENÇA DIGITAL: ${presenca.resumo}
CANAL: ${presenca.canalSugerido}

Gere mensagem de primeiro contato:
- Natural, máximo 4 linhas
- Baseada no que você "observou" (presença digital, falta de reviews, etc.)
- SEM mencionar IA, automação ou tecnologia diretamente
- Termine com uma pergunta aberta
- Tom: ${presenca.canalSugerido === 'instagram' ? 'casual' : 'direto mas humano'}

Responda APENAS JSON: {"dor":"dor em 1 frase","canal":"${presenca.canalSugerido}","mensagem":"texto"}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'x-api-key':         env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });
    if (!r.ok) return fallback();
    const d     = await r.json();
    const txt   = d.content?.[0]?.text || '';
    const match = txt.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch { /* fallback */ }

  return fallback();
}

async function gerarFollowUp(env, mensagemOriginal, diasSemResposta) {
  if (!env.ANTHROPIC_API_KEY) {
    return `Oi! Só passando pra deixar meu contato caso faça sentido depois. Qualquer coisa é só falar 👋`;
  }
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'x-api-key':         env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages:   [{
          role:    'user',
          content: `Escreva um follow-up curto (2 linhas) para alguém que não respondeu há ${diasSemResposta} dias.\nTom: leve, sem cobrar, sem "oi sumido".\nPrimeira mensagem: "${mensagemOriginal}"\nResponda APENAS o texto do follow-up.`,
        }],
      }),
    });
    if (!r.ok) throw new Error();
    const d = await r.json();
    return d.content?.[0]?.text?.trim() || '';
  } catch {
    return `Oi! Só passando pra deixar meu contato caso faça sentido depois. Qualquer coisa é só falar 👋`;
  }
}

// ─────────────────────────────────────────────────────────────
// WHATSAPP — Evolution API
// ─────────────────────────────────────────────────────────────
async function enviarWhatsApp(env, numero, mensagem, leadNome = '') {
  if (!env.EVOLUTION_API_URL || !env.EVOLUTION_API_KEY) {
    console.log(`[WA SIMULADO → ${numero || leadNome}]\n${mensagem}`);
    return { simulado: true };
  }
  const inst = env.EVOLUTION_INSTANCE || 'andarilho';
  try {
    const r = await fetch(`${env.EVOLUTION_API_URL}/message/sendText/${inst}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': env.EVOLUTION_API_KEY },
      body:    JSON.stringify({ number: numero, text: mensagem }),
    });
    return r.json();
  } catch (e) {
    console.error('WA erro:', e.message);
    return { erro: e.message };
  }
}

// ─────────────────────────────────────────────────────────────
// AGENTE 1 — PROSPECTAR (max 3 buscas por run para caber no Worker)
// ─────────────────────────────────────────────────────────────
async function agentProspectar(env, buscas = BUSCAS_PADRAO) {
  console.log('[AGENTE 1] Prospecção iniciada...');
  const leads     = await lerLeads(env);
  const existentes = new Set(leads.map(l => l.nome?.toLowerCase()));
  const novos     = [];

  // Workers têm limite de tempo — processa até 3 buscas por run
  for (const busca of buscas.slice(0, 3)) {
    console.log(`  → ${busca.query} em ${busca.cidade}`);
    const resultados = await buscarPlaces(env, busca.query, busca.cidade);

    for (const lugar of resultados.slice(0, 5)) {
      if (ehFranquia(lugar.name || '')) continue;
      if (existentes.has((lugar.name || '').toLowerCase())) continue;

      await sleep(200);
      const detalhes = await buscarDetalhes(env, lugar.place_id);

      const lead = {
        nome:     detalhes.name                  || lugar.name       || '',
        nicho:    busca.nicho,
        cidade:   busca.cidade,
        endereco: detalhes.formatted_address     || lugar.formatted_address || '',
        telefone: detalhes.formatted_phone_number|| lugar._telefone  || '',
        site:     detalhes.website               || lugar._site      || '',
        instagram:lugar._instagram               || '',
        whatsapp: '',
        rating:   detalhes.rating                || lugar.rating     || 0,
        reviews:  detalhes.user_ratings_total    || lugar.user_ratings_total || 0,
      };

      const dadosSite = lead.site ? await rasparSite(lead.site) : { telefone:'', instagram:'', whatsappDireto:'' };
      if (dadosSite.instagram && !lead.instagram) lead.instagram = dadosSite.instagram;

      const presenca = compilarPresenca(lead, dadosSite);
      const analise  = await gerarMensagem(env, lead, busca.nicho, presenca);

      const novoLead = {
        id:              uid(),
        nome:            lead.nome,
        nicho:           lead.nicho,
        cidade:          lead.cidade,
        whatsapp:        presenca.melhorWhatsApp,
        site:            lead.site,
        instagram:       presenca.instagramHandle,
        canal:           analise.canal,
        problema:        analise.dor,
        mensagem:        analise.mensagem,
        notas:           [
          lead.telefone ? `Tel: ${lead.telefone}` : 'Sem telefone',
          `${lead.rating}⭐ (${lead.reviews} avaliações)`,
          `Presença: ${presenca.score}`,
          lead.endereco,
        ].filter(Boolean).join(' | '),
        presencaDigital: presenca.resumo,
        status:          'encontrado',
        criadoEm:        new Date().toISOString(),
        enviadoEm:       null,
        respondeuEm:     null,
        followupEm:      null,
      };

      novos.push(novoLead);
      existentes.add(lead.nome.toLowerCase());
      console.log(`  ✅ ${lead.nome} | ${presenca.score} | canal: ${analise.canal}`);
      await sleep(300);
    }
  }

  if (novos.length > 0) {
    await salvarLeads(env, [...leads, ...novos]);
    await appendLog(env, 'prospeccao', 'ok', `${novos.length} leads novos`);
    console.log(`[AGENTE 1] ${novos.length} leads adicionados.`);
  } else {
    await appendLog(env, 'prospeccao', 'skip', 'Nenhum lead novo');
    console.log('[AGENTE 1] Nenhum lead novo.');
  }

  return novos;
}

// ─────────────────────────────────────────────────────────────
// AGENTE 2 — ENVIAR LOTE
// ─────────────────────────────────────────────────────────────
async function agentEnviarLote(env, limite = 10) {
  console.log('[AGENTE 2] Envio em lote iniciado...');
  const leads     = await lerLeads(env);
  const pendentes = leads.filter(l => l.status === 'encontrado' && l.mensagem && (l.whatsapp || l.instagram)).slice(0, limite);

  if (pendentes.length === 0) {
    await appendLog(env, 'envio_lote', 'skip', 'Nenhum lead pendente');
    return 0;
  }

  let enviados = 0;
  for (const lead of pendentes) {
    if (lead.whatsapp) {
      await enviarWhatsApp(env, lead.whatsapp, lead.mensagem, lead.nome);
    } else {
      console.log(`[IG DM — ${lead.nome}]: ${lead.mensagem}`);
    }
    const idx = leads.findIndex(l => l.id === lead.id);
    if (idx !== -1) { leads[idx].status = 'contatado'; leads[idx].enviadoEm = new Date().toISOString(); }
    enviados++;
    await sleep(3000);
  }

  await salvarLeads(env, leads);
  await appendLog(env, 'envio_lote', 'ok', `${enviados} mensagens enviadas`);
  console.log(`[AGENTE 2] ${enviados} enviados.`);
  return enviados;
}

// ─────────────────────────────────────────────────────────────
// AGENTE 3 — FOLLOW-UP
// ─────────────────────────────────────────────────────────────
async function agentFollowUp(env, diasSemResposta = 4) {
  console.log('[AGENTE 3] Follow-up iniciado...');
  const leads = await lerLeads(env);
  const corte = Date.now() - diasSemResposta * 86400000;

  const alvo = leads.filter(l =>
    l.status === 'contatado' &&
    l.enviadoEm &&
    new Date(l.enviadoEm).getTime() < corte &&
    !l.followupEm
  ).slice(0, 5);

  if (alvo.length === 0) {
    await appendLog(env, 'followup', 'skip', 'Nenhum lead elegível');
    return 0;
  }

  let enviados = 0;
  for (const lead of alvo) {
    const msg = await gerarFollowUp(env, lead.mensagem, diasSemResposta);
    if (lead.whatsapp) await enviarWhatsApp(env, lead.whatsapp, msg, lead.nome);
    else console.log(`[IG Follow-up — ${lead.nome}]: ${msg}`);

    const idx = leads.findIndex(l => l.id === lead.id);
    if (idx !== -1) { leads[idx].followupEm = new Date().toISOString(); leads[idx].mensagemFollowup = msg; }
    enviados++;
    await sleep(3500);
  }

  await salvarLeads(env, leads);
  await appendLog(env, 'followup', 'ok', `${enviados} follow-ups enviados`);
  return enviados;
}

// ─────────────────────────────────────────────────────────────
// AGENTE 4 — FATHOM MEETING INTEL
// Runs daily at 18h UTC (15h BRT). Reads new Fathom calls,
// extracts client intel via Claude, saves to clients.json.
// ─────────────────────────────────────────────────────────────
async function agentFathom(env) {
  if (!env.FATHOM_API_KEY) {
    console.log('[AGENTE 4] FATHOM_API_KEY não configurada, pulando.');
    return 0;
  }
  console.log('[AGENTE 4] Lendo reuniões do Fathom...');

  const { data: existentes } = await dbRead(env, 'clients.json');
  const clientes = existentes ?? [];
  const idsProcessados = new Set(clientes.map(c => c.fathom_call_id));

  const calls = await listCalls(env, 20);
  const novas  = calls.filter(c => !idsProcessados.has(c.id ?? c.call_id));

  if (novas.length === 0) {
    await appendLog(env, 'fathom', 'skip', 'Nenhuma reunião nova');
    console.log('[AGENTE 4] Nenhuma reunião nova.');
    return 0;
  }

  let processadas = 0;
  for (const call of novas.slice(0, 5)) {
    const callId = call.id ?? call.call_id;
    try {
      const transcript = await getTranscript(env, callId);
      const fathomSummary = await getCallSummary(env, callId);

      const prompt = `You are a B2B sales assistant for Guilherme Andrade, founder of Andarilho Digital — an AI automation agency.

Meeting title: "${call.title ?? call.name ?? 'Untitled'}"
Meeting date: ${call.started_at ?? call.date ?? call.created_at ?? 'unknown'}
Fathom summary: ${fathomSummary ?? 'none'}

TRANSCRIPT:
${transcript.slice(0, 8000)}

Extract the following as JSON (no markdown, pure JSON):
{
  "client_name": "full name of the prospect/client",
  "company": "company name if mentioned",
  "role": "their job title if mentioned",
  "pain_points": ["array of specific problems they described"],
  "goals": ["what they want to achieve"],
  "action_items": ["concrete next steps agreed in the call"],
  "next_meeting": "date/time if scheduled, else null",
  "deal_status": "prospect | interested | negotiating | closed | not_a_fit",
  "deal_value": "monthly value discussed if any, else null",
  "key_insight": "one sentence: the most important thing to remember about this person",
  "follow_up_message": "a short WhatsApp message to send within 24h based on the conversation"
}`;

      let intel = null;
      if (env.ANTHROPIC_API_KEY) {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key':         env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type':      'application/json',
          },
          body: JSON.stringify({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            messages:   [{ role: 'user', content: prompt }],
          }),
        });
        if (r.ok) {
          const data = await r.json();
          const raw  = data.content?.[0]?.text ?? '{}';
          try { intel = JSON.parse(raw); } catch { intel = { raw_extract: raw }; }
        }
      }

      const entry = {
        fathom_call_id:  callId,
        call_title:      call.title ?? call.name ?? 'Untitled',
        meeting_date:    call.started_at ?? call.date ?? call.created_at ?? null,
        fathom_summary:  fathomSummary,
        ...(intel ?? {}),
        processed_at:    new Date().toISOString(),
      };

      clientes.push(entry);
      processadas++;
      console.log(`[AGENTE 4] ✅ ${entry.call_title} | ${entry.client_name ?? 'unknown'}`);
      await sleep(500);
    } catch (e) {
      console.error(`[AGENTE 4] erro em ${callId}:`, e.message);
    }
  }

  if (processadas > 0) {
    await dbUpdate(env, 'clients.json', () => clientes, []);
    await appendLog(env, 'fathom', 'ok', `${processadas} reuniões processadas`);
  }

  return processadas;
}

// ─────────────────────────────────────────────────────────────
// CRON DISPATCH
// UTC schedule → BRT = UTC-3
// ─────────────────────────────────────────────────────────────
const CRON_MAP = {
  '0 10 * * 2,5': env => agentProspectar(env), // Ter + Sex 07h BRT
  '0 13 * * 2,4': env => agentEnviarLote(env), // Ter + Qui 10h BRT
  '0 13 * * 3,6': env => agentFollowUp(env),   // Qua + Sab 10h BRT
  '0 18 * * *':   env => agentFathom(env),     // Daily 15h BRT
};

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
function checkAuth(request, env, url) {
  const secret = request.headers.get('x-sync-secret') || url.searchParams.get('secret');
  return secret === (env.SYNC_SECRET || 'andarilho-secret');
}

// ─────────────────────────────────────────────────────────────
// HANDLERS
// ─────────────────────────────────────────────────────────────
async function handleStatus(env) {
  const leads = await lerLeads(env);
  const { data: logs } = await dbRead(env, 'logs.json');
  return json({
    ok: true,
    servidor: 'Andarilho Digital — Prospecção (Cloudflare Workers)',
    agora: new Date().toISOString(),
    ferramentas: {
      googlePlaces: env.GOOGLE_PLACES_API_KEY ? '✅ configurado' : '⚠️ simulando',
      whatsapp:     env.EVOLUTION_API_URL      ? '✅ configurado' : '⚠️ simulando',
      claude:       env.ANTHROPIC_API_KEY      ? '✅ configurado' : '⚠️ usando templates',
      githubDB:     env.GITHUB_TOKEN           ? '✅ configurado' : '❌ FALTA GITHUB_TOKEN',
    },
    pipeline: {
      total:      leads.length,
      encontrado: leads.filter(l => l.status === 'encontrado').length,
      contatado:  leads.filter(l => l.status === 'contatado').length,
      respondeu:  leads.filter(l => l.status === 'respondeu').length,
      reuniao:    leads.filter(l => l.status === 'reuniao').length,
      fechado:    leads.filter(l => l.status === 'fechado').length,
      perdido:    leads.filter(l => l.status === 'perdido').length,
    },
    ultimasExecucoes: {
      prospeccao: logs?.prospeccao?.[0] || null,
      envio_lote: logs?.envio_lote?.[0] || null,
      followup:   logs?.followup?.[0]   || null,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// ROUTER + EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default {
  // ── HTTP requests ──────────────────────────────────────────
  async fetch(request, env, ctx) {
    const url    = new URL(request.url);
    const path   = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { headers: CORS });

    // Rotas públicas
    if (method === 'GET' && path === '/status') return handleStatus(env);

    // Webhook Evolution (sem auth, verificado internamente)
    if (method === 'POST' && path === '/webhook/whatsapp') {
      ctx.waitUntil((async () => {
        try {
          const evento = await request.json();
          if (evento?.event !== 'messages.upsert') return;
          const msg = evento?.data;
          if (!msg || msg.key?.fromMe) return;

          const numero = msg.key?.remoteJid?.replace('@s.whatsapp.net','').replace(/\D/g,'');
          if (!numero) return;

          const leads = await lerLeads(env);
          const lead  = leads.find(l => l.whatsapp === numero);
          if (!lead || !['contatado','encontrado'].includes(lead.status)) return;

          const idx = leads.findIndex(l => l.id === lead.id);
          leads[idx].status      = 'respondeu';
          leads[idx].respondeuEm = new Date().toISOString();
          await salvarLeads(env, leads);
          console.log(`[WEBHOOK] ${lead.nome} respondeu`);
        } catch (e) { console.error('[WEBHOOK] erro:', e); }
      })());
      return new Response('ok', { status: 200 });
    }

    // Rotas autenticadas
    if (!checkAuth(request, env, url)) return json({ erro: 'Não autorizado' }, 401);

    // GET /leads
    if (method === 'GET' && path === '/leads') {
      return json(await lerLeads(env));
    }

    // GET /logs
    if (method === 'GET' && path === '/logs') {
      const { data } = await dbRead(env, 'logs.json');
      return json(data || {});
    }

    // POST /sync — merge bidirecional com pipeline-leads.html
    if (method === 'POST' && path === '/sync') {
      const body = await request.json();
      const leadsDoCliente = body?.leads;
      if (!Array.isArray(leadsDoCliente)) return json({ erro: 'Esperado { leads: [] }' }, 400);

      const leadsServidor = await lerLeads(env);
      const idsSrv = new Set(leadsServidor.map(l => l.id));
      const idsCli = new Set(leadsDoCliente.map(l => l.id));

      const novosParaSrv = leadsDoCliente.filter(l => !idsSrv.has(l.id));
      if (novosParaSrv.length) await salvarLeads(env, [...leadsServidor, ...novosParaSrv]);

      const novosParaCli = leadsServidor.filter(l => !idsCli.has(l.id));
      const mapaStatus   = Object.fromEntries(leadsServidor.map(l => [l.id, l.status]));

      return json({ ok: true, novosParaCliente: novosParaCli, mapaStatus });
    }

    // POST /prospectar
    if (method === 'POST' && path === '/prospectar') {
      const body   = await request.json().catch(() => ({}));
      const buscas = body?.buscas || BUSCAS_PADRAO;
      ctx.waitUntil(agentProspectar(env, buscas));
      return json({ ok: true, mensagem: 'Prospecção iniciada.' });
    }

    // POST /enviar/lote
    if (method === 'POST' && path === '/enviar/lote') {
      const body  = await request.json().catch(() => ({}));
      const limite = body?.limite || 10;
      ctx.waitUntil(agentEnviarLote(env, limite));
      return json({ ok: true, mensagem: `Envio em lote iniciado (até ${limite}).` });
    }

    // POST /followup
    if (method === 'POST' && path === '/followup') {
      const body = await request.json().catch(() => ({}));
      const dias  = body?.diasSemResposta || 4;
      ctx.waitUntil(agentFollowUp(env, dias));
      return json({ ok: true, mensagem: `Follow-up iniciado (${dias}+ dias sem resposta).` });
    }

    // GET /clients — list all processed meeting intel
    if (method === 'GET' && path === '/clients') {
      const { data } = await dbRead(env, 'clients.json');
      return json(data ?? []);
    }

    // POST /fathom/sync — manually trigger Fathom agent
    if (method === 'POST' && path === '/fathom/sync') {
      ctx.waitUntil(agentFathom(env).catch(e => console.error('[FATHOM SYNC] erro:', e)));
      return json({ ok: true, mensagem: 'Fathom sync iniciado.' });
    }

    // POST /enviar/:id
    const enviarMatch = path.match(/^\/enviar\/([^/]+)$/);
    if (method === 'POST' && enviarMatch) {
      const id    = enviarMatch[1];
      const leads = await lerLeads(env);
      const lead  = leads.find(l => l.id === id);
      if (!lead) return json({ erro: 'Lead não encontrado' }, 404);

      const body     = await request.json().catch(() => ({}));
      const mensagem = body?.mensagem || lead.mensagem;
      if (!lead.whatsapp && !lead.instagram) return json({ erro: 'Lead sem contato' }, 400);

      if (lead.whatsapp) {
        const result = await enviarWhatsApp(env, lead.whatsapp, mensagem, lead.nome);
        const idx    = leads.findIndex(l => l.id === id);
        leads[idx].status    = 'contatado';
        leads[idx].enviadoEm = new Date().toISOString();
        await salvarLeads(env, leads);
        await appendLog(env, 'envio_manual', 'ok', lead.nome);
        return json({ ok: true, simulado: !!result.simulado });
      }

      return json({ ok: true, instrucao: 'Instagram DM manual', instagram: lead.instagram, mensagem });
    }

    // PATCH /leads/:id
    const patchMatch = path.match(/^\/leads\/([^/]+)$/);
    if (method === 'PATCH' && patchMatch) {
      const id    = patchMatch[1];
      const leads = await lerLeads(env);
      const idx   = leads.findIndex(l => l.id === id);
      if (idx === -1) return json({ erro: 'Lead não encontrado' }, 404);

      const body   = await request.json();
      const campos = ['status','notas','mensagem','canal','presencaDigital','whatsapp','instagram'];
      campos.forEach(c => { if (body[c] !== undefined) leads[idx][c] = body[c]; });
      leads[idx].atualizadoEm = new Date().toISOString();
      await salvarLeads(env, leads);
      return json({ ok: true, lead: leads[idx] });
    }

    // DELETE /leads/:id
    const deleteMatch = path.match(/^\/leads\/([^/]+)$/);
    if (method === 'DELETE' && deleteMatch) {
      const id    = deleteMatch[1];
      const leads = await lerLeads(env);
      const idx   = leads.findIndex(l => l.id === id);
      if (idx === -1) return json({ erro: 'Lead não encontrado' }, 404);
      leads.splice(idx, 1);
      await salvarLeads(env, leads);
      return json({ ok: true });
    }

    return json({ erro: 'Rota não encontrada' }, 404);
  },

  // ── Cron triggers ──────────────────────────────────────────
  async scheduled(event, env, ctx) {
    const fn = CRON_MAP[event.cron];
    if (fn) {
      console.log(`[CRON] ${event.cron}`);
      ctx.waitUntil(fn(env).catch(e => console.error('[CRON] erro:', e)));
    } else {
      console.warn(`[CRON] cron desconhecido: ${event.cron}`);
    }
  },
};
