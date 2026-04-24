const fs = require('fs');
const path = 'C:\\Users\\viaje\\Projeto 1\\petsgo-crm-light.html';
let content = fs.readFileSync(path, 'utf8');

// 1. CSS Palette
content = content.replace(
  /--brand:#4047C8;.*?--yellow-light:#FFFDE6;/s,
  '--brand:#EA580C;--brand-dark:#C2410C;--brand-light:#FFEDD5;--blue:#1E3A8A;--blue-light:#DBEAFE;--green:#10B981;--green-light:#D1FAE5;--pink:#EC4899;--pink-light:#FCE7F3;--indigo:#6366F1;--indigo-light:#E0E7FF;--yellow:#F5C218;--yellow-light:#FFFDE6;'
);

// 2. Stats CSS
content = content.replace(
  /\.stat-c1\{background:var\(--brand-light\);color:var\(--brand-dark\)\}\.stat-c1 \.stat-icon\{background:#C8CAEF\}.*?\.stat-c4\{background:var\(--yellow-light\);color:#856400\}\.stat-c4 \.stat-icon\{background:#FDEEA0\}/s,
  '.stat-c1{background:var(--brand-light);color:var(--brand-dark)}.stat-c1 .stat-icon{background:var(--brand);color:#fff}\n.stat-c2{background:var(--green-light);color:var(--green)}.stat-c2 .stat-icon{background:var(--green);color:#fff}\n.stat-c3{background:var(--pink-light);color:var(--pink)}.stat-c3 .stat-icon{background:var(--pink);color:#fff}\n.stat-c4{background:var(--indigo-light);color:var(--indigo)}.stat-c4 .stat-icon{background:var(--indigo);color:#fff}'
);

// 3. Toast CSS / innerHTML
content = content.replace(/t\.textContent = msg;/g, 't.innerHTML = msg;');

// 4. PAL Array
content = content.replace(
  /const PAL = \[\['#ECEEFF','#4047C8'\],\['#E5FFF8','#006B4F'\],\['#FFF0F8','#9A0050'\],\['#FFFDE6','#856400'\],\['#FEF2F2','#DC2626'\],\['#F0FFF4','#16A34A'\]\];/,
  "const PAL = [['#FFEDD5','#EA580C'],['#DBEAFE','#1E3A8A'],['#D1FAE5','#10B981'],['#FCE7F3','#EC4899'],['#E0E7FF','#6366F1']];"
);

// 5. Sidebar Config
content = content.replace(
  /<div class="sidebar-sep"><\/div>\s*<div class="sidebar-bottom">/,
  `<div class="sidebar-sep"></div>
  <div class="nav-label">Sistema</div>
  <div class="nav-item" id="nav-config" onclick="navTo('config')">
    <span class="nav-ico"><i class="ph ph-gear"></i></span> Configurações
  </div>
  <div class="sidebar-sep"></div>
  <div class="sidebar-bottom">`
);

// 6. navTo update
content = content.replace(
  /  if \(page==='estoque'\)    renderEstoque\(\);\s*\}/,
  `  if (page==='estoque')    renderEstoque();
  if (page==='config')     renderConfig();
}`
);

// 7. Add Config Page HTML
const config_page = `  <!-- CONFIGURAÇÕES -->
  <div class="page" id="page-config">
    <div class="page-header">
      <div>
        <div class="page-title">Configurações</div>
        <div class="page-sub" id="config-sub">Personalize o CRM</div>
      </div>
    </div>
    
    <div class="filter-row" style="margin-bottom:20px">
      <div class="svc-tab active" id="tab-conf-aparencia" onclick="setConfTab('aparencia')">Aparência</div>
      <div class="svc-tab" id="tab-conf-servicos" onclick="setConfTab('servicos')">Serviços</div>
    </div>

    <div id="conf-aparencia">
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

    <div id="conf-servicos" style="display:none">
      <div class="card">
        <div class="card-title">
          Catálogo de Serviços
          <button class="btn btn-primary btn-sm" onclick="openModal('modal-new-servico')"><i class="ph ph-plus"></i> Novo Serviço</button>
        </div>
        <div id="cfg-servicos-list" style="display:flex;flex-direction:column;gap:8px"></div>
      </div>
    </div>
  </div>

  <!-- ESTOQUE -->
  <div class="page" id="page-estoque">`;
content = content.replace(/  <!-- ESTOQUE -->\s*<div class="page" id="page-estoque">/, config_page);

