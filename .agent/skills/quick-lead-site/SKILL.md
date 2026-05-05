# Skill: quick-lead-site

**Trigger**: `run quick-lead-site [URL]`
**Model**: Haiku (scrape) → Sonnet (copy + build)
**Goal**: URL → branded 1-page Astro site → live Cloudflare URL in < 2 min

---

## Flow

### Step 1 — Scrape (Haiku)
Run: `node astro-sites/scripts/generate-lead-site.js [URL]`

Extracts from target URL:
- Company name
- Primary hex color (from CSS, meta theme-color, or dominant visual)
- Tagline / description
- Up to 4 image URLs
- Services / product categories (inferred from nav or headings)

Outputs: `astro-sites/src/pages/leads/[slug].astro`

### Step 2 — Review & copy (Sonnet)
If the auto-generated copy needs polish:
- Rewrite headline to be punchy and benefit-focused
- 3 feature bullets: what the business does → what the client gains
- CTA: "Fale com a gente" → WhatsApp link

### Step 3 — Build + Deploy
```bash
cd astro-sites
npm run build
npx wrangler pages deploy ./dist --project-name andarilho-astro
```

### Step 4 — Return URL
Live URL: `https://andarilho-astro.pages.dev/leads/[slug]`

---

## Config

- WhatsApp number: edit in `astro-sites/scripts/generate-lead-site.js` (WHATSAPP_NUMBER constant)
- Fallback color if extraction fails: `#ae330a` (Andarilho rust)
- Unsplash fallback: if < 2 images found, fetch from Unsplash (no key needed for embed URLs)

---

## Usage Examples

```
run quick-lead-site https://simples.vet
run quick-lead-site https://petshopexemplo.com.br
run quick-lead-site https://clinicavet.com.br
```

---

## Output Format

Claude returns:
```
✓ Lead site created
URL: https://andarilho-astro.pages.dev/leads/simples-vet
Company: Simples.Vet
Color: #1a6b4a
Generated in: ~90s
```
