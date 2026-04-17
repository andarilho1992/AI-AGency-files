// ═══════════════════════════════════════════════════════════════
//  SERVIDOR DE PROSPECÇÃO — Andarilho Digital
//  Sistema completo: busca leads → enriquece → mensagem → WA → follow-up
//
//  Rodar:  node servidor-prospecao.js
//  Deploy: Railway / Fly.io / VPS
//
//  Ferramentas (tudo simula sem chave):
//    GOOGLE_PLACES_API_KEY  → busca real no Google Maps
//    EVOLUTION_API_URL      → disparo real de WhatsApp
//    EVOLUTION_API_KEY      → autenticação Evolution
//    EVOLUTION_INSTANCE     → instância do WhatsApp conectado
//    ANTHROPIC_API_KEY      → mensagens personalizadas com Claude
//    SYNC_SECRET            → protege endpoints (padrão: 'andarilho-secret')
// ═══════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';
import express   from 'express';
import cors      from 'cors';
import fs        from 'fs';
import path      from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Carrega .env ──────────────────────────────────────────────
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#') && rest.length)
      process.env[key.trim()] = rest.join('=').trim();
  });
}

// ── Config ───────────────────────────────────────────────────
const PORT            = process.env.PORT             || 3002;
const SYNC_SECRET     = process.env.SYNC_SECRET      || 'andarilho-secret';
const PLACES_KEY      = process.env.GOOGLE_PLACES_API_KEY || null;
const EVOLUTION_URL   = process.env.EVOLUTION_API_URL    || null;
const EVOLUTION_KEY   = process.env.EVOLUTION_API_KEY    || null;
const EVOLUTION_INST  = process.env.EVOLUTION_INSTANCE   || 'andarilho';
const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY    || null;

// ── Paths de dados ────────────────────────────────────────────
const DATA_DIR  = path.join(__dirname, 'data-prospeccao');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const LOGS_FILE  = path.join(DATA_DIR, 'logs.json');
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, '[]');
if (!fs.existsSync(LOGS_FILE))  fs.writeFileSync(LOGS_FILE,  '{}');

