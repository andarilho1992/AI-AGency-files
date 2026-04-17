// ─────────────────────────────────────────────────────────────
//  AGENTE DE PROSPECÇÃO — Andarilho Digital
//  Google Places → raspa site → analisa Instagram → Claude → pipeline
//
//  Rodar: node agente-prospeccao.js
//  Config: edite BUSCAS abaixo para mudar nicho/cidade
// ─────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

// ── Carrega .env ──────────────────────────────────────────────
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#') && rest.length)
      process.env[key.trim()] = rest.join('=').trim();
  });
}

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const PLACES_KEY    = process.env.GOOGLE_PLACES_API_KEY;
const OUTPUT_FILE   = 'leads-prospectados.json';

if (!ANTHROPIC_KEY) { console.error('❌ ANTHROPIC_API_KEY não configurada no .env'); process.exit(1); }
if (!PLACES_KEY)    { console.error('❌ GOOGLE_PLACES_API_KEY não configurada no .env\n   → Obter em: console.cloud.google.com → APIs → Places API'); process.exit(1); }

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ── CONFIGURE AQUI: quais nichos e cidades buscar ─────────────
const BUSCAS = [
  // Clínicas de botox / harmonização
  { nicho: 'clínica', query: 'clínica botox harmonização facial', cidade: 'Moema São Paulo' },
  { nicho: 'clínica', query: 'clínica botox harmonização facial', cidade: 'Jardins São Paulo' },
  { nicho: 'clínica', query: 'clínica harmonização facial',       cidade: 'Batel Curitiba' },
  { nicho: 'clínica', query: 'clínica botox harmonização facial', cidade: 'Moinhos de Vento Porto Alegre' },
  { nicho: 'clínica', query: 'clínica botox harmonização facial', cidade: 'Ipanema Rio de Janeiro' },
  { nicho: 'clínica', query: 'clínica botox harmonização facial', cidade: 'Savassi Belo Horizonte' },
  // Pet shops
  { nicho: 'pet shop', query: 'pet shop banho tosa',              cidade: 'Moema São Paulo' },
  { nicho: 'pet shop', query: 'pet shop banho tosa',              cidade: 'Batel Curitiba' },
  { nicho: 'pet shop', query: 'pet shop banho tosa',              cidade: 'Porto Alegre' },
  { nicho: 'pet shop', query: 'pet shop banho tosa',              cidade: 'Botafogo Rio de Janeiro' },
  { nicho: 'pet shop', query: 'pet shop banho tosa veterinária',  cidade: 'Belo Horizonte' },
  { nicho: 'pet shop', query: 'pet shop banho tosa',              cidade: 'Brasília' },
];

// ── Delay entre requests ───────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Headers de browser para scraping ──────────────────────────
const HEADERS_BROWSER = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

// ── Busca no Google Places Text Search ───────────────────────
async function buscarPlaces(query, cidade) {
  const q = encodeURIComponent(`${query} em ${cidade}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&language=pt-BR&region=br&key=${PLACES_KEY}`;
  const r = await fetch(url);
  const data = await r.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.warn(`  ⚠️  Places API: ${data.status} — ${data.error_message || ''}`);
  }
  return data.results || [];
}

