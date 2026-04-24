const PDFParser = require('pdf2json');
const file = process.argv[2];
const parser = new PDFParser();
parser.on('pdfParser_dataReady', data => {
  const pages = data.Pages || [];
  let text = '';
  pages.forEach(page => {
    (page.Texts || []).forEach(t => {
      (t.R || []).forEach(r => {
        try { text += decodeURIComponent(r.T) + ' '; }
        catch { text += r.T + ' '; }
      });
      text += '\n';
    });
  });
  console.log('PAGES:', pages.length);
  console.log(text.substring(0, 10000));
});
parser.on('pdfParser_dataError', e => { console.error(e); process.exit(1); });
parser.loadPDF(file);