// ── Setup ─────────────────────────────────────────────────────
const app     = express();
const anthropic = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ── Nichos padrão para prospecção automática ──────────────────
const BUSCAS_PADRAO = [
  { nicho: 'clínica', query: 'clínica botox harmonização facial', cidade: 'Moema São Paulo' },
  { nicho: 'clínica', query: 'clínica harmonização facial',       cidade: 'Batel Curitiba' },
  { nicho: 'clínica', query: 'clínica botox harmonização facial', cidade: 'Moinhos de Vento Porto Alegre' },
  { nicho: 'pet shop', query: 'pet shop banho tosa',              cidade: 'Moema São Paulo' },
  { nicho: 'pet shop', query: 'pet shop banho tosa',              cidade: 'Batel Curitiba' },
  { nicho: 'pet shop', query: 'pet shop banho tosa',              cidade: 'Porto Alegre' },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const uid   = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

function lerLeads()  { try { return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8')); } catch { return []; } }
function salvarLeads(leads) { fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2)); }

function log(agente, status, resumo) {
  const logs = (() => { try { return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8')); } catch { return {}; } })();
  if (!logs[agente]) logs[agente] = [];
  logs[agente].unshift({ ts: new Date().toISOString(), status, resumo });
  logs[agente] = logs[agente].slice(0, 100);
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
}

const FRANQUIAS = ['petz','cobasi','petlove','botoclinic','royal face','hof clinic','face doctor','botocenter','botoesthetic'];
const ehFranquia = nome => FRANQUIAS.some(f => nome.toLowerCase().includes(f));

const HEADERS_BROWSER = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9',
};

// ─────────────────────────────────────────────────────────────
// MOCK DATA — usado quando sem GOOGLE_PLACES_API_KEY
// ─────────────────────────────────────────────────────────────
const MOCK_LEADS = {
  'clínica': [
    { nome: 'Clínica Dra. Ana Lima', site: 'clinicaanalima.com.br', instagram: '@clinica.analima', telefone: '(11) 9 9123-4567', reviews: 38, rating: 4.7 },
    { nome: 'Instituto Facial Premium',  site: '',                    instagram: '@institutofacialpremium', telefone: '', reviews: 12, rating: 4.5 },
    { nome: 'Centro Estético Bellaforma', site: 'bellaforma.com.br', instagram: '@bellaforma.estetica', telefone: '(41) 9 8765-4321', reviews: 67, rating: 4.8 },
  ],
  'pet shop': [
    { nome: 'PetCare Banho & Tosa',   site: 'petcarebatosa.com.br',   instagram: '@petcarebatosa',  telefone: '(11) 9 9876-5432', reviews: 22, rating: 4.6 },
    { nome: 'Mundo Animal Pet Shop',  site: '',                        instagram: '@mundoanimalpet', telefone: '', reviews: 8, rating: 4.3 },
    { nome: 'VetAmigo Petshop',        site: 'vetamigo.com.br',       instagram: '@vetamigo',        telefone: '(51) 9 8234-5678', reviews: 45, rating: 4.9 },
  ],
};

function gerarMockLeads(nicho, cidade) {
  const base = MOCK_LEADS[nicho] || MOCK_LEADS['clínica'];
  return base.map(b => ({
    place_id: uid(),
    name: b.nome,
    _site: b.site,
    _instagram: b.instagram,
    _telefone: b.telefone,
    rating: b.rating,
    user_ratings_total: b.reviews,
    formatted_address: `${cidade}, Brasil`,
    _mock: true,
  }));
}

// ─────────────────────────────────────────────────────────────
// GOOGLE PLACES
// ─────────────────────────────────────────────────────────────
async function buscarPlaces(query, cidade) {
  if (!PLACES_KEY) {
    console.log(`  [SIMULADO] Buscando "${query}" em ${cidade}`);
    const nicho = query.includes('pet') ? 'pet shop' : 'clínica';
    return gerarMockLeads(nicho, cidade);
  }
  const q = encodeURIComponent(`${query} em ${cidade}`);
  const r = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&language=pt-BR&region=br&key=${PLACES_KEY}`);
  const d = await r.json();
  return d.results || [];
}

async function buscarDetalhes(placeId) {
  if (!PLACES_KEY) return {};
  const fields = 'name,formatted_phone_number,website,rating,user_ratings_total,formatted_address';
  const r = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=pt-BR&key=${PLACES_KEY}`);
  const d = await r.json();
  return d.result || {};
}

// ─────────────────────────────────────────────────────────────
// SCRAPING
// ─────────────────────────────────────────────────────────────
async function rasparSite(url) {
  const vazio = { telefone: '', instagram: '', whatsappDireto: '' };
  if (!url) return vazio;
  try {
    const ctrl = new AbortController();
    const to   = setTimeout(() => ctrl.abort(), 9000);
    const r    = await fetch(url, { signal: ctrl.signal, headers: HEADERS_BROWSER });
    clearTimeout(to);
    if (!r.ok) return vazio;
    const html = await r.text();
    const telMatch   = html.match(/\(?\d{2}\)?\s?(?:9\d{4}|\d{4,5})[-.\s]?\d{4}(?!\d)/);
    const instaMatch = html.match(/instagram\.com\/(?!p\/|reel\/|explore\/|accounts\/)([a-zA-Z0-9_.]{2,})/);
    const waMatch    = html.match(/wa\.me\/(55\d{10,11})/);
    return {
      telefone:      telMatch   ? telMatch[0].trim()              : '',
      instagram:     instaMatch ? '@' + instaMatch[1].replace(/\/$/, '') : '',
      whatsappDireto:waMatch    ? waMatch[1]                      : '',
    };
  } catch { return vazio; }
}

// ─────────────────────────────────────────────────────────────
// PRESENÇA DIGITAL
// ─────────────────────────────────────────────────────────────
function compilarPresenca(lead, site, _insta) {
  const handle      = site.instagram || lead.instagram || '';
  const melhorTel   = lead.telefone  || site.telefone  || '';
  const melhorWA    = lead.whatsapp  || site.whatsappDireto
    || (site.telefone ? site.telefone.replace(/\D/g,'').replace(/^0/,'55') : '')
    || (lead.telefone ? lead.telefone.replace(/\D/g,'').replace(/^0/,'55') : '');

  const pontos = [!!lead.site, !!handle, !!melhorTel, lead.reviews > 20].filter(Boolean).length;
  const score  = pontos >= 3 ? 'forte' : pontos >= 2 ? 'média' : 'fraca';

  let descContato = 'contato só via DM';
  if (lead.telefone)          descContato = `telefone Google: ${lead.telefone}`;
  else if (site.whatsappDireto) descContato = `WhatsApp no site: ${site.whatsappDireto}`;
  else if (site.telefone)       descContato = `telefone no site: ${site.telefone}`;
  else if (handle)               descContato = 'contato só via Instagram DM';

  let descGoogle = 'sem avaliações';
  if (lead.reviews > 50)     descGoogle = `${lead.rating}⭐ ${lead.reviews} avaliações`;
  else if (lead.reviews > 15) descGoogle = `${lead.rating}⭐ ${lead.reviews} avaliações (poucas)`;
  else if (lead.reviews > 0)  descGoogle = `${lead.rating}⭐ ${lead.reviews} avaliações — oportunidade`;

  return {
    score,
    canalSugerido:  melhorTel ? 'whatsapp' : handle ? 'instagram' : 'instagram',
    melhorWhatsApp: melhorWA,
    melhorTelefone: melhorTel,
    instagramHandle:handle,
    resumo: [
      lead.site ? `site (${lead.site})` : 'sem site',
      handle || 'sem Instagram',
      descContato,
      descGoogle,
    ].join(' | '),
  };
}

// ─────────────────────────────────────────────────────────────
// CLAUDE — gera mensagem personalizada
// ─────────────────────────────────────────────────────────────
const MENSAGEM_TEMPLATE = {
  clínica:  (nome, presenca) => `Oi! Vi o trabalho d${presenca.instagramHandle ? `a ${nome}` : 'e vocês'} — presença digital ${presenca.score}. Curiosidade: como estão gerenciando as confirmações de agenda? Ainda é tudo manual no WhatsApp?`,
  'pet shop': (nome, _p)    => `Oi! Passei pelo ${nome} e fiquei curioso — o agendamento de banho ainda chega tudo pelo WhatsApp na mão? Pergunto porque é exatamente onde as petshops perdem mais cliente sem perceber.`,
};

async function gerarMensagem(lead, nicho, presenca) {
  if (!anthropic) {
    const fn = MENSAGEM_TEMPLATE[nicho] || MENSAGEM_TEMPLATE['clínica'];
    return {
      dor: 'gestão manual de agenda e atendimento',
      canal: presenca.canalSugerido,
      mensagem: fn(lead.nome, presenca),
    };
  }

  const prompt = `Você é especialista em vendas B2B para agência de automação.
Analise este negócio e gere uma mensagem de primeiro contato.

NEGÓCIO: ${lead.nome} | NICHO: ${nicho} | CIDADE: ${lead.cidade}
PRESENÇA DIGITAL: ${presenca.resumo}
CANAL: ${presenca.canalSugerido}

Gere uma mensagem:
- Natural, máximo 4 linhas
- Baseada no que você "observou" (presença digital, falta de reviews, etc.)
- SEM mencionar IA, automação ou tecnologia diretamente
- Termine com uma pergunta aberta
- Tom: ${presenca.canalSugerido === 'instagram' ? 'casual' : 'direto mas humano'}

Responda APENAS JSON:
{"dor":"dor em 1 frase","canal":"${presenca.canalSugerido}","mensagem":"texto aqui"}`;

  try {
    const r = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });
    const txt   = r.content[0]?.text || '';
    const match = txt.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) { console.warn('Claude erro:', e.message); }

  const fn = MENSAGEM_TEMPLATE[nicho] || MENSAGEM_TEMPLATE['clínica'];
  return { dor: '', canal: presenca.canalSugerido, mensagem: fn(lead.nome, presenca) };
}