// ── Busca detalhes de um lugar (telefone + site) ──────────────
async function buscarDetalhes(placeId) {
  const fields = 'name,formatted_phone_number,website,rating,user_ratings_total,formatted_address';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=pt-BR&key=${PLACES_KEY}`;
  const r = await fetch(url);
  const data = await r.json();
  return data.result || {};
}

// ── Raspa site buscando telefone, Instagram e WhatsApp ────────
async function rasparSite(url) {
  const vazio = { telefone: '', instagram: '', whatsappDireto: '' };
  if (!url) return vazio;
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 9000);
    const r = await fetch(url, { signal: ctrl.signal, headers: HEADERS_BROWSER });
    clearTimeout(timeout);
    if (!r.ok) return vazio;
    const html = await r.text();

    // Telefone BR — (DDD) 9xxxx-xxxx ou (DDD) xxxx-xxxx
    const telMatch = html.match(/\(?\d{2}\)?\s?(?:9\d{4}|\d{4,5})[-.\s]?\d{4}(?!\d)/);
    const telefone = telMatch ? telMatch[0].trim() : '';

    // Instagram handle no HTML
    const instaMatch = html.match(/instagram\.com\/(?!p\/|reel\/|explore\/|accounts\/)([a-zA-Z0-9_.]{2,})/);
    const instagram = instaMatch ? '@' + instaMatch[1].replace(/\/$/, '') : '';

    // WhatsApp link direto (wa.me/55...)
    const waMatch = html.match(/wa\.me\/(55\d{10,11})/);
    const whatsappDireto = waMatch ? waMatch[1] : '';

    return { telefone, instagram, whatsappDireto };
  } catch {
    return vazio;
  }
}

// ── Raspa perfil público do Instagram (seguidores, atividade) ─
async function rasparInstagram(handle) {
  const vazio = { seguidores: '', ativo: false };
  if (!handle) return vazio;
  const cleanHandle = handle.replace('@', '').replace(/\/$/, '');
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 9000);
    const r = await fetch(`https://www.instagram.com/${cleanHandle}/`, {
      signal: ctrl.signal,
      headers: {
        ...HEADERS_BROWSER,
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    clearTimeout(timeout);
    if (!r.ok) return vazio;
    const html = await r.text();

    // og:description contém "X Followers, Y Following, Z Posts"
    const metaMatch = html.match(/property="og:description"\s+content="([^"]+)"/i)
                   || html.match(/content="([^"]+)"\s+property="og:description"/i);
    if (metaMatch) {
      const desc = metaMatch[1];
      const segMatch = desc.match(/([\d,.KkMm]+)\s*(?:Followers|seguidores)/i);
      return {
        seguidores: segMatch ? segMatch[1] : 'perfil público',
        ativo: true
      };
    }
    // Se a página carregou mas sem og:description (logado obrigatório)
    return { seguidores: 'perfil encontrado', ativo: html.includes('instagram') };
  } catch {
    return vazio;
  }
}

// ── Compila presença digital estruturada ─────────────────────
function compilarPresenca(lead, dadosSite, dadosInsta) {
  // Instagram: prioridade site > lead (Google não retorna)
  const instagramHandle = dadosSite.instagram || lead.instagram || '';

  // Telefone: prioridade Google > site > whatsapp do site
  const melhorTelefone = lead.telefone || dadosSite.telefone || '';
  const melhorWhatsApp = lead.whatsapp
    || (dadosSite.whatsappDireto ? dadosSite.whatsappDireto : '')
    || (dadosSite.telefone ? dadosSite.telefone.replace(/\D/g, '').replace(/^0/, '55') : '');

  // Descrições legíveis pra Claude
  const descSite = lead.site ? `tem site (${lead.site})` : 'sem site';

  let descInsta = 'sem Instagram identificado';
  if (instagramHandle) {
    descInsta = instagramHandle;
    if (dadosInsta.seguidores) descInsta += ` — ${dadosInsta.seguidores} seguidores`;
    else if (dadosInsta.ativo)  descInsta += ' — perfil ativo';
  }

  let descContato = 'contato difícil de achar — só DM';
  if (lead.telefone)           descContato = `telefone no Google: ${lead.telefone}`;
  else if (dadosSite.whatsappDireto) descContato = `WhatsApp link no site: ${dadosSite.whatsappDireto}`;
  else if (dadosSite.telefone)  descContato = `telefone no site: ${dadosSite.telefone}`;
  else if (instagramHandle)     descContato = `contato só via Instagram DM`;

  let descGoogle = 'sem avaliações no Google';
  if (lead.reviews > 50)      descGoogle = `${lead.rating}⭐ com ${lead.reviews} avaliações (bem avaliado)`;
  else if (lead.reviews > 15)  descGoogle = `${lead.rating}⭐ com ${lead.reviews} avaliações (poucos reviews)`;
  else if (lead.reviews > 0)   descGoogle = `${lead.rating}⭐ com ${lead.reviews} avaliações (quase sem reviews — oportunidade)`;

  // Score geral (0–4 pontos)
  const pontos = [!!lead.site, !!instagramHandle, !!melhorTelefone, lead.reviews > 20].filter(Boolean).length;
  const score = pontos >= 3 ? 'forte' : pontos >= 2 ? 'média' : 'fraca';

  // Canal de abordagem sugerido
  const canalSugerido = melhorTelefone ? 'whatsapp' : instagramHandle ? 'instagram' : 'instagram';

  return {
    site: descSite,
    instagram: descInsta,
    instagramHandle,
    seguidores: dadosInsta.seguidores || '',
    contato: descContato,
    google: descGoogle,
    score,
    canalSugerido,
    melhorTelefone,
    melhorWhatsApp,
    telefoneSite: dadosSite.telefone || '',
    whatsappSite: dadosSite.whatsappDireto || '',
    resumo: [descSite, descInsta, descContato, descGoogle].join(' | '),
  };
}

