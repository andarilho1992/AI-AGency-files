const fs = require('fs');

let src = fs.readFileSync('petsgo-crm-light.html', 'utf8');

// --- 1. Title ---
src = src.replace('<title>Pets Go Control</title>', '<title>PetSystem</title>');

// --- 2. CSS brand colors → CSS var override-friendly ---
src = src.replace(
  '--brand:#4047C8;--brand-dark:#2D33A8;--brand-light:#ECEEFF;',
  '--brand:#4047C8;--brand-dark:#2D33A8;--brand-light:#ECEEFF; /* ← alterar BRAND_COLOR no script */'
);

// --- 3. Replace logo + name in topbar with configurable IDs ---
src = src.replace(
  /<div class="tb-logo"><img src="data:image\/png;base64,[^"]*" alt="[^"]*"\/><\/div>\s*\n\s*<div class="tb-name">Pets Go Control<\/div>/,
  `<div class="tb-logo" id="cfg-logo-wrap"></div>\n    <div class="tb-name" id="cfg-app-name"></div>`
);

// --- 4. Avatar JR ---
src = src.replace(/(<div class="tb-avatar"[^>]*>)JR(<\/div>)/,
  '<div class="tb-avatar" id="cfg-avatar">PS</div>');

// --- 5. Remove old DB_KEY const, it'll come from config ---
src = src.replace("const DB_KEY = 'petsgo_crm';", '');

// --- 6. Inject CONFIG BLOCK at start of <script> ---
const configBlock = `
  /* =======================================================
     ✏️  CONFIG — Altere aqui para cada novo cliente
     ======================================================= */
  const APP_NAME    = 'PetSystem';    // Nome do sistema
  const APP_AVATAR  = 'PS';           // Iniciais do admin/usuário logado
  const APP_LOGO    = '';             // '' = usa ícone padrão | ou cole data:image/png;base64,...
  const BRAND_COLOR = '#4047C8';      // Cor principal (hex)
  const DB_KEY      = 'petsystem_crm'; // Chave localStorage — use o nome do cliente
  /* ======================================================= */

`;

src = src.replace('<script>', '<script>' + configBlock);

// --- 7. Inject applyConfig() before seedServicos() call ---
const applyConfigFn = `
function applyConfig() {
  // Brand color CSS override
  const r = document.documentElement;
  r.style.setProperty('--brand', BRAND_COLOR);
  const d = parseInt(BRAND_COLOR.slice(1),16);
  const dr = Math.max(0,((d>>16)&0xff)-30), dg = Math.max(0,((d>>8)&0xff)-30), db = Math.max(0,(d&0xff)-30);
  r.style.setProperty('--brand-dark','#'+[dr,dg,db].map(x=>x.toString(16).padStart(2,'0')).join(''));
  r.style.setProperty('--brand-light',BRAND_COLOR+'22');
  // Name
  const nameEl = document.getElementById('cfg-app-name');
  if (nameEl) nameEl.textContent = APP_NAME;
  document.title = APP_NAME;
  // Logo
  const logoWrap = document.getElementById('cfg-logo-wrap');
  if (logoWrap) {
    if (APP_LOGO) {
      logoWrap.innerHTML = \`<img src="\${APP_LOGO}" alt="\${APP_NAME}" style="width:36px;height:36px;object-fit:cover;border-radius:8px">\`;
    } else {
      logoWrap.innerHTML = '<div style="width:36px;height:36px;border-radius:8px;background:var(--brand);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px">🐾</div>';
    }
  }
  // Avatar
  const av = document.getElementById('cfg-avatar');
  if (av) av.textContent = APP_AVATAR;
}

`;

// Insert before seedServicos()
src = src.replace('seedServicos();', applyConfigFn + 'applyConfig();\nseedServicos();');

fs.writeFileSync('petsgo-crm-base.html', src);
console.log('petsgo-crm-base.html gerado');

// Quick sanity check
const checks = ['APP_NAME', 'APP_LOGO', 'BRAND_COLOR', 'DB_KEY', 'cfg-logo-wrap', 'cfg-app-name', 'applyConfig'];
checks.forEach(c => console.log(c + ':', src.includes(c) ? '✓' : '✗ FALTANDO'));