// ─────────────────────────────────────────────────────────────
// WHATSAPP — Evolution API (simula se sem chave)
// ─────────────────────────────────────────────────────────────
async function enviarWhatsApp(numero, mensagem, leadNome = '') {
  if (!EVOLUTION_URL || !EVOLUTION_KEY) {
    console.log(`\n  [WA SIMULADO → ${numero || leadNome}]\n  ${mensagem}\n`);
    return { simulado: true };
  }
  try {
    const r = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
      body: JSON.stringify({ number: numero, text: mensagem }),
    });
    return r.json();
  } catch (e) {
    console.error('WA erro:', e.message);
    return { erro: e.message };
  }
}

// ─────────────────────────────────────────────────────────────
// AGENTE 1 — PROSPECTAR
// Busca leads → enriquece → gera mensagem → salva com status 'encontrado'
// ─────────────────────────────────────────────────────────────
async function agentProspectar(buscas = BUSCAS_PADRAO) {
  console.log('\n[AGENTE 1] Prospecção iniciada...');
  const leads    = lerLeads();
  const existentes = new Set(leads.map(l => l.nome?.toLowerCase()));
  const novos    = [];

  for (const busca of buscas) {
    console.log(`  → ${busca.query} em ${busca.cidade}`);
    const resultados = await buscarPlaces(busca.query, busca.cidade);

    for (const lugar of resultados.slice(0, 8)) {
      if (ehFranquia(lugar.name || '')) continue;
      if (existentes.has((lugar.name || '').toLowerCase())) continue;

      await sleep(300);
      const detalhes = await buscarDetalhes(lugar.place_id);

      const lead = {
        nome:     detalhes.name     || lugar.name     || '',
        nicho:    busca.nicho,
        cidade:   busca.cidade,
        endereco: detalhes.formatted_address || lugar.formatted_address || '',
        telefone: detalhes.formatted_phone_number || lugar._telefone || '',
        site:     detalhes.website  || lugar._site    || '',
        instagram:lugar._instagram  || '',
        whatsapp: '',
        rating:   detalhes.rating   || lugar.rating   || 0,
        reviews:  detalhes.user_ratings_total || lugar.user_ratings_total || 0,
      };

      // Scraping
      const dadosSite = lead.site ? await rasparSite(lead.site) : { telefone:'', instagram:'', whatsappDireto:'' };
      if (dadosSite.instagram && !lead.instagram) lead.instagram = dadosSite.instagram;

      // Presença
      const presenca = compilarPresenca(lead, dadosSite, {});

      // Mensagem
      const analise = await gerarMensagem(lead, busca.nicho, presenca);

      const novoLead = {
        id:             uid(),
        nome:           lead.nome,
        nicho:          lead.nicho,
        cidade:         lead.cidade,
        whatsapp:       presenca.melhorWhatsApp,
        site:           lead.site,
        instagram:      presenca.instagramHandle,
        canal:          analise.canal,
        problema:       analise.dor,
        mensagem:       analise.mensagem,
        notas:          [
          lead.telefone ? `Tel: ${lead.telefone}` : 'Sem telefone',
          `${lead.rating}⭐ (${lead.reviews} avaliações)`,
          `Presença: ${presenca.score}`,
          lead.endereco,
        ].filter(Boolean).join(' | '),
        presencaDigital:presenca.resumo,
        status:         'encontrado',
        criadoEm:       new Date().toISOString(),
        enviadoEm:      null,
        respondeuEm:    null,
        followupEm:     null,
      };

      novos.push(novoLead);
      existentes.add(lead.nome.toLowerCase());
      console.log(`    ✅ ${lead.nome} | ${presenca.score} | canal: ${analise.canal}`);
      await sleep(400);
    }
  }

  if (novos.length > 0) {
    salvarLeads([...leads, ...novos]);
    log('prospeccao', 'ok', `${novos.length} leads novos`);
    console.log(`[AGENTE 1] ${novos.length} leads adicionados.\n`);
  } else {
    log('prospeccao', 'skip', 'Nenhum lead novo');
    console.log('[AGENTE 1] Nenhum lead novo.\n');
  }

  return novos;
}

