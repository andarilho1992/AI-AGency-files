/**
 * STORAGE.JS — Camada de dados do Sistema de Prospecção
 * Tudo salvo no localStorage do navegador.
 */

const Storage = {

  // ── CONFIG (API key, configurações gerais) ─────────────────
  getConfig() {
    return JSON.parse(localStorage.getItem('prosp_config') || '{}');
  },
  salvarConfig(dados) {
    localStorage.setItem('prosp_config', JSON.stringify(dados));
  },

  // ── COMENTÁRIOS ANALISADOS ─────────────────────────────────
  getComentarios() {
    return JSON.parse(localStorage.getItem('prosp_comentarios') || '[]');
  },
  salvarComentarios(lista) {
    localStorage.setItem('prosp_comentarios', JSON.stringify(lista));
  },
  limparComentarios() {
    localStorage.removeItem('prosp_comentarios');
  },

  // ── LEADS SALVOS ───────────────────────────────────────────
  getLeads() {
    return JSON.parse(localStorage.getItem('prosp_leads') || '[]');
  },
  salvarLead(lead) {
    const leads = this.getLeads();
    // Evita duplicatas pelo channelId + videoId
    const jaExiste = leads.find(l => l.channelId === lead.channelId && l.videoId === lead.videoId);
    if (jaExiste) return false;
    lead.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    lead.savedAt = new Date().toISOString();
    leads.unshift(lead);
    localStorage.setItem('prosp_leads', JSON.stringify(leads));
    return true;
  },
  excluirLead(id) {
    const leads = this.getLeads().filter(l => l.id !== id);
    localStorage.setItem('prosp_leads', JSON.stringify(leads));
  },
  atualizarLead(id, updates) {
    const leads = this.getLeads().map(l => l.id === id ? { ...l, ...updates } : l);
    localStorage.setItem('prosp_leads', JSON.stringify(leads));
  },

  // ── HISTÓRICO DE BUSCAS ────────────────────────────────────
  getHistorico() {
    return JSON.parse(localStorage.getItem('prosp_historico') || '[]');
  },
  adicionarHistorico(item) {
    const hist = this.getHistorico();
    hist.unshift({ ...item, data: new Date().toISOString() });
    // Mantém só os últimos 50
    localStorage.setItem('prosp_historico', JSON.stringify(hist.slice(0, 50)));
  },
};
