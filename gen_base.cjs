const fs = require('fs');

let src = fs.readFileSync('petsgo-crm-light.html', 'utf8');

// ── 1. Title ─────────────────────────────────────────────────────────────────
src = src.replace('<title>Pets Go Control</title>', '<title>PetSystem</title>');

// ── 2. Topbar: logo+name → configurable elements ─────────────────────────────
src = src.replace(
  /<div class="tb-logo"><img src="data:image\/png;base64,[^"]*" alt="[^"]*"\/><\/div>\s*\n\s*<div class="tb-name">Pets Go Control<\/div>/,
  `<div class="tb-logo" id="cfg-logo-wrap"></div>\n    <div class="tb-name" id="cfg-app-name">PetSystem</div>`
);

// ── 3. Avatar initials ────────────────────────────────────────────────────────
src = src.replace(/(<div class="tb-avatar"[^>]*>)JR(<\/div>)/, '<div class="tb-avatar" id="cfg-avatar">PS</div>');

// ── 4. DB_KEY → from settings ────────────────────────────────────────────────
src = src.replace("const DB_KEY = 'petsgo_crm';", "const DB_KEY = loadSettings().dbKey || 'petsystem_crm';");

// ── 5. Configurações page: add sub-tabs + Aparência section ──────────────────
src = src.replace(
  `  <!-- CONFIGURAÇÕES -->
  <div class="page" id="page-config">
    <div class="page-header">
      <div>
        <div class="page-title">Serviços</div>
        <div class="page-sub" id="cfg-sub">Serviços do pet shop</div>
      </div>
      <button class="btn btn-primary" onclick="openModal('modal-new-servico')"><i class="ph ph-plus"></i> Novo serviço</button>
    </div>
    <div class="card" style="max-width:720px">
      <div class="card-title">Catálogo de Serviços <span id="cfg-count"></span></div>
      <div id="cfg-list">
        <div style="text-align:center;padding:30px;color:var(--muted);font-size:13px">Nenhum serviço ainda.</div>
      </div>
    </div>
  </div>`,

  `  <!-- CONFIGURAÇÕES -->
  <div class="page" id="page-config">
    <div class="page-header">
      <div>
        <div class="page-title" id="cfg-page-title">Configurações</div>
        <div class="page-sub" id="cfg-sub">Serviços e aparência do sistema</div>
      </div>
      <button class="btn btn-primary" id="cfg-btn-new" onclick="openModal('modal-new-servico')" style="display:none"><i class="ph ph-plus"></i> Novo serviço</button>
    </div>
    <div class="filter-row">
      <div class="svc-tab active" id="cfg-tab-servicos" onclick="setCfgTab('servicos')">Serviços</div>
      <div class="svc-tab" id="cfg-tab-aparencia" onclick="setCfgTab('aparencia')">Aparência</div>
    </div>

    <!-- ABA SERVIÇOS -->
    <div id="cfg-panel-servicos">
      <div class="card" style="max-width:720px">
        <div class="card-title">Catálogo de Serviços <span id="cfg-count"></span></div>
        <div id="cfg-list">
          <div style="text-align:center;padding:30px;color:var(--muted);font-size:13px">Nenhum serviço ainda.</div>
        </div>
      </div>
    </div>

    <!-- ABA APARÊNCIA -->
    <div id="cfg-panel-aparencia" style="display:none">
      <div class="card" style="max-width:520px">
        <div class="card-title">Identidade Visual</div>
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:16px">

          <div class="field">
            <label>Logo do sistema</label>
            <div id="logo-drop-area" onclick="document.getElementById('logo-file').click()"
              style="border:2px dashed var(--border2);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:border-color .15s;background:var(--surface2)"
              ondragover="event.preventDefault();this.style.borderColor='var(--brand)'"
              ondragleave="this.style.borderColor='var(--border2)'"
              ondrop="handleLogoDrop(event)">
              <div id="logo-preview-wrap">
                <div style="font-size:32px;color:var(--muted2)"><i class="ph ph-image"></i></div>
                <div style="font-size:13px;color:var(--muted);margin-top:6px">Clique ou arraste uma imagem</div>
                <div style="font-size:11px;color:var(--muted2);margin-top:2px">PNG, JPG, SVG — recomendado quadrado</div>
              </div>
            </div>
            <input type="file" id="logo-file" accept="image/*" style="display:none" onchange="handleLogoFile(this)"/>
            <button class="btn btn-ghost btn-sm" style="margin-top:6px" onclick="clearLogo()">Remover logo</button>
          </div>

          <div class="field">
            <label>Nome do sistema</label>
            <input id="cfg-inp-nome" placeholder="Ex: Pets Go Control, MaxPet, BioVet..." style="font-size:14px"/>
          </div>

          <div class="field">
            <label>Iniciais (avatar do usuário)</label>
            <input id="cfg-inp-avatar" maxlength="2" placeholder="Ex: JR, PS, MG" style="width:80px;font-size:14px;text-transform:uppercase"/>
          </div>

          <div class="field">
            <label>Cor principal</label>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <input type="color" id="cfg-color-pick" style="width:44px;height:44px;border-radius:8px;border:1px solid var(--border);cursor:pointer;padding:2px" oninput="previewColor(this.value)"/>
              <div style="display:flex;gap:8px;flex-wrap:wrap" id="color-presets">
                ${['#4047C8','#059669','#0EA5E9','#F97316','#EC4899','#7C3AED','#DC2626','#0F766E'].map(c =>
                  `<div onclick="setPresetColor('${c}')" title="${c}"
                    style="width:28px;height:28px;border-radius:6px;background:${c};cursor:pointer;border:2px solid transparent;transition:border-color .12s"
                    class="color-preset" data-color="${c}"></div>`
                ).join('')}
              </div>
            </div>
          </div>

          <button class="btn btn-primary" onclick="saveAppearance()"><i class="ph ph-floppy-disk"></i> Salvar aparência</button>
        </div>
      </div>
    </div>
  </div>`
);

