# Contexto — Guilherme Andrade
> Cole isso no início de qualquer sessão Claude mobile/navegador.
> Atualizado: 06/05/2026

---

## Quem sou

Guilherme Andrade, 33 anos, gaúcho. Digital nomad em Chiang Mai, Tailândia, com minha noiva. Designer Industrial por 9 anos (Brasil + Suíça). Aprendi a construir software sozinho usando IA. Opero uma micro-agência de automação + produtos SaaS. Custo mensal: R$5.650. Caixa atual: ~R$1.000, mas fixos dos próximos 30 dias já pagos e alimentação já tenho em cash. Dinheiro entrando. Margem mínima — não suavizar.

Mentor: Donal Lynch (irlandês). Me apresentou ao Claude e a esse workflow de skills + agentes.

---

## O negócio — Andarilho Digital

Agência B2B solo. Construo sistemas de gestão com IA para pequenos negócios brasileiros. CRMs, bots WhatsApp, automações n8n. Ticket médio: R$800–R$2.500/mês recorrente.

Único cliente recorrente: **Junior** (pet shop, Porto Alegre). R$300 toda segunda + R$200 toda sexta = ~R$2.150/mês. Junior não é só cliente — é co-fundador do Pets Go Control.

Gap para break-even: ~R$3.500/mês.

---

## Produto principal — Pets Go Control

Sistema de gestão completo para pet shops. Um único arquivo HTML (`petsgo-crm-light.html`), vanilla JS puro, zero dependências, funciona offline como PWA.

Co-fundado com Junior — ele tem 4 filiais em Porto Alegre que são o laboratório vivo. Visão: organizar as filiais dele → prova social → vender para outros pet shops no Brasil.

**Deploy:** https://andarilho-digital.pages.dev/petsgo-crm-light.html
**Manual:** https://andarilho-digital.pages.dev/petsgo-manual.html

**Estado em 25/04:** CRM básico — Clientes & Pets (1.041 tutores), filtro por filial, catálogo de serviços.

**Adicionado entre 25/04 e 06/05 (tudo novo):**
Agenda estilo Google Calendar (chips de serviço, filtro de filial), PDV/Caixa, Recibo PDF, modal de pagamento na agenda, Financeiro (Movimento + Gerencial), Estoque, Planos & Pacotes (crédito pré-pago, abate diário automático), histórico de diárias, diária retroativa com proteção de duplicata, plano com grupo + modalidade + frequência semanal, cancelamento de plano limpa financeiro, Funcionários, Manual v4 responsivo mobile.

**Próximas features (em ordem):**
1. Botão "Reagendar após serviço" no recibo (chips rápidos 7/15/30 dias)
2. NF-e via eNotas — Junior tem conta + certificado A1, falta API Key
3. PWA completo + Cloudflare D1 (sync entre dispositivos, offline-first)

---

## Produto 2 — Nutri Control

Sistema de gestão para nutricionistas. Single-file HTML, vanilla JS.
Módulos: Pacientes, Agenda, Evolução peso/IMC/TMB, Exames laboratoriais, Documentos PDF, Transcrição de voz.

**Deploy:** https://andarilho-digital.pages.dev/nutri-control.html
**Landing page:** criada (`nutri-landing.html`), deploy pendente.
Status: produto pronto, aguarda cliente real para validar.

---

## Canal — Um Forasteiro

YouTube + Instagram. Narrativa solo: designer que projeta sistemas de sobrevivência em cada país. Ciclo vivido duas vezes (Europa → gasta na Tailândia → volta). Tailândia 2 é a aposta definitiva com digital.

Status: parado. Pets Go tem prioridade até ter caixa estável. Canal alimenta funil da agência no longo prazo.

---

## Stack técnico

- Todo código: HTML + vanilla JS puro. Zero frameworks, zero dependências externas.
- Armazenamento: localStorage + IndexedDB
- Deploy: Cloudflare Pages — projeto `andarilho-digital`
- URL pública: https://andarilho-digital.pages.dev
- Repo público: github.com/andarilho1992/AI-AGency-files
- Repo privado: github.com/andarilho1992/my-workspace

---

## APIs e serviços

| Serviço | Status |
|---------|--------|
| Anthropic Claude | ✅ Ativo |
| Cloudflare Pages | ✅ Ativo |
| GitHub | ✅ Ativo |
| n8n (conta do Junior) | ✅ Ativo |
| eNotas (NF-e) | ⏳ Junior tem conta, falta API Key |
| Evolution API (WhatsApp) | ⏳ Aguarda budget |
| OpenAI / Perplexity | ❌ Não configurado |

---

## Landing pages criadas (05–06/05/2026)

- `guilherme-build.html` — portfólio pessoal dark (Clash Display + Satoshi, terracota)
- `petsgo-landing.html` — landing page de vendas do Pets Go
- `nutri-landing.html` — landing page de vendas do Nutri Control

Todas staged no git, deploy pendente. Correção pendente: número WhatsApp no guilherme-build.html.

---

## Sistema de skills (Claude desktop)

O Claude desktop usa skills — arquivos `.md` que ensinam papéis específicos. No mobile não carregam automaticamente.

**Workflow:** `daily-brief` (manhã), `reflect` (fim de sessão), `weekly-report` (sexta), `petsgo-report` (update pro Junior)

**Personas:** `research-analyst`, `copywriter`, `technical-architect`, `sales-strategist`, `plm-engineer`

**Projeto:** `guilherme-profile`, `um-forasteiro`, `business-system`, `design-system`, `architecture`, `clean-code`, `systematic-debugging`, `frontend-design`, `app-builder`, `api-patterns`, `sales-closer`, `proposta`, `brainstorming`, `ux-audit`

**Conteúdo:** `instagram-carousel`, `instagram-copy`, `instagram-strategy`, `mobile-video-director`, `casey-neistat`, `content-pipeline`, `seo-growth`, `paid-traffic`

**Agência/Agentes:** `orchestrator`, `compound-research`, `brief-to-website`, `quick-lead-site`, `outreach-engine`, `multi-client-audit`

---

## Como trabalhar comigo

- Direto e tático. Zero motivacional.
- Explica o que está fazendo E por quê — aprendo enquanto construo.
- Uma pergunta de esclarecimento quando em dúvida, não cinco.
- Cada tarefa produz um arquivo ou ação concreta.
- Nunca suaviza a realidade financeira.
- Prioridade sempre: (1) Pets Go / Junior, (2) caixa, (3) tudo mais.
- Modelo mental: sou um designer industrial que aprendeu a codar — vejo sistemas, não só telas.
