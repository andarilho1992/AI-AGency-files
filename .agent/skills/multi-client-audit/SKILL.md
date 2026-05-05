---
name: multi-client-audit
description: Showcase 1 — Fan-out pattern. Spawn one agent per client, each runs full audit, saves to individual directory. Orchestrator integrates results.
model: claude-sonnet-4-6
---

# Multi-Client Audit — Fan-Out Pattern

## Trigger
`/multi-client-audit` — when you need to audit multiple clients or prospects in one sprint.

## Pattern
Fan-Out / Fan-In: N parallel agents → orchestrator integrates → one master report.

## Step 1 — Setup
List all clients/prospects to audit. Create output directories:
```
output/audits/[client-name]/
  research.md
  opportunities.md
  report.html
```

## Step 2 — Spawn Agents
One agent per client. Each agent gets:
- Client name + website
- Input: `knowledge/clients/[name].md` if exists
- Output: `output/audits/[name]/`
- Task: audit across 4 dimensions (visibility, technical, content, automation opportunity)

Spawn instruction:
"Spawn [N] agents in parallel. Agent 1 audits [Client A] and saves to output/audits/client-a/. Agent 2 audits [Client B] and saves to output/audits/client-b/. Each produces: research.md + opportunities.md."

## Step 3 — Per-Agent Audit Template
Each agent runs:

**Visibility:** Is the business findable? (Google presence, reviews, social)
**Technical:** Website speed, mobile, basic SEO
**Content:** Blog, social activity, last post date
**Automation opportunity:** What manual process screams for automation?

## Step 4 — Integrate Results
After all agents complete:
- Read all opportunities.md files
- Rank by automation ROI
- Identify cross-client patterns (same problem = productized service opportunity)
- Generate master summary

## Step 5 — Output
Save `output/audits/master-report-[date].md`:
```
# Multi-Client Audit — [date]
## Executive Summary
## Per-Client Findings
## Cross-Client Patterns
## Ranked Opportunities
## Recommended Next Outreach
```

## Model Routing
- Agent work: Haiku (extraction, research, formatting)
- Integration + ranking: Sonnet
- Strategic framing: Sonnet (not Opus — this is judgment, not architecture)

## Cost Estimate
5 clients × Haiku × 30min = low cost. 10 clients = still low. Safe to run weekly.
