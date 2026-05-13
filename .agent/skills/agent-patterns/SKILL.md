# Skill: Agent Patterns

## Role
Arquiteto de sistemas multi-agente usando Cloudflare Workers + Claude API. Especialista em escolher o padrão certo para cada problema — sem over-engineering.

---

## Lei Fundamental (Anthropic)
> "Comece simples. Adicione complexidade só quando necessário e demonstrável."

A maioria dos problemas resolve com um único LLM bem configurado + RAG. Agentes completos são para quando o número de passos é imprevisível.

---

## Os 5 Padrões de Workflow (do mais simples ao mais complexo)

### 1. Prompt Chaining (Encadeamento)
**O que é:** Saída de um LLM vira entrada do próximo. Passos sequenciais fixos.
**Quando usar:** Tarefa decomponível em subtarefas fixas, troca latência por precisão.
**Exemplo no teu stack:**
```
Prospectar → Qualificar → Gerar Mensagem → Enviar
(cada etapa é um step no Cron do Worker)
```
**Cuidado:** Adicione checkpoints de validação entre steps. Se um step falha, não passa pro próximo.

---

### 2. Routing (Roteamento)
**O que é:** LLM classifica o input e manda para handler especializado.
**Quando usar:** Inputs com categorias distintas que precisam de tratamento diferente.
**Exemplo no teu stack:**
```js
// No worker: roteia por tipo de lead
if (lead.nicho === 'pet shop') return agentPetShop(lead);
if (lead.nicho === 'clínica') return agentClinica(lead);
// Ou roteamento por modelo:
// Pergunta simples → Haiku | Análise complexa → Sonnet
```
**Ganho real:** Reduz custo — perguntas simples não precisam de Sonnet.

---

### 3. Paralelização
**Variante A — Sectioning:** Subtarefas independentes rodam ao mesmo tempo.
**Variante B — Voting:** Mesma tarefa roda N vezes, pega consenso (melhor qualidade).

**Quando usar:** Múltiplos produtos/campanhas independentes, ou quando precisas de alta confiança em decisão crítica.
**Exemplo:**
```js
// Prospectar 3 cidades ao mesmo tempo
const [poa, sao, rj] = await Promise.all([
  buscarLeads('Porto Alegre'),
  buscarLeads('São Paulo'),
  buscarLeads('Rio de Janeiro'),
]);
```
**Cuidado:** Cloudflare Workers tem limite de subrequests simultâneos (50). Não paralelize mais que isso.

---

### 4. Orchestrator-Workers (Orquestrador + Subagentes)
**O que é:** LLM central decompõe o problema dinamicamente e delega para workers especializados. Workers retornam resultados, orquestrador sintetiza.
**Quando usar:** Problema complexo onde os subtarefas não são previsíveis com antecedência.
**Exemplo (teu worker atual):**
```
Orchestrator (scheduled cron)
├── agentProspectar() → busca e salva leads
├── agentAnalyst()   → qualifica leads
├── agentWriter()    → gera mensagens
└── agentTracker()   → atualiza pipeline
```
**Crítico:** Cada worker deve ter responsabilidade única. Orquestrador não executa — só coordena.

---

### 5. Evaluator-Optimizer (Gerador + Avaliador)
**O que é:** LLM A gera. LLM B avalia e critica. Loop até aprovação.
**Quando usar:** Output tem critério claro de qualidade. Ex: copy de vendas, mensagem de prospecção.
**Exemplo:**
```js
let msg = await gerarMensagem(lead);
let score = await avaliarMensagem(msg, lead); // 0-10
if (score < 7) msg = await refinarMensagem(msg, score.feedback);
```
**Cuidado:** Limite de iterações (max 3). Senão entra em loop infinito e estoura budget.

---

## ReAct Loop (Think → Act → Observe)
Base de qualquer agente que usa tools. Alterna raciocínio e ação:

```
Thought: Preciso encontrar petshops em POA com baixa presença digital
Action: buscarPlaces("pet shop", "Porto Alegre")
Observation: 12 resultados retornados
Thought: Preciso filtrar franquias
Action: filtrarFranquias(results)
Observation: 8 independentes restaram
Thought: Agora gero mensagem personalizada para cada um
Action: gerarMensagem(lead[0])
...
```

**Por que importa:** Torna o agente debugável. Você vê exatamente onde ele errou.
**No teu stack:** Usa `console.log('[AGENTE] Thought:', ...)` em cada step do Worker. Visível no `wrangler tail`.

---

## Tipos de Memória de Agente

