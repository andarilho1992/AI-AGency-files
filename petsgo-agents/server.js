// ============================================================
// PETS GO — AGENTES DE IA 24/7
// Guilherme Andrade · Agência de Automação
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import express   from 'express';
import cron      from 'node-cron';
import fs        from 'fs';
import path      from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CONFIG ────────────────────────────────────────────────
const PORT        = process.env.PORT        || 3001;
const SYNC_SECRET = process.env.SYNC_SECRET || 'petsgo-secret';
const CLAUDE_KEY  = process.env.ANTHROPIC_API_KEY;
const WHATSAPP_URL= process.env.EVOLUTION_API_URL  || null;  // futura Evolution API
const WHATSAPP_KEY= process.env.EVOLUTION_API_KEY  || null;

const DATA_FILE   = path.join(__dirname, 'data', 'petsgo.json');
const REPORTS_DIR = path.join(__dirname, 'data', 'reports');
const LOGS_FILE   = path.join(__dirname, 'data', 'logs.json');

// ─── SETUP ─────────────────────────────────────────────────
const app    = express();
const claude = new Anthropic({ apiKey: CLAUDE_KEY });

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sync-secret');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Garante que as pastas existem antes de qualquer operação
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
fs.mkdirSync(REPORTS_DIR, { recursive: true });
[DATA_FILE, LOGS_FILE].forEach(f => {
  if (!fs.existsSync(f)) fs.writeFileSync(f, '{}');
});

// ─── HELPERS ───────────────────────────────────────────────
function lerDados() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return {}; }
}

