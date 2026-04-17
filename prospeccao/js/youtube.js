/**
 * YOUTUBE.JS — Wrapper para YouTube Data API v3
 *
 * COMO FUNCIONA:
 * O YouTube oferece uma API REST gratuita (10.000 unidades/dia).
 * Cada chamada para buscar comentários custa 1 unidade por página.
 * Uma página tem até 100 comentários.
 * 10.000 unidades = ~100 páginas = ~10.000 comentários por dia.
 *
 * A chamada é feita diretamente do browser (sem servidor necessário).
 * A API key fica salva no localStorage — nunca vaza para a internet
 * porque a chamada é do seu navegador para o Google.
 *
 * ENDPOINTS USADOS:
 * - commentThreads.list: busca comentários de um vídeo
 * - videos.list: busca título e canal de um vídeo
 */

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Busca informações de um vídeo (título, canal, thumbnail).
 *
 * @param {string} videoId - ID do vídeo (11 caracteres)
 * @param {string} apiKey  - Chave da API do Google Cloud
 * @returns {Object|null}  - { title, channelTitle, thumbnail }
 */
async function buscarInfoVideo(videoId, apiKey) {
  const url = `${BASE_URL}/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `Erro HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data.items?.length) return null;
  const s = data.items[0].snippet;
  return {
    title: s.title,
    channelTitle: s.channelTitle,
    thumbnail: s.thumbnails?.medium?.url || s.thumbnails?.default?.url,
    publishedAt: s.publishedAt,
  };
}

/**
 * Busca uma página de comentários de um vídeo.
 *
 * @param {string} videoId    - ID do vídeo
 * @param {string} apiKey     - Chave da API
 * @param {string} pageToken  - Token para próxima página (opcional)
 * @param {number} maxResults - Comentários por página (max 100)
 * @returns {Object} - { comentarios: [], nextPageToken, totalResults }
 */
async function buscarComentarios(videoId, apiKey, pageToken = null, maxResults = 100) {
  let url = `${BASE_URL}/commentThreads?` +
    `part=snippet` +
    `&videoId=${videoId}` +
    `&maxResults=${maxResults}` +
    `&order=relevance` + // 'relevance' ou 'time'
    `&key=${apiKey}`;

  if (pageToken) url += `&pageToken=${pageToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `Erro HTTP ${res.status}`);
  }
  const data = await res.json();

  const comentarios = (data.items || []).map(item => {
    const c = item.snippet.topLevelComment.snippet;
    return {
      id: item.id,
      videoId,
      texto: c.textOriginal || c.textDisplay,
      autor: c.authorDisplayName,
      autorUrl: c.authorChannelUrl,
      autorFoto: c.authorProfileImageUrl,
      likes: c.likeCount || 0,
      respostas: item.snippet.totalReplyCount || 0,
      data: c.publishedAt,
    };
  });

  return {
    comentarios,
    nextPageToken: data.nextPageToken || null,
    totalResults: data.pageInfo?.totalResults || 0,
  };
}

/**
 * Busca TODOS os comentários de um vídeo, página por página.
 * Usa um callback de progresso para atualizar a UI enquanto busca.
 *
 * @param {string}   videoId      - ID do vídeo
 * @param {string}   apiKey       - Chave da API
 * @param {number}   maxPaginas   - Limite de páginas (evita gastar quota)
 * @param {Function} onProgresso  - Callback (comentariosBuscados, total)
 * @returns {Array} - Lista completa de comentários
 */
async function buscarTodosComentarios(videoId, apiKey, maxPaginas = 5, onProgresso = null) {
  let todos = [];
  let pageToken = null;
  let pagina = 0;

  do {
    const resultado = await buscarComentarios(videoId, apiKey, pageToken);
    todos = todos.concat(resultado.comentarios);
    pageToken = resultado.nextPageToken;
    pagina++;

    if (onProgresso) {
      onProgresso(todos.length, resultado.totalResults);
    }

    // Pequena pausa para não sobrecarregar a API
    if (pageToken && pagina < maxPaginas) {
      await new Promise(r => setTimeout(r, 300));
    }
  } while (pageToken && pagina < maxPaginas);

  return todos;
}