// ── 6. Add setup overlay HTML before </body> ─────────────────────────────────
const setupOverlay = `
<!-- SETUP OVERLAY (first run) -->
<div id="setup-overlay" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)">
  <div style="background:#fff;border-radius:20px;padding:36px 32px;width:100%;max-width:460px;box-shadow:0 24px 60px rgba(0,0,0,.25)">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:40px;margin-bottom:8px">🐾</div>
      <div style="font-size:22px;font-weight:800;letter-spacing:-.02em">Bem-vindo!</div>
      <div style="font-size:14px;color:#64748B;margin-top:4px">Configure a identidade do seu sistema antes de começar</div>
    </div>

    <div style="display:flex;flex-direction:column;gap:14px">

      <div>
        <label style="font-size:12px;font-weight:600;color:#334155;display:block;margin-bottom:6px">Logo do pet shop</label>
        <div id="setup-logo-area" onclick="document.getElementById('setup-logo-file').click()"
          style="border:2px dashed #CBD5E1;border-radius:12px;padding:20px;text-align:center;cursor:pointer;background:#F8FAFC;transition:border-color .15s"
          ondragover="event.preventDefault();this.style.borderColor='#4047C8'"
          ondragleave="this.style.borderColor='#CBD5E1'"
          ondrop="handleSetupLogoDrop(event)">
          <div id="setup-logo-preview">
            <div style="font-size:28px;color:#94A3B8"><i class="ph ph-image"></i></div>
            <div style="font-size:12px;color:#94A3B8;margin-top:4px">Clique para adicionar logo</div>
          </div>
        </div>
        <input type="file" id="setup-logo-file" accept="image/*" style="display:none" onchange="handleSetupLogoFile(this)"/>
      </div>

      <div>
        <label style="font-size:12px;font-weight:600;color:#334155;display:block;margin-bottom:6px">Nome do sistema *</label>
        <input id="setup-nome" placeholder="Ex: Pets Go Control, MaxPet, BioVet..."
          style="width:100%;padding:10px 12px;border:1px solid #E2E8F0;border-radius:8px;font-family:Inter,sans-serif;font-size:14px;outline:none;transition:border-color .15s"
          onfocus="this.style.borderColor='#4047C8'" onblur="this.style.borderColor='#E2E8F0'"/>
      </div>

      <div>
        <label style="font-size:12px;font-weight:600;color:#334155;display:block;margin-bottom:8px">Cor principal</label>
        <div style="display:flex;align-items:center;gap:10px">
          <input type="color" id="setup-color" value="#4047C8"
            style="width:44px;height:44px;border-radius:8px;border:1px solid #E2E8F0;cursor:pointer;padding:2px"/>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${['#4047C8','#059669','#0EA5E9','#F97316','#EC4899','#7C3AED','#DC2626','#0F766E'].map(c =>
              `<div onclick="document.getElementById('setup-color').value='${c}'"
                style="width:28px;height:28px;border-radius:6px;background:${c};cursor:pointer"></div>`
            ).join('')}
          </div>
        </div>
      </div>

      <button onclick="finishSetup()"
        style="margin-top:8px;background:#4047C8;color:#fff;border:none;border-radius:10px;padding:14px;font-family:Inter,sans-serif;font-size:15px;font-weight:700;cursor:pointer;width:100%;transition:background .15s"
        onmouseover="this.style.background='#2D33A8'" onmouseout="this.style.background='#4047C8'">
        Começar →
      </button>
    </div>
  </div>
</div>
`;

