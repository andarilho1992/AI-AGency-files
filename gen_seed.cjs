const fs = require('fs');
const path = require('path');

const clients = JSON.parse(fs.readFileSync(path.join(__dirname, 'clientes_parsed.json'), 'utf8'));
const totalPets = clients.reduce((s,c) => s + c.pets.length, 0);
const ativos = clients.filter(c => c.statusCliente === 'ativo').length;
const inativos = clients.filter(c => c.statusCliente === 'inativo').length;

const clientsJSON = JSON.stringify(clients);

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Pets Go Control — Importar Todas as Filiais</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:#F1F5F9;color:#0F172A;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:40px 20px}
.card{background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:32px;width:100%;max-width:600px;box-shadow:0 4px 24px rgba(0,0,0,.07);text-align:center;margin-bottom:16px}
.logo-wrap{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:16px}
.logo-img{width:40px;height:40px;border-radius:8px;object-fit:cover}
.brand{font-size:20px;font-weight:800;letter-spacing:-.02em}
h1{font-size:22px;font-weight:800;margin-bottom:8px}
.sub{font-size:14px;color:#64748B;margin-bottom:24px;line-height:1.6}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
.stat{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 8px;text-align:center}
.stat-val{font-size:24px;font-weight:800;color:#4047C8}
.stat-lbl{font-size:10px;color:#64748B;font-weight:600;margin-top:3px;text-transform:uppercase}
.filiais{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
.filial{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 10px}
.filial-nome{font-size:12px;font-weight:700;margin-bottom:8px;color:#1E293B}
.filial-row{display:flex;justify-content:space-between;font-size:11px;color:#64748B;margin-bottom:2px}
.filial-row span{font-weight:600;color:#1E293B}
.warning{background:#FFFDE6;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;font-size:13px;color:#854D0E;margin-bottom:16px;text-align:left;line-height:1.6}
.success{background:#E5FFF8;border:1px solid #6EE7C7;border-radius:8px;padding:12px 16px;font-size:13px;color:#065F46;margin-bottom:16px;display:none;text-align:left;line-height:1.6}
.btn{display:inline-flex;align-items:center;gap:8px;border:none;border-radius:10px;padding:14px 24px;font-family:'Inter',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;width:100%;justify-content:center;margin-bottom:10px}
.btn-primary{background:#4047C8;color:#fff}.btn-primary:hover{background:#2D33A8}
.btn-danger{background:#DC2626;color:#fff}.btn-danger:hover{background:#B91C1C}
.btn-ghost{background:#F8FAFC;color:#334155;border:1px solid #E2E8F0}.btn-ghost:hover{background:#F1F5F9}
.preview{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;max-height:240px;overflow-y:auto;text-align:left;margin-bottom:16px}
.preview-row{padding:8px 14px;border-bottom:1px solid #E2E8F0;display:flex;gap:8px;align-items:center;font-size:12px}
.preview-row:last-child{border-bottom:none}
.preview-num{width:28px;color:#94A3B8;font-weight:700;flex-shrink:0}
.preview-nome{flex:1;font-weight:600}
.preview-filial{font-size:10px;color:#4047C8;font-weight:700;background:#EEF2FF;border-radius:4px;padding:2px 6px;white-space:nowrap}
.preview-status{font-size:10px;font-weight:600;border-radius:4px;padding:2px 6px;white-space:nowrap}
.ativo{color:#065F46;background:#E5FFF8}
.inativo{color:#64748B;background:#F1F5F9}
.preview-pets{color:#64748B;font-size:11px;margin-top:1px}
progress{width:100%;height:8px;border-radius:4px;margin-bottom:8px;accent-color:#4047C8}
.link{display:inline-block;margin-top:8px;color:#4047C8;font-size:13px;font-weight:600;text-decoration:none}
</style>
</head>
<body>
<div class="card">
  <div class="logo-wrap">
    <img class="logo-img" src="logo-petsgo.png" alt="Pets Go"/>
    <div class="brand">Pets Go Control</div>
  </div>
  <h1>Importar Dados — Todas as Filiais</h1>
  <p class="sub">Clientes e pets exportados do Pet Shop Control<br>3 filiais · Ativos e inativos · Exportado em 22/04/2026</p>

  <div class="stats-grid">
    <div class="stat"><div class="stat-val">${clients.length}</div><div class="stat-lbl">Clientes</div></div>
    <div class="stat"><div class="stat-val">${totalPets}</div><div class="stat-lbl">Pets</div></div>
    <div class="stat"><div class="stat-val">${ativos}</div><div class="stat-lbl">Ativos</div></div>
    <div class="stat"><div class="stat-val">${inativos}</div><div class="stat-lbl">Inativos</div></div>
  </div>

  <div class="filiais">
    <div class="filial">
      <div class="filial-nome">Cachorródromo</div>
      <div class="filial-row">Ativos <span>217</span></div>
      <div class="filial-row">Inativos <span>196</span></div>
    </div>
    <div class="filial">
      <div class="filial-nome">Rio Branco</div>
      <div class="filial-row">Ativos <span>224</span></div>
      <div class="filial-row">Inativos <span>298</span></div>
    </div>
    <div class="filial">
      <div class="filial-nome">Petrópolis</div>
      <div class="filial-row">Ativos <span>81</span></div>
      <div class="filial-row">Inativos <span>25</span></div>
    </div>
  </div>

  <div class="warning">⚠️ <strong>Atenção:</strong> Use <strong>"Substituir tudo"</strong> para apagar dados existentes e importar tudo do zero. Use <strong>"Adicionar"</strong> para somar aos dados já no sistema sem apagar.</div>

  <div class="preview" id="preview"></div>
  <div id="progress-wrap" style="display:none">
    <progress id="prog" max="100" value="0"></progress>
    <div style="font-size:12px;color:#64748B;margin-bottom:12px" id="prog-label">Importando...</div>
  </div>
  <div class="success" id="msg-ok"></div>

  <button class="btn btn-primary" onclick="importar(false)">⬆️ Adicionar ao sistema</button>
  <button class="btn btn-danger" onclick="importar(true)">🔄 Substituir tudo e importar</button>
  <button class="btn btn-ghost" onclick="window.location.href='petsgo-crm-light.html'">← Voltar ao CRM</button>
</div>

<script>
const CLIENTES = ${clientsJSON};
const DB_KEY = 'petsgo_crm';

function loadDB() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || emptyDB(); } catch { return emptyDB(); }
}
function emptyDB() {
  return { clientes:[], agendamentos:[], financeiro:[], estoque:[], servicos:[] };
}
function saveDB(d) { localStorage.setItem(DB_KEY, JSON.stringify(d)); }

// Preview
const preview = document.getElementById('preview');
CLIENTES.slice(0, 30).forEach((c, i) => {
  const row = document.createElement('div');
  row.className = 'preview-row';
  row.innerHTML = \`<div class="preview-num">\${i+1}</div>
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:6px">
        <span class="preview-nome">\${c.nome}</span>
        <span class="preview-filial">\${c.filial}</span>
        <span class="preview-status \${c.statusCliente}">\${c.statusCliente}</span>
      </div>
      \${c.pets.length ? \`<div class="preview-pets">🐾 \${c.pets.map(p=>p.nome).join(', ')}</div>\` : ''}
    </div>\`;
  preview.appendChild(row);
});
if (CLIENTES.length > 30) {
  const more = document.createElement('div');
  more.className = 'preview-row';
  more.style.color = '#94A3B8';
  more.style.fontStyle = 'italic';
  more.style.justifyContent = 'center';
  more.textContent = \`+ \${CLIENTES.length - 30} clientes adicionais...\`;
  preview.appendChild(more);
}

async function importar(substituir) {
  const btn1 = document.querySelectorAll('.btn');
  btn1.forEach(b => b.disabled = true);

  const D = loadDB();
  if (substituir) {
    D.clientes = [];
  }

  const progWrap = document.getElementById('progress-wrap');
  const prog = document.getElementById('prog');
  const progLabel = document.getElementById('prog-label');
  progWrap.style.display = 'block';

  const BATCH = 50;
  for (let i = 0; i < CLIENTES.length; i += BATCH) {
    const batch = CLIENTES.slice(i, i + BATCH);
    batch.forEach(c => D.clientes.push(c));
    const pct = Math.round((i + batch.length) / CLIENTES.length * 100);
    prog.value = pct;
    progLabel.textContent = \`Importando \${Math.min(i + BATCH, CLIENTES.length)} de \${CLIENTES.length}...\`;
    await new Promise(r => setTimeout(r, 0));
  }

  saveDB(D);
  progWrap.style.display = 'none';

  const ok = document.getElementById('msg-ok');
  ok.style.display = 'block';
  ok.innerHTML = \`✅ <strong>\${CLIENTES.length} clientes importados com sucesso!</strong><br>
    Total no sistema: \${D.clientes.length} clientes · \${D.clientes.reduce((s,c)=>s+c.pets.length,0)} pets<br>
    <a class="link" href="petsgo-crm-light.html">→ Abrir o CRM</a>\`;
}
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'petsgo-seed-todas-filiais.html'), html);
console.log('Seed gerado: petsgo-seed-todas-filiais.html');
console.log('Clientes:', clients.length, '| Pets:', totalPets);