// ── Analisa lead com Claude — usa presença digital ────────────
async function analisarComClaude(lead, nicho, presenca) {
  const ehClinica = nicho === 'clínica';

  const prompt = `Você é especialista em vendas B2B para uma agência de automação digital.

Analise esse negócio e gere uma mensagem de primeiro contato personalizada.

NEGÓCIO: ${lead.nome}
NICHO: ${nicho}
CIDADE: ${lead.cidade}

PRESENÇA DIGITAL (use isso para personalizar):
- Site: ${presenca.site}
- Instagram: ${presenca.instagram}
- Contato: ${presenca.contato}
- Google: ${presenca.google}
- Presença geral: ${presenca.score}
- Canal recomendado para abordar: ${presenca.canalSugerido}

${ehClinica
  ? `CONTEXTO — CLÍNICA DE ESTÉTICA:
Dores reais: lead some no WhatsApp fora do horário, no-show por falta de confirmação, paciente de botox não volta sem lembrete (precisa a cada 4-6 meses), avaliações Google zeradas, dono no gargalo de tudo.`
  : `CONTEXTO — PET SHOP:
Dores reais: pedido de banho chega no WhatsApp fora do horário sem resposta, cliente não volta sem lembrete (banho a cada 2-3 semanas), sem follow-up pós-atendimento, agenda lotada de improviso.`
}

INSTRUÇÕES PARA A MENSAGEM:
- Natural, sem parecer robô ou vendedor
- Máximo 4 linhas
- Baseie na presença digital observada (ex: se tem Instagram mas poucos reviews Google, mencione que viu o perfil deles; se não tem site, mencione que o contato é difícil de achar; se tem poucos reviews, use isso)
- NÃO mencione automação, IA ou tecnologia diretamente
- Foque em uma dor específica que você "observou" como cliente em potencial
- Termine com uma pergunta aberta natural
- Tom: ${presenca.canalSugerido === 'instagram' ? 'casual, como quem encontrou o perfil organicamente' : 'direto mas humano, como uma indicação'}

Responda APENAS em JSON válido, sem texto antes ou depois:
{
  "dor": "principal dor deste negócio em 1 frase curta",
  "canal": "${presenca.canalSugerido}",
  "mensagem": "mensagem de primeiro contato aqui"
}`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }]
    });
    const texto = msg.content[0]?.text || '';
    const match = texto.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) {
    console.warn(`  ⚠️  Claude erro: ${e.message}`);
  }
  return { dor: '', canal: presenca.canalSugerido, mensagem: '' };
}

