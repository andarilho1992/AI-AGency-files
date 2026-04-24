const PDFParser = require('pdf2json');

const parser = new PDFParser();
parser.on('pdfParser_dataReady', data => {
  const pages = data.Pages || [];
  const page = pages[0];
  const items = [];
  (page.Texts || []).forEach(t => {
    let text = '';
    (t.R || []).forEach(r => {
      try { text += decodeURIComponent(r.T); } catch { text += r.T; }
    });
    if (text.trim()) items.push({ x: Math.round(t.x*10)/10, y: Math.round(t.y*10)/10, text: text.trim() });
  });
  items.sort((a,b) => a.y - b.y || a.x - b.x);
  items.slice(0, 60).forEach(i => console.log(`x=${i.x} y=${i.y} | ${i.text}`));
});
parser.on('pdfParser_dataError', e => console.error(e));
parser.loadPDF('C:\\Users\\viaje\\OneDrive\\Desktop\\Pets go - ATIVOS\\clientes ativos cachorrodromo.pdf');