// ─────────────────────────────────────────────────────────────
// AGENTE 2 — ENVIAR LOTE
// Envia WA para todos os leads com status 'encontrado' e whatsapp preenchido
// ─────────────────────────────────────────────────────────────
async function agentEnviarLote(limite = 20) {
  console.log('\n[AGENTE 2] Envio em lote iniciado...');
  const leads   = lerLeads();
  const pendentes = leads.filter(l =>
    l.status === 'encontrado' &&
    l.mensagem &&
    (l.whatsapp || l.instagram)
  ).slice(0, limite);

  if (pendentes.length === 0) {
    log('envio_lote', 'skip', 'Nenhum lead pendente com contato');
    console.log('[AGENTE 2] Nenhum lead para enviar.\n');
    return 0;
  }

  let enviados = 0;
  for (const lead of pendentes) {
    if (lead.whatsapp) {
      await enviarWhatsApp(lead.whatsapp, lead.mensagem, lead.nome);
    } else {
      // Instagram: só loga (abrir DM manualmente)
      console.log(`  [IG DM — ${lead.nome}]: ${lead.mensagem}`);
    }

    const idx = leads.findIndex(l => l.id === lead.id);
    if (idx !== -1) {
      leads[idx].status    = 'contatado';
      leads[idx].enviadoEm = new Date().toISOString();
    }
    enviados++;
    await sleep(3500); // evita spam
  }

  salvarLeads(leads);
  log('envio_lote', 'ok', `${enviados} mensagens enviadas`);
  console.log(`[AGENTE 2] ${enviados} enviados.\n`);
  return enviados;
}

