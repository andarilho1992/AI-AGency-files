/**
 * REDDIT.JS — Busca posts e comentários no Reddit
 *
 * O Reddit tem uma API pública JSON sem autenticação para leitura.
 * Basta adicionar .json no final de qualquer URL do Reddit.
 *
 * SEM CUSTO, SEM API KEY, SEM LIMITE RÍGIDO.
 * Rate limit sugerido: ~1 request por segundo para não ser bloqueado.
 *
 * SUBREDDITS ÚTEIS PARA PROSPECÇÃO (público BR):
 *   r/empreendedorismo   — donos de negócio, autônomos
 *   r/freelancers        — freelancers BR
 *   r/marketing          — marketing digital BR
 *   r/financaspessoais   — pessoas querendo melhorar renda
 *   r/brdev              — devs que podem ser clientes de ferramentas
 *   r/meunegocio         — pequenos negócios
 */

const REDDIT_BASE = 'https://www.reddit.com';

/**
 * Busca os posts mais recentes de um subreddit.
 *
 * @param {string} subreddit - Nome do subreddit (sem r/)
 * @param {number} limite    - Número de posts (max 100)
 * @param {string} sort      - 'new' | 'hot' | 'top'
 */
async function buscarPostsSubreddit(subreddit, limite = 25, sort = 'new') {
  const url = `${REDDIT_BASE}/r/${subreddit}/${sort}.json?limit=${limite}&raw_json=1`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

  if (res.status === 404) throw new Error(`Subreddit r/${subreddit} não existe.`);
  if (res.status === 403) throw new Error(`Subreddit r/${subreddit} é privado.`);
  if (!res.ok) throw new Error(`Erro ${res.status} ao acessar r/${subreddit}.`);

  const data = await res.json();
  return (data.data?.children || [])
    .filter(p => p.kind === 't3')
    .map(p => p.data)
    .filter(p => !p.stickied); // ignora posts fixados (regras, anúncios do mod)
}

/**
 * Busca os comentários de um post específico.
 * Retorna comentários aplainados (sem a estrutura de árvore).
 *
 * @param {string} subreddit - Nome do subreddit
 * @param {string} postId    - ID do post (6 caracteres alfanuméricos)
 * @param {number} limite    - Comentários a buscar
 */
async function buscarComentariosPost(subreddit, postId, limite = 50) {
  const url = `${REDDIT_BASE}/r/${subreddit}/comments/${postId}.json?limit=${limite}&raw_json=1&depth=3`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar comentários.`);
  const data = await res.json();

  // data[0] = post, data[1] = árvore de comentários
  const postSnippet = data[0]?.data?.children?.[0]?.data || {};
  const comentarios = [];

  function extrair(children) {
    if (!Array.isArray(children)) return;
    children.forEach(child => {
      if (child.kind !== 't1') return;
      const c = child.data;
      if (!c.body || c.body === '[deleted]' || c.body === '[removed]') return;
      if (c.author === 'AutoModerator') return;

      comentarios.push({
        id: `reddit-c-${c.id}`,
        tipo: 'comentario',
        texto: c.body,
        autor: c.author,
        autorUrl: `https://reddit.com/u/${c.author}`,
        autorFoto: null,
        likes: c.score || 0,
        data: new Date((c.created_utc || 0) * 1000).toISOString(),
        fonte: 'reddit',
        subreddit: postSnippet.subreddit || subreddit,
        postId: postSnippet.id || postId,
        videoId: postSnippet.id || postId,       // campo unificado com YouTube
        videoTitle: `r/${postSnippet.subreddit || subreddit} · ${(postSnippet.title || '').slice(0, 60)}`,
        permalink: `https://reddit.com${postSnippet.permalink || ''}${c.id}/`,
      });

      // Vai um nível a mais (respostas de respostas)
      if (c.replies?.data?.children) {
        extrair(c.replies.data.children);
      }
    });
  }

  extrair(data[1]?.data?.children || []);
  return comentarios;
}

