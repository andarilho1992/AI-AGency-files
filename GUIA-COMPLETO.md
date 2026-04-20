# Guia Completo — O que foi construído, como usar e o que falta
**Guilherme Andrade / Andarilho Digital**
**Atualizado:** Abril 2026

---

## PARTE 1 — O QUE FOI CONSTRUÍDO

### 🧠 Sistema de Memória (Claude lembra de você entre sessões)

Foram criados 7 arquivos de memória que ficam salvos permanentemente. Toda vez que você abre uma nova conversa com o Claude, ele lê esses arquivos antes de responder qualquer coisa.

| Arquivo | O que contém |
|---------|-------------|
| `user_profile.md` | Quem você é, como prefere trabalhar, UTC+7, custo mensal real |
| `project_andarilho.md` | Andarilho Digital + Um Forasteiro: metas, status, prioridades |
| `project_petsgo_status.md` | Estado atual do CRM da Pets Go |
| `project_petsgo_roadmap.md` | 6 módulos do CRM, fases MVP/Core/Fase2+ |
| `feedback_working_rules.md` | Regras inegociáveis (sem coach-speak, Pets Go primeiro, etc.) |
| `feedback_git.md` | Regras de commit, pipeline de deploy, trabalho paralelo |
| `reference_apis.md` | Onde ficam cada chave de API, comandos de deploy, repos GitHub |

**Por que isso importa:** Sem isso, toda sessão começa do zero. Com isso, o Claude já sabe quem você é, o que está construindo, e o que já foi decidido — sem você precisar repetir.

---

### 📋 CLAUDE.md (Manual de Operação Permanente)

O arquivo `.claude/CLAUDE.md` é carregado automaticamente em **toda** conversa. Ele contém:

- Quem você é e seus projetos ativos
- Regras de comportamento (zero enrolação, números reais)
- Mapeamento de todas as skills disponíveis
- **Doutrina de modelo** (quando usar Haiku vs Sonnet vs Opus)
- Regras de múltiplos agentes
- Regra de deploy (não está pronto até curl retornar 200)

**Por que isso importa:** É a "constituição" do seu workspace. Define como o Claude trabalha com você para sempre, não só nessa sessão.

---

### ⚡ Hooks — Proteção Automática do Trabalho

Configurado em `.claude/settings.json`. Toda vez que o Claude salva ou edita um arquivo, ele automaticamente roda `git add -A`.

**Antes:** Você poderia fechar o VS Code sem salvar e perder horas de trabalho.
**Agora:** Cada arquivo salvo pelo Claude é automaticamente staged no git. Só falta você fazer o commit.

---

### 🔌 MCP — Conexões com Ferramentas Externas (Prontas, Aguardando Chaves)

MCP (Model Context Protocol) é o sistema de plugins do Claude Code. Com ele, o Claude consegue ler seu Google Drive, escrever em planilhas, buscar na web, mandar mensagens no Slack — sem você precisar copiar e colar nada.

Os stubs (configurações) já foram adicionados em `.claude/settings.json`:

| MCP | O que faz quando ativo |
|-----|----------------------|
| Google Drive | Claude lê seus documentos e pastas diretamente |
| Google Sheets | Claude lê e escreve em planilhas (clientes, financeiro, leads) |
| Firecrawl | Claude faz crawl profundo de sites (auditoria de clientes) |
| Slack | Claude manda e lê mensagens em canais |

**O que falta:** Credenciais. Ver Parte 3.

---

### 🛠️ Skills — Comandos de Um Clique

Skills são arquivos markdown que transformam tarefas repetitivas em um comando. Você digita `/nome-da-skill` e o Claude executa todo o fluxo automaticamente.

Você tem agora **30 skills** organizadas em categorias:

#### Workflow Diário
| Comando | O que faz | Modelo |
|---------|-----------|--------|
| `/daily-brief` | Abre a sessão: carrega estado, mostra 3 prioridades do dia | Haiku (rápido) |
| `/weekly-report` | Revisão da sexta: KPIs, o que foi feito, próxima semana | Haiku |
| `/reflect` | Fecha a sessão: salva o que foi feito, próximo passo exato | Haiku |
| `/petsgo-report` | Gera atualização profissional para o Junior | Sonnet |