// ── Filtra redes/franquias conhecidas ─────────────────────────
const IGNORAR = ['petz', 'cobasi', 'petlove', 'botoclinic', 'royal face', 'hof clinic', 'face doctor', 'botocenter', 'botoesthetic'];
function ehFranquia(nome) {
  return IGNORAR.some(f => nome.toLowerCase().includes(f));
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🔍 AGENTE DE PROSPECÇÃO — Andarilho Digital');
  console.log('─'.repeat(55));

  const leadsEncontrados = [];
  const vistos = new Set();

  for (const busca of BUSCAS) {
    console.log(`\n📍 Buscando: ${busca.query} em ${busca.cidade}`);

    const resultados = await buscarPlaces(busca.query, busca.cidade);
    console.log(`   ${resultados.length} resultados`);

    for (const lugar of resultados.slice(0, 8)) {
      if (vistos.has(lugar.place_id)) continue;
      if (ehFranquia(lugar.name)) {
        console.log(`   ⏭  Franquia ignorada: ${lugar.name}`);
        continue;
      }
      vistos.add(lugar.place_id);

      process.stdout.write(`   → ${lugar.name}... `);

      // 1. Detalhes do Google Places
      await sleep(300);
      const detalhes = await buscarDetalhes(lugar.place_id);

      const lead = {
        nome:     detalhes.name || lugar.name,
        nicho:    busca.nicho,
        cidade:   busca.cidade,
        endereco: detalhes.formatted_address || lugar.formatted_address || '',
        telefone: detalhes.formatted_phone_number || '',
        whatsapp: (detalhes.formatted_phone_number || '').replace(/\D/g, '').replace(/^0/, '55'),
        site:     detalhes.website || '',
        instagram: '',
        rating:   detalhes.rating || lugar.rating || 0,
        reviews:  detalhes.user_ratings_total || lugar.user_ratings_total || 0,
      };

      // 2. Raspa o site (telefone extra, instagram, whatsapp link)
      let dadosSite = { telefone: '', instagram: '', whatsappDireto: '' };
      if (lead.site) {
        process.stdout.write('🌐 ');
        await sleep(400);
        dadosSite = await rasparSite(lead.site);
        if (dadosSite.instagram) lead.instagram = dadosSite.instagram;
        if (!lead.telefone && dadosSite.telefone) lead.telefone = dadosSite.telefone;
        if (!lead.whatsapp && dadosSite.whatsappDireto) lead.whatsapp = dadosSite.whatsappDireto;
      }

      // 3. Raspa Instagram se encontrado
      let dadosInsta = { seguidores: '', ativo: false };
      const handleParaRaspar = dadosSite.instagram || lead.instagram;
      if (handleParaRaspar) {
        process.stdout.write('📸 ');
        await sleep(600);
        dadosInsta = await rasparInstagram(handleParaRaspar);
      }

      // 4. Compila presença digital
      const presenca = compilarPresenca(lead, dadosSite, dadosInsta);

      // 5. Analisa com Claude
      process.stdout.write('🤖 ');
      await sleep(400);
      const analise = await analisarComClaude(lead, busca.nicho, presenca);

      leadsEncontrados.push({ lead, presenca, analise });
      console.log(`✅ presença ${presenca.score} | canal: ${analise.canal}`);

      await sleep(300);
    }
  }

  // ── Monta output compatível com pipeline-leads.html ──────────
  const output = leadsEncontrados.map((item, i) => {
    const { lead, presenca, analise } = item;
    const telefoneExibir = lead.telefone || presenca.telefoneSite || '';
    const instaExibir    = presenca.instagramHandle || '';

    return {
      id:        (Date.now() + i).toString(),
      nome:      lead.nome,
      nicho:     lead.nicho,
      cidade:    lead.cidade,
      whatsapp:  presenca.melhorWhatsApp || lead.whatsapp,
      site:      lead.site,
      instagram: instaExibir,
      canal:     analise.canal,
      problema:  analise.dor,
      mensagem:  analise.mensagem,
      notas: [
        telefoneExibir ? `Tel: ${telefoneExibir}` : 'Sem telefone',
        instaExibir ? `Instagram: ${instaExibir}` : '',
        presenca.seguidores ? `${presenca.seguidores} seguidores` : '',
        `${lead.rating}⭐ (${lead.reviews} avaliações)`,
        `Presença: ${presenca.score}`,
        lead.endereco,
      ].filter(Boolean).join(' | '),
      presencaDigital: presenca.resumo,
      status:    'encontrado',
      criadoEm:  new Date().toISOString(),
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  // ── Resumo final ─────────────────────────────────────────────
  const comTel   = output.filter(l => l.whatsapp && l.whatsapp.length > 5).length;
  const comInsta = output.filter(l => l.instagram).length;
  const comSite  = output.filter(l => l.site).length;
  const presForte = output.filter(l => l.notas.includes('forte')).length;

  console.log('\n' + '─'.repeat(55));
  console.log(`✅ ${output.length} leads salvos em ${OUTPUT_FILE}`);
  console.log(`   📞 ${comTel} com telefone/WhatsApp`);
  console.log(`   📸 ${comInsta} com Instagram identificado`);
  console.log(`   🌐 ${comSite} com site`);
  console.log(`   💪 ${presForte} com presença digital forte`);
  console.log(`\nPróximo passo:`);
  console.log(`  1. Abre pipeline-leads.html no navegador`);
  console.log(`  2. Clica em "Importar Leads"`);
  console.log(`  3. Seleciona o arquivo ${OUTPUT_FILE}`);
  console.log('─'.repeat(55) + '\n');
}

main().catch(e => {
  console.error('❌ Erro fatal:', e.message);
  process.exit(1);
});
