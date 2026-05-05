---
name: charles-fantasy
description: Skill especialista no projeto Charles Fantasy, um app RPG de produtividade pessoal.
---
# Charles Fantasy — Skill do Projeto

## O que é este projeto

**Charles Fantasy** é um app web RPG de produtividade pessoal.
Arquivo único, sem backend, sem dependências externas.
Roda 100% no browser via `index.html` + `script.js` + `style.css`.
Todos os dados persistem no `localStorage`.

**Criador:** Guilherme Andrade (Um Forasteiro)
**Propósito:** Gamificar a vida real — missões, XP, níveis, finanças, viagem, skills — tudo integrado num só lugar com estética RPG dark.

---

## Arquitetura

### 3 arquivos, sem exceção
```
index.html   — estrutura HTML, seções, modais, topbar, sidebar
script.js    — toda a lógica, dados, render, localStorage (~4800 linhas)
style.css    — visual completo, tema dark, variáveis CSS, responsivo
```

### Estado global
```js
// Objeto S — salvo em localStorage como 'rpg_v2'
S = {
  character: { name, title, charClass, mainQuest },
  ui: { systemName, accentColor, bgColor, surfaceColor, textColor,
        googleFont, brandSize, brandSpacing, brandGap,
        avatarUrl, logoUrl, logoIsSvg, currencyName, currencySymbol, questLabel },
  financial: { reserva, custo, seguranca, gold, xp },
  system: { xpPerLevel, maxLevel, ranks[], difficulties[], priorities[],
            missionStatuses[], missionTypes[], repeatOptions[], repeatLabels[], rarities[] },
  areas: [...],
  missions: [...],
  skills: [...],
  inventory: [...],
  travel: { rates: { usd, brl, updatedAt }, categories[], expenses[], monthlySheets: {} }
}
```

### localStorage keys
| Chave | Conteúdo |
|---|---|
| `rpg_v2` | Estado principal (S) |
| `cf_lang` | Idioma ativo ('pt' ou 'en') |
| `cf_daily_expenses` | Gastos da Calculadora Diária |
| `cf_skill_levels` | Níveis customizados das skills |
| `cf_skill_svgs` | SVGs customizados das skills |
| `cf_skill_colors` | Cores customizadas das barras de skill |
| `cf_translations_en` | Cache de traduções EN via Claude API |
| `cf_mm_nodes` | Nós do mindmap editável |
| `cf_kanban` | Dados do Kanban board |
| `cf_pdfs` | Metadados de PDFs no inventário |

---

## Seções do app

| Seção | Função |
|---|---|
| Dashboard | Cards de stat, missão principal, skills, progresso por área, finanças |
| Missões | Lista/cards com filtros, XP, status, dificuldade |
| Áreas | Áreas de vida com progresso |
| Skills | Skills do usuário |
| Inventário | Itens por área + Calculadora Diária fixada no topo |
| Configurações | Personagem, finanças, sistema, interface |
| Diário de Viagem | Analytics visuais (donut + barras), dados da Calculadora |
| Dados | Export, import, backup, reset |

---

## Sistemas principais

### Personagem
- Level 33, XP 32.190, Rank: Forasteiro
- Ranks: Aprendiz → Jovem → Construtor → Criador → Forasteiro(33) → Veterano → Mestre → Lendário → Imortal

### Missões
- Prioridades: Crítica, Alta, Média, Baixa
- Dificuldades: Épica(5x), Difícil(3x), Média(2x), Fácil(1x)
- Status: Não iniciada, Em andamento, Concluída, Pausada, Cancelada
- Tipos: Principal, Secundária, Diária, Semanal, Especial

### Financeiro (dados reais)
- Jan 2026: R$400 ganhos / R$5.684 gastos
- Fev 2026: R$500 ganhos / R$5.615 gastos
- Mar 2026: em andamento | Saldo atual: R$1.437,99

### Calculadora Diária
- Item especial no inventário (`isCalcDiaria: true`), sempre no topo
- Categorias: hospedagem, alimentação, transporte, extras
- Auto-categorização por palavra-chave
- Storage: `cf_daily_expenses`

### Skills & Tools (Dashboard)
- 9 skills com cor, SVG e nível customizáveis
- Color picker inline em cada barra
- Upload de SVG por skill via botão 🎨 Ícones

### i18n PT/EN
- `APP_I18N` com todas as traduções da interface
- `t(key)` para textos fixos, `sysLabel(val)` para valores do sistema
- `autoTranslateIfNeeded()` chama Claude API para traduzir conteúdo do usuário

---

## Regras invioláveis

1. **Sempre 3 arquivos** — nunca separar em mais
2. **Zero dependências externas** — sem npm, sem CDN novo
3. **Toda persistência em localStorage**
4. **Nunca quebrar o estado S** — mudanças no schema precisam de migração em `load()`
5. **Proteção de dados em load():**
   ```js
   if ((S.financial?.xp || 0) < 32000) S.financial.xp = 32190;
   if ((S.financial?.gold || 0) < 100) S.financial.gold = 1437.99;
   if (!S.missions?.length) S.missions = deepClone(DEFAULTS.missions);
   ```
6. **Calculadora sempre visível** — pinada no topo do inventário
7. **BRL sempre primário, THB secundário** em exibições financeiras
8. **Checar sintaxe antes de entregar** — `node --check script.js`

---

## Identidade visual

- Tema dark RPG: fundo `#080a0f`, accent dourado `#c8a96e`
- CSS Variables: `--accent`, `--bg`, `--bg-2`, `--bg-3`, `--text`, `--text-muted`, `--border`
- Cards: `border-radius 12–16px`, glow effects nos destaques
- Responsivo: sidebar deslizante mobile, breakpoints 768px e 480px

---

## Personagem (não alterar sem instrução)

```
Nome: Guilherme Andrade | Título: Um Forasteiro
Classe: Criador de Sistemas
Missão Principal: Crescer o canal + gerar renda + viver viajando
Nível: 33 | XP: 32.190 | Rank: Forasteiro | Saldo: R$1.437,99
```