// 8. Add Config JS Logic
const config_js = `// ── CONFIGURAÇÕES ───────────────────────────────────────────────────────────────
let confTab = 'aparencia';
function setConfTab(t) {
  confTab = t;
  document.getElementById('tab-conf-aparencia').classList.toggle('active', t==='aparencia');
  document.getElementById('tab-conf-servicos').classList.toggle('active', t==='servicos');
  document.getElementById('conf-aparencia').style.display = t==='aparencia'?'block':'none';
  document.getElementById('conf-servicos').style.display = t==='servicos'?'block':'none';
  if(t==='servicos') renderCfgServicos();
}

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

function initDefaultServicos() {
  const D = loadDB();
  if(!D.servicos || D.servicos.length===0) {
    D.servicos = [
      {id:uid(), nome:'Banho', preco:45, duracao:30, status:'ativo'},
      {id:uid(), nome:'Tosa', preco:60, duracao:45, status:'ativo'},
      {id:uid(), nome:'Banho + Tosa', preco:90, duracao:60, status:'ativo'},
      {id:uid(), nome:'Creche — Dia', preco:80, duracao:0, status:'ativo'},
      {id:uid(), nome:'Consulta Veterinária', preco:150, duracao:30, status:'ativo'}
    ];
    saveDB(D);
  }
}

function renderCfgServicos() {
  const D = loadDB();
  const list = D.servicos || [];
  const el = document.getElementById('cfg-servicos-list');
  if(!list.length) {
    el.innerHTML = '<div class="empty-state"><p>Nenhum serviço cadastrado.</p></div>';
    return;
  }
  el.innerHTML = list.map(s => \`
    <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--surface)">
      <div style="flex:1">
        <div style="font-weight:700;font-size:14px">\${s.nome}</div>
        <div style="font-size:12px;color:var(--muted)">\${s.preco?fmtBRL(s.preco):'Preço a definir'}\${s.duracao?\` · \${s.duracao} min\`:\`\`}</div>
      </div>
      <span class="tag \${s.status==='ativo'?'tag-green':'tag-gray'}">\${s.status==='ativo'?'Ativo':'Inativo'}</span>
      <div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-sm" onclick="editServico('\${s.id}')"><i class="ph ph-pencil"></i></button>
        <button class="btn btn-danger btn-sm" onclick="delServico('\${s.id}')"><i class="ph ph-trash"></i></button>
      </div>
    </div>\`).join('');
}

function openServicoModal(id) {
  const D = loadDB();
  const s = id ? D.servicos.find(x=>x.id===id) : null;
  document.getElementById('cfg-srv-id').value = id||'';
  document.getElementById('cfg-srv-nome').value = s?s.nome:'';
  document.getElementById('cfg-srv-preco').value = s?s.preco:'';
  document.getElementById('cfg-srv-duracao').value = s?s.duracao:'';
  document.getElementById('cfg-srv-status').value = s?s.status:'ativo';
  openModal('modal-new-servico');
}

function editServico(id) { openServicoModal(id); }

function saveServico() {
  const nome = document.getElementById('cfg-srv-nome').value.trim();
  if(!nome) { toast('<i class="ph ph-warning-circle"></i> Nome obrigatório'); return; }
  const id = document.getElementById('cfg-srv-id').value;
  const preco = parseFloat(document.getElementById('cfg-srv-preco').value)||0;
  const duracao = parseInt(document.getElementById('cfg-srv-duracao').value)||0;
  const status = document.getElementById('cfg-srv-status').value;
  
  const D = loadDB();
  if(id) {
    const s = D.servicos.find(x=>x.id===id);
    if(s) { s.nome=nome; s.preco=preco; s.duracao=duracao; s.status=status; }
  } else {
    D.servicos.push({id:uid(), nome, preco, duracao, status});
  }
  saveDB(D);
  closeModal('modal-new-servico');
  renderCfgServicos();
  toast('<i class="ph ph-check-circle"></i> Serviço salvo!');
}

function delServico(id) {
  if(!confirm('Remover serviço?')) return;
  const D = loadDB();
  D.servicos = D.servicos.filter(x=>x.id!==id);
  saveDB(D); renderCfgServicos(); toast('<i class="ph ph-trash"></i> Removido');
}

// ── INIT ──────────────────────────────────────────────────────────────────────`;
content = content.replace(/\/\/ ── INIT ──────────────────────────────────────────────────────────────────────/, config_js);