| Tipo | O que é | No teu stack |
|------|---------|--------------|
| **In-context** | Prompt atual | Histórico de conversa no Claude |
| **External (KV)** | Banco de dados | GitHub (leads.json) via D1 |
| **Episódic** | O que aconteceu antes | logs.json no Worker |
| **Semantic** | Embeddings/RAG | Não usado ainda — adicionar se precisar buscar em histórico grande |

---

## Tool Design (ACI — Agent-Computer Interface)
A Anthropic gastou mais tempo otimizando as **ferramentas** do que os prompts. Regras:

1. **Documenta cada tool como se fosse pra um dev júnior** — nome, parâmetro, quando usar, quando NÃO usar
2. **Use absolute paths, não relative** — elimina 90% dos erros de LLM
3. **Testa com muitos inputs** — o modelo vai usar a tool de formas que você não antecipou
4. **Poka-yoke:** Mude a estrutura para tornar o erro impossível, não só documentar o erro

**Exemplo prático:**
```js
// RUIM: LLM pode confundir
tools: [{ name: 'save', params: { path: 'string' } }]

// BOM: impossível errar
tools: [{ name: 'saveLeadToGithub', params: {
  leadId: 'string', // ex: "lead-1234abcd"
  status: 'encontrado|qualificado|descartado', // enum claro
  mensagem: 'string' // mensagem WhatsApp gerada
}}]
```

---

## Quando Usar Agente vs Workflow vs LLM Simples

```
Problema bem definido, passos fixos?
→ WORKFLOW (prompt chaining ou routing)

Problema complexo, subtarefas imprevisíveis?
→ AGENTE (orchestrator-workers)

Pergunta simples, resposta direta?
→ LLM SIMPLES (Haiku com retrieval)

Output precisa ser perfeito e tem critério claro?
→ EVALUATOR-OPTIMIZER (2-3 iterações)
```

---

## Model Routing para Agentes (teu stack)

| Task | Modelo | Razão |
|------|--------|-------|
| Classificar/rotear leads | Haiku | Decisão binária, barato, rápido |
| Gerar mensagem WhatsApp | Sonnet | Cliente vai ler, qualidade importa |
| Análise de presença digital | Sonnet | Raciocínio complexo |
| Follow-up em loop | Haiku | Escala — muitos leads |
| Decisão de arquitetura | Opus | 1-2x/semana máximo |
| Extrair dados estruturados | Haiku | Pattern matching simples |
| Copy de proposta/pitch | Sonnet | Alto stakes, cliente vai ver |

---

## Anti-Padrões (Não Faça)

- ❌ **Framework antes de entender o básico** — Comece com chamadas diretas à API. Frameworks escondem o que está acontecendo.
- ❌ **Agente para tudo** — Se o número de steps é previsível, use workflow. Agente = custo maior + erro composto.
- ❌ **Loop sem limite** — Todo loop de agente precisa de `maxIterations`. Senão estoura contexto e budget.
- ❌ **Tools genéricas demais** — `execute_code` é menos útil que `run_python_snippet(code, timeout)`.
- ❌ **Paralelizar mais que 50 requests** — Limite do Cloudflare Workers.
- ❌ **Estado em memória no Worker** — Workers são stateless. Todo estado vai pro D1/KV/GitHub.

---

## Padrões Específicos para Cloudflare Workers

```js
// Cron bem definido por agente
"0 10 * * 2,5"  → agentProspectar  (Ter/Sex 07h BRT)
"0 13 * * 2,4"  → agentEnviarLote  (Ter/Qui 10h BRT)
"0 13 * * 3,6"  → agentFollowUp    (Qua/Sab 10h BRT)

// Cada agente: responsabilidade única, sem overlap
// Escreve no D1/GitHub, nunca lê estado de outro agente em tempo real
// Usa waitUntil() para não bloquear response

ctx.waitUntil(agentProspectar(env).catch(e => console.error(e)));
return json({ ok: true, started: true }); // responde imediato
```

---

## Checklist ao Construir um Novo Agente

- [ ] Qual padrão? (chaining / routing / parallel / orchestrator / evaluator)
- [ ] Qual modelo por step? (Haiku/Sonnet/Opus)
- [ ] Onde fica o estado? (D1 / KV / GitHub JSON)
- [ ] Qual o limite de iterações/loops?
- [ ] Como debugar? (console.log com prefixo `[AGENTE N]`)
- [ ] O que acontece se falhar? (try/catch + log + não quebra o cron todo)
- [ ] Tem humano no loop? (aprovação manual antes de ação irreversível = enviar WA)
- [ ] Tools documentadas como ACI?

---

## Fontes
- Anthropic: "Building Effective Agents" (2024)
- ReAct: Yao et al., arXiv:2210.03629
- Microsoft: "AI Agents for Beginners" (github.com/microsoft/ai-agents-for-beginners)
- Google: Agent Design Patterns Whitepaper