function salvarLog(agente, status, resumo) {
  const logs = (() => { try { return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8')); } catch { return {}; } })();
  if (!logs[agente]) logs[agente] = [];
  logs[agente].unshift({ ts: new Date().toISOString(), status, resumo });
  logs[agente] = logs[agente].slice(0, 50); // mantém últimas 50 execuções
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
}

function salvarRelatorio(nome, conteudo) {
  const data  = new Date().toISOString().split('T')[0];
  const arq   = path.join(REPORTS_DIR, `${data}-${nome}.txt`);
  fs.writeFileSync(arq, conteudo);
  return arq;
}

function hoje() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function semanaPassada() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}

// Envia WhatsApp via Evolution API (ativa quando a variável de ambiente estiver configurada)
async function enviarWhatsApp(numero, mensagem) {
  if (!WHATSAPP_URL || !WHATSAPP_KEY) {
    console.log(`[WhatsApp SIMULADO → ${numero}]\n${mensagem}\n`);
    return { simulado: true };
  }
  const res = await fetch(`${WHATSAPP_URL}/message/sendText/petsgo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': WHATSAPP_KEY },
    body: JSON.stringify({ number: numero, text: mensagem })
  });
  return res.json();
}

// ============================================================
// AGENTE 1 — RELATÓRIO SEMANAL (Segunda-feira 8h BRT = 11h UTC)
// Usa Claude para analisar os dados e gerar um resumo inteligente
// ============================================================
async function agentRelatorioSemanal() {
  console.log('\n[AGENTE 1] Relatório Semanal — iniciando...');
  const D = lerDados();
  if (!D.atendimentos) { salvarLog('relatorio_semanal', 'skip', 'Sem dados ainda'); return; }

  const corte     = semanaPassada();
  const atendSemana = (D.atendimentos || []).filter(a => a.data >= corte);
  const lancSemana  = (D.lancamentos  || []).filter(l => l.data >= corte);

  if (atendSemana.length === 0) {
    salvarLog('relatorio_semanal', 'skip', 'Nenhum atendimento na semana');
    return;
  }

  // Monta resumo bruto dos dados para o Claude
  const faturamentoAtend = atendSemana.reduce((s, a) => s + (Number(a.preco) || 0), 0);
  const faturamentoLanc  = lancSemana.reduce((s, l)  => s + (Number(l.valor) || 0), 0);
  const totalFaturamento = faturamentoAtend + faturamentoLanc;

  const porFilial  = {};
  atendSemana.forEach(a => { porFilial[a.filial || 'Geral'] = (porFilial[a.filial || 'Geral'] || 0) + 1; });

  const porServico = {};
  atendSemana.forEach(a => { porServico[a.servico || 'Outros'] = (porServico[a.servico || 'Outros'] || 0) + 1; });

  const estoqueBaixo = (D.estoque || []).filter(e => e.quantidade <= (e.minimo || 5));

  const dadosBrutos = {
    periodo: `${corte} a ${hoje()}`,
    totalAtendimentos: atendSemana.length,
    faturamentoTotal: totalFaturamento,
    atendimentosPorFilial: porFilial,
    servicosMaisFeitos: porServico,
    estoqueBaixo: estoqueBaixo.map(e => ({ nome: e.nome, quantidade: e.quantidade, minimo: e.minimo || 5 })),
    totalPets: (D.pets || []).length,
    totalTutores: (D.tutores || []).length
  };

  // Claude analisa e gera relatório inteligente
  const stream = await claude.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 800,
    thinking: { type: 'adaptive' },
    messages: [{
      role: 'user',
      content: `Você é um assistente de gestão para petshop. Analise os dados abaixo e gere um relatório semanal executivo em português, com linguagem direta para o dono do negócio.

Inclua:
1. Resumo da semana (2-3 linhas)
2. Destaques (filial top, serviço mais pedido)
3. Alertas (estoque baixo, se houver)
4. 1 insight acionável para a próxima semana

Dados:
${JSON.stringify(dadosBrutos, null, 2)}

Formato: texto simples, sem markdown pesado, máximo 300 palavras.`
    }]
  });

  const msg      = await stream.finalMessage();
  const relatorio = msg.content.find(b => b.type === 'text')?.text || 'Erro ao gerar relatório.';

  const textoFinal = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELATÓRIO SEMANAL — PETS GO
${dadosBrutos.periodo}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${relatorio}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gerado automaticamente · Agência Guilherme Andrade
`.trim();

  const arq = salvarRelatorio('relatorio-semanal', textoFinal);
  console.log(`[AGENTE 1] Relatório salvo: ${arq}`);

  // Envia para o responsável (D.config.operadorTelefone quando disponível)
  const telefone = D.config?.telefoneResponsavel;
  if (telefone) {
    await enviarWhatsApp(telefone, textoFinal);
    console.log('[AGENTE 1] Relatório enviado via WhatsApp');
  }

  salvarLog('relatorio_semanal', 'ok', `${atendSemana.length} atendimentos · R$ ${totalFaturamento.toFixed(2)}`);
  console.log('[AGENTE 1] Concluído.\n');
}

// ============================================================
// AGENTE 2 — ANIVERSÁRIO DOS PETS (Diário 9h)
// Detecta pets que fazem aniversário hoje e avisa o tutor
// ============================================================
async function agentAniversarioPets() {
  console.log('\n[AGENTE 2] Aniversário dos Pets — verificando...');
  const D = lerDados();
  if (!D.pets?.length) { salvarLog('aniversario', 'skip', 'Sem pets'); return; }

  const [mesHoje, diaHoje] = hoje().slice(5).split('-'); // MM-DD
  const aniversariantes = D.pets.filter(p => {
    if (!p.dtnasc) return false;
    const [, mes, dia] = p.dtnasc.split('-');
    return mes === mesHoje && dia === diaHoje;
  });

  if (aniversariantes.length === 0) {
    console.log('[AGENTE 2] Nenhum aniversário hoje.');
    salvarLog('aniversario', 'skip', 'Nenhum aniversário');
    return;
  }

  for (const pet of aniversariantes) {
    const tutor = D.tutores?.find(t => t.id === pet.tutorId);
    const nome  = pet.nome;
    const idade = pet.dtnasc ? new Date().getFullYear() - parseInt(pet.dtnasc.split('-')[0]) : null;

    const msg = `🎂 Parabéns ao ${nome}!${idade ? ` Hoje ele(a) completa ${idade} ano(s)!` : ''}

Aproveite para mimar com um banho especial ou tosa completa. 🐾

— Pets Go`

    if (tutor?.telefone) {
      await enviarWhatsApp(tutor.telefone, msg);
      console.log(`[AGENTE 2] Mensagem enviada para tutor de ${nome}`);
    } else {
      console.log(`[AGENTE 2] ${nome} faz aniversário hoje! (tutor sem telefone registrado)`);
    }
  }

  salvarLog('aniversario', 'ok', `${aniversariantes.length} aniversariante(s): ${aniversariantes.map(p => p.nome).join(', ')}`);
  console.log('[AGENTE 2] Concluído.\n');
}

// ============================================================
// AGENTE 3 — ALERTA DE ESTOQUE BAIXO (Diário 9h)
// Verifica itens abaixo do mínimo e avisa o gestor
// ============================================================
async function agentAlertaEstoque() {
  console.log('\n[AGENTE 3] Alerta de Estoque — verificando...');
  const D = lerDados();
  if (!D.estoque?.length) { salvarLog('estoque', 'skip', 'Sem estoque'); return; }

  const criticos = D.estoque.filter(e => e.quantidade === 0);
  const baixos   = D.estoque.filter(e => e.quantidade > 0 && e.quantidade <= (e.minimo || 5));

  if (criticos.length === 0 && baixos.length === 0) {
    console.log('[AGENTE 3] Estoque OK — nenhum item no limite.');
    salvarLog('estoque', 'ok', 'Todos os itens acima do mínimo');
    return;
  }

  let msg = '⚠️ *Alerta de Estoque — Pets Go*\n\n';

  if (criticos.length > 0) {
    msg += '🔴 *ZERADO (compra urgente):*\n';
    criticos.forEach(e => { msg += `• ${e.nome} — ${e.filial || 'Geral'}\n`; });
    msg += '\n';
  }

  if (baixos.length > 0) {
    msg += '🟡 *BAIXO (atenção):*\n';
    baixos.forEach(e => { msg += `• ${e.nome} — ${e.quantidade} un. restantes (mín: ${e.minimo || 5}) · ${e.filial || 'Geral'}\n`; });
  }

  msg += '\n— Pets Go (alerta automático)';

  const telefone = D.config?.telefoneResponsavel;
  if (telefone) {
    await enviarWhatsApp(telefone, msg);
  } else {
    console.log('[AGENTE 3] Alerta:\n' + msg);
  }

  salvarLog('estoque', 'ok', `${criticos.length} zerados, ${baixos.length} baixos`);
  console.log(`[AGENTE 3] Concluído — ${criticos.length} zerados, ${baixos.length} baixos.\n`);
}

// ============================================================
// AGENTE 4 — LEMBRETE DE AGENDAMENTO (A cada hora)
// Avisa tutores 24h antes do banho ou tosa agendado
// ============================================================
async function agentLembreteAgendamento() {
  const D = lerDados();
  if (!D.atendimentos?.length) return;

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const dataAmanha = amanha.toISOString().split('T')[0];

  const agendados = D.atendimentos.filter(
    a => a.data === dataAmanha && a.status === 'agendado'
  );

  if (agendados.length === 0) return;

  console.log(`\n[AGENTE 4] ${agendados.length} agendamento(s) para amanhã — enviando lembretes...`);

  for (const a of agendados) {
    const pet   = D.pets?.find(p => p.id === a.petId);
    const tutor = D.tutores?.find(t => t.id === pet?.tutorId);
    if (!tutor?.telefone) continue;

    const horario = a.horario || '';
    const msg = `🐾 Olá${tutor.nome ? ', ' + tutor.nome.split(' ')[0] : ''}! Lembrando que ${pet?.nome || 'seu pet'} tem *${a.servico || 'atendimento'}* amanhã${horario ? ' às ' + horario : ''} na Pets Go${a.filial ? ' — ' + a.filial : ''}.

Em caso de imprevisto, avise com antecedência. 😊

— Pets Go`;

    await enviarWhatsApp(tutor.telefone, msg);
  }

  salvarLog('lembrete_agendamento', 'ok', `${agendados.length} lembrete(s) enviados para ${dataAmanha}`);
  console.log('[AGENTE 4] Concluído.\n');
}

// ============================================================
// AGENTE 5 — REATIVAÇÃO DE CLIENTES
// Roda toda terça e quinta às 10h BRT (13h UTC)
// Pega clientes em risco/inativos, gera mensagem personalizada
// via Claude e envia WhatsApp. Atualiza status no pipeline.
// ============================================================
async function agentReativacao() {
  console.log('\n[AGENTE 5] Reativação de Clientes — iniciando...');
  const D = lerDados();
  if (!D.reativacao?.length) {
    salvarLog('reativacao', 'skip', 'Pipeline vazio');
    return;
  }

  const agora = Date.now();
  // Só contata quem está inativo ou em_risco e não foi contatado nas últimas 72h
  const alvo = D.reativacao.filter(c => {
    if (c.status !== 'inativo' && c.status !== 'em_risco') return false;
    if (!c.whatsapp) return false;
    if (c.contatadoEm) {
      const diffHoras = (agora - new Date(c.contatadoEm).getTime()) / 3600000;
      if (diffHoras < 72) return false;
    }
    return true;
  });

  if (alvo.length === 0) {
    console.log('[AGENTE 5] Nenhum cliente elegível agora.');
    salvarLog('reativacao', 'skip', 'Nenhum elegível (todos contatados recentemente)');
    return;
  }

  // Limite de 10 por execução para não spammar
  const lote = alvo.slice(0, 10);
  let enviados = 0;

  for (const c of lote) {
    const dias = c.ultimoServico
      ? Math.floor((agora - new Date(c.ultimoServico).getTime()) / 86400000)
      : null;
    const pets = Array.isArray(c.pets) ? c.pets.join(' e ') : (c.pets || 'seu pet');
    const servico = c.servico || 'atendimento';

    // Claude gera mensagem curta, natural, sem parecer marketing
    let mensagem = c.mensagemIA || '';
    if (!mensagem) {
      try {
        const resp = await claude.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: `Escreva uma mensagem de WhatsApp curta e natural (2-3 linhas) para reativar um cliente de petshop.
Tutor: ${c.nome.split(' ')[0]}
Pet: ${pets}
Último serviço: ${servico}${dias ? ` (há ${dias} dias)` : ''}
Tom: amigável, sem forçar venda, como se fosse a própria dona do pet shop escrevendo.
Assine como "— Pets Go"
Responda APENAS a mensagem, sem aspas ou explicações.`
          }]
        });
        mensagem = resp.content[0]?.text?.trim() || `Oi ${c.nome.split(' ')[0]}! Faz um tempo que ${pets} não aparece por aqui. Qualquer coisa que precisar, estamos à disposição! 🐾 — Pets Go`;

        // Salva mensagem gerada de volta no pipeline
        const idx = D.reativacao.findIndex(x => x.id === c.id);
        if (idx !== -1) D.reativacao[idx].mensagemIA = mensagem;
      } catch (e) {
        console.error('[AGENTE 5] Erro ao gerar mensagem:', e.message);
        mensagem = `Oi ${c.nome.split(' ')[0]}! Faz um tempo que ${pets} não aparece por aqui. Sentimos falta! 🐾 — Pets Go`;
      }
    }

    await enviarWhatsApp(c.whatsapp, mensagem);

    // Atualiza status no pipeline
    const idx = D.reativacao.findIndex(x => x.id === c.id);
    if (idx !== -1) {
      D.reativacao[idx].status = 'contatado';
      D.reativacao[idx].contatadoEm = new Date().toISOString();
    }

    enviados++;
    console.log(`[AGENTE 5] Mensagem enviada → ${c.nome} (${c.whatsapp})`);

    // Pausa de 3s entre mensagens para não parecer bot
    await new Promise(r => setTimeout(r, 3000));
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(D, null, 2));
  salvarLog('reativacao', 'ok', `${enviados} mensagem(ns) enviada(s)`);
  console.log(`[AGENTE 5] Concluído — ${enviados} enviados.\n`);
}

