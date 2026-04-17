/**
 * STORAGE.JS — Camada de persistência local (localStorage)
 *
 * Por que localStorage?
 * - Não precisa de servidor, banco de dados externo ou internet
 * - Funciona no browser direto, sem nenhuma configuração
 * - Para um MVP, é perfeito: dados salvos localmente, app 100% offline
 * - Quando migrar para Supabase (Fase 2), só vai trocar essas funções
 *   mantendo toda lógica do app intacta. Isso se chama "separação de camadas".
 */

const Storage = {

  // =====================
  // ORÇAMENTOS
  // =====================

  getOrcamentos() {
    return JSON.parse(localStorage.getItem('orcamentos') || '[]');
  },

  _salvarOrcamentos(lista) {
    localStorage.setItem('orcamentos', JSON.stringify(lista));
  },

  salvarOrcamento(dados, idExistente = null) {
    const lista = this.getOrcamentos();

    if (idExistente) {
      // Editar orçamento existente
      const idx = lista.findIndex(o => o.id === idExistente);
      if (idx !== -1) {
        lista[idx] = {
          ...lista[idx],
          ...dados,
          atualizadoEm: new Date().toISOString(),
        };
        this._salvarOrcamentos(lista);
        return lista[idx];
      }
    }

    // Novo orçamento
    const ultimo = lista.reduce((max, o) => Math.max(max, o.numero || 0), 0);
    const novoOrc = {
      id: gerarId(),
      numero: ultimo + 1,
      ...dados,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    lista.push(novoOrc);

    // Salvar cliente automaticamente se for novo
    if (!dados.clienteId && dados.clienteNome) {
      const clientes = this.getClientes();
      const existente = clientes.find(c =>
        c.nome.toLowerCase() === dados.clienteNome.toLowerCase()
      );
      if (!existente) {
        this.salvarCliente({
          nome: dados.clienteNome,
          email: dados.clienteEmail,
          telefone: dados.clienteTelefone,
          empresa: dados.clienteEmpresa,
        });
      }
    }

    this._salvarOrcamentos(lista);
    return novoOrc;
  },

  atualizarStatus(id, novoStatus) {
    const lista = this.getOrcamentos();
    const idx = lista.findIndex(o => o.id === id);
    if (idx !== -1) {
      lista[idx].status = novoStatus;
      lista[idx].atualizadoEm = new Date().toISOString();
      this._salvarOrcamentos(lista);
    }
  },

  excluirOrcamento(id) {
    const lista = this.getOrcamentos().filter(o => o.id !== id);
    this._salvarOrcamentos(lista);
  },

  // =====================
  // CLIENTES
  // =====================

  getClientes() {
    return JSON.parse(localStorage.getItem('clientes') || '[]');
  },

  _salvarClientes(lista) {
    localStorage.setItem('clientes', JSON.stringify(lista));
  },

  salvarCliente(dados, idExistente = null) {
    const lista = this.getClientes();

    if (idExistente) {
      const idx = lista.findIndex(c => c.id === idExistente);
      if (idx !== -1) {
        lista[idx] = { ...lista[idx], ...dados, atualizadoEm: new Date().toISOString() };
        this._salvarClientes(lista);
        return lista[idx];
      }
    }

    const novoCliente = {
      id: gerarId(),
      ...dados,
      criadoEm: new Date().toISOString(),
    };
    lista.push(novoCliente);
    this._salvarClientes(lista);
    return novoCliente;
  },

  excluirCliente(id) {
    const lista = this.getClientes().filter(c => c.id !== id);
    this._salvarClientes(lista);
  },

  // =====================
  // CONFIGURAÇÕES DA EMPRESA
  // =====================

  getConfig() {
    return JSON.parse(localStorage.getItem('config') || '{}');
  },

  salvarConfig(dados) {
    localStorage.setItem('config', JSON.stringify(dados));
  },
};
