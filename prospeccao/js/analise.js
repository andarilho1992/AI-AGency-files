/**
 * ANALISE.JS — Classificação de dores nos comentários
 *
 * Recebe o texto de um comentário e retorna quais categorias
 * de dor foram detectadas, com as palavras que deram o match.
 *
 * Funciona por correspondência de palavras-chave em português BR e inglês
 * (sem acento, case insensitive) — sem precisar de IA.
 * Fase 2: integrar Claude API para análise semântica.
 */

// ── DICIONÁRIO DE DORES ────────────────────────────────────────
const DORES = {
  cobranca: {
    label: 'Cobrança / Valor',
    emoji: '💰',
    cor: 'orange',
    desc: 'Dificuldade em precificar, sentimento de ser desvalorizado, guerras de preço.',
    keywords: [
      // PT-BR
      'cobrar', 'cobranca', 'precificacao', 'precificar', 'preco', 'caro', 'barato',
      'desvalorizado', 'desvalorizacao', 'vale a pena', 'quanto custa', 'muito caro',
      'nao tenho dinheiro', 'sem dinheiro', 'orcamento', 'margem', 'lucro',
      'concorrente cobra', 'concorrencia', 'dumping', 'hora trabalhada',
      'nao consigo cobrar', 'nao posso cobrar', 'tenho medo de cobrar',
      // EN
      'pricing', 'undercharge', 'underpriced', 'overpriced', 'too expensive', 'charge more',
      'charge less', 'how much to charge', 'what to charge', 'low budget', 'no budget',
      'cant afford', 'undervalued', 'underpaid', 'race to the bottom', 'lowball',
      'hourly rate', 'rate', 'invoice', 'profit margin', 'quote', 'proposal price',
      'afraid to charge', 'scared to raise', 'raise my rates', 'worth it'
    ]
  },
  presenca: {
    label: 'Presença Digital',
    emoji: '🌐',
    cor: 'blue',
    desc: 'Falta de presença online, site ruim, invisível no Google e redes sociais.',
    keywords: [
      // PT-BR
      'site', 'website', 'instagram', 'seguidores', 'aparecer', 'online', 'visibilidade',
      'google', 'redes sociais', 'digital', 'presenca digital', 'marketing digital',
      'divulgacao', 'anuncio', 'trafego', 'nao apareco', 'ninguem me acha',
      'perfil', 'bio', 'portfolio online', 'nao tenho site', 'sem site',
      'nao sei usar', 'algoritmo', 'alcance', 'curtidas', 'engajamento',
      // EN
      'no website', 'no online presence', 'invisible online', 'not found on google',
      'followers', 'social media', 'engagement', 'reach', 'algorithm', 'traffic',
      'digital marketing', 'online marketing', 'seo', 'ads', 'advertising',
      'no followers', 'no traffic', 'cant be found', 'not ranking', 'low reach',
      'brand awareness', 'online visibility', 'grow my audience', 'build an audience'
    ]
  },
  captacao: {
    label: 'Captação de Clientes',
    emoji: '🎯',
    cor: 'purple',
    desc: 'Dificuldade em atrair, converter ou manter clientes. Falta de leads.',
    keywords: [
      // PT-BR
      'cliente', 'lead', 'venda', 'converter', 'prospectar', 'fechar', 'atrair',
      'captar', 'nao tenho cliente', 'sem cliente', 'como conseguir cliente',
      'primeiro cliente', 'carteira', 'indicacao', 'networking', 'proposta',
      'perdi cliente', 'perder cliente', 'fidelizar', 'retencao', 'churn',
      'funil', 'pipeline', 'nao consigo vender', 'ninguem compra',
      // EN
      'no clients', 'find clients', 'get clients', 'lose clients', 'lost a client',
      'client retention', 'churn', 'lead generation', 'sales funnel', 'conversion',
      'how to sell', 'cant close', 'closing deals', 'prospecting', 'cold outreach',
      'referrals', 'word of mouth', 'first client', 'struggling to sell',
      'no one buys', 'no leads', 'pipeline', 'networking', 'sales'
    ]
  },
  operacional: {
    label: 'Operacional / Gestão',
    emoji: '⚙️',
    cor: 'cyan',
    desc: 'Falta de processos, sobrecarga, dificuldade em organizar a operação.',
    keywords: [
      // PT-BR
      'tempo', 'processo', 'organizar', 'gestao', 'bagunca', 'acumular',
      'sobrecarga', 'produtividade', 'eficiencia', 'automatizar', 'automacao',
      'sistema', 'planilha', 'controle', 'gerenciar', 'nao tenho tempo',
      'estou sobrecarregado', 'falta de processo', 'cada cliente e diferente',
      'retrabalho', 'erro', 'prazo', 'entrega', 'atraso', 'escalar',
      // EN
      'no time', 'overwhelmed', 'burned out', 'burnout', 'overloaded', 'too busy',
      'disorganized', 'no process', 'no system', 'spreadsheet', 'manual work',
      'automate', 'automation', 'workflow', 'productivity', 'efficiency',
      'scale', 'scaling', 'delegating', 'cant delegate', 'deadline', 'late delivery',
      'rework', 'mistakes', 'chaotic', 'manage my time', 'time management'
    ]
  },
  credibilidade: {
    label: 'Credibilidade / Portfólio',
    emoji: '🏆',
    cor: 'yellow',
    desc: 'Falta de autoridade, portfólio fraco, dificuldade em ser levado a sério.',
    keywords: [
      // PT-BR
      'confianca', 'reputacao', 'profissional', 'amador', 'portfolio',
      'experiencia', 'comprovado', 'referencia', 'testimonial', 'depoimento',
      'credibilidade', 'autoridade', 'nao me levam a serio', 'parece amador',
      'nao sou reconhecido', 'ninguem me conhece', 'sem case', 'sem experiencia',
      'iniciante', 'comecando', 'nao tenho portfolio', 'como provar',
      // EN
      'no portfolio', 'no experience', 'no credibility', 'not taken seriously',
      'looks amateur', 'unprofessional', 'trust', 'authority', 'reputation',
      'testimonials', 'reviews', 'case study', 'prove myself', 'no track record',
      'just starting', 'beginner', 'new to this', 'no proof', 'social proof',
      'nobody knows me', 'build trust', 'establish authority', 'imposter syndrome'
    ]
  }
};

