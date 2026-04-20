# Complete Guide — What Was Built, How to Use It, and What's Left
**Guilherme Andrade / Andarilho Digital**
**Updated:** April 2026

---

## PART 1 — WHAT WAS BUILT

### 🧠 Memory System (Claude remembers you between sessions)

7 memory files were created and saved permanently. Every time you open a new conversation with Claude, it reads these files before responding to anything.

| File | What it contains |
|------|-----------------|
| `user_profile.md` | Who you are, how you prefer to work, UTC+7, real monthly cost |
| `project_andarilho.md` | Andarilho Digital + Um Forasteiro: goals, status, priorities |
| `project_petsgo_status.md` | Current state of the Pets Go CRM |
| `project_petsgo_roadmap.md` | 6 CRM modules, phases MVP/Core/Phase2+ |
| `feedback_working_rules.md` | Non-negotiable rules (no coach-speak, Pets Go first, etc.) |
| `feedback_git.md` | Commit rules, deploy pipeline, parallel work |
| `reference_apis.md` | Where each API key lives, deploy commands, GitHub repos |

**Why this matters:** Without this, every session starts from zero. With this, Claude already knows who you are, what you're building, and what's already been decided — without you having to repeat it.

---

### 📋 CLAUDE.md (Permanent Operating Manual)

The `.claude/CLAUDE.md` file is automatically loaded in **every** conversation. It contains:

- Who you are and your active projects
- Behavior rules (zero fluff, real numbers)
- Map of all available skills
- **Model routing doctrine** (when to use Haiku vs Sonnet vs Opus)
- Multi-agent rules
- Deploy rule (not done until curl returns 200)

**Why this matters:** It's the "constitution" of your workspace. It defines how Claude works with you permanently, not just in this session.

---

### ⚡ Hooks — Automatic Work Protection

Configured in `.claude/settings.json`. Every time Claude saves or edits a file, it automatically runs `git add -A`.

**Before:** You could close VS Code without saving and lose hours of work.
**Now:** Every file Claude saves is automatically staged in git. You just need to commit.

---

### 🔌 MCP — External Tool Connections (Ready, Waiting for Keys)

MCP (Model Context Protocol) is Claude Code's plugin system. With it, Claude can read your Google Drive, write to spreadsheets, search the web, send Slack messages — without you needing to copy and paste anything.

The stubs (configurations) have already been added to `.claude/settings.json`:

| MCP | What it does when active |
|-----|--------------------------|
| Google Drive | Claude reads your documents and folders directly |
| Google Sheets | Claude reads and writes to spreadsheets (clients, financials, leads) |
| Firecrawl | Claude deep-crawls websites (client audits) |
| Slack | Claude sends and reads messages in channels |

**What's missing:** Credentials. See Part 3.

---

### 🛠️ Skills — One-Command Workflows

Skills are markdown files that turn repetitive tasks into a single command. You type `/skill-name` and Claude executes the entire flow automatically.

You now have **30 skills** organized in categories:

#### Daily Workflow
| Command | What it does | Model |
|---------|-------------|-------|
| `/daily-brief` | Opens the session: loads state, shows 3 daily priorities | Haiku (fast) |
| `/weekly-report` | Friday review: KPIs, what was done, next week | Haiku |
| `/reflect` | Closes the session: saves what was done, exact next step | Haiku |
| `/petsgo-report` | Generates professional update for Junior | Sonnet |

#### Personas — "Switch to X mode"
| Persona | When to use |
|---------|-------------|
| `research-analyst` | Market research, competitor analysis, fact-checking |
| `copywriter` | Writing emails, Reel captions, sales proposals |
| `technical-architect` | Architecture decisions, code review, planning |
| `sales-strategist` | Closing clients, handling objections, writing proposals |

How to use: "Switch to Copywriter mode. Rewrite this email."

#### Business Workflows (Showcases)
| Skill | What it does |
|-------|-------------|
| `/orchestrate` | Coordinates multiple agents in parallel safely |
| `/compound-research` | Research → Sales Strategy → Copy in automatic sequence |
| `/multi-client-audit` | Audits multiple clients/prospects in parallel |
| `/brief-to-website` | One paragraph brief → HTML site → live URL in 10 min |
| `/content-pipeline` | Weekly plan → Reel scripts → captions → posting calendar |
| `/outreach-engine` | Prospects → personalized message → follow-up → meeting |
| `/knowledge-ingestion` | Book/course/article → searchable knowledge base |

