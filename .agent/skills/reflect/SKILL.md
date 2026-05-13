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

## Step 5 — Sync Memory to GitHub
After saving locally, push the memory files to `AI-AGency-files` so the daily brief agent can read them tomorrow.

Run these commands via Bash:
```bash
# Clone or update the repo
REPO_DIR="$HOME/AppData/Local/Temp/ai-agency-sync"
if [ -d "$REPO_DIR/.git" ]; then
  git -C "$REPO_DIR" pull --quiet
else
  git clone https://github.com/andarilho1992/AI-AGency-files "$REPO_DIR" --quiet
fi

# Copy memory files
MEMORY_SRC="C:/Users/viaje/.claude/projects/c--Users-viaje-Projeto-1/memory"
cp "$MEMORY_SRC"/*.md "$REPO_DIR/memory/" 2>/dev/null || true

# Commit and push
git -C "$REPO_DIR" config user.email "braziliangui1992@gmail.com"
git -C "$REPO_DIR" config user.name "Guilherme Andrade"
git -C "$REPO_DIR" add memory/
git -C "$REPO_DIR" commit -m "memory: sync $(date '+%Y-%m-%d')" --quiet 2>/dev/null || true
git -C "$REPO_DIR" push origin main --quiet
```

If push succeeds: notify "Memória sincronizada com GitHub."
If push fails: notify "Sync falhou — brief de amanhã usará status base." and continue without blocking.

## Rules
- Run this BEFORE closing VS Code
- One reflection per session, not one per day
- If session was long, capture the last 2 hours (what matters now)
- "Exact next step" must be specific enough that cold-start Claude can execute it without asking
- Step 5 (GitHub sync) never blocks the session close — se falhar, ignora e segue
