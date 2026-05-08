---
name: project_petsgo_roadmap
description: Roadmap oficial Pets Go: status atual, próximas features, decisões técnicas PWA e NF-e
type: project
originSessionId: a358548c-1c33-415d-a444-f1502b588eb6
---
## Status dos módulos (01/05/2026)

| Módulo | Status |
|--------|--------|
| Clientes + Pets (CPF, endereço, peso) | ✅ Feito |
| Agenda visual (Google Calendar style) | ✅ Feito |
| PDV / Caixa | ✅ Feito |
| Financeiro (Movimento + Gerencial) | ✅ Feito |
| Estoque | ✅ Feito |
| Planos & Pacotes | ✅ Feito |
| Funcionários | ✅ Feito |
| Recibo PDF | ✅ Feito |
| Pagar na agenda (modal forma pagamento) | ✅ Feito |
| Filtro de serviço na agenda (chips dinâmicos) | ✅ Feito |
| Histórico de diárias do plano | ✅ Feito |
| Diária retroativa + proteção duplicata | ✅ Feito |
| Plano com grupo + modalidade + frequência semanal | ✅ Feito |
| Cancelar plano limpa financeiro | ✅ Feito |
| Manual v4 responsivo mobile | ✅ Feito |

## Próximas features (aguardando aprovação Junior)

- **Reagendar após serviço**: botão no recibo "Agendar próxima visita" pré-preenchido com mesmo cliente/pet/serviço + chips rápidos 7/15/30 dias
- **NF-e via eNotas**: botão "Emitir NF-e" no PDV/recibo → Cloudflare Worker → eNotas API → DANFE PDF + XML para contador

## Decisão técnica: PWA + Cloudflare D1

**Quando:** assim que Junior aprovar as funcionalidades atuais

**Why:** Junior quer offline (internet instável no pet shop). Guilherme quer cloud. PWA + D1 entrega os dois.

**Plano:**
1. PWA (manifest.json + service-worker.js) — 1 sessão
   - Instala na tela inicial do celular/PC/tablet como app nativo
   - Funciona 100% offline após primeiro carregamento
2. Sync com Cloudflare D1 — 1 sessão maior
   - Dados compartilhados entre dispositivos
   - Backup automático, offline-first

## NF-e — Plano técnico

**Provedor:** eNotas (mesmo que Pet Shop Control usa — confirmado em case study oficial)

**Junior já tem:** conta eNotas configurada, certificado A1 uploadado, dados da empresa preenchidos

**O que falta:** API Key do eNotas → `wrangler secret put ENOTAS_API_KEY`

**Arquitetura:** Pets Go → Cloudflare Worker → eNotas API → SEFAZ → DANFE PDF + XML

**Cobre:** NFC-e (produtos) + NFS-e Porto Alegre (serviços: banho, tosa, creche, hotel)

**CNAEs:** clínica vet s/ internação, salão de beleza p/ animais, alimentos p/ animais, armarinho/bijuterias, produtos agrícolas/vet, alojamento de animais

## Links ativos

- Sistema: https://andarilho-digital.pages.dev/petsgo-crm-light.html
- Manual v4: https://andarilho-digital.pages.dev/petsgo-manual.html