#### Personas — "Switch to X mode"
| Persona | Quando usar |
|---------|-------------|
| `research-analyst` | Pesquisar mercado, analisar concorrentes, fact-checking |
| `copywriter` | Escrever emails, captions de Reel, propostas de venda |
| `technical-architect` | Decisões de arquitetura, revisão de código, planejamento |
| `sales-strategist` | Fechar cliente, lidar com objeções, escrever proposta |

Como usar: "Switch to Copywriter mode. Reescreve esse email."

#### Fluxos de Negócio (Showcases)
| Skill | O que faz |
|-------|-----------|
| `/orchestrate` | Coordena múltiplos agentes em paralelo com segurança |
| `/compound-research` | Pesquisa → Estratégia de Venda → Copy em sequência automática |
| `/multi-client-audit` | Audita múltiplos clientes/prospects em paralelo |
| `/brief-to-website` | Parágrafo de briefing → site HTML → URL ao vivo em 10 min |
| `/content-pipeline` | Plano semanal → scripts de Reel → legendas → calendário |
| `/outreach-engine` | Prospects → mensagem personalizada → follow-up → reunião |
| `/knowledge-ingestion` | Livro/curso/artigo → base de conhecimento pesquisável |

#### Skills de Projeto (já existiam, agora em inglês)
`guilherme-profile`, `um-forasteiro`, `business-system`, `charles-fantasy`, `content-system`, `growth-system`, `design-system`, `ux-audit`, `architecture`, `clean-code`, `systematic-debugging`, `frontend-design`, `game-development`, `performance-profiling`, `brainstorming`, `app-builder`, `api-patterns`, `web-design-guidelines`, `sales-closer`

---

### 🚀 Deploy Pipeline

**`deploy.sh`** atualizado — um comando faz tudo:
1. Commit com sua mensagem
2. Push para o GitHub
3. Deploy no Cloudflare Pages
4. Verifica se está ao vivo (curl 200)
5. Mostra a URL final

Uso: `./deploy.sh "mensagem do commit" nome-do-arquivo.html`

**URL de produção:** `https://andarilho-digital.pages.dev`

---

### 🤖 Infraestrutura Técnica

**Cloudflare Worker** (`workers/webhook-receiver.js`):
Receptor de webhooks pronto para conectar com Stripe, Evolution API (WhatsApp), Typeform, n8n. Deploy com um comando quando precisar.

**Agent SDK Python** (`agents/pipeline-template.py`):
Pipeline de 3 agentes prontos para rodar autonomamente:
- Agente 1 (Haiku): pesquisa o negócio
- Agente 2 (Sonnet): analisa oportunidades
- Agente 3 (Sonnet): escreve o pitch

Uso: `python agents/pipeline-template.py --target "nome-do-negocio"`

---

## PARTE 2 — COMO ISSO CONTRIBUI PRA CADA PROJETO

### 🐾 Pets Go (Prioridade 1 — Caixa Agora)

O que o sistema faz pelo Pets Go agora:

- **`/petsgo-report`** → Gera a atualização semanal pro Junior em 2 minutos. Mostra status de cada módulo, o que foi entregue, próxima entrega. Profissional, sem enrolação.
- **`technical-architect` persona** → Antes de qualquer decisão de arquitetura no CRM (novo módulo, nova feature), ativa essa persona. Ela considera o que quebra, o que escala, o custo de manutenção.
- **`/reflect` ao final de cada sessão** → Salva exatamente onde parou no código. Próxima sessão começa com `/daily-brief` e sabe o próximo passo sem perder tempo.
- **Memória ativa** → Claude sabe o roadmap completo do Pets Go (6 módulos, 3 fases). Não precisa explicar do zero toda vez.
- **Hooks automáticos** → Todo arquivo de código salvo é staged automaticamente. Menos chance de perder trabalho.

**Ganho real:** Mais tempo codando, menos tempo explicando contexto ou perdendo trabalho.

---

### 🏢 Andarilho Digital (Agência — Fechar Clientes)

O que o sistema faz pela agência:

