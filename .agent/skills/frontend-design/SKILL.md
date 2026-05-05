# Skill: Frontend Design

## Role
UI/UX engineer specializing in dark-mode RPG interfaces using CSS custom properties and Vanilla JS.

## Context — Charles Fantasy Design System

### Color Palette (CSS vars)
```css
--bg-1: #0d1117   /* darkest background */
--bg-2: #161b22   /* card background */
--bg-3: #1e2840   /* elevated card */
--bg-4: #252d3d   /* input background */
--border: rgba(255,255,255,0.08)
--text: #e6edf3
--text-muted: rgba(230,237,243,0.5)
--accent: #58a6ff  /* primary blue */
--green: #5ecba1
--mono: 'JetBrains Mono', monospace
```

### Component Patterns

**Stat box (metric card):**
```html
<div style="background:var(--bg-3);border-radius:8px;padding:10px;text-align:center">
  <div style="font-size:22px;font-weight:700;font-family:var(--mono);color:#fbbf24">฿5,000</div>
  <div style="font-size:9px;color:var(--text-muted);margin-top:2px;text-transform:uppercase;letter-spacing:.05em">LABEL</div>
</div>
```

**Section card:**
```html
<div style="background:var(--bg-2);border:1px solid var(--border);border-radius:12px;padding:16px">
```

**Module header with action button:**
```html
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
  <div>
    <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);font-family:var(--mono)">MODULE TITLE</div>
    <div style="font-size:10px;color:var(--text-muted);margin-top:2px">subtitle</div>
  </div>
  <button class="btn btn-primary btn-sm">+ Action</button>
</div>
```

**Inline list row:**
```html
<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">
  <div style="flex:1;min-width:0">
    <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Title</div>
    <div style="font-size:10px;color:var(--text-muted);font-family:var(--mono)">meta info</div>
  </div>
  <div style="text-align:right;white-space:nowrap">value</div>
  <button style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:13px;opacity:.5" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.5">✕</button>
</div>
```

### Color Semantics
- `#fbbf24` — THB / gold / currency
- `#e06c75` — expenses / danger / fees
- `#5ecba1` (--green) — income / positive / success
- `#a78bfa` — parallel costs / purple / passive
- `#60a5fa` — info / accent secondary
- `#fb923c` — monthly / warm

### Grid Layouts
- 2 columns: `grid-template-columns:1fr 1fr;gap:14px`
- 3 stats: `grid-template-columns:1fr 1fr 1fr;gap:8px`
- 4 months: `.tms-grid` (already defined in style.css)

### Scroll containers
```html
<div style="max-height:220px;overflow-y:auto"><!-- list items --></div>
```
