---
name: compound-research
description: Skill chaining — runs Research Analyst → Sales Strategist → Copywriter in sequence. Input: a topic or client. Output: ready-to-send pitch or proposal.
model: claude-sonnet-4-6
---

# Compound Research Skill — Chained Personas

## Trigger
`/compound-research [topic or client name]` — produces a full pitch from scratch.

## What This Does
Chains 3 personas in sequence. Each persona hands off to the next.

```
Research Analyst → Sales Strategist → Copywriter → Final Output
```

No gaps. No manual handoffs. One command, one ready-to-send result.

---

## Phase 1 — Research Analyst
*Internally activates research-analyst persona*

Gather everything known about [topic/client]:
- What is the business / market?
- What pain points are visible (website, reviews, social, job listings)?
- Who are the competitors? How do they position?
- What automation or AI opportunity is obvious but unsolved?

Output format:
```
## Research: [topic]
**Confidence:** HIGH / MEDIUM / LOW per finding

### Business overview
### Visible pain points
### Competitor landscape
### Automation opportunity (ranked by ROI)
### Data gaps
```

---

## Phase 2 — Sales Strategist
*Internally activates sales-strategist persona*

Takes Phase 1 research. Builds the pitch architecture:
- Their real pain (in their words, not mine)
- The outcome they want to brag about
- The objections they'll raise
- The offer framing (what + timeline + price anchor)
- The one ask (exact next step)

Output format:
```
## Pitch Architecture: [topic]

**Their pain:** [specific]
**Outcome they want:** [not features — the result]
**Likely objections:** [list]
**Offer frame:** [deliverable + timeline + price anchor]
**One ask:** [exact CTA]
```

---

## Phase 3 — Copywriter
*Internally activates copywriter persona*

Takes Phase 2 architecture. Writes the actual outreach:
- Cold email (under 100 words, specific opening, one CTA)
- OR WhatsApp first message (2-3 lines max)
- OR proposal intro paragraph

Self-critique pass before outputting final.

Output format:
```
## Draft
[raw copy]

## Self-critique
- [issue]
- [fix]

## Final
[tightened copy — ready to send]
```

---

## Final Output
Save all three phases to `output/compound-research/[topic]-[date].md`

---

## Rules
- Never skip Phase 1 to go straight to copy — bad copy comes from skipped research
- If research confidence is LOW on key points, flag before pitching
- Final copy must match Guilherme's voice (no coach-speak, specific numbers, honest)
- One CTA only in the final output