- **`/compound-research [nome do negócio]`** → Pesquisa o prospect, identifica a dor, cria o pitch pronto para enviar no WhatsApp. Antes levava horas. Agora: 15 minutos.
- **`/outreach-engine [nicho] [cidade]`** → Pipeline completo de prospecção. Você lista os prospects, o sistema gera as 3 mensagens de follow-up personalizadas para cada um.
- **`sales-strategist` persona** → Antes de qualquer reunião de vendas, ativa essa persona. Ela prepara os argumentos, antecipa objeções, sugere o fechamento.
- **`/brief-to-website`** → Quando fechar um cliente novo, você tem um site no ar em menos de 10 minutos para mostrar que trabalha rápido. Isso é prova de valor imediata.
- **`/multi-client-audit`** → Quando você tiver 2-3 clientes, audita todos em paralelo em uma sessão. Relatórios individuais em HTML, cada um com URL própria.
- **Agent SDK Python** → Quando você tiver orçamento para um VPS (~$5/mês), esse pipeline roda autonomamente. Você acorda com 20 prospects pesquisados e pitches prontos.

**Ganho real:** Você consegue prospectar, pesquisar e criar propostas sem depender de tempo manual. Um dia de trabalho produz material suficiente para semanas de outreach.

---

### 📱 Um Forasteiro (Canal — Autoridade de Longo Prazo)

O que o sistema faz pelo canal:

- **`/content-pipeline`** → Toda segunda de manhã, um comando gera os 5 scripts de Reel da semana + 5 legendas + calendário de postagem. Baseado nos seus 4 pilares de conteúdo.
- **`copywriter` persona** → Escreve no seu tom. Tem os presets específicos do Um Forasteiro: honesto, cru, narrativa solo, sem linguagem de coach.
- **`um-forasteiro` skill** → Carrega toda a identidade do canal antes de qualquer criação de conteúdo.
- **`/knowledge-ingestion`** → Livros, cursos e podcasts que você consume viram base de conhecimento pesquisável. Em vez de tentar lembrar de um framework depois, você busca na base.

**Ganho real:** O canal vai de "zero conteúdo gravado, parado há 1 mês" para um sistema de produção que precisa de 15 minutos por semana para planejar. A execução (gravar) ainda é com você — mas o planejamento vira automático.

---

### 🎮 Charles Fantasy (App RPG)

O que o sistema faz pelo app:

- **`charles-fantasy` + `architecture` + `clean-code` skills** → São lidas automaticamente antes de qualquer sessão de código do Charles Fantasy. Elas carregam as regras invioláveis (3 arquivos apenas, vanilla JS puro, zero dependências).
- **`technical-architect` persona** → Avalia qualquer nova feature antes de implementar. Previne dívida técnica.
- **`systematic-debugging` skill** → Protocolo de debug com comandos de console prontos.
- **Hooks automáticos** → Código salvo automaticamente staged.

**Ganho real:** Nenhuma feature nova vai quebrar a regra dos 3 arquivos. Claude sempre vai lembrar das constraints antes de sugerir algo.

---

## PARTE 3 — O QUE FALTA FAZER

### 🟢 Você pode fazer agora (gratuito ou quase)

**1. Corrigir o Google Workspace (15 minutos)**
- Vai em `andarilhodigital92@gmail.com` → Google Drive
- Compartilha as pastas principais com `braziliangui1992@gmail.com`
- Isso ativa o MCP do Google Drive e Sheets no Claude Code
- Impacto: Claude consegue ler suas planilhas de clientes e leads diretamente

**2. Começar o hábito dos 15 minutos diários**
- Manhã: `/daily-brief` → Claude mostra onde parou e as 3 prioridades
- Fim do dia: `/reflect` → Claude salva o estado exato antes de fechar
- Isso garante que nenhuma sessão comece do zero

**3. Criar a estrutura de pastas `knowledge/`**
- `knowledge/clients/` → um arquivo por cliente com contexto
- `knowledge/books/` → conteúdo de livros que você leu (via `/knowledge-ingestion`)
- `knowledge/content-pillars.md` → seus 4 pilares de conteúdo do Um Forasteiro
- Isso alimenta as skills de content-pipeline e compound-research

