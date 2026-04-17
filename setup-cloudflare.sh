#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  SETUP — Andarilho Digital no Cloudflare + GitHub
#  Rode: bash setup-cloudflare.sh
#
#  O que este script faz:
#    1. Instala wrangler (Cloudflare CLI) e gh (GitHub CLI)
#    2. Autentica nos dois serviços
#    3. Cria repo privado no GitHub para dados
#    4. Inicializa leads.json e logs.json no repo
#    5. Sobe os secrets no Cloudflare
#    6. Faz o deploy do worker
# ═══════════════════════════════════════════════════════════════

set -e

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   ANDARILHO DIGITAL — SETUP CLOUDFLARE + GITHUB ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── 1. Instalar ferramentas ──────────────────────────────────
echo "[ 1/6 ] Instalando ferramentas CLI..."

# wrangler
if ! command -v wrangler &> /dev/null; then
  npm install -g wrangler
  echo "  ✅ wrangler instalado"
else
  echo "  ✅ wrangler já instalado: $(wrangler --version)"
fi

# gh CLI
if ! command -v gh &> /dev/null; then
  echo "  ⚠️  GitHub CLI não encontrado."
  echo "  Windows: winget install GitHub.cli"
  echo "  Mac:     brew install gh"
  echo "  Linux:   https://cli.github.com"
  echo "  Instale e rode o script novamente."
  exit 1
else
  echo "  ✅ gh já instalado: $(gh --version | head -1)"
fi

# ─── 2. Autenticar ────────────────────────────────────────────
echo ""
echo "[ 2/6 ] Autenticando..."

echo "  → GitHub (abrirá o browser ou use token)"
gh auth login

echo "  → Cloudflare (abrirá o browser)"
wrangler login

# ─── 3. Criar repo de dados no GitHub ────────────────────────
echo ""
echo "[ 3/6 ] Criando repo de dados no GitHub..."

GH_OWNER=$(gh api user --jq '.login')
GH_REPO="andarilho-data"

if gh repo view "$GH_OWNER/$GH_REPO" &> /dev/null; then
  echo "  ✅ Repo $GH_OWNER/$GH_REPO já existe"
else
  gh repo create "$GH_REPO" --private --description "Dados do sistema de prospecção Andarilho Digital"
  echo "  ✅ Repo $GH_OWNER/$GH_REPO criado"
fi

# ─── 4. Inicializar arquivos de dados ────────────────────────
echo ""
echo "[ 4/6 ] Inicializando dados no GitHub..."

# leads.json
if gh api "repos/$GH_OWNER/$GH_REPO/contents/leads.json" &> /dev/null; then
  echo "  ✅ leads.json já existe"
else
  gh api "repos/$GH_OWNER/$GH_REPO/contents/leads.json" \
    --method PUT \
    --field message="init leads.json" \
    --field content="$(echo '[]' | base64)" \
    > /dev/null
  echo "  ✅ leads.json criado"
fi

# logs.json
if gh api "repos/$GH_OWNER/$GH_REPO/contents/logs.json" &> /dev/null; then
  echo "  ✅ logs.json já existe"
else
  gh api "repos/$GH_OWNER/$GH_REPO/contents/logs.json" \
    --method PUT \
    --field message="init logs.json" \
    --field content="$(echo '{}' | base64)" \
    > /dev/null
  echo "  ✅ logs.json criado"
fi

# ─── 5. Subir secrets no Cloudflare ──────────────────────────
echo ""
echo "[ 5/6 ] Configurando secrets no Cloudflare Workers..."
echo "  (entre na pasta worker-prospecao/)"
echo ""

cd worker-prospecao
npm install

# Gera token GitHub com permissão de repo
echo ""
echo "  Precisamos de um GitHub Personal Access Token (classic):"
echo "  → github.com/settings/tokens/new"
echo "  → Permissões: repo (full)"
echo "  → Copie o token e cole abaixo"
echo ""
printf "  GitHub Token: " && read -r GH_TOKEN

echo "$GH_TOKEN"           | wrangler secret put GITHUB_TOKEN
echo "$GH_OWNER"           | wrangler secret put GH_OWNER
echo "$GH_REPO"            | wrangler secret put GH_REPO

# Secret de autenticação dos endpoints
DEFAULT_SECRET="andarilho-$(date +%s | tail -c 6)"
printf "  SYNC_SECRET [padrão: $DEFAULT_SECRET]: " && read -r SYNC_SECRET_INPUT
SYNC_SECRET="${SYNC_SECRET_INPUT:-$DEFAULT_SECRET}"
echo "$SYNC_SECRET" | wrangler secret put SYNC_SECRET

echo ""
echo "  Agora as chaves opcionais (Enter para pular):"
echo ""

printf "  ANTHROPIC_API_KEY: " && read -r V
[ -n "$V" ] && echo "$V" | wrangler secret put ANTHROPIC_API_KEY

printf "  GOOGLE_PLACES_API_KEY: " && read -r V
[ -n "$V" ] && echo "$V" | wrangler secret put GOOGLE_PLACES_API_KEY

printf "  EVOLUTION_API_URL: " && read -r V
[ -n "$V" ] && echo "$V" | wrangler secret put EVOLUTION_API_URL

printf "  EVOLUTION_API_KEY: " && read -r V
[ -n "$V" ] && echo "$V" | wrangler secret put EVOLUTION_API_KEY

printf "  EVOLUTION_INSTANCE [padrão: andarilho]: " && read -r V
[ -n "$V" ] && echo "$V" | wrangler secret put EVOLUTION_INSTANCE

# ─── 6. Deploy ───────────────────────────────────────────────
echo ""
echo "[ 6/6 ] Fazendo deploy no Cloudflare Workers..."
wrangler deploy

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║                  ✅  PRONTO!                     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "  Worker URL: https://andarilho-prospecao.<seu-subdomain>.workers.dev"
echo "  Dados:      github.com/$GH_OWNER/$GH_REPO"
echo "  Secret:     $SYNC_SECRET"
echo ""
echo "  COMANDOS ÚTEIS (dentro de worker-prospecao/):"
echo ""
echo "  npm run dev           → roda local (http://localhost:8787)"
echo "  npm run deploy        → re-deploy"
echo "  npm run logs          → stream de logs em tempo real"
echo ""
echo "  TESTAR:"
echo "  curl https://<url>/status"
echo "  curl -X POST https://<url>/prospectar -H 'x-sync-secret: $SYNC_SECRET'"
echo "  curl -X POST https://<url>/enviar/lote -H 'x-sync-secret: $SYNC_SECRET'"
echo ""
echo "  VER DADOS:"
echo "  gh api repos/$GH_OWNER/$GH_REPO/contents/leads.json | jq '.content' | base64 -d | jq ."
echo "  gh api repos/$GH_OWNER/$GH_REPO/contents/logs.json  | jq '.content' | base64 -d | jq ."
echo ""
echo "  CRON (automático, UTC):"
echo "  Prospectar  → Ter + Sex 10h UTC (07h BRT)"
echo "  Enviar lote → Ter + Qui 13h UTC (10h BRT)"
echo "  Follow-up   → Qua + Sab 13h UTC (10h BRT)"
echo ""