content = content.replace(/populateSel\('f-unidade',''\);/, `const savedBrand = localStorage.getItem('petsgo_brand') || 'orange';
setBrand(savedBrand);
initDefaultServicos();
populateSel('f-unidade','');`);

// 9. Modal HTML for Servico
const modal_servico = `
<!-- Novo/Editar Serviço -->
<div class="modal-overlay" id="modal-new-servico">
  <div class="modal modal-sm">
    <div class="modal-header">
      <div class="modal-title">Serviço</div>
      <div class="modal-close" onclick="closeModal('modal-new-servico')"><i class="ph ph-x"></i></div>
    </div>
    <div class="form-grid">
      <input type="hidden" id="cfg-srv-id"/>
      <div class="field"><label>Nome *</label><input id="cfg-srv-nome" placeholder="Ex: Banho G"/></div>
      <div class="form-row">
        <div class="field"><label>Preço Padrão (R$)</label><input id="cfg-srv-preco" type="number" placeholder="0.00" step="0.01"/></div>
        <div class="field"><label>Duração (min)</label><input id="cfg-srv-duracao" type="number" placeholder="Ex: 30"/></div>
      </div>
      <div class="field"><label>Status</label>
        <select id="cfg-srv-status"><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select>
      </div>
      <div class="form-footer">
        <button class="btn btn-ghost" onclick="closeModal('modal-new-servico')">Cancelar</button>
        <button class="btn btn-primary" onclick="saveServico()"><i class="ph ph-floppy-disk"></i> Salvar</button>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>`;
content = content.replace(/<div class="toast" id="toast"><\/div>/, modal_servico);


// 10. Change Agenda logic to use DB servicos
content = content.replace(
  /<select id="ag-servico">.*?<\/select>/s,
  `<select id="ag-servico" onchange="onAgServicoChange()">
    <option value="">Selecionar...</option>
  </select>`
);

const onAgServicoChangeCode = `
function onAgServicoChange() {
  const sid = document.getElementById('ag-servico').value;
  if(!sid) return;
  const D = loadDB();
  const s = D.servicos.find(x=>x.id===sid);
  if(s && s.preco) {
    document.getElementById('ag-valor').value = s.preco;
  }
}

function onAgTutorChange() {`;
content = content.replace(/function onAgTutorChange\(\) \{/, onAgServicoChangeCode);

const populateAgServicosCode = `
  const D = loadDB();
  document.getElementById('ag-servico').innerHTML = 
    '<option value="">Selecionar...</option>' + 
    (D.servicos||[]).filter(s=>s.status!=='inativo').map(s=>\`<option value="\${s.id}">\${s.nome}</option>\`).join('');
  document.getElementById('ag-tutor').innerHTML =`;
content = content.replace(/  const D = loadDB\(\);\n  document.getElementById\('ag-tutor'\).innerHTML =/, populateAgServicosCode);

content = content.replace(
  /a\.servico\|\|''/g,
  `(D.servicos?.find(s=>s.id===a.servico)?.nome || a.servico || '')`
);

// 11. Emojis
const emojis = {
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
    "🐾 Pet \${i+1}": "<i class=\"ph ph-paw-print\"></i> Pet \${i+1}",
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
};

for(let k in emojis) {
  content = content.split(k).join(emojis[k]);
}

content = content.split("confirm(`<i class=\"ph ph-warning-circle\"></i> APAGAR TODOS OS DADOS?").join("confirm(`⚠️ APAGAR TODOS OS DADOS?");

// We will use substring replacement for est-sub innerHTML instead of backticks inside backticks
content = content.replace("document.getElementById('est-sub').textContent = `${ps.length} produtos${baixo?` · <i class=\"ph ph-warning-circle\"></i> ${baixo} com estoque baixo`:''}`;", "document.getElementById('est-sub').innerHTML = `${ps.length} produtos${baixo?` · <i class=\"ph ph-warning-circle\"></i> ${baixo} com estoque baixo`:''}`;");
content = content.replace("document.getElementById('est-sub').textContent = `${ps.length} produtos${baixo?` · ⚠️ ${baixo} com estoque baixo`:''}`;", "document.getElementById('est-sub').innerHTML = `${ps.length} produtos${baixo?` · <i class=\"ph ph-warning-circle\"></i> ${baixo} com estoque baixo`:''}`;");

fs.writeFileSync(path, content, 'utf8');
console.log('done');