src = src.replace('</body>', setupOverlay + '\n</body>');

// ── 7. Inject settings system + UI logic into <script> ────────────────────────
const settingsJS = `
// ══════════════════════════════════════════════════════════════
// SETTINGS SYSTEM
// ══════════════════════════════════════════════════════════════
const SETTINGS_KEY = '_app_cfg';
let _setupLogo = '';

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; }
}
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

function applySettings(s) {
  const name  = s.appName  || 'PetSystem';
  const color = s.color    || '#4047C8';
  const logo  = s.logo     || '';
  const initials = s.avatar || name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'PS';

  // CSS brand color
  const r = document.documentElement;
  r.style.setProperty('--brand', color);
  const hex = color.replace('#','');
  const dr = Math.max(0,parseInt(hex.slice(0,2),16)-30);
  const dg = Math.max(0,parseInt(hex.slice(2,4),16)-30);
  const db2 = Math.max(0,parseInt(hex.slice(4,6),16)-30);
  r.style.setProperty('--brand-dark','#'+[dr,dg,db2].map(x=>x.toString(16).padStart(2,'0')).join(''));
  r.style.setProperty('--brand-light', color + '22');

  // App name
  const nameEl = document.getElementById('cfg-app-name');
  if (nameEl) nameEl.textContent = name;
  document.title = name;

  // Logo in topbar
  const logoWrap = document.getElementById('cfg-logo-wrap');
  if (logoWrap) {
    if (logo) {
      logoWrap.innerHTML = '<img src="'+logo+'" alt="'+name+'" style="width:36px;height:36px;object-fit:cover;border-radius:8px">';
    } else {
      logoWrap.innerHTML = '<div style="width:36px;height:36px;border-radius:8px;background:var(--brand);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px">🐾</div>';
    }
  }

  // Avatar
  const avEl = document.getElementById('cfg-avatar');
  if (avEl) avEl.textContent = initials;

  // Populate Aparência form if open
  const ni = document.getElementById('cfg-inp-nome');
  if (ni) ni.value = name;
  const ai = document.getElementById('cfg-inp-avatar');
  if (ai) ai.value = s.avatar || '';
  const ci = document.getElementById('cfg-color-pick');
  if (ci) ci.value = color;
  updatePresetHighlight(color);

  // Logo preview in aparência tab
  if (logo) showLogoPreview(logo, 'logo-preview-wrap');
}

// ── Configurações tabs ───────────────────────────────────────
let curCfgTab = 'servicos';
function setCfgTab(tab) {
  curCfgTab = tab;
  document.getElementById('cfg-panel-servicos').style.display = tab==='servicos'?'':'none';
  document.getElementById('cfg-panel-aparencia').style.display = tab==='aparencia'?'':'none';
  document.getElementById('cfg-tab-servicos').classList.toggle('active', tab==='servicos');
  document.getElementById('cfg-tab-aparencia').classList.toggle('active', tab==='aparencia');
  document.getElementById('cfg-btn-new').style.display = tab==='servicos'?'':'none';
  if (tab==='aparencia') {
    const s = loadSettings();
    const ni = document.getElementById('cfg-inp-nome');
    if (ni) ni.value = s.appName || '';
    const ai = document.getElementById('cfg-inp-avatar');
    if (ai) ai.value = s.avatar || '';
    const ci = document.getElementById('cfg-color-pick');
    if (ci) ci.value = s.color || '#4047C8';
    updatePresetHighlight(s.color || '#4047C8');
    if (s.logo) showLogoPreview(s.logo, 'logo-preview-wrap');
  }
}

// ── Aparência form helpers ───────────────────────────────────
function previewColor(c) { updatePresetHighlight(c); }
function setPresetColor(c) {
  document.getElementById('cfg-color-pick').value = c;
  updatePresetHighlight(c);
}
function updatePresetHighlight(c) {
  document.querySelectorAll('.color-preset').forEach(el => {
    el.style.borderColor = el.dataset.color===c ? '#0F172A' : 'transparent';
  });
}
function showLogoPreview(src, wrapId) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  wrap.innerHTML = '<img src="'+src+'" style="max-height:72px;max-width:100%;border-radius:8px;object-fit:contain"/>' +
    '<div style="font-size:11px;color:var(--muted);margin-top:6px">Logo carregada</div>';
}
function clearLogo() {
  const s = loadSettings(); s.logo = ''; saveSettings(s);
  const wrap = document.getElementById('logo-preview-wrap');
  if (wrap) wrap.innerHTML = '<div style="font-size:32px;color:var(--muted2)"><i class="ph ph-image"></i></div><div style="font-size:13px;color:var(--muted);margin-top:6px">Clique ou arraste uma imagem</div><div style="font-size:11px;color:var(--muted2);margin-top:2px">PNG, JPG, SVG</div>';
  applySettings(s);
  toast('Logo removida');
}
function handleLogoFile(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { showLogoPreview(e.target.result, 'logo-preview-wrap'); document.getElementById('cfg-color-pick')._pendingLogo = e.target.result; _setupLogo = e.target.result; };
  reader.readAsDataURL(file);
}
function handleLogoDrop(e) {
  e.preventDefault();
  document.getElementById('logo-drop-area').style.borderColor = 'var(--border2)';
  const file = e.dataTransfer.files[0]; if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = ev => { showLogoPreview(ev.target.result, 'logo-preview-wrap'); _setupLogo = ev.target.result; };
  reader.readAsDataURL(file);
}
function saveAppearance() {
  const s = loadSettings();
  const nome = document.getElementById('cfg-inp-nome').value.trim() || 'PetSystem';
  const avatar = document.getElementById('cfg-inp-avatar').value.trim().toUpperCase().slice(0,2);
  const color = document.getElementById('cfg-color-pick').value;
  const logoEl = document.getElementById('logo-preview-wrap')?.querySelector('img');
  if (logoEl) s.logo = logoEl.src;
  s.appName = nome; s.avatar = avatar; s.color = color;
  saveSettings(s);
  applySettings(s);
  toast('✅ Aparência salva!');
}

// ── Setup overlay (first run) ────────────────────────────────
function handleSetupLogoFile(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { _setupLogo = e.target.result; showSetupLogoPreview(e.target.result); };
  reader.readAsDataURL(file);
}
function handleSetupLogoDrop(e) {
  e.preventDefault();
  document.getElementById('setup-logo-area').style.borderColor = '#CBD5E1';
  const file = e.dataTransfer.files[0]; if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = ev => { _setupLogo = ev.target.result; showSetupLogoPreview(ev.target.result); };
  reader.readAsDataURL(file);
}
function showSetupLogoPreview(src) {
  const wrap = document.getElementById('setup-logo-preview');
  if (wrap) wrap.innerHTML = '<img src="'+src+'" style="max-height:64px;max-width:100%;border-radius:8px;object-fit:contain"/><div style="font-size:11px;color:#94A3B8;margin-top:4px">Logo carregada</div>';
}
function finishSetup() {
  const nome = document.getElementById('setup-nome').value.trim();
  if (!nome) { document.getElementById('setup-nome').style.borderColor = '#DC2626'; return; }
  const color = document.getElementById('setup-color').value;
  const avatar = nome.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const s = { appName: nome, avatar, color, logo: _setupLogo, dbKey: nome.toLowerCase().replace(/[^a-z0-9]/g,'_')+'_crm' };
  saveSettings(s);
  document.getElementById('setup-overlay').style.display = 'none';
  applySettings(s);
  toast('✅ ' + nome + ' configurado!');
}
function checkFirstRun() {
  const s = loadSettings();
  if (!s.appName) {
    document.getElementById('setup-overlay').style.display = 'flex';
  } else {
    applySettings(s);
  }
}
`;

