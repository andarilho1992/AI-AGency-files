// ═══════════════════════════════════════════════════════════════
//  WORKER NF-e — Pets Go
//  Proxy seguro para a API do eNotas.
//  Mantém a API Key no servidor — nunca exposta no frontend.
//
//  Endpoints:
//    POST /emitir-nfse   → Emite NFS-e (serviços: banho, tosa, etc.)
//    POST /emitir-nfce   → Emite NFC-e (produtos: ração, petisco, etc.)
//    GET  /status/:id    → Consulta status de uma nota
//    GET  /health        → Healthcheck
//
//  Secrets necessários (wrangler secret put):
//    ENOTAS_API_KEY      → API Key do painel eNotas
//    ENOTAS_EMPRESA_ID   → ID da empresa no eNotas
// ═══════════════════════════════════════════════════════════════

const ENOTAS_BASE = 'https://app.enotas.com.br/api';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function authHeader(apiKey) {
  // eNotas usa Basic Auth: base64(apiKey + ":")
  const encoded = btoa(apiKey + ':');
  return `Basic ${encoded}`;
}

// ─── NFS-e (serviços) ────────────────────────────────────────
// Campos recebidos do frontend:
//   descricao, valor, data, cliente?{ nome, cpfCnpj, email }
async function emitirNFSe(body, env) {
  const { descricao, valor, data, cliente } = body;
  if (!descricao || !valor) {
    return jsonResp({ erro: 'descricao e valor são obrigatórios' }, 400);
  }

  const payload = {
    dataCompetencia: data || new Date().toISOString().slice(0, 10),
    servico: {
      discriminacao: descricao,
      valor: parseFloat(valor),
      // CNAE principal do Junior: 9609-2/08 (Higiene e Embelezamento de Animais)
      // Código de serviço na prefeitura de POA: verificar no cadastro eNotas
      codigoTributacaoMunicipio: '',
    },
    tomador: cliente?.cpfCnpj ? {
      razaoSocial: cliente.nome || 'Consumidor',
      cpfCnpj:     cliente.cpfCnpj.replace(/\D/g, ''),
      email:        cliente.email || '',
    } : undefined,
  };

  const url = `${ENOTAS_BASE}/empresas/${env.ENOTAS_EMPRESA_ID}/nfses`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader(env.ENOTAS_API_KEY),
    },
    body: JSON.stringify(payload),
  });

  const data_res = await res.json().catch(() => ({}));
  if (!res.ok) {
    return jsonResp({ erro: data_res?.message || 'Erro ao emitir NFS-e', detalhe: data_res }, res.status);
  }
  return jsonResp({ ok: true, numero: data_res.numero, link: data_res.linkDownloadNFSe, id: data_res.id });
}

// ─── NFC-e (produtos) ────────────────────────────────────────
// Campos recebidos do frontend:
//   itens: [{descricao, quantidade, valorUnitario, ncm?, cfop?}]
//   formaPagamento: 'dinheiro'|'credito'|'debito'|'pix'
//   cliente?{ nome, cpfCnpj }
async function emitirNFCe(body, env) {
  const { itens, formaPagamento, cliente } = body;
  if (!itens?.length) {
    return jsonResp({ erro: 'itens são obrigatórios' }, 400);
  }

  // Mapeamento de forma de pagamento → código SEFAZ
  const pgtoMap = { dinheiro: 1, credito: 3, debito: 4, pix: 17, outros: 99 };
  const pgCod = pgtoMap[formaPagamento?.toLowerCase()] || 99;

  const payload = {
    naturezaOperacao: 'Venda ao Consumidor',
    itens: itens.map(i => ({
      descricao: i.descricao,
      quantidade: i.quantidade || 1,
      valorUnitario: parseFloat(i.valorUnitario),
      // NCM padrão para produtos pet (verificar com contador)
      ncm: i.ncm || '23091000',
      cfop: i.cfop || '5102',
      origem: 0,
      cst: '102',
    })),
    pagamentos: [{ meio: pgCod, valor: itens.reduce((s, i) => s + (i.valorUnitario * (i.quantidade||1)), 0) }],
    consumidorFinal: true,
    presencaComprador: 1,
    tomador: cliente?.cpfCnpj ? {
      razaoSocial: cliente.nome || 'Consumidor',
      cpfCnpj:     cliente.cpfCnpj.replace(/\D/g, ''),
    } : undefined,
  };

  const url = `${ENOTAS_BASE}/empresas/${env.ENOTAS_EMPRESA_ID}/nfces`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader(env.ENOTAS_API_KEY),
    },
    body: JSON.stringify(payload),
  });

  const data_res = await res.json().catch(() => ({}));
  if (!res.ok) {
    return jsonResp({ erro: data_res?.message || 'Erro ao emitir NFC-e', detalhe: data_res }, res.status);
  }
  return jsonResp({ ok: true, numero: data_res.numero, chave: data_res.chaveAcesso, id: data_res.id });
}

// ─── Consulta status ─────────────────────────────────────────
async function consultarStatus(notaId, tipo, env) {
  const endpoint = tipo === 'nfce' ? 'nfces' : 'nfses';
  const url = `${ENOTAS_BASE}/empresas/${env.ENOTAS_EMPRESA_ID}/${endpoint}/${notaId}`;
  const res = await fetch(url, {
    headers: { 'Authorization': authHeader(env.ENOTAS_API_KEY) },
  });
  const data_res = await res.json().catch(() => ({}));
  return jsonResp(data_res, res.status);
}

// ─── Handler principal ────────────────────────────────────────
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // Verifica secrets antes de qualquer operação
    if (!env.ENOTAS_API_KEY || !env.ENOTAS_EMPRESA_ID) {
      return jsonResp({ erro: 'Worker não configurado. Defina ENOTAS_API_KEY e ENOTAS_EMPRESA_ID via wrangler secret put.' }, 503);
    }

    const url  = new URL(request.url);
    const path = url.pathname;

    if (path === '/health') {
      return jsonResp({ ok: true, worker: 'petsgo-nfe', ts: new Date().toISOString() });
    }

    if (path === '/emitir-nfse' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return emitirNFSe(body, env);
    }

    if (path === '/emitir-nfce' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return emitirNFCe(body, env);
    }

    const statusMatch = path.match(/^\/status\/([^/]+)(?:\/(nfce))?$/);
    if (statusMatch && request.method === 'GET') {
      return consultarStatus(statusMatch[1], statusMatch[2], env);
    }

    return jsonResp({ erro: 'Rota não encontrada' }, 404);
  },
};