// ============================================================
// API REST — Sync do CRM + Status + Logs
// ============================================================

// POST /sync — CRM envia dados toda vez que salva
app.post('/sync', (req, res) => {
  const secret = req.headers['x-sync-secret'];
  if (secret !== SYNC_SECRET) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  const dados = req.body;
  if (!dados || typeof dados !== 'object') {
    return res.status(400).json({ erro: 'Payload inválido' });
  }

  dados._syncedAt = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(dados, null, 2));

  console.log(`[SYNC] Dados recebidos — ${new Date().toLocaleTimeString('pt-BR')}`);
  res.json({ ok: true, syncedAt: dados._syncedAt });
});

// GET /status — saúde do servidor + resumo dos dados
app.get('/status', (_req, res) => {
  const D    = lerDados();
  const logs = (() => { try { return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8')); } catch { return {}; } })();

  res.json({
    ok: true,
    servidor: 'Pets Go Agents',
    agora: new Date().toISOString(),
    dados: {
      pets:          D.pets?.length              || 0,
      tutores:       D.tutores?.length           || 0,
      atendimentos:  D.atendimentos?.length      || 0,
      estoque:       D.estoque?.length           || 0,
      lancamentos:   D.lancamentos?.length       || 0,
      reativacao:    D.reativacao?.length        || 0,
      reatPendentes: D._reativacaoPendentes?.length || 0,
      ultimoSync:    D._syncedAt                || null
    },
    ultimasExecucoes: {
      relatorio_semanal:    logs.relatorio_semanal?.[0]    || null,
      aniversario:          logs.aniversario?.[0]          || null,
      estoque:              logs.estoque?.[0]              || null,
      lembrete_agendamento: logs.lembrete_agendamento?.[0] || null,
      reativacao:           logs.reativacao?.[0]           || null
    }
  });
});

// GET /logs — histórico de execuções dos agentes
app.get('/logs', (_req, res) => {
  try { res.json(JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'))); }
  catch { res.json({}); }
});

// GET /relatorios — lista os relatórios gerados
app.get('/relatorios', (_req, res) => {
  const arqs = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.endsWith('.txt'))
    .sort()
    .reverse()
    .slice(0, 20)
    .map(f => ({ arquivo: f, url: `/relatorios/${f}` }));
  res.json(arqs);
});

// GET /relatorios/:arquivo — retorna o conteúdo de um relatório
app.get('/relatorios/:arquivo', (req, res) => {
  const arq = path.join(REPORTS_DIR, path.basename(req.params.arquivo));
  if (!fs.existsSync(arq)) return res.status(404).json({ erro: 'Não encontrado' });
  res.type('text/plain; charset=utf-8');
  res.send(fs.readFileSync(arq, 'utf8'));
});

// POST /agentes/rodar/:nome — dispara um agente manualmente (útil pra testes)
app.post('/agentes/rodar/:nome', async (req, res) => {
  const secret = req.headers['x-sync-secret'];
  if (secret !== SYNC_SECRET) return res.status(401).json({ erro: 'Não autorizado' });

  const agentes = {
    relatorio:   agentRelatorioSemanal,
    aniversario: agentAniversarioPets,
    estoque:     agentAlertaEstoque,
    lembrete:    agentLembreteAgendamento,
    reativacao:  agentReativacao
  };

  const fn = agentes[req.params.nome];
  if (!fn) return res.status(404).json({ erro: 'Agente não encontrado', disponiveis: Object.keys(agentes) });

  res.json({ ok: true, mensagem: `Agente "${req.params.nome}" disparado. Acompanhe os logs.` });
  fn().catch(e => console.error(`[ERRO] Agente ${req.params.nome}:`, e));
});

// ── ENDPOINTS DE REATIVAÇÃO ────────────────────────────────

// GET /reativacao/pendentes — CRM puxa contatos novos vindos do WhatsApp
app.get('/reativacao/pendentes', (req, res) => {
  const secret = req.headers['x-sync-secret'];
  if (secret !== SYNC_SECRET) return res.status(401).json({ erro: 'Não autorizado' });
  const D = lerDados();
  // Retorna apenas os que têm origem 'whatsapp' e foram criados nas últimas 24h
  const corte = Date.now() - 86400000;
  const pendentes = (D._reativacaoPendentes || []).filter(c =>
    new Date(c.criadoEm).getTime() > corte
  );
  res.json(pendentes);
});

// POST /reativacao/add — agente ou webhook adiciona contato novo
app.post('/reativacao/add', (req, res) => {
  const secret = req.headers['x-sync-secret'];
  if (secret !== SYNC_SECRET) return res.status(401).json({ erro: 'Não autorizado' });
  const { nome, whatsapp, pets, ultimoServico, servico, mensagemIA, notas } = req.body;
  if (!nome || !whatsapp) return res.status(400).json({ erro: 'nome e whatsapp obrigatórios' });

  const D = lerDados();
  if (!D._reativacaoPendentes) D._reativacaoPendentes = [];

  // Evita duplicatas pelo número
  const ja = D._reativacaoPendentes.some(c => c.whatsapp === whatsapp.replace(/\D/g,''));
  if (ja) return res.json({ ok: true, duplicata: true });

  D._reativacaoPendentes.push({
    nome, whatsapp: whatsapp.replace(/\D/g,''),
    pets: Array.isArray(pets) ? pets : [pets].filter(Boolean),
    ultimoServico: ultimoServico || '',
    servico: servico || '',
    mensagemIA: mensagemIA || '',
    notas: notas || '',
    status: 'inativo',
    origem: 'whatsapp',
    criadoEm: new Date().toISOString(),
  });
  fs.writeFileSync(DATA_FILE, JSON.stringify(D, null, 2));
  console.log(`[REATIVAÇÃO] Novo contato adicionado: ${nome} (${whatsapp})`);
  res.json({ ok: true });
});

// POST /whatsapp/webhook — recebe eventos da Evolution API
// Quando cliente desconhecido manda mensagem, entra no pipeline
app.post('/whatsapp/webhook', async (req, res) => {
  res.sendStatus(200); // responde imediato pro Evolution não retentar

  const evento = req.body;
  // Evolution API envia eventos de tipo 'messages.upsert'
  if (evento?.event !== 'messages.upsert') return;

  const msg = evento?.data;
  if (!msg || msg.key?.fromMe) return; // ignora mensagens enviadas por nós

  const numero = msg.key?.remoteJid?.replace('@s.whatsapp.net','').replace(/\D/g,'');
  if (!numero) return;

  const D = lerDados();

  // Verifica se é tutor conhecido no CRM
  const tutorConhecido = (D.tutores || []).find(t => t.telefone?.replace(/\D/g,'') === numero);
  // Verifica se já está no pipeline de reativação
  const jaNoReat = (D.reativacao || []).find(c => c.whatsapp === numero) ||
                   (D._reativacaoPendentes || []).find(c => c.whatsapp === numero);

  if (jaNoReat || !tutorConhecido) {
    // Atualiza status para 'contatado' se já está no pipeline e mandou mensagem (voltou a falar)
    if (jaNoReat && (D.reativacao || [])) {
      const idx = D.reativacao?.findIndex(c => c.whatsapp === numero);
      if (idx !== -1 && D.reativacao[idx].status === 'contatado') {
        D.reativacao[idx].status = 'voltou';
        D.reativacao[idx].voltouEm = new Date().toISOString();
        fs.writeFileSync(DATA_FILE, JSON.stringify(D, null, 2));
        console.log(`[WEBHOOK] Cliente voltou a responder: ${numero}`);
      }
    }
    return;
  }

  // Tutor conhecido mas não está no pipeline — adiciona como lead de reativação
  const pets = (D.pets || []).filter(p => p.tutorId === tutorConhecido.id).map(p => p.nome);
  const ultimoAtend = (D.atendimentos || [])
    .filter(a => pets.some(pet => D.pets.find(p => p.nome === pet && p.id === a.petId)))
    .sort((a,b) => b.data.localeCompare(a.data))[0];

  if (!D._reativacaoPendentes) D._reativacaoPendentes = [];
  D._reativacaoPendentes.push({
    nome: tutorConhecido.nome,
    whatsapp: numero,
    pets,
    ultimoServico: ultimoAtend?.data || '',
    servico: ultimoAtend?.servico || '',
    mensagemIA: '',
    notas: 'Entrou em contato via WhatsApp',
    status: 'contatado',
    origem: 'whatsapp',
    criadoEm: new Date().toISOString(),
  });
  fs.writeFileSync(DATA_FILE, JSON.stringify(D, null, 2));
  console.log(`[WEBHOOK] Tutor "${tutorConhecido.nome}" adicionado ao pipeline de reativação via WhatsApp`);
});

// GET /dashboard — dados processados para o app mobile dos gestores
app.get('/dashboard', (req, res) => {
  const pin = req.headers['x-pin'];
  const D   = lerDados();

  if (D.config?.pinFaturamento && pin !== D.config.pinFaturamento) {
    return res.status(401).json({ erro: 'PIN inválido' });
  }

  const dataHoje = hoje();
  const inicioSemana = (() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split('T')[0];
  })();
  const inicioMes = dataHoje.slice(0, 7) + '-01';

  const atend       = D.atendimentos || [];
  const lancamentos = D.lancamentos  || [];
  const estoque     = D.estoque      || [];
  const pets        = D.pets         || [];

  // Faturamento helpers
  const fatAtend = (lista) => lista.reduce((s, a) => s + (Number(a.preco) || 0), 0);
  const fatLanc  = (lista) => lista.reduce((s, l) => s + (Number(l.valor) || 0), 0);

  const atendHoje   = atend.filter(a => a.data === dataHoje);
  const atendSemana = atend.filter(a => a.data >= inicioSemana);
  const atendMes    = atend.filter(a => a.data >= inicioMes);
  const lancHoje    = lancamentos.filter(l => l.data === dataHoje);
  const lancMes     = lancamentos.filter(l => l.data >= inicioMes);

  // Por filial (hoje)
  const porFilialHoje = {};
  atendHoje.forEach(a => {
    const f = a.filial || 'Geral';
    if (!porFilialHoje[f]) porFilialHoje[f] = { atendimentos: 0, faturamento: 0 };
    porFilialHoje[f].atendimentos++;
    porFilialHoje[f].faturamento += Number(a.preco) || 0;
  });

  // Agendamentos de hoje ainda pendentes
  const agendamentosHoje = atendHoje
    .filter(a => a.status === 'agendado')
    .map(a => ({
      id:      a.id,
      pet:     pets.find(p => p.id === a.petId)?.nome || '—',
      servico: a.servico,
      horario: a.horario || '—',
      filial:  a.filial  || '—'
    }));

  // Alertas de estoque
  const estoqueCritico = estoque.filter(e => e.quantidade === 0)
    .map(e => ({ nome: e.nome, quantidade: 0, filial: e.filial || 'Geral', nivel: 'critico' }));
  const estoqueBaixo = estoque.filter(e => e.quantidade > 0 && e.quantidade <= (e.minimo || 5))
    .map(e => ({ nome: e.nome, quantidade: e.quantidade, filial: e.filial || 'Geral', nivel: 'baixo' }));

  // Aniversários hoje
  const [mesH, diaH] = dataHoje.slice(5).split('-');
  const aniversarios = pets
    .filter(p => { if (!p.dtnasc) return false; const [,m,d] = p.dtnasc.split('-'); return m === mesH && d === diaH; })
    .map(p => ({ nome: p.nome, dtnasc: p.dtnasc }));

  // Logs dos agentes
  const logs = (() => { try { return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8')); } catch { return {}; } })();

  res.json({
    ultimoSync: D._syncedAt || null,
    config: { nome: D.config?.nome || 'Pets Go', emoji: D.config?.emoji || '🐾' },
    faturamento: {
      hoje:   fatAtend(atendHoje)   + fatLanc(lancHoje),
      semana: fatAtend(atendSemana),
      mes:    fatAtend(atendMes)    + fatLanc(lancMes)
    },
    atendimentos: {
      hoje:   atendHoje.length,
      semana: atendSemana.length,
      mes:    atendMes.length,
      emAndamento: atendHoje.filter(a => a.status === 'em_andamento').length,
      concluidos:  atendHoje.filter(a => a.status === 'concluido').length,
      porFilial:   porFilialHoje
    },
    agendamentosHoje,
    alertas: {
      estoqueCritico,
      estoqueBaixo,
      aniversariosHoje: aniversarios,
      total: estoqueCritico.length + estoqueBaixo.length + aniversarios.length
    },
    agentes: {
      relatorio:   logs.relatorio_semanal?.[0]    || null,
      aniversario: logs.aniversario?.[0]          || null,
      estoque:     logs.estoque?.[0]              || null,
      lembrete:    logs.lembrete_agendamento?.[0] || null
    }
  });
});

// ============================================================
// CRON — Agenda dos Agentes
// Fuso: UTC (Railway roda em UTC, BRT = UTC-3)
// ============================================================

// Relatório Semanal — Segunda-feira 11h UTC (8h BRT)
cron.schedule('0 11 * * 1', () => {
  agentRelatorioSemanal().catch(e => console.error('[CRON] Relatório semanal:', e));
}, { timezone: 'UTC' });

// Aniversário + Estoque — Diário 12h UTC (9h BRT)
cron.schedule('0 12 * * *', () => {
  agentAniversarioPets().catch(e => console.error('[CRON] Aniversário:', e));
  agentAlertaEstoque().catch(e => console.error('[CRON] Estoque:', e));
}, { timezone: 'UTC' });

// Lembrete de Agendamento — A cada hora (minuto 0)
cron.schedule('0 * * * *', () => {
  agentLembreteAgendamento().catch(e => console.error('[CRON] Lembrete:', e));
}, { timezone: 'UTC' });

// Reativação — Terça e Quinta 13h UTC (10h BRT)
cron.schedule('0 13 * * 2,4', () => {
  agentReativacao().catch(e => console.error('[CRON] Reativação:', e));
}, { timezone: 'UTC' });

// ─── START ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      PETS GO AGENTS — ONLINE 24/7      ║
╠════════════════════════════════════════╣
║  Porta:   ${String(PORT).padEnd(29)}║
║  Status:  GET  /status                 ║
║  Sync:    POST /sync                   ║
║  Logs:    GET  /logs                   ║
╚════════════════════════════════════════╝

Agentes agendados:
  ✓ Relatório Semanal  — Segunda 08h BRT
  ✓ Aniversário Pets   — Diário   09h BRT
  ✓ Alerta Estoque     — Diário   09h BRT
  ✓ Lembrete Agendam.  — A cada hora
  ✓ Reativação Clientes — Ter/Qui 10h BRT

WhatsApp: ${WHATSAPP_URL ? 'Evolution API configurada ✓' : 'SIMULADO (configure EVOLUTION_API_URL para ativar)'}
`);
});