/**
 * Função principal: busca posts + comentários de um subreddit completo.
 * Retorna array no mesmo formato que o YouTube (compatível com analise.js).
 *
 * @param {string}   subreddit    - ex: 'empreendedorismo'
 * @param {number}   maxPosts     - quantos posts analisar
 * @param {Function} onProgresso  - callback (atual, total, texto)
 */
async function buscarRedditCompleto(subreddit, maxPosts = 10, onProgresso = null) {
  const todos = [];

  if (onProgresso) onProgresso(0, maxPosts, `Buscando posts em r/${subreddit}...`);

  const posts = await buscarPostsSubreddit(subreddit, maxPosts);

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];

    // O próprio post (título + corpo) vira um "comentário" analisável
    const textoPost = [p.title, p.selftext].filter(Boolean).join('\n\n').trim();
    if (textoPost.length >= 15) {
      todos.push({
        id: `reddit-post-${p.id}`,
        tipo: 'post',
        texto: textoPost,
        autor: p.author,
        autorUrl: `https://reddit.com/u/${p.author}`,
        autorFoto: null,
        likes: p.score || 0,
        respostas: p.num_comments || 0,
        data: new Date((p.created_utc || 0) * 1000).toISOString(),
        fonte: 'reddit',
        subreddit: p.subreddit,
        videoId: p.id,
        videoTitle: `r/${p.subreddit} · ${p.title.slice(0, 60)}`,
        permalink: `https://reddit.com${p.permalink}`,
      });
    }

    // Comentários do post
    if (p.num_comments > 0) {
      try {
        const comentarios = await buscarComentariosPost(p.subreddit, p.id, 50);
        todos.push(...comentarios);
      } catch (e) {
        console.warn(`r/${subreddit} post ${p.id}: ${e.message}`);
      }
    }

    if (onProgresso) onProgresso(i + 1, posts.length, `Post ${i + 1} de ${posts.length} processado...`);

    // Pausa entre posts para respeitar rate limit
    if (i < posts.length - 1) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  return todos;
}

/**
 * Busca posts por termo de busca dentro de um subreddit.
 * Útil para encontrar posts sobre temas específicos (ex: "cobrar mais").
 *
 * @param {string} subreddit - Subreddit para buscar
 * @param {string} query     - Termo de busca
 * @param {number} limite    - Número de posts
 */
async function buscarRedditPorTermo(subreddit, query, limite = 25) {
  const url = `${REDDIT_BASE}/r/${subreddit}/search.json?` +
    `q=${encodeURIComponent(query)}&sort=new&limit=${limite}&raw_json=1&restrict_sr=1`;

  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Erro ${res.status} na busca.`);

  const data = await res.json();
  return (data.data?.children || [])
    .filter(p => p.kind === 't3')
    .map(p => p.data);
}

/**
 * Busca em múltiplos subreddits de uma vez.
 * Ideal para varrer vários comunidades BR em uma única análise.
 */
async function buscarMultiplosSubreddits(subreddits, postsPerSub = 5, onProgresso = null) {
  const todos = [];
  let subAtual = 0;

  for (const sub of subreddits) {
    if (onProgresso) onProgresso(subAtual, subreddits.length, `Analisando r/${sub}...`);
    try {
      const resultados = await buscarRedditCompleto(sub, postsPerSub, null);
      todos.push(...resultados);
    } catch (e) {
      console.warn(`Erro em r/${sub}: ${e.message}`);
    }
    subAtual++;
    await new Promise(r => setTimeout(r, 800));
  }

  return todos;
}

// Subreddits BR pré-definidos para o nicho Andarilho Digital
const SUBREDDITS_BR = [
  { sub: 'empreendedorismo',  desc: 'Empreendedores e donos de negócio' },
  { sub: 'freelancers',       desc: 'Freelancers e autônomos' },
  { sub: 'marketing',         desc: 'Marketing digital' },
  { sub: 'financaspessoais',  desc: 'Finanças pessoais (futuros clientes)' },
  { sub: 'brdev',             desc: 'Desenvolvedores brasileiros' },
  { sub: 'meunegocio',        desc: 'Pequenos negócios' },
  { sub: 'trabalheemcasa',    desc: 'Trabalho remoto' },
];