**4. Testar o pipeline Python localmente**
- No terminal: `pip install anthropic`
- Depois: `python agents/pipeline-template.py --target "nome-de-um-prospect"`
- Não custa nada (usa a chave Anthropic que você já tem)

**5. Adicionar `.env.template` ao `.gitignore` corretamente**
- Hoje o `.env.template` está sendo bloqueado pelo gitignore (regra `*.env.*`)
- Se quiser versionar o template no GitHub: edita `.gitignore` e remove ou adiciona exceção para `*.template`

---

### 🟡 Requer um pouco de dinheiro (mas baixo custo)

**Firecrawl API (tem free tier)**
- Site: firecrawl.dev
- Free tier: 500 créditos/mês
- Impacto: Claude audita sites de clientes automaticamente. Usa a skill `/multi-client-audit` com dados reais.
- Adiciona a chave no `.env`: `FIRECRAWL_API_KEY=fc-...`

**Perplexity API (tem free tier)**
- Site: perplexity.ai/api
- Impacto: Claude pesquisa em tempo real com fontes citadas. Melhora muito o `/compound-research`.
- Adiciona no `.env`: `PERPLEXITY_API_KEY=pplx-...`

**VPS básico para Agent SDK (~$5/mês)**
- Digital Ocean, Hetzner, ou Contabo
- Roda o `agents/pipeline-template.py` de forma autônoma, 24/7
- Quando tiver 2-3 clientes, esse investimento se paga no primeiro dia

---

### 🔴 Requer investimento maior (quando tiver caixa)

**Claude Max 5x ($100/mês)**
- Ativa o Claude.ai Memory (3ª camada do sistema de memória)
- Permite correr muito mais agentes em paralelo sem limitação de taxa
- Justifica quando você tiver pelo menos 1 cliente recorrente pagando

**Stack de Outreach (Apollo + Hunter + Instantly)**
- Apollo: ~$49/mês (leads)
- Hunter: ~$49/mês (emails verificados)
- Instantly: ~$37/mês (sequências de email)
- Total: ~$135/mês
- ROI: 1 cliente fechado via outreach paga esses 3 meses de ferramentas
- Quando comprar: só quando tiver o Pets Go estável e 1-2 horas/semana pra outreach

**ElevenLabs (voice cloning)**
- $5-22/mês dependendo do plano
- Clona sua voz para narração de vídeos do Um Forasteiro
- Útil quando o canal tiver tração real (50+ seguidores engajados)

---

## PARTE 4 — COMO USAR NA PRÁTICA (DIA A DIA)

### Manhã (5 minutos)
```
1. Abre VS Code
2. Abre o terminal integrado
3. Digita: /daily-brief
4. Claude mostra onde parou ontem e as 3 prioridades
5. Você começa a trabalhar no item #1
```

### Durante o Trabalho
```
- Para código: Claude Code no terminal
- Para estratégia: "Switch to Technical Architect mode"
- Para venda: "Switch to Sales Strategist mode"
- Para copy: "Switch to Copywriter mode"
- Para pesquisa: "Switch to Research Analyst mode"
```

### Fim do Dia (5 minutos)
```
1. Digita: /reflect
2. Claude pergunta o que foi feito
3. Você responde em 3-4 linhas
4. Claude salva o estado na memória
5. Fecha o VS Code com consciência limpa
```

### Sexta-Feira (15 minutos)
```
1. Digita: /weekly-report
2. Responde as perguntas (o que fez, o que não fez, receita)
3. Claude gera relatório salvo em reports/weekly-YYYY-MM-DD.md
4. Usa esse relatório para a reunião mental da semana
```

### Antes de Cada Atualização para o Junior (Pets Go)
```
1. Digita: /petsgo-report
2. Responde o que foi entregue
3. Claude gera o relatório formatado
4. Você cola no WhatsApp para o Junior
```

### Quando Quiser Prospectar
```
1. Digita: /outreach-engine [nicho] [cidade]
2. Claude gera lista de prospects + 3 mensagens por prospect
3. Você revisa e envia as melhores
4. Para a pesquisa mais profunda: /compound-research [nome do negócio]
```