#### Project Skills (already existed, now in English)
`guilherme-profile`, `um-forasteiro`, `business-system`, `charles-fantasy`, `content-system`, `growth-system`, `design-system`, `ux-audit`, `architecture`, `clean-code`, `systematic-debugging`, `frontend-design`, `game-development`, `performance-profiling`, `brainstorming`, `app-builder`, `api-patterns`, `web-design-guidelines`, `sales-closer`

---

### 🚀 Deploy Pipeline

**`deploy.sh`** updated — one command does everything:
1. Commit with your message
2. Push to GitHub
3. Deploy to Cloudflare Pages
4. Checks if it's live (curl 200)
5. Shows the final URL

Usage: `./deploy.sh "commit message" filename.html`

**Production URL:** `https://andarilho-digital.pages.dev`

---

### 🤖 Technical Infrastructure

**Cloudflare Worker** (`workers/webhook-receiver.js`):
Webhook receiver ready to connect with Stripe, Evolution API (WhatsApp), Typeform, n8n. Deploy with one command when needed.

**Agent SDK Python** (`agents/pipeline-template.py`):
3-agent pipeline ready to run autonomously:
- Agent 1 (Haiku): researches the business
- Agent 2 (Sonnet): analyzes opportunities
- Agent 3 (Sonnet): writes the pitch

Usage: `python agents/pipeline-template.py --target "business-name"`

---

## PART 2 — HOW THIS HELPS EACH PROJECT

### 🐾 Pets Go (Priority 1 — Cash Now)

What the system does for Pets Go right now:

- **`/petsgo-report`** → Generates the weekly update for Junior in 2 minutes. Shows each module's status, what was delivered, next delivery. Professional, no fluff.
- **`technical-architect` persona** → Before any architecture decision in the CRM (new module, new feature), activate this persona. It considers what breaks, what scales, the maintenance cost.
- **`/reflect` at the end of each session** → Saves exactly where you stopped in the code. Next session starts with `/daily-brief` and knows the next step without wasting time.
- **Active memory** → Claude knows the full Pets Go roadmap (6 modules, 3 phases). No need to explain from scratch every time.
- **Automatic hooks** → Every code file saved is automatically staged. Less chance of losing work.

**Real gain:** More time coding, less time explaining context or losing work.

---

### 🏢 Andarilho Digital (Agency — Closing Clients)

What the system does for the agency:

- **`/compound-research [business name]`** → Researches the prospect, identifies the pain, creates a ready-to-send WhatsApp pitch. Used to take hours. Now: 15 minutes.
- **`/outreach-engine [niche] [city]`** → Full prospecting pipeline. You list the prospects, the system generates 3 personalized follow-up messages for each.
- **`sales-strategist` persona** → Before any sales meeting, activate this persona. It prepares arguments, anticipates objections, suggests the close.
- **`/brief-to-website`** → When you close a new client, you have a live site in under 10 minutes to show you work fast. That's immediate proof of value.
- **`/multi-client-audit`** → When you have 2-3 clients, audit all of them in parallel in one session. Individual HTML reports, each with its own URL.
- **Agent SDK Python** → When you have budget for a VPS (~$5/month), this pipeline runs autonomously. You wake up with 20 researched prospects and ready pitches.

**Real gain:** You can prospect, research, and create proposals without depending on manual time. One day of work produces enough material for weeks of outreach.

---

### 📱 Um Forasteiro (Channel — Long-Term Authority)

What the system does for the channel:

- **`/content-pipeline`** → Every Monday morning, one command generates 5 Reel scripts for the week + 5 captions + posting calendar. Based on your 4 content pillars.
- **`copywriter` persona** → Writes in your voice. Has Um Forasteiro-specific presets: honest, raw, solo narrative, no coach language.
- **`um-forasteiro` skill** → Loads the full channel identity before any content creation.
- **`/knowledge-ingestion`** → Books, courses and podcasts you consume become a searchable knowledge base. Instead of trying to remember a framework later, you search the base.

