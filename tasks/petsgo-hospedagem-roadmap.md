# Roadmap — Hospedagem & Internação Veterinária
_Análise técnica: 06/05/2026_

---

## TL;DR para a reunião com Junior

| Item | Existe? | Esforço | Minha recomendação |
|------|---------|---------|-------------------|
| Lista de hóspedes ativos | ❌ | Médio | ✅ Fazer — sessão 1 |
| Prontuário do hóspede | ❌ | Médio | ✅ Fazer — sessão 1 |
| Checklist diário (alimentação) | ❌ | Médio | ✅ Fazer — sessão 2 |
| Medicação com checkbox + horário | ❌ | Alto | ✅ Fazer — sessão 2 |
| Atividades / observações plantonista | ❌ | Baixo | ✅ Junto com alimentação |
| Geração automática de tarefas/dia | ❌ | Alto | ✅ Fazer — sessão 2 |
| Internação veterinária (tudo) | ❌ | Muito alto | ⚠️ Validar antes — ver nota |
| Alertas push de horário | ❌ | Muito alto | ❌ Não agora (requer PWA) |
| Linha do tempo do paciente | ❌ | Alto | ❌ Não agora — baixo ROI |
| Destaque de tarefas atrasadas | ❌ | Baixo | ✅ Junto com checklist |

---

## O que existe hoje (mapeado no código)

### ✅ Exists — parcialmente útil
- **Hospedagem como tipo de plano** — campo `tipo: "Hospedagem"` no modal de planos, com modo de abate automático por dia corrido
- **Check-in/Out** — mostra pets `status === 'andamento'` *só do dia de hoje*. Não é lista de hóspedes permanentes
- **Funcionários** — CRUD existe, mas NÃO está integrado ao checklist (não registra "quem fez o quê")
- **Campo `obs`** em planos e agendamentos — campo livre, sem estrutura

### ❌ Não existe nada de:
- Lista de hóspedes ativos com período de permanência
- Prontuário por hóspede
- Checklist diário (alimentação, medicação, atividades)
- Geração automática de tarefas por dia
- Registro de: quem executou + horário real
- Qualquer coisa relacionada a internação veterinária
- Alertas de horário
- Parâmetros vitais

---

## Módulo A — Hospedagem (o que implementar)

### A1 · Lista de Hóspedes Ativos ← sessão 1
**O que é:** tela nova "Hospedagem" no nav, mostrando cães que estão hospedados agora (data entrada ≤ hoje ≤ data saída).

**Dados necessários:** cruzar `planos` com `tipo === "Hospedagem"` + `status === "ativo"` + período ativo.

**Campos visíveis na lista:**
- Nome do pet + foto (se tiver)
- Tutor + contato
- Data entrada / data saída / dias restantes
- Status badge (ativo / alta)

**Complexidade:** baixa — já temos todos os dados, só falta a tela de visualização.
**Estimativa:** ~2h de implementação.

---

### A2 · Prontuário do Hóspede ← sessão 1
**O que é:** ao clicar no hóspede, abre painel com dados básicos + abas.

**Dados básicos (salvar em `plano.prontuario`):**
- Peso (já existe no pet)
- Alimentação padrão (campo novo)
- Observações gerais (campo novo)

**Complexidade:** baixa-média. Estrutura de dados nova, mas simples.
**Estimativa:** ~2h de implementação.

**Total sessão 1:** ~4h — lista + prontuário básico.

---

### A3 · Checklist Diário ← sessão 2
**O que é:** dentro do prontuário, aba "Rotina" com tarefas do dia.

**Estrutura de dados proposta:**
```javascript
// Salvo em plano.checklist[data_iso]
{
  "2026-05-06": {
    alimentacao: {
      manha:  { feito: false, obs: "", feitorPor: "", hora: null },
      tarde:  { feito: false, obs: "", feitorPor: "", hora: null },
      noite:  { feito: false, obs: "", feitorPor: "", hora: null }
    },
    medicacoes: [
      {
        nome: "Amoxicilina", dose: "250mg",
        horarios: [
          { hora: "08:00", feito: false, feitorPor: "", horaReal: null },
          { hora: "20:00", feito: false, feitorPor: "", horaReal: null }
        ]
      }
    ],
    atividades: { passeio: false, recreacao: false, socializacao: false },
    observacoes: ""  // campo livre por dia
  }
}
```

**Geração automática:** ao abrir a aba do dia, verificar se `checklist[today]` existe. Se não, criar a estrutura com base nas medicações cadastradas no prontuário.

