import re

path = r"C:\Users\viaje\Projeto 1\petsgo-crm-light.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. CSS Palette
content = re.sub(
    r'--brand:#4047C8;.*?--yellow-light:#FFFDE6;',
    '--brand:#EA580C;--brand-dark:#C2410C;--brand-light:#FFEDD5;--blue:#1E3A8A;--blue-light:#DBEAFE;--green:#10B981;--green-light:#D1FAE5;--pink:#EC4899;--pink-light:#FCE7F3;--indigo:#6366F1;--indigo-light:#E0E7FF;--yellow:#F5C218;--yellow-light:#FFFDE6;',
    content,
    flags=re.DOTALL
)

# 2. Stats CSS
content = re.sub(
    r'\.stat-c1\{background:var\(--brand-light\);color:var\(--brand-dark\)\}\.stat-c1 \.stat-icon\{background:#C8CAEF\}.*?\.stat-c4\{background:var\(--yellow-light\);color:#856400\}\.stat-c4 \.stat-icon\{background:#FDEEA0\}',
    '.stat-c1{background:var(--brand-light);color:var(--brand-dark)}.stat-c1 .stat-icon{background:var(--brand);color:#fff}\n.stat-c2{background:var(--green-light);color:var(--green)}.stat-c2 .stat-icon{background:var(--green);color:#fff}\n.stat-c3{background:var(--pink-light);color:var(--pink)}.stat-c3 .stat-icon{background:var(--pink);color:#fff}\n.stat-c4{background:var(--indigo-light);color:var(--indigo)}.stat-c4 .stat-icon{background:var(--indigo);color:#fff}',
    content,
    flags=re.DOTALL
)

# 3. Toast CSS / innerHTML
content = re.sub(r"t\.textContent = msg;", "t.innerHTML = msg;", content)

# 4. PAL Array
content = re.sub(
    r"const PAL = \[\['#ECEEFF','#4047C8'\],\['#E5FFF8','#006B4F'\],\['#FFF0F8','#9A0050'\],\['#FFFDE6','#856400'\],\['#FEF2F2','#DC2626'\],\['#F0FFF4','#16A34A'\]\];",
    "const PAL = [['#FFEDD5','#EA580C'],['#DBEAFE','#1E3A8A'],['#D1FAE5','#10B981'],['#FCE7F3','#EC4899'],['#E0E7FF','#6366F1']];",
    content
)

# 5. Sidebar Config
sidebar_sep = r'''<div class="sidebar-sep"></div>
  <div class="sidebar-bottom">'''
new_sidebar = r'''<div class="sidebar-sep"></div>
  <div class="nav-label">Sistema</div>
  <div class="nav-item" id="nav-config" onclick="navTo('config')">
    <span class="nav-ico"><i class="ph ph-gear"></i></span> Configurações
  </div>
  <div class="sidebar-sep"></div>
  <div class="sidebar-bottom">'''
content = content.replace(sidebar_sep, new_sidebar)

# 6. navTo update
navto_code = r'''  if (page==='estoque')    renderEstoque();
}'''
new_navto_code = r'''  if (page==='estoque')    renderEstoque();
  if (page==='config')     renderConfig();
}'''
content = content.replace(navto_code, new_navto_code)

# 7. Add Config Page HTML
estoque_page = r'''  <!-- ESTOQUE -->
  <div class="page" id="page-estoque">'''

config_page = r'''  <!-- CONFIGURAÇÕES -->
  <div class="page" id="page-config">
    <div class="page-header">
      <div>
        <div class="page-title">Configurações</div>
        <div class="page-sub">Personalize o CRM</div>
      </div>
    </div>
    <div class="card" style="max-width: 500px">
      <div class="card-title">Cor Principal da Marca</div>
      <div style="display:flex;gap:12px;margin-top:16px">
        <div onclick="setBrand('orange')" style="background:#EA580C;width:36px;height:36px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all 0.2s" id="color-orange"></div>
        <div onclick="setBrand('blue')" style="background:#1E3A8A;width:36px;height:36px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all 0.2s" id="color-blue"></div>
        <div onclick="setBrand('green')" style="background:#10B981;width:36px;height:36px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all 0.2s" id="color-green"></div>
        <div onclick="setBrand('pink')" style="background:#EC4899;width:36px;height:36px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all 0.2s" id="color-pink"></div>
        <div onclick="setBrand('indigo')" style="background:#6366F1;width:36px;height:36px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all 0.2s" id="color-indigo"></div>
      </div>
    </div>
  </div>

  <!-- ESTOQUE -->
  <div class="page" id="page-estoque">'''
content = content.replace(estoque_page, config_page)

