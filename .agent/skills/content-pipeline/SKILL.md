---
name: content-pipeline
description: Showcase 3 — Weekly content machine. Strategy → captions → Reel scripts → posting schedule. 15 min/week to run after setup.
model: claude-haiku-4-5-20251001
---

# Content Pipeline — Weekly Execution

## Trigger
`/content-pipeline [week of YYYY-MM-DD]` — run every Monday morning.

## Pattern
Build infrastructure once → run weekly with one command.

---

## SETUP (one-time — do once)

### Content Pillars (Um Forasteiro)
1. **Process** — how I build systems (educational, shows expertise)
2. **Life** — nomad reality, Chiang Mai, contrast with work (relatable)
3. **Results** — client wins, things I shipped (social proof)
4. **Behind the scenes** — tools, failures, real numbers (trust)

Save to `knowledge/content-pillars.md`

### Reel Script Template
Save to `templates/reel-template.md`:
```
Hook (0-2s): [provocative statement or question]
Setup (2-8s): [context — what problem / situation]
Payoff (8-25s): [the insight, result, or demonstration]
CTA (25-30s): [one action — follow, save, or comment]
Caption: [first line = hook. 3-5 lines max. CTA at end.]
```

---

## WEEKLY EXECUTION

### Step 1 — Generate Week Plan
Read `knowledge/content-pillars.md`.
Map 5 posts to pillars:
- Mon: Process
- Tue: Life
- Wed: Results
- Thu: Behind the scenes
- Fri: Free / trending moment

### Step 2 — Generate Scripts
5 Reel scripts using template. Each:
- Hook tied to this week's moment (what happened, what was built)
- Specific numbers over vague claims
- Um Forasteiro voice: honest, pragmatic, no coach-speak

### Step 3 — Generate Captions
5 captions — one per Reel:
- First line = hook (same as video hook)
- 3-5 lines max
- CTA at end (follow / save / comment — rotate)
- 3-5 hashtags at bottom

### Step 4 — Save Output
```
output/content/week-[YYYY-MM-DD]/
  scripts.md    (5 Reel scripts)
  captions.md   (5 captions)
  schedule.md   (what posts on which day + time)
```

### Step 5 — Posting Schedule
Best times (Chiang Mai UTC+7, Brazilian audience UTC-3):
- Post at 09:00 BRT = 19:00 ICT
- Or 12:00 BRT = 22:00 ICT

---

## Rules
- Real moments only — no invented scenarios
- Specific > vague: "built in 3 hours" not "built quickly"
- Um Forasteiro narrative: solo nomad who designs survival systems
- Never post about dropshipping, generic hustle, or motivation without substance
- If no real moment this week → use a tool/lesson from Pets Go build