// ─────────────────────────────────────────────────────────────
// AGENTE 3 — FOLLOW-UP
// Leads contatados há mais de X dias sem resposta recebem follow-up
// ─────────────────────────────────────────────────────────────
async function agentFollowUp(diasSemResposta = 4) {
  console.log('\n[AGENTE 3] Follow-up iniciado...');
  const leads = lerLeads();
  const corte = Date.now() - diasSemResposta * 86400000;

  const alvo = leads.filter(l =>
    l.status === 'contatado' &&
    l.enviadoEm &&
    new Date(l.enviadoEm).getTime() < corte &&
    !l.followupEm
  );

  if (alvo.length === 0) {
    log('followup', 'skip', 'Nenhum lead elegível');
    console.log('[AGENTE 3] Nenhum lead para follow-up.\n');
    return 0;
  }

  let enviados = 0;
  for (const lead of alvo.slice(0, 10)) {
    let msg = '';

    if (anthropic) {
      try {
        const r = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: `Escreva um follow-up curto (2 linhas) para alguém que não respondeu a mensagem abaixo há ${diasSemResposta} dias.
Tom: leve, sem cobrar, sem desculpa, sem "oi sumido".
Primeira mensagem: "${lead.mensagem}"
Responda APENAS a mensagem de follow-up.`
          }]
        });
        msg = r.content[0]?.text?.trim() || '';
      } catch { /* segue pro fallback */ }
    }

    if (!msg) msg = `Oi! Só passando pra deixar meu contato caso faça sentido depois. Qualquer coisa é só falar 👋`;

    if (lead.whatsapp) {
      await enviarWhatsApp(lead.whatsapp, msg, lead.nome);
    } else {
      console.log(`  [IG Follow-up — ${lead.nome}]: ${msg}`);
    }

    const idx = leads.findIndex(l => l.id === lead.id);
    if (idx !== -1) {
      leads[idx].followupEm  = new Date().toISOString();
      leads[idx].mensagemFollowup = msg;
    }
    enviados++;
    await sleep(4000);
  }

  salvarLeads(leads);
  log('followup', 'ok', `${enviados} follow-ups enviados`);
  console.log(`[AGENTE 3] ${enviados} follow-ups enviados.\n`);
  return enviados;
}

// ─────────────────────────────────────────────────────────────
// AUTOMAÇÃO — cron manual com setInterval + verificação de hora
// ─────────────────────────────────────────────────────────────
const ultimaExecucao = {};

function deveRodar(agente, diasSemana, horaBRT) {
  const agora   = new Date();
  const utc3    = new Date(agora.getTime() - 3 * 3600000); // BRT = UTC-3
  const dia     = utc3.getDay(); // 0=dom 1=seg 2=ter 3=qua 4=qui 5=sex 6=sab
  const hora    = utc3.getHours();
  const dataKey = utc3.toISOString().slice(0, 10) + '-' + agente;

  if (!diasSemana.includes(dia)) return false;
  if (hora !== horaBRT) return false;
  if (ultimaExecucao[dataKey]) return false;
  ultimaExecucao[dataKey] = true;
  return true;
}