# 8. Add Config JS Logic
init_code = r'''// ── INIT ──────────────────────────────────────────────────────────────────────'''
config_js = r'''// ── CONFIGURAÇÕES ───────────────────────────────────────────────────────────────
const BRANDS = {
  orange: { brand: '#EA580C', dark: '#C2410C', light: '#FFEDD5' },
  blue:   { brand: '#1E3A8A', dark: '#1E40AF', light: '#DBEAFE' },
  green:  { brand: '#10B981', dark: '#059669', light: '#D1FAE5' },
  pink:   { brand: '#EC4899', dark: '#DB2777', light: '#FCE7F3' },
  indigo: { brand: '#6366F1', dark: '#4F46E5', light: '#E0E7FF' }
};

function setBrand(colorName) {
  const b = BRANDS[colorName];
  if (!b) return;
  document.documentElement.style.setProperty('--brand', b.brand);
  document.documentElement.style.setProperty('--brand-dark', b.dark);
  document.documentElement.style.setProperty('--brand-light', b.light);
  localStorage.setItem('petsgo_brand', colorName);
  renderConfig();
}

function renderConfig() {
  const current = localStorage.getItem('petsgo_brand') || 'orange';
  ['orange','blue','green','pink','indigo'].forEach(c => {
    const el = document.getElementById('color-'+c);
    if(el) {
      el.style.borderColor = c === current ? 'var(--text)' : 'transparent';
      el.style.transform = c === current ? 'scale(1.1)' : 'scale(1)';
    }
  });
}

// ── INIT ──────────────────────────────────────────────────────────────────────'''
content = content.replace(init_code, config_js)

init_calls = r'''populateSel('f-unidade','');'''
init_calls_new = r'''const savedBrand = localStorage.getItem('petsgo_brand') || 'orange';
setBrand(savedBrand);
populateSel('f-unidade','');'''
content = content.replace(init_calls, init_calls_new)

# 9. Emoji Replacements
emojis = {
    '<div class="tb-logo">🐾</div>': '<div class="tb-logo"><i class="ph ph-paw-print"></i></div>',
    '<div class="quick-icon">👤</div>': '<div class="quick-icon"><i class="ph ph-user"></i></div>',
    '<div class="quick-icon">📅</div>': '<div class="quick-icon"><i class="ph ph-calendar-plus"></i></div>',
    '<div class="quick-icon">🚪</div>': '<div class="quick-icon"><i class="ph ph-door-open"></i></div>',
    '<div class="quick-icon">⬆️</div>': '<div class="quick-icon"><i class="ph ph-upload-simple"></i></div>',
    '<div class="form-divider">🐾 Pets': '<div class="form-divider"><i class="ph ph-paw-print"></i> Pets',
    '<div class="form-divider">🐾 Pets existentes</div>': '<div class="form-divider"><i class="ph ph-paw-print"></i> Pets existentes</div>',
    '<div style="font-size:22px">🐾</div>': '<div style="font-size:22px"><i class="ph ph-paw-print"></i></div>',
    "🐾 Pets de ": "<i class='ph ph-paw-print'></i> Pets de ",
    "'🐾 '+pets.map": "'<i class=\"ph ph-paw-print\"></i> '+pets.map",
    "🐾 Pet ${i+1}": "<i class=\"ph ph-paw-print\"></i> Pet ${i+1}",
    "🐾 Novo pet": "<i class=\"ph ph-paw-print\"></i> Novo pet",
    "<span>🐾 <strong>": "<span><i class=\"ph ph-paw-print\"></i> <strong>",
    "dentro?'🟢':saiu?'⚪':'🟡'": "dentro?'<i class=\"ph-fill ph-check-circle\" style=\"color:var(--green)\"></i>':saiu?'<i class=\"ph-fill ph-circle\" style=\"color:var(--muted)\"></i>':'<i class=\"ph-fill ph-clock\" style=\"color:var(--yellow)\"></i>'",
    "⚠️ ": "<i class=\"ph ph-warning-circle\"></i> ",
    "✅ ": "<i class=\"ph ph-check-circle\"></i> ",
    "🗑️ ": "<i class=\"ph ph-trash\"></i> ",
    "📅 ": "<i class=\"ph ph-calendar\"></i> ",
    "🚪 ": "<i class=\"ph ph-door-open\"></i> ",
    "❌ ": "<i class=\"ph ph-x-circle\"></i> ",
    "✔️ ": "<i class=\"ph ph-check-circle\"></i> "
}

for k, v in emojis.items():
    content = content.replace(k, v)

# Fix confirm prompt which had emoji replaced
content = content.replace("confirm(`<i class=\"ph ph-warning-circle\"></i> APAGAR TODOS OS DADOS?", "confirm(`⚠️ APAGAR TODOS OS DADOS?")

# Change textContent to innerHTML for est-sub so HTML icon renders correctly
content = content.replace(
    "document.getElementById('est-sub').textContent = `${ps.length} produtos${baixo?` · <i class=\"ph ph-warning-circle\"></i> ${baixo} com estoque baixo`:''}`;", 
    "document.getElementById('est-sub').innerHTML = `${ps.length} produtos${baixo?` · <i class=\"ph ph-warning-circle\"></i> ${baixo} com estoque baixo`:''}`;"
)
content = content.replace(
    "document.getElementById('est-sub').textContent = `${ps.length} produtos${baixo?` · ⚠️ ${baixo} com estoque baixo`:''}`;", 
    "document.getElementById('est-sub').innerHTML = `${ps.length} produtos${baixo?` · <i class=\"ph ph-warning-circle\"></i> ${baixo} com estoque baixo`:''}`;"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
