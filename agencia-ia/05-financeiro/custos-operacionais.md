# Custos Operacionais — Andarilho Digital

> Foco: manter o custo de operação da agência o mais baixo possível
> enquanto a receita não está estabilizada.

---

## Ferramentas — Custo Atual

| Ferramenta | Uso | Custo/mês | Status |
|---|---|---|---|
| n8n (self-hosted) | Automações | ~R$ 0–R$ 50 (VPS) | Ativo |
| Supabase | Banco de dados | Grátis até 500MB | Ativo |
| Cloudflare | Hospedagem de sites | Grátis / R$ 0 | Ativo |
| Evolution API | WhatsApp (alternativa Z-API) | Grátis (self-hosted) | Aguardando caixa |
| Z-API | WhatsApp (pago) | R$ 99/mês | Pausado — trial encerrou |
| Claude API (Anthropic) | IA para agentes | ~R$ 50–R$ 200 (por uso) | Ativo |
| Autentique | Assinatura de contratos | Grátis até 5 docs/mês | A ativar |
| Google Workspace | E-mail profissional | R$ 34/mês | Opcional |
| Astro | Framework de sites | Grátis (open source) | Ativo |

**Total estimado hoje:** R$ 100–R$ 300/mês dependendo do volume de IA

---

## Decisão sobre WhatsApp API

**Situação:** Z-API trial encerrou. Budget apertado para R$99/mês agora.

**Recomendação:**
- Usar Evolution API (gratuita, self-hosted) assim que tiver o primeiro cliente de WhatsApp
- Setup da Evolution API leva ~2–4h uma vez, depois é zero custo
- Não gastar R$99/mês antes de ter receita recorrente confirmada

**Regra:** só reativar Z-API ou pagar ferramenta nova se o cliente que precisa dela já pagou o setup.

---

## Custos que o Cliente Paga (não sai do seu bolso)

Sempre repassar para o cliente:

| Item | Valor estimado | Quando |
|---|---|---|
| Domínio (.com.br ou .com) | R$ 40–R$ 80/ano | Projeto de site |
| Hospedagem (Cloudflare Pages) | R$ 0 | Projeto de site |
| WhatsApp Business API (número) | Variável | Projeto de WhatsApp |
| Google Workspace (se precisar) | R$ 34/mês | Se o cliente não tiver |

**Regra:** nunca pagar ferramenta do cliente no próprio cartão. Sempre o cliente paga direto ou te repassa antes.

---

## Projeção de Custos vs. Receita

| Mês | Receita (base) | Custos operacionais | Custos vida | Saldo |
|---|---|---|---|---|
| Mês 1 | R$ 4.000 | R$ 200 | R$ 5.650 | **−R$ 1.850** |
| Mês 2 | R$ 5.300 | R$ 250 | R$ 5.650 | **−R$ 600** |
| Mês 3 | R$ 6.600 | R$ 300 | R$ 5.650 | **+R$ 650** |

> Mês 1 e 2 ainda consomem reserva. Mês 3 é o primeiro mês positivo no cenário base.
> A reserva de R$5k cobre os déficits do Mês 1 (R$1.850) e Mês 2 (R$600) com R$2.550 sobrando.

---

## Alerta de Risco

| Gatilho | Ação |
|---|---|
| Reserva cai para R$ 2.000 | Aumentar cadência de prospecção para 10 abordagens/dia |
| Reserva cai para R$ 1.000 | Aceitar qualquer projeto dentro do escopo, priorizar entrada de caixa |
| 2 meses sem fechar nenhum cliente | Revisar script de vendas + oferta + segmento |

---

*Criado em: 2026-04-16*