setInterval(() => {
  // Prospectar: terça (2) + sexta (5) às 7h BRT
  if (deveRodar('prospeccao', [2, 5], 7))
    agentProspectar().catch(e => console.error('[CRON] Prospecção:', e));

  // Enviar lote: ter (2) + qui (4) às 10h BRT
  if (deveRodar('envio', [2, 4], 10))
    agentEnviarLote().catch(e => console.error('[CRON] Envio:', e));

  // Follow-up: qua (3) + sab (6) às 10h BRT
  if (deveRodar('followup', [3, 6], 10))
    agentFollowUp().catch(e => console.error('[CRON] Follow-up:', e));

}, 60 * 1000); // verifica a cada minuto

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE de autenticação
// ─────────────────────────────────────────────────────────────
function auth(req, res, next) {
  const secret = req.headers['x-sync-secret'] || req.query.secret;
  if (secret !== SYNC_SECRET) return res.status(401).json({ erro: 'Não autorizado' });
  next();
}

// ─────────────────────────────────────────────────────────────
// API REST
// ─────────────────────────────────────────────────────────────

// ── GET /status ───────────────────────────────────────────────
app.get('/status', (_req, res) => {
  const leads = lerLeads();
  const logs  = (() => { try { return JSON.parse(fs.readFileSync(LOGS_FILE)); } catch { return {}; } })();

  res.json({
    ok: true,
    servidor: 'Andarilho Digital — Prospecção',
    agora: new Date().toISOString(),
    ferramentas: {
      googlePlaces: PLACES_KEY   ? '✅ configurado' : '⚠️ simulando (adicione GOOGLE_PLACES_API_KEY)',
      whatsapp:     EVOLUTION_URL? '✅ configurado' : '⚠️ simulando (adicione EVOLUTION_API_URL)',
      claude:       ANTHROPIC_KEY? '✅ configurado' : '⚠️ usando templates (adicione ANTHROPIC_API_KEY)',
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
      prospeccao: logs.prospeccao?.[0] || null,
      envio_lote: logs.envio_lote?.[0] || null,
      followup:   logs.followup?.[0]   || null,
    },
  });
});

// ── GET /leads ────────────────────────────────────────────────
app.get('/leads', auth, (_req, res) => {
  res.json(lerLeads());
});

// ── POST /sync ────────────────────────────────────────────────
// Pipeline CRM envia seus leads → server faz merge → retorna leads novos
app.post('/sync', auth, (req, res) => {
  const leadsDoCliente = req.body?.leads;
  if (!Array.isArray(leadsDoCliente)) return res.status(400).json({ erro: 'Payload inválido — esperado { leads: [] }' });

  const leadsServidor = lerLeads();
  const idsSrv = new Set(leadsServidor.map(l => l.id));
  const idsCli = new Set(leadsDoCliente.map(l => l.id));

  // Leads do cliente que o servidor não tem → adiciona
  const novosParaSrv = leadsDoCliente.filter(l => !idsSrv.has(l.id));
  if (novosParaSrv.length) salvarLeads([...leadsServidor, ...novosParaSrv]);

  // Leads do servidor que o cliente não tem → manda de volta
  const novosParaCli = leadsServidor.filter(l => !idsCli.has(l.id));

  // Atualiza status dos leads comuns (server é fonte de verdade para status)
  const mapaStatus = {};
  leadsServidor.forEach(l => { mapaStatus[l.id] = l.status; });

  res.json({ ok: true, novosParaCliente: novosParaCli, mapaStatus });
});

// ── POST /prospectar ──────────────────────────────────────────
// Body opcional: { buscas: [{nicho, query, cidade}] }
app.post('/prospectar', auth, async (req, res) => {
  const buscas = req.body?.buscas || BUSCAS_PADRAO;
  res.json({ ok: true, mensagem: 'Prospecção iniciada. Acompanhe os logs.' });
  agentProspectar(buscas).catch(e => console.error('[POST /prospectar]', e));
});

// ── POST /enviar/:id ──────────────────────────────────────────
app.post('/enviar/:id', auth, async (req, res) => {
  const leads = lerLeads();
  const lead  = leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ erro: 'Lead não encontrado' });

  const numero  = lead.whatsapp;
  const mensagem = req.body?.mensagem || lead.mensagem;

  if (!numero && !lead.instagram) return res.status(400).json({ erro: 'Lead sem contato' });

  if (numero) {
    const result = await enviarWhatsApp(numero, mensagem, lead.nome);
    const idx = leads.findIndex(l => l.id === lead.id);
    leads[idx].status    = 'contatado';
    leads[idx].enviadoEm = new Date().toISOString();
    salvarLeads(leads);
    log('envio_manual', 'ok', lead.nome);
    return res.json({ ok: true, simulado: !!result.simulado });
  }

  // Instagram DM: retorna a mensagem formatada pro usuário copiar
  res.json({ ok: true, instrucao: 'Instagram DM manual', instagram: lead.instagram, mensagem });
});