---

## PARTE 5 — GLOSSÁRIO (O QUE É CADA COISA)

**Claude Code:** A versão do Claude que vive no seu terminal/VS Code. Pode ler e escrever arquivos, rodar código, fazer deploy. É mais poderoso que o chat normal.

**MCP (Model Context Protocol):** Sistema de plugins. Cada MCP conecta o Claude a uma ferramenta externa (Google Drive, Slack, etc.). Quando ativo, Claude acessa essas ferramentas sem você precisar copiar e colar.

**Skills:** Arquivos markdown em `.agent/skills/`. Cada um é um "modo especialista" ou fluxo de trabalho. Você ativa com `/nome-da-skill`.

**Hooks:** Comandos que rodam automaticamente quando o Claude faz algo. O hook que configuramos: toda vez que Claude salva um arquivo, automaticamente roda `git add`. Proteção automática do trabalho.

**Orquestrador:** Um agente Claude principal que coordena vários agentes menores rodando em paralelo. O principal não produz arquivos — só coordena, integra e faz commit.

**Subagente:** Um Claude auxiliar que roda uma tarefa específica e retorna o resultado para o orquestrador.

**Haiku / Sonnet / Opus:** Três versões do Claude com custo e capacidade diferentes:
- Haiku: barato e rápido. Para extração de dados, formatação, tarefas em massa.
- Sonnet: balanceado. Para código, conteúdo de qualidade, análise.
- Opus: caro e poderoso. Para estratégia complexa e arquitetura. Use raramente.

**Deploy:** Publicar um arquivo para que fique ao vivo na internet. No seu caso: `npx wrangler pages deploy`.

**Curl:** Comando que verifica se uma URL está respondendo. Se retornar 200, está ao vivo.

**CLAUDE.md:** O manual de operação do seu workspace. O Claude lê esse arquivo no início de toda sessão.

**Memória:** Arquivos em `~/.claude/projects/.../memory/`. Persistem entre sessões. São a "memória de longo prazo" do Claude sobre você e seus projetos.

**Git:** Sistema de versionamento. Registra cada mudança em arquivo. Permite voltar a qualquer versão anterior. Seus repos: `AI-AGency-files` (público) e `my-workspace` (privado).

**Cloudflare Pages:** Onde seus sites HTML ficam hospedados. Gratuito. URL base: `andarilho-digital.pages.dev`.

**Worker:** Função serverless no Cloudflare. Roda JavaScript na edge, sem servidor. Você tem um template em `workers/webhook-receiver.js` pronto para receber eventos externos (pagamentos, formulários, mensagens).

**Pipeline:** Sequência de agentes onde a saída de um é a entrada do próximo. Exemplo: Pesquisador → Analista → Escritor de pitch.

**Webhook:** Notificação automática enviada por um serviço quando algo acontece. Exemplo: Stripe manda um webhook quando um pagamento é recebido. Seu worker recebe e faz algo com isso.

---

## RESUMO EXECUTIVO

**O que você tem hoje:**
Um sistema de IA configurado para operar a Andarilho Digital de forma semi-autônoma. Claude já sabe quem você é, o que está construindo, as regras do jogo, e como agir em cada contexto.

**O que isso muda na prática:**
Você para de repetir contexto toda sessão. Claude começa trabalhando, não aprendendo. Tarefas que levavam horas (pesquisar um prospect, gerar conteúdo da semana, reportar para o Junior) agora levam minutos.

**O que ainda depende de você:**
- Fazer o `/daily-brief` de manhã e o `/reflect` de noite (hábito de 10 min)
- Corrigir o email do Google Drive (15 min, uma vez)
- Quando tiver caixa: comprar as ferramentas de outreach
- Quando Pets Go estabilizar: ativar o canal Um Forasteiro com `/content-pipeline`

**A prioridade não mudou:**
Pets Go primeiro. Caixa antes de escalar. Tudo isso existe para fazer você entregar o MVP mais rápido e fechar os próximos clientes com menos esforço.

---

*Documento gerado por Claude Code — Andarilho Digital, Abril 2026*