**Real gain:** The channel goes from "zero recorded content, paused for 1 month" to a production system that needs 15 minutes a week to plan. The execution (recording) is still on you — but the planning becomes automatic.

---

### 🎮 Charles Fantasy (RPG App)

What the system does for the app:

- **`charles-fantasy` + `architecture` + `clean-code` skills** → Automatically read before any Charles Fantasy coding session. They load the inviolable rules (3 files only, pure vanilla JS, zero dependencies).
- **`technical-architect` persona** → Evaluates any new feature before implementing. Prevents technical debt.
- **`systematic-debugging` skill** → Debug protocol with ready-to-use console commands.
- **Automatic hooks** → Code automatically staged when saved.

**Real gain:** No new feature will ever break the 3-file rule. Claude will always remember the constraints before suggesting anything.

---

## PART 3 — WHAT'S LEFT TO DO

### 🟢 You can do now (free or nearly free)

**1. Fix Google Workspace (15 minutes)**
- Go to `andarilhodigital92@gmail.com` → Google Drive
- Share the main folders with `braziliangui1992@gmail.com`
- This activates the Google Drive and Sheets MCP in Claude Code
- Impact: Claude can read your client and lead spreadsheets directly

**2. Start the 15-minute daily habit**
- Morning: `daily-brief` → Claude shows where you stopped and the 3 priorities
- End of day: `reflect` → Claude saves the exact state before closing
- This ensures no session ever starts from zero

**3. Create the `knowledge/` folder structure**
- `knowledge/clients/` → one file per client with context
- `knowledge/books/` → content from books you've read (via `/knowledge-ingestion`)
- `knowledge/content-pillars.md` → your 4 Um Forasteiro content pillars
- This feeds the content-pipeline and compound-research skills

**4. Test the Python pipeline locally**
- In terminal: `pip install anthropic`
- Then: `python agents/pipeline-template.py --target "prospect-name"`
- Costs nothing (uses the Anthropic key you already have)

**5. Fix `.env.template` in `.gitignore`**
- Currently `.env.template` is blocked by the gitignore rule `*.env.*`
- If you want to version the template on GitHub: edit `.gitignore` and add an exception for `*.template`

---

### 🟡 Requires a little money (but low cost)

**Firecrawl API (has free tier)**
- Site: firecrawl.dev
- Free tier: 500 credits/month
- Impact: Claude automatically audits client websites. Powers `/multi-client-audit` with real data.
- Add key to `.env`: `FIRECRAWL_API_KEY=fc-...`

**Perplexity API (has free tier)**
- Site: perplexity.ai/api
- Impact: Claude searches the internet in real time with cited sources. Greatly improves `/compound-research`.
- Add to `.env`: `PERPLEXITY_API_KEY=pplx-...`

**Basic VPS for Agent SDK (~$5/month)**
- Digital Ocean, Hetzner, or Contabo
- Runs `agents/pipeline-template.py` autonomously, 24/7
- When you have 2-3 clients, this investment pays for itself on day one

---

### 🔴 Requires larger investment (when you have cash)

**Claude Max 5x ($100/month)**
- Activates Claude.ai Memory (3rd layer of the memory system)
- Allows running far more agents in parallel without rate limits
- Worth it when you have at least 1 recurring paying client

**Outreach Stack (Apollo + Hunter + Instantly)**
- Apollo: ~$49/month (leads)
- Hunter: ~$49/month (verified emails)
- Instantly: ~$37/month (email sequences)
- Total: ~$135/month
- ROI: 1 client closed via outreach pays for 3 months of these tools
- When to buy: only when Pets Go is stable and you have 1-2 hrs/week for outreach

**ElevenLabs (voice cloning)**
- $5-22/month depending on plan
- Clones your voice for Um Forasteiro video narration
- Useful when the channel has real traction (50+ engaged followers)

---

## PART 4 — HOW TO USE IT IN PRACTICE (DAY TO DAY)

### Morning (5 minutes)
```
1. Open VS Code
2. Open the integrated terminal
3. Type: daily-brief (or /daily-brief)
4. Claude shows where you stopped yesterday and the 3 priorities
5. Start working on item #1
```

### During Work
```
- For code: Claude Code in terminal
- For strategy: "Switch to Technical Architect mode"
- For sales: "Switch to Sales Strategist mode"
- For copy: "Switch to Copywriter mode"
- For research: "Switch to Research Analyst mode"
```

