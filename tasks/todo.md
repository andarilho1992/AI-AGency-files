# tasks/todo.md
_Última atualização: 06/05/2026_

---

## Em andamento

| # | Tarefa | Arquivo | Status |
|---|--------|---------|--------|
| 1 | NF-e via eNotas — aguarda último nº de nota do contador do Junior | `petsgo-crm-light.html` + Cloudflare Worker | 🟡 Bloqueado (dependência externa) |
| 2 | Reagendamento pós-serviço — ✅ JÁ EXISTE (modal automático após pagamento, chips 7/15/30 dias) | `petsgo-crm-light.html` | ✅ Concluído (sessão anterior) |

---

## Backlog — Pets Go Control

| # | Tarefa | Prioridade |
|---|--------|-----------|
| 3 | PWA + service worker (offline-first real) | Alta |
| 4 | Cloudflare D1 — sync entre dispositivos | Alta |
| 5 | NF-e: NFC-e (produtos) + NFS-e POA (serviços) via eNotas API | Alta |
| 6 | Reagendamento pós-serviço no recibo | Alta |

---

## Backlog — Nutri Control

| # | Tarefa | Prioridade | Condição |
|---|--------|-----------|----------|
| 7 | Módulo Antropometria (Pollock, Petroski, Guedes, Durnin, Faulkner) | Alta | **Só após contrato assinado** |
| 8 | Anamnese estruturada 1ª e 2ª consulta | Alta | Após módulo 7 |
| 9 | Prontuário por consulta + Diário expandido | Média | Após módulo 8 |
| 10 | Exames com comparação % (verde/vermelho/cinza) | Média | Após módulo 8 |
| 11 | Faturamento por paciente | Média | — |
| 12 | Plano alimentar + Sintomas correlacionados | Baixa | — |
| 13 | Transcrição Google Meet | Baixa | **Fase futura — não implementar agora** |

---

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