// Insert settings JS at start of <script> block (before DB_KEY line)
src = src.replace('<script>\n', '<script>\n' + settingsJS + '\n');

// ── 8. Replace seedServicos() call to also call checkFirstRun ─────────────────
src = src.replace(
  'seedServicos();',
  'checkFirstRun();\nseedServicos();'
);

// ── 9. renderConfig: show "Novo serviço" button correctly ────────────────────
// Make sure the button is shown when on serviços tab
// (Already handled by setCfgTab, but fix initial state)
src = src.replace(
  `  if (page==='config')     renderConfig();`,
  `  if (page==='config')     { renderConfig(); setCfgTab(curCfgTab); }`
);

// ── Write output ──────────────────────────────────────────────────────────────
fs.writeFileSync('petsgo-crm-base.html', src);
console.log('petsgo-crm-base.html gerado');

const checks = [
  ['Settings system', '_setupLogo'],
  ['applySettings', 'applySettings(s)'],
  ['checkFirstRun', 'checkFirstRun()'],
  ['Setup overlay', 'setup-overlay'],
  ['Aparência tab', 'cfg-tab-aparencia'],
  ['Logo upload', 'setup-logo-file'],
  ['Color presets', 'color-preset'],
  ['cfg-logo-wrap', 'cfg-logo-wrap'],
];
checks.forEach(([label, token]) => console.log(label+':', src.includes(token) ? '✓' : '✗ FALTANDO'));
