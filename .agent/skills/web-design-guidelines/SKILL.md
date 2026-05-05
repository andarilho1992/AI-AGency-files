# Skill: Web Design Guidelines

## Role
UI consistency enforcer for dark-mode Cyberpunk RPG single-page application.

## Charles Fantasy Visual Language

### Typography Hierarchy
| Level | Size | Weight | Color | Font | Usage |
|---|---|---|---|---|---|
| Section title | 24px | 700 | --text | sans | `<h1 class="section-title">` |
| Subsection | 16px | 700 | --text | sans | `<h3 class="subsection-title">` |
| Module header | 11px | 700 | --text-muted | mono | All-caps labels |
| Body | 13px | 400 | --text | sans | Descriptions |
| Meta / sub | 10-11px | 400 | --text-muted | mono | Dates, counts |
| Stat value | 17-24px | 700 | accent color | mono | Numbers, KPIs |

### Spacing System
- Card padding: `16px`
- Gap between cards: `14px`
- Row padding (list items): `7px 0`
- Section margin top: `24px` or `32px`
- Button group gap: `8px`

### Border System
- All cards: `border: 1px solid var(--border)` where `--border: rgba(255,255,255,0.08)`
- Border radius: `var(--r)` (8px) for inputs, `10-12px` for cards, `20px` for badges

### Button Classes
```html
<button class="btn btn-primary">Primary Action</button>   <!-- blue filled -->
<button class="btn btn-ghost">Secondary</button>          <!-- transparent + border -->
<button class="btn btn-primary btn-sm">Small</button>     <!-- 11px, compact -->
<button class="btn btn-ghost btn-sm">Small Ghost</button>
```

### Badge / Tag Patterns
```html
<!-- Status badge -->
<span class="tms-badge tms-open">🗺 Ativo</span>
<span class="tms-badge tms-closed">⚔ Encerrado</span>

<!-- Custom inline badge -->
<span style="background:rgba(87,139,254,.15);border:1px solid rgba(87,139,254,.3);color:#58a6ff;padding:2px 8px;border-radius:20px;font-size:10px;font-family:var(--mono)">LABEL</span>
```

### Progress Bars
```html
<div style="height:4px;background:#1e2840;border-radius:3px;overflow:hidden">
  <div style="height:100%;width:${pct}%;background:${color};transition:width .4s;border-radius:3px"></div>
</div>
```

### Empty States
```html
<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:12px">
  Nenhum item registrado ainda.
</div>
```

### Delete Buttons (inline, subtle)
```html
<button onclick="deleteX('${id}')"
  style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:13px;opacity:.5;padding:2px 4px"
  onmouseover="this.style.opacity=1"
  onmouseout="this.style.opacity=.5">✕</button>
```

### Responsive Grid
- Dashboard modules: `grid-template-columns:1fr 1fr` (collapses to 1fr on mobile via media query)
- Month cards: `.tms-grid` (4 columns → 2 → 1)
- Stats row: `grid-template-columns:1fr 1fr 1fr`

### Accessibility Minimums
- All action buttons need `title` or visible label
- Color alone never conveys state — always pair with icon or text
- Interactive elements have `:hover` feedback (opacity or glow)
