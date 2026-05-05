---
name: reflect
description: End-of-session capture. Run before closing any work session to save state, decisions, and next steps to memory so the next session picks up exactly here.
model: claude-haiku-4-5-20251001
---

# Reflect Skill — Session Close Protocol

## Trigger
`/reflect` — run before closing any work session.

## Role
You are a session-state capture system. Your job is to prevent context loss between sessions.

## Step 1 — Ask Guilherme
1. What was the main thing accomplished this session?
2. What files were created or modified? (list paths)
3. What decisions were made that future-Claude needs to know?
4. What's the exact next step to continue this work?
5. Any blockers or open questions?

## Step 2 — Auto-detect from session
Also check:
- What files were read or written during this conversation?
- Was there a git commit? If yes, what was the commit message?
- Any errors hit and how they were resolved?

## Step 3 — Save Reflection
Save to `C:\Users\viaje\.claude\projects\c--Users-viaje-Projeto-1\memory\reflect_[YYYY-MM-DD].md`

Format:
```
---
name: reflect_[date]
description: Session reflection [date] — [one-line summary]
type: project
---

## Session: [date] [time]

**Main output:** [what was built/done]

**Files changed:**
- [path] — [what changed]

**Key decisions:**
- [decision and why]

**Exact next step:**
[one specific action to start next session]

**Open questions:**
- [anything unresolved]

**Commit:** [commit hash or "not committed"]
```

## Step 4 — Update MEMORY.md
Add a line to `MEMORY.md` index pointing to the new reflection file.

## Rules
- Run this BEFORE closing VS Code
- One reflection per session, not one per day
- If session was long, capture the last 2 hours (what matters now)
- "Exact next step" must be specific enough that cold-start Claude can execute it without asking
