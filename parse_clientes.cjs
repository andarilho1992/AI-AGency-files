const fs   = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function decodeText(r) {
  try { return decodeURIComponent(r.T); } catch { return r.T; }
}

function colOf(x) {
  if (x < 12)  return 'nome';
  if (x < 27)  return 'pets';
  if (x < 43)  return 'email';
  if (x < 48)  return 'phone';
  return 'date';
}

const HEADER_WORDS = new Set(['NOME','ANIMAL','E-MAIL','TELEFONE','CELULAR','DATA','COMPRA',
  'D','ATA','ÚLTIMA','Clientes','ativos','inativos','OBS:','De:','Até:','Total','PAGES:']);

function isHeaderText(s) {
  return HEADER_WORDS.has(s.trim()) ||
    /^(De:|Até:|OBS:|PAGES:|Total|Clientes|22\/04\/2026|20\/04\/2026|01\/01\/2026)/i.test(s.trim());
}

function cleanPhone(s) {
  const d = s.replace(/\D/g,'');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d[2]} ${d.slice(3,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  if (d.length < 6)   return '';
  return s.replace(/\s+/g,' ').trim();
}

function parsePDF(file, filial, status) {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();
    parser.on('pdfParser_dataReady', data => {
      const pages = data.Pages || [];
      const allItems = [];

      pages.forEach((page, pi) => {
        (page.Texts || []).forEach(t => {
          let text = (t.R || []).map(decodeText).join('').trim();
          if (!text || isHeaderText(text)) return;
          allItems.push({ x: t.x, y: t.y + pi * 200, col: colOf(t.x), text });
        });
      });

      // Sort by Y then X
      allItems.sort((a,b) => a.y - b.y || a.x - b.x);

      // Group by Y row (tolerance ±0.4)
      const rows = [];
      for (const item of allItems) {
        if (rows.length === 0 || Math.abs(item.y - rows[rows.length-1].y) > 0.4) {
          rows.push({ y: item.y, items: [] });
        }
        rows[rows.length-1].items.push(item);
      }

      const clients = [];
      for (const row of rows) {
        const byCol = { nome:'', pets:'', email:'', phone:'', date:'' };
        for (const item of row.items) {
          // If an item in the 'pets' col looks like an email, reclassify
          if (item.col === 'pets' && item.text.includes('@')) {
            byCol.email = (byCol.email + ' ' + item.text).trim();
          } else {
            byCol[item.col] = (byCol[item.col] + ' ' + item.text).trim();
          }
        }

        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(byCol.date.trim())) continue;
        const nome = byCol.nome.replace(/^:\s*/,'').replace(/\s+/g,' ').trim();
        if (!nome || nome.length < 2) continue;

        // Parse pets — filter out emails and short junk fragments
        const rawPets = byCol.pets.replace(/[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/gi, '');
        const petNames = rawPets
          .split(/[,;]/)
          .map(p => p.trim())
          .filter(p => p.length > 0 && p.length < 50 && !/^\d/.test(p) && !p.includes('@'))
          // Join split tokens like "R" + "AY" → handled by keeping them as combined text above
          .map(p => p.replace(/\s+/g, ' ').trim());

        // Parse email — take first valid-looking email token
        const emailMatch = byCol.email.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
        const email = emailMatch ? emailMatch[0] : '';

        const pets = petNames.map(pNome => ({
          id: uid(), nome: pNome, especie: 'Cachorro',
          raca:'', porte:'', obs:'', criadoEm: new Date().toISOString()
        }));

        clients.push({
          id: uid(),
          nome,
          email,
          telefone: cleanPhone(byCol.phone),
          endereco: '', obs: '', filial, statusCliente: status,
          ultimaCompra: byCol.date.trim(),
          pets,
          criadoEm: new Date().toISOString()
        });
      }
      resolve(clients);
    });
    parser.on('pdfParser_dataError', reject);
    parser.loadPDF(file);
  });
}

async function main() {
  const jobs = [
    { file: 'C:\\Users\\viaje\\OneDrive\\Desktop\\Pets go - ATIVOS\\clientes ativos cachorrodromo.pdf', filial: 'Cachorródromo', status: 'ativo' },
    { file: 'C:\\Users\\viaje\\OneDrive\\Desktop\\Pets go - ATIVOS\\clientes ativos petropolis.pdf',    filial: 'Petrópolis',    status: 'ativo' },
    { file: 'C:\\Users\\viaje\\OneDrive\\Desktop\\Pets go - ATIVOS\\clientes ativos rio branco.pdf',    filial: 'Rio Branco',    status: 'ativo' },
    { file: 'C:\\Users\\viaje\\OneDrive\\Desktop\\Pets go inativos\\Cachorrodromo.pdf',                  filial: 'Cachorródromo', status: 'inativo' },
    { file: 'C:\\Users\\viaje\\OneDrive\\Desktop\\Pets go inativos\\Petropolis.pdf',                    filial: 'Petrópolis',    status: 'inativo' },
    { file: 'C:\\Users\\viaje\\OneDrive\\Desktop\\Pets go inativos\\Rio branco.pdf',                    filial: 'Rio Branco',    status: 'inativo' },
  ];

  const all = [];
  for (const j of jobs) {
    const clients = await parsePDF(j.file, j.filial, j.status);
    console.log(`${j.filial} ${j.status}: ${clients.length}`);
    all.push(...clients);
  }
  console.log(`\nTOTAL: ${all.length}`);
  fs.writeFileSync(path.join(__dirname, 'clientes_parsed.json'), JSON.stringify(all, null, 2));
}

main().catch(console.error);
