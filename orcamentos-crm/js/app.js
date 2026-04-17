/**
 * APP.JS — Funções utilitárias globais
 *
 * Essas funções são usadas em todas as páginas.
 * Carregadas antes dos scripts específicos de cada página.
 */

// =====================
// GERAR ID ÚNICO
// =====================
function gerarId() {
  // Gera um ID único baseado em timestamp + número aleatório
  // Suficiente para dados locais — em produção usaríamos UUID do Supabase
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// =====================
// FORMATADORES
// =====================

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
}

function formatarData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// =====================
// STATUS
// =====================

function traduzirStatus(status) {
  const map = {
    rascunho: 'Rascunho',
    pendente: 'Pendente',
    enviado: 'Enviado',
    aceito: 'Aceito',
    recusado: 'Recusado',
  };
  return map[status] || status;
}

// =====================
// TOAST NOTIFICATION
// =====================

function mostrarToast(mensagem, duracao = 2500) {
  // Remove toast anterior se existir
  const anterior = document.querySelector('.toast');
  if (anterior) anterior.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensagem;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duracao);
}

// =====================
// CONFIGURAÇÃO INICIAL
// =====================

// Se não tiver configuração, abre modal de setup na primeira vez
function verificarSetupInicial() {
  const config = Storage.getConfig();
  if (!config.empresa) {
    const nome = prompt(
      'Bem-vindo ao Orçamentos Pro!\n\nQual é o nome da sua empresa?'
    );
    if (nome) {
      Storage.salvarConfig({ empresa: nome.trim() });
      document.querySelectorAll('#empresa-nome').forEach(el => {
        el.textContent = nome.trim();
      });
    }
  }
}

// Ativa o setup na primeira visita
document.addEventListener('DOMContentLoaded', () => {
  verificarSetupInicial();
});
