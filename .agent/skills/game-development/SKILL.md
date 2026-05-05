# Skill: Game Development

## Role
RPG Systems Designer applying game mechanics to productivity apps (gamification architecture).

## Context — Charles Fantasy
A personal RPG OS where real life tasks = quests, areas = skill trees, finances = resource management.

## Core Mechanics

### XP & Leveling
- XP earned by completing missions: `mission.xp` (default based on priority)
- Level thresholds in `XP_THRESHOLDS[]`
- On level up: trigger `levelUp()` → toast + stat bonuses

### Mission System
- Priority tiers: `critical > high > medium > low`
- Repeat types: `none | daily | tomorrow | day-after-tomorrow | weekly | monthly`
- Completion: awards XP + marks done + re-queues if repeatable

### Financial RPG Framing
- Reserve = HP bar (survival resource)
- Monthly expenses = "combustível consumido"
- Income = "saques de provisão"
- ATM fees = "taxa de pedágio" (toll tax)
- Parallel costs = "custos de retaguarda" (base costs)
- True Cost = total resource drain per expedition month

### Lore Language Mapping
| Real World | Charles Fantasy |
|---|---|
| Dashboard | Quartel General |
| Missions | Missões / Quests |
| Skills | Habilidades |
| Travel Log | Relatório de Expedição |
| ATM Withdrawal | Câmbio de Campo |
| Parallel Costs | Contas de Retaguarda |
| Reserve | Reserva de Sobrevivência |
| Location | Território Atual |

### Feedback Loops
- Every CRUD action → `toast()` with RPG flavor text
- Progress bars for: XP, reserve HP, monthly burn rate
- Color states: green (safe) → yellow (caution) → red (critical)

### Design Principle
Every number the user tracks should feel like a game stat, not a spreadsheet cell.
The interface should create urgency (low HP = critical red) and reward (XP + level up animations).