// ── FUNÇÕES DE ANÁLISE ─────────────────────────────────────────

/**
 * Normaliza o texto: minúsculas, sem acentos, sem pontuação extra.
 * Funciona para PT-BR e EN — 'cobrança' vira 'cobranca', inglês já sem acento.
 */
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\s]/g, ' ')        // remove pontuação
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Analisa um comentário e retorna as categorias de dor detectadas.
 * Retorna array vazio se nenhuma dor for detectada.
 *
 * @param {string} texto - Texto do comentário
 * @returns {Array} - Lista de { key, label, emoji, cor, keywords_match }
 */
function analisarComentario(texto) {
  if (!texto || texto.length < 10) return [];
  const norm = normalizar(texto);
  const detectadas = [];

  Object.entries(DORES).forEach(([key, dor]) => {
    const matches = dor.keywords.filter(kw => norm.includes(kw));
    if (matches.length > 0) {
      detectadas.push({
        key,
        label: dor.label,
        emoji: dor.emoji,
        cor: dor.cor,
        desc: dor.desc,
        keywords_match: matches,
        score: matches.length, // quantas keywords batem
      });
    }
  });

  // Ordena por score (mais keywords = mais relevante)
  return detectadas.sort((a, b) => b.score - a.score);
}

/**
 * Verifica se um comentário tem alguma dor detectável.
 */
function temDor(texto) {
  return analisarComentario(texto).length > 0;
}

/**
 * Extrai o ID de um vídeo do YouTube a partir de vários formatos de URL.
 * Suporta: watch?v=, youtu.be/, /embed/, /shorts/
 */
function extrairVideoId(url) {
  url = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // ID direto sem URL
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Retorna as estatísticas de dores de uma lista de comentários analisados.
 * Útil para montar gráficos no dashboard.
 */
function calcularEstatisticas(comentarios) {
  const stats = {};
  Object.keys(DORES).forEach(key => {
    stats[key] = { ...DORES[key], total: 0 };
  });

  comentarios.forEach(c => {
    (c.dores || []).forEach(d => {
      if (stats[d.key]) stats[d.key].total++;
    });
  });

  return Object.values(stats).sort((a, b) => b.total - a.total);
}
