---
name: Status do projeto Pets Go
description: Status atual do CRM Pets Go Control — módulos, deploy, dados, pagamentos e próximos passos
type: project
originSessionId: a358548c-1c33-415d-a444-f1502b588eb6
---
## CRM Pets Go Control

Arquivo oficial: `C:\Users\viaje\Projeto 1\petsgo-crm-light.html`
Deploy público: https://andarilho-digital.pages.dev/petsgo-crm-light.html
Manual v4: https://andarilho-digital.pages.dev/petsgo-manual.html

**Módulos funcionais (06/05/2026):**
- Dashboard ✅
- Clientes & Pets (CPF, endereço, peso, histórico) ✅
- Agenda visual estilo Google Calendar ✅ (chips de serviço, filtro de filial)
- Check-in/Out ✅
- PDV / Caixa ✅
- Recibo PDF ✅
- Pagar na agenda (modal forma de pagamento) ✅
- Financeiro: Movimento + Gerencial ✅
- Estoque ✅
- Planos & Pacotes (crédito pré-pago, abate diário automático) ✅
- Histórico de diárias do plano ✅
- Diária retroativa + proteção duplicata ✅
- Plano com grupo + modalidade + frequência semanal ✅
- Cancelar plano limpa financeiro ✅
- Funcionários ✅
- Serviços CRUD (8 serviços padrão seedados) ✅

**Dados dos clientes:**
- 1041 tutores + 1382 pets (3 filiais: Cachorródromo, Rio Branco, Petrópolis)
- Seed local: `C:\Users\viaje\Projeto 1\petsgo-seed-todas-filiais.html`
- Seed NÃO está no servidor (PII — entregue por WhatsApp direto ao Junior)
- Regenerar: `node gen_seed.cjs` na pasta do projeto

**Arquivos relacionados:**
- Base white-label: `petsgo-crm-base.html` (setup wizard + aparência configurável + seletor cor)
- Landing page: `petsgo-landing.html` (staged, não deployado)
- Gerador do seed: `gen_seed.cjs`
- Parser dos PDFs: `parse_clientes.cjs`

**Pagamentos do Junior — confirmado 04/05/2026:**
- R$300 toda segunda + R$200 toda sexta = ~R$2.150/mês recorrente
- R$180 pago em 25/04/2026 por entrega da fachada

**Status dos sistemas legados:**
- CRM antigo no Cloudflare Workers: descontinuado
- Servidor de agentes Railway: https://petsgo-agents-production.up.railway.app ⏳ (trial, verificar)
- Sync CRM → Railway: ❌ pendente
- WhatsApp Evolution API: ❌ aguarda budget

**Próximos passos:**
1. Junior validar CRM na operação real (seed entregue por WhatsApp)
2. Botão "Reagendar após serviço" no recibo (chips rápidos 7/15/30 dias)
3. NF-e via eNotas API (Junior tem conta + certificado A1, falta API Key)
4. PWA completo + Cloudflare D1 (sync entre dispositivos, offline-first)

**Why:** Junior é co-fundador/validação do Pets Go — mostrar valor constante é prioridade máxima.
**How to apply:** CRM primeiro. Próxima feature: reagendamento pós-serviço.
