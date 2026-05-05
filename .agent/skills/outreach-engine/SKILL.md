---
name: outreach-engine
description: Showcase 5 — End-to-end outreach pipeline. Prospect → verify → personalized sequence → send → monitor replies. Human touches only hot replies.
model: claude-sonnet-4-6
---

# Outreach Engine — B2B Lead Pipeline

## Trigger
`/outreach-engine [niche] [city/region]` — when prospecting for new clients.

## Pattern
Lead scraping → enrichment → sequence → load → monitor → human closes.

---

## Step 1 — Define Target

Andarilho Digital ICP (Ideal Client Profile):
- **Business type:** Pet shops, clinics, restaurants, local services
- **Size:** 1-10 employees, owner-operated
- **Pain:** No CRM, manual WhatsApp, no automation
- **Budget:** R$800-R$2.500/mo recurring
- **Location:** Brazil (any city — remote delivery)

## Step 2 — Find Prospects
Without Apollo (manual method):
1. Google Maps search: `[niche] [city]`
2. Extract: business name, phone (WhatsApp), Instagram handle
3. Save to `output/leads/[niche]-[date].csv`:
   ```
   name, whatsapp, instagram, city, notes
   ```

With Apollo API (when configured):
- Query: `title:owner industry:[niche] location:Brazil`
- Export to same CSV format

## Step 3 — Research Each Lead (Haiku agent)
For each prospect, pull:
- Instagram: last post date, follower count, content quality
- Google Maps: rating, review count, last response to review
- Website (if any): last update, has WhatsApp button?

Output: enriched CSV with `automation_score` (1-5 based on how manual they look)

## Step 4 — Generate Sequences
For top 20 leads (automation_score 4-5):

**Message 1 (WhatsApp) — Day 1:**
```
Oi [name]! Vi o [business name] no Maps.
Trabalho com automação de WhatsApp para [niche]s em [city].
Posso te mostrar o que montei pra outro cliente? Leva 10 min.
```

**Message 2 — Day 3 (if no reply):**
```
[name], não quero encher sua caixa.
Mas se você ainda responde pedido por pedido no WhatsApp, isso pode mudar.
Quer ver como?
```

**Message 3 — Day 7 (final):**
```
Última mensagem, prometo.
Montei um sistema que atende, agenda e cobra no WhatsApp automaticamente.
Se algum dia fizer sentido: [calendly link]
```

Save to `output/leads/sequences-[date].md`

## Step 5 — Send & Monitor
- Send manually via WhatsApp (or via Evolution API if configured)
- Log each send: date, lead, message number
- Check replies daily

## Step 6 — Human Takeover
When lead replies positively:
- Run `/compound-research [business name]` to prep for call
- Run `/petsgo-report` mindset — know your proof before the call
- Run `/sales-strategist` persona for objection prep

## Rules
- Max 20 active outreach at a time — quality over volume
- Never send same day as research — review before sending
- Real Pets Go proof only (screenshots of live CRM, not mockups)
- Follow-up max 3 times — no spam
- When they say no, remove immediately, no pushback