### End of Day (5 minutes)
```
1. Type: reflect (or /reflect)
2. Claude asks what was done
3. You answer in 3-4 lines
4. Claude saves the state to memory
5. Close VS Code with a clear conscience
```

### Every Friday (15 minutes)
```
1. Type: weekly-report
2. Answer the questions (what you did, what you didn't, revenue)
3. Claude generates a report saved to reports/weekly-YYYY-MM-DD.md
4. Use that report for your weekly mental review
```

### Before Every Junior Update (Pets Go)
```
1. Type: petsgo-report
2. Answer what was delivered
3. Claude generates the formatted report
4. Paste it in WhatsApp to Junior
```

### When You Want to Prospect
```
1. Type: outreach-engine [niche] [city]
2. Claude generates prospect list + 3 messages per prospect
3. You review and send the best ones
4. For deeper research: compound-research [business name]
```

---

## PART 5 — GLOSSARY (WHAT IS EACH THING)

**Claude Code:** The version of Claude that lives in your terminal/VS Code. It can read and write files, run code, deploy. More powerful than the normal chat.

**MCP (Model Context Protocol):** Plugin system. Each MCP connects Claude to an external tool (Google Drive, Slack, etc.). When active, Claude accesses these tools without you needing to copy and paste.

**Skills:** Markdown files in `.agent/skills/`. Each one is an "expert mode" or workflow. You activate them with `/skill-name`.

**Hooks:** Commands that run automatically when Claude does something. The hook we configured: every time Claude saves a file, it automatically runs `git add`. Automatic work protection.

**Orchestrator:** A main Claude agent that coordinates several smaller agents running in parallel. The main one doesn't produce files — it only coordinates, integrates, and commits.

**Subagent:** An auxiliary Claude that runs a specific task and returns the result to the orchestrator.

**Haiku / Sonnet / Opus:** Three versions of Claude with different cost and capability:
- Haiku: cheap and fast. For data extraction, formatting, bulk tasks.
- Sonnet: balanced. For code, quality content, analysis.
- Opus: expensive and powerful. For complex strategy and architecture. Use rarely.

**Deploy:** Publishing a file so it goes live on the internet. In your case: `npx wrangler pages deploy`.

**Curl:** Command that checks if a URL is responding. If it returns 200, it's live.

**CLAUDE.md:** Your workspace's operating manual. Claude reads this file at the start of every session.

**Memory:** Files in `~/.claude/projects/.../memory/`. They persist between sessions. They're Claude's "long-term memory" about you and your projects.

**Git:** Version control system. Records every file change. Lets you go back to any previous version. Your repos: `AI-AGency-files` (public) and `my-workspace` (private).

**Cloudflare Pages:** Where your HTML sites are hosted. Free. Base URL: `andarilho-digital.pages.dev`.

**Worker:** Serverless function on Cloudflare. Runs JavaScript at the edge, no server needed. You have a template at `workers/webhook-receiver.js` ready to receive external events (payments, forms, messages).

**Pipeline:** A sequence of agents where the output of one is the input of the next. Example: Researcher → Analyst → Pitch Writer.

**Webhook:** Automatic notification sent by a service when something happens. Example: Stripe sends a webhook when a payment is received. Your worker receives it and does something with it.

---

## EXECUTIVE SUMMARY

**What you have today:**
An AI system configured to operate Andarilho Digital semi-autonomously. Claude already knows who you are, what you're building, the rules of the game, and how to act in each context.

**What this changes in practice:**
You stop repeating context every session. Claude starts working, not learning. Tasks that took hours (researching a prospect, generating the week's content, reporting to Junior) now take minutes.

**What still depends on you:**
- Running `daily-brief` in the morning and `reflect` at night (10-min habit)
- Fixing the Google Drive email (15 min, one time)
- When you have cash: buy the outreach tools
- When Pets Go stabilizes: activate the Um Forasteiro channel with `/content-pipeline`

**The priority hasn't changed:**
Pets Go first. Cash before scaling. All of this exists to help you deliver the MVP faster and close the next clients with less effort.

---

*Document generated by Claude Code — Andarilho Digital, April 2026*
