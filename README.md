# Andarilho Digital — AI Agency Systems

Built by **Guilherme Andrade** — Industrial designer turned digital nomad, building an AI automation agency from Thailand.

## What's in here

### Presentations
| File | Description |
|------|-------------|
| `andarilho-pitch.html` | Full agency story — for investors/partners |
| `petsgo-pitch.html` | Pets Go CRM system pitch (EN) |

### Live Systems
| File | Description |
|------|-------------|
| `petsgo-crm.html` | Full CRM — dashboard, pets, stock, reactivation pipeline |
| `leads-pipeline.html` | Prospecting lead Kanban |
| `agency-dashboard.html` | Agency internal dashboard |
| `agency-landing.html` | Agency landing page |

### AI Agents Server
| Path | Description |
|------|-------------|
| `petsgo-agents/server.js` | 5 AI agents for Pets Go (Railway deploy) |
| `prospecting-server.js` | Prospecting automation server (Node.js) |
| `worker-prospecao/` | Cloudflare Workers version (zero-server, $5/mo) |

### Case Studies & Demos
`case-petsgo.html` · `case-whatsapp-bot.html` · `case-crm-automation.html` · `case-customer-journey.html` · `clinicbot-demo.html` · `bakery-demo.html`

### Pitches & Proposals
`petsgo-proposal.html` · `petsgo-partner-pitch.html` · `clinics-solution.html`

---

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS — zero dependencies, runs anywhere
- **Backend**: Node.js (Railway) or Cloudflare Workers ($5/mo)
- **Database**: GitHub API as JSON store (free)
- **AI**: Claude Haiku via Anthropic API
- **WhatsApp**: Evolution API
- **Leads**: Google Places API + site scraping

## Deploy
```bash
# Pages (static HTML) — auto-deploys on push
git push

# Worker (AI agents API)
cd worker-prospecao
npm run deploy

# Petsgo agents (Railway)
cd petsgo-agents
railway up
```

## Live URLs
- Pages: https://andarilho-digital.pages.dev
- GitHub: https://github.com/andarilho1992/AI-AGency-files