**Lógica de "quem fez":** ao dar check, registra `feitorPor: funcionarioLogado` + `hora: new Date().toISOString()`. Como não temos login real, usar select de funcionário fixado (já existe no sistema).

**Tarefas atrasadas:** se `hora > horário_previsto + 30min` e `feito === false`, mostrar badge vermelho.

**Complexidade:** alta — lógica de estado por dia, geração automática, registro de execução.
**Estimativa:** ~4-5h de implementação.

---

### A4 · Cadastro de Medicações no Prontuário ← junto com A3
**O que é:** antes de ver o checklist, nutricionista (ou admin) cadastra as medicações do hóspede.

**Campo:** `plano.medicacoes = [{ nome, dose, horarios: ["08:00", "20:00"] }]`

**O sistema gera os slots automaticamente** a partir dos horários cadastrados.

**Complexidade:** média.
**Estimativa:** ~2h.

**Total sessão 2:** ~6-7h — checklist + medicações + geração automática + tarefas atrasadas.

---

## Módulo B — Internação Veterinária ⚠️

### Minha opinião antes de implementar

**Antes de codar uma linha:** perguntar ao Junior:

> "O pet shop tem veterinário próprio no quadro? Quantas internações acontecem por semana agora? Onde elas são registradas hoje?"

**Por quê:** internação veterinária com prescrições dinâmicas, fluidoterapia (ml/kg/h), parâmetros vitais por horário, vias de administração (IV/IM/SC), evolução clínica — **isso é um sistema de prontuário clínico completo**. É o dobro da complexidade do módulo de hospedagem inteiro.

**Se o pet shop tem vet próprio e ≥ 3 internações/semana:** vale implementar. Estimativa: 5-7 sessões.

**Se não tem vet próprio ou internação é rara:** não implementar agora. ROI não justifica o esforço. Registrar como TD-006 em tech_debt.md.

---

### Se confirmar que deve implementar:

| Sub-módulo | Complexidade | Estimativa |
|-----------|-------------|-----------|
| Tela lista de internados (separada hospedagem) | Baixa | 1h |
| Prontuário clínico (dados, diagnóstico, médico) | Baixa | 1h |
| Prescrições com via + frequência | Média | 2h |
| Geração automática de horários (8/8h → 08h/16h/00h) | Alta | 3h |
| Alimentação com aceitação | Baixa | 1h |
| Fluidoterapia (taxa ml/kg/h, controle início/fim/volume) | Alta | 3h |
| Parâmetros vitais por horário (temp/FC/FR/glicemia/dor) | Média | 2h |
| Evolução clínica (texto livre + data + responsável) | Baixa | 1h |
| **Total** | | **~14h (3-4 sessões)** |

---

## Funcionalidades Extras — análise

### ✅ Implementar junto com checklist
- **Destaque de tarefas atrasadas** — badge vermelho se horário passou e `feito === false`. 30 min de implementação. Alto valor visual.

### ⚠️ Implementar só com PWA
- **Alertas de horário (notificação push)** — requer `service-worker.js` + `Notification API` + PWA instalado. Não é possível sem PWA. Está no backlog como TD-002. Implementar junto com PWA, não agora.

### ❌ Baixa prioridade agora
- **Linha do tempo do paciente** — bonito, pouco operacional. O histórico de `checklist[datas]` já é a linha do tempo. Pode gerar visualização depois com 2-3h quando tiver dados reais para mostrar.

---

## Ordem de implementação sugerida

```
Sessão 1 (~4h)
├── A1: Tela "Hospedagem" no nav
├── Lista de hóspedes ativos (filtro por período)
└── Prontuário básico ao clicar (dados + alimentação padrão + obs)

Sessão 2 (~6h)
├── A4: Cadastro de medicações no prontuário
├── A3: Aba "Rotina" com checklist diário
├── Geração automática de tarefas ao abrir o dia
├── Checkbox com registro de funcionário + hora real
└── Badge de tarefas atrasadas

[VALIDAR COM JUNIOR] → Internação veterinária?
├── SIM → Sessão 3-6 (14h+ de implementação)
└── NÃO → Registrar em tech_debt.md e seguir para PWA

Total estimado (hospedagem): 2 sessões = ~10h
Total estimado (+ internação): 5-6 sessões = ~25h
```

---

## Pergunta obrigatória para Junior antes de começar internação

1. Tem veterinário na equipe fixa?
2. Quantas internações por semana em média?
3. Como registra hoje? (papel, planilha, outro sistema?)
4. Qual a dor principal: controle de medicação ou relatório para o tutor?
