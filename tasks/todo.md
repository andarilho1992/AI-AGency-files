# tasks/todo.md
_Última atualização: 07/05/2026_

---

## Bloqueado

| # | Tarefa | Arquivo | Status |
|---|--------|---------|--------|
| 1 | NF-e via eNotas — aguarda último nº de nota do contador do Junior | `petsgo-crm-light.html` + Cloudflare Worker | 🟡 Bloqueado (dependência externa) |

---

## Backlog — Pets Go Control

| # | Tarefa | Prioridade |
|---|--------|-----------|
| 2 | PWA + service worker (offline-first real, instalável no celular) | Alta |
| 3 | Cloudflare D1 — sync entre dispositivos | Alta |
| 4 | NF-e: NFC-e (produtos) + NFS-e POA (serviços) via eNotas API | Alta |

---

## Backlog — Nutri Control

| # | Tarefa | Prioridade | Condição |
|---|--------|-----------|----------|
| 5 | Módulo Antropometria (Pollock, Petroski, Guedes, Durnin, Faulkner) | Alta | **Só após contrato assinado** |
| 6 | Anamnese estruturada 1ª e 2ª consulta | Alta | Após módulo 5 |
| 7 | Prontuário por consulta + Diário expandido | Média | Após módulo 6 |
| 8 | Exames com comparação % (verde/vermelho/cinza) | Média | Após módulo 6 |
| 9 | Faturamento por paciente | Média | — |
| 10 | Plano alimentar + Sintomas correlacionados | Baixa | — |
| 11 | Transcrição Google Meet | Baixa | **Fase futura — não implementar agora** |

---

## Concluído (07/05/2026)

- [x] Hospedagem S1 — lista de hóspedes ativos + prontuário básico (alimentação padrão, obs, medicações)
- [x] Hospedagem S2 — aba Rotina: checklist diário (manhã/tarde/noite + medicações com slots automáticos + atividades + obs) + badge atrasado + navegação de datas + plantonista
- [x] Internação Veterinária — módulo completo: lista com badge, prontuário clínico (diagnóstico, médico, via IV/IM/SC/VO), aba Rotina (medicações + alimentação aceitou/recusou + evolução do dia), dar alta, relatório PDF para tutor

## Concluído (06/05/2026)

- [x] Deploy das 3 landing pages (guilherme-build, petsgo-landing, nutri-landing)
- [x] Redesign guilherme-build.html — estilo levels.io, números reais, WhatsApp CTA
- [x] Nº de diárias + auto-calc bidirecional no modal de plano
- [x] Data de término no plano
- [x] Usar Período no modal de diária (range de datas)
- [x] Banho/Tosa com opção de debitar plano ativo
- [x] Vacinação com sub-tipo (Polivalente, Raiva, Gripe, Giárdia)
- [x] Backlog Nutri Control salvo em memory (10 módulos)
- [x] NUTRI_PROPOSTA.html gerada e deployada
- [x] LINKEDIN_PERFIL.md gerado
- [x] STATUS_20260506.md gerado e commitado em my-workspace
- [x] Reagendamento pós-serviço — já existia (modal automático após pagamento, chips 7/15/30 dias)