// ── POST /enviar/lote ─────────────────────────────────────────
app.post('/enviar/lote', auth, async (req, res) => {
  const limite = req.body?.limite || 20;
  res.json({ ok: true, mensagem: `Envio em lote iniciado (até ${limite} leads).` });
  agentEnviarLote(limite).catch(e => console.error('[POST /enviar/lote]', e));
});

// ── POST /followup ────────────────────────────────────────────
app.post('/followup', auth, async (req, res) => {
  const dias = req.body?.diasSemResposta || 4;
  res.json({ ok: true, mensagem: `Follow-up iniciado (leads sem resposta há ${dias}+ dias).` });
  agentFollowUp(dias).catch(e => console.error('[POST /followup]', e));
});

// ── PATCH /leads/:id ──────────────────────────────────────────
// Atualiza status ou campos de um lead
app.patch('/leads/:id', auth, (req, res) => {
  const leads = lerLeads();
  const idx   = leads.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Lead não encontrado' });

  const campos = ['status','notas','mensagem','canal','presencaDigital','whatsapp','instagram'];
  campos.forEach(c => { if (req.body[c] !== undefined) leads[idx][c] = req.body[c]; });
  leads[idx].atualizadoEm = new Date().toISOString();
  salvarLeads(leads);
  res.json({ ok: true, lead: leads[idx] });
});

// ── DELETE /leads/:id ─────────────────────────────────────────
app.delete('/leads/:id', auth, (req, res) => {
  const leads = lerLeads();
  const idx   = leads.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Lead não encontrado' });
  leads.splice(idx, 1);
  salvarLeads(leads);
  res.json({ ok: true });
});

// ── POST /webhook/whatsapp ────────────────────────────────────
// Evolution API envia eventos aqui quando alguém responde
app.post('/webhook/whatsapp', (req, res) => {
  res.sendStatus(200);
  const evento = req.body;
  if (evento?.event !== 'messages.upsert') return;
  const msg = evento?.data;
  if (!msg || msg.key?.fromMe) return;

  const numero = msg.key?.remoteJid?.replace('@s.whatsapp.net','').replace(/\D/g,'');
  if (!numero) return;

  const leads = lerLeads();
  const lead  = leads.find(l => l.whatsapp === numero);
  if (!lead) return;

  if (['contatado','encontrado'].includes(lead.status)) {
    const idx = leads.findIndex(l => l.id === lead.id);
    leads[idx].status      = 'respondeu';
    leads[idx].respondeuEm = new Date().toISOString();
    salvarLeads(leads);
    console.log(`[WEBHOOK] ${lead.nome} respondeu → status: respondeu`);
  }
});

// ── GET /logs ─────────────────────────────────────────────────
app.get('/logs', auth, (_req, res) => {
  try { res.json(JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'))); }
  catch { res.json({}); }
});

// ─────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const sim = v => v ? '✅' : '⚠️  SIMULANDO';
  console.log(`
╔══════════════════════════════════════════════════╗
║    ANDARILHO DIGITAL — SERVIDOR DE PROSPECÇÃO    ║
╠══════════════════════════════════════════════════╣
║  http://localhost:${String(PORT).padEnd(30)}║
╚══════════════════════════════════════════════════╝

Ferramentas:
  Google Places  ${sim(PLACES_KEY)}
  WhatsApp (WA)  ${sim(EVOLUTION_URL)}
  Claude IA      ${sim(ANTHROPIC_KEY)}

Automação (BRT):
  Prospectar     Ter + Sex  07h
  Enviar lote    Ter + Qui  10h
  Follow-up      Qua + Sab  10h

Endpoints:
  GET  /status
  GET  /leads              [secret]
  POST /sync               [secret]
  POST /prospectar         [secret]
  POST /enviar/lote        [secret]
  POST /enviar/:id         [secret]
  POST /followup           [secret]
  PATCH /leads/:id         [secret]
  POST /webhook/whatsapp   (Evolution API)

Secret: ${SYNC_SECRET}
`);
});
