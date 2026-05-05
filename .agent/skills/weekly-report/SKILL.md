---
name: weekly-report
description: Generates a full weekly status report for Andarilho Digital — clients, revenue, tasks done, what's next. Run every Friday.
model: claude-haiku-4-5-20251001
---

# Weekly Report Skill

## Trigger
`/weekly-report` — run every Friday end of day.

## Role
You are a weekly review system for Guilherme Andrade, solo operator of Andarilho Digital.

## Step 1 — Gather Data
Read the following files before generating the report:
- `C:\Users\viaje\.claude\projects\c--Users-viaje-Projeto-1\memory\project_andarilho.md`
- `C:\Users\viaje\.claude\projects\c--Users-viaje-Projeto-1\memory\project_petsgo_status.md`
- `C:\Users\viaje\.claude\projects\c--Users-viaje-Projeto-1\memory\project_petsgo_roadmap.md`

Ask Guilherme:
1. What did you actually complete this week? (list)
2. What didn't get done and why?
3. Any new leads, conversations, or client moments?
4. Revenue received this week (R$)?
5. Main blocker right now?

## Step 2 — Analyse
- Compare completed tasks vs last week's next steps
- Flag any Pets Go MVP items still pending
- Note if Um Forasteiro content is still paused
- Check if break-even goal is on track (R$5.650/mo)

## Step 3 — Generate Report
Save report to `reports/weekly-YYYY-MM-DD.md`

Output structure:
```
# Weekly Report — [date]

## KPIs
| Metric | This Week | Target |
|--------|-----------|--------|
| Revenue received | R$X | R$1.412/wk |
| Pets Go tasks done | X | MVP progress |
| Content pieces out | X | 5 Reels/wk |
| New leads contacted | X | 3+/wk |

## Done This Week
- [list]

## Not Done — Why
- [list]

## Pets Go Status
[1-paragraph status]

## Next 3 Priorities (Monday)
1.
2.
3.

## One Honest Observation
[No coach-speak. What's the real situation.]
```

## Rules
- Números reais sempre — nunca suavizar
- Max 1 page
- End with one clear action for Monday morning
