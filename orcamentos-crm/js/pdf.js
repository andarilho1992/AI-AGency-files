/**
 * PDF.JS — Geração de PDF profissional do orçamento
 * =====================================================
 * Usa a biblioteca jsPDF (carregada via CDN no HTML).
 *
 * O QUE ESSE ARQUIVO FAZ:
 * Pega os dados do orçamento (variável global 'orcamento')
 * e as configurações da empresa (Storage.getConfig()),
 * e monta um documento PDF página A4 completo.
 *
 * ESTRUTURA DO PDF:
 * 1. Cabeçalho colorido (cor da empresa) com logo + número
 * 2. Dados do cliente (para quem é o orçamento)
 * 3. Título e descrição do projeto
 * 4. Tabela de itens com quantidade, valor unitário e subtotal
 * 5. Bloco de totais (subtotal, desconto, total final)
 * 6. Observações (se houver)
 * 7. Rodapé com nome da empresa
 *
 * POR QUE GERAR NO BROWSER E NÃO NO SERVIDOR?
 * Sem servidor = sem custo, sem complexidade, sem deploy.
 * Para MVP, é perfeito. O cliente baixa e envia como quiser.
 * Em produção futura: geramos no servidor para PDFs mais ricos
 * e com links rastreáveis (ex: "cliente aceitou o orçamento").
 * =====================================================
 */

function gerarPDF() {
  // Garante que temos um orçamento carregado
  if (!orcamento) {
    mostrarToast('Nenhum orçamento carregado.');
    return;
  }

  // Carrega as configurações da empresa salvas pelo usuário
  const config = Storage.getConfig();
  const empresa = config.empresa || 'Minha Empresa';

  /*
    jsPDF é disponibilizado via CDN como window.jspdf
    Desestruturamos para pegar só o construtor jsPDF.

    Parâmetros:
    - orientation: 'portrait' = vertical (padrão A4)
    - unit: 'mm' = milímetros (unidade padrão de documentos)
    - format: 'a4' = 210mm x 297mm
  */
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  /*
    Converte a cor hex da empresa para RGB.
    jsPDF usa arrays [R, G, B] com valores de 0 a 255.
    Ex: '#2563eb' → [37, 99, 235]

    Por que converter? CSS usa hex (#2563eb), mas
    a API do jsPDF usa RGB separado.
  */
  const corEmpresa = hexParaRgb(config.cor || '#2563eb');

  // Paleta de cores do documento
  const CINZA_ESCURO  = [31, 41, 55];    // títulos e texto principal
  const CINZA_MEDIO   = [107, 114, 128]; // textos secundários
  const CINZA_CLARO   = [243, 244, 246]; // fundo de células da tabela
  const BRANCO        = [255, 255, 255];

  // Dimensões e margens
  const pageW   = 210; // largura A4 em mm
  const pageH   = 297; // altura A4 em mm
  const marginL = 18;  // margem esquerda
  const marginR = 18;  // margem direita
  const contentW = pageW - marginL - marginR; // largura útil

  // Cursor Y — controla onde cada elemento é desenhado verticalmente
  // Avança conforme adicionamos conteúdo
  let y = 0;

  // =====================================================
  // 1. CABEÇALHO — fundo colorido com cor da empresa
  // =====================================================

  /*
    doc.setFillColor() define a cor de preenchimento.
    doc.rect(x, y, largura, altura, 'F') desenha um retângulo preenchido.
    'F' = Fill (preenchido). 'S' = Stroke (só borda). 'FD' = ambos.
  */
  const alturaHeader = config.logo ? 46 : 38;
  doc.setFillColor(...corEmpresa);
  doc.rect(0, 0, pageW, alturaHeader, 'F');

  let xLogo = marginL;

  /*
    LOGO DA EMPRESA
    Se o usuário configurou um logo, adicionamos ao PDF.
    O logo está em base64 (uma string longa que representa a imagem).
    doc.addImage(base64, formato, x, y, largura, altura)

    Calculamos a largura proporcional para manter a proporção
    original da imagem, limitando a altura máxima a 18mm.
  */
  if (config.logo) {
    try {
      const img = new Image();
      img.src = config.logo;

      // Calcula dimensões mantendo proporção
      const alturaMaxLogo = 18;
      const proporcao = img.naturalWidth / img.naturalHeight;
      const larguraLogo = alturaMaxLogo * proporcao;

      // Detecta o formato pelo início da string base64
      const formato = config.logo.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(config.logo, formato, marginL, 8, larguraLogo, alturaMaxLogo);
      xLogo = marginL + larguraLogo + 8;
    } catch (e) {
      // Se falhar ao carregar o logo, continua sem ele
      xLogo = marginL;
    }
  }

  // Nome da empresa (texto branco sobre o fundo colorido)
  doc.setTextColor(...BRANCO);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa, xLogo, config.logo ? 16 : 14);

  // Slogan (se tiver)
  if (config.slogan) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(config.slogan, xLogo, config.logo ? 22 : 20);
  }

  // Contato da empresa (email, telefone, site)
  const contato = [config.email, config.telefone, config.site].filter(Boolean).join(' · ');
  if (contato) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const yContato = config.logo ? (config.slogan ? 28 : 24) : (config.slogan ? 26 : 22);
    doc.text(contato, xLogo, yContato);
  }

  // Número do orçamento (lado direito do cabeçalho)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255, 0.8); // branco semi-transparente
  doc.text('ORÇAMENTO', pageW - marginR, 10, { align: 'right' });

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRANCO);
  doc.text(`#${orcamento.numero}`, pageW - marginR, 20, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${formatarData(orcamento.criadoEm)}`, pageW - marginR, 27, { align: 'right' });
  if (orcamento.validade) {
    doc.text(`Válido até: ${formatarData(orcamento.validade)}`, pageW - marginR, 32, { align: 'right' });
  }

  y = alturaHeader + 10;

  // =====================================================
  // 2. DADOS DO CLIENTE
  // =====================================================

  // Label "PARA" em cinza pequeno
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CINZA_MEDIO);
  doc.text('PARA', marginL, y);
  y += 5;

  // Nome do cliente em destaque
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CINZA_ESCURO);
  doc.text(orcamento.clienteNome, marginL, y);
  y += 5;

  // Dados complementares do cliente
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...CINZA_MEDIO);

  const dadosCliente = [
    orcamento.clienteEmpresa,
    orcamento.clienteEmail,
    orcamento.clienteTelefone,
  ].filter(Boolean);

  dadosCliente.forEach(dado => {
    doc.text(dado, marginL, y);
    y += 4.5;
  });

  y += 4;

  // =====================================================
  // 3. TÍTULO E DESCRIÇÃO DO ORÇAMENTO
  // =====================================================

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CINZA_ESCURO);
  doc.text(orcamento.titulo, marginL, y);
  y += 6;

  if (orcamento.descricao) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CINZA_MEDIO);
    /*
      splitTextToSize() quebra o texto em múltiplas linhas
      para não ultrapassar a largura disponível.
      Retorna um array de strings, uma por linha.
    */
    const linhasDesc = doc.splitTextToSize(orcamento.descricao, contentW);
    doc.text(linhasDesc, marginL, y);
    y += linhasDesc.length * 4.5 + 4;
  }

  y += 2;

  // =====================================================
  // 4. TABELA DE ITENS
  // =====================================================

  /*
    doc.autoTable() é fornecido pelo plugin jspdf-autotable.
    Cria tabelas formatadas automaticamente, com paginação se necessário.

    startY: onde começa verticalmente
    head: array com os cabeçalhos (array de arrays)
    body: array com as linhas (array de arrays)
    styles: estilo geral das células
    headStyles: estilo específico do cabeçalho
    columnStyles: estilo por coluna (índice 0, 1, 2...)
    alternateRowStyles: linhas alternadas com cor diferente
  */
  doc.autoTable({
    startY: y,
    head: [['Descrição', 'Qtd.', 'Valor Unit.', 'Subtotal']],
    body: (orcamento.itens || []).map(item => [
      item.descricao,
      String(item.qtd),
      formatarMoeda(item.preco),
      formatarMoeda(item.subtotal),
    ]),
    margin: { left: marginL, right: marginR },
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: CINZA_ESCURO,
    },
    headStyles: {
      fillColor: corEmpresa,  // usa a cor da empresa no cabeçalho da tabela
      textColor: BRANCO,
      fontStyle: 'bold',
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },               // descrição: ocupa o resto
      1: { cellWidth: 18, halign: 'center' }, // qtd: centralizado
      2: { cellWidth: 35, halign: 'right' },  // valor unit: direita
      3: { cellWidth: 38, halign: 'right' },  // subtotal: direita
    },
    alternateRowStyles: { fillColor: CINZA_CLARO },
  });

  // Após autoTable, pegamos onde terminou para continuar abaixo
  y = doc.lastAutoTable.finalY + 6;

  // =====================================================
  // 5. TOTAIS
  // =====================================================

  // Alinha os totais à direita da página
  const totaisX = pageW - marginR - 72;

  const linhaTotal = (label, valor, negrito = false, tamanho = 10) => {
    doc.setFontSize(tamanho);
    doc.setFont('helvetica', negrito ? 'bold' : 'normal');
    doc.setTextColor(...(negrito ? CINZA_ESCURO : CINZA_MEDIO));
    doc.text(label, totaisX, y);
    doc.text(valor, pageW - marginR, y, { align: 'right' });
    y += negrito ? 7 : 6;
  };

  linhaTotal('Subtotal', formatarMoeda(orcamento.subtotal));

  if (orcamento.desconto > 0) {
    const valorDesconto = orcamento.subtotal - orcamento.total;
    linhaTotal(`Desconto (${orcamento.desconto}%)`, `− ${formatarMoeda(valorDesconto)}`);
  }

  // Linha separadora antes do total final
  doc.setDrawColor(...CINZA_CLARO);
  doc.setLineWidth(0.5);
  doc.line(totaisX, y - 2, pageW - marginR, y - 2);
  y += 2;

  linhaTotal('TOTAL', formatarMoeda(orcamento.total), true, 13);

  // =====================================================
  // 6. OBSERVAÇÕES (se houver)
  // =====================================================

  if (orcamento.observacoes) {
    y += 6;
    const linhasObs = doc.splitTextToSize(orcamento.observacoes, contentW - 12);
    const alturaObs = linhasObs.length * 4.5 + 14;

    // Fundo cinza claro para a caixa de observações
    doc.setFillColor(...CINZA_CLARO);
    doc.roundedRect(marginL, y, contentW, alturaObs, 3, 3, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...CINZA_MEDIO);
    doc.text('OBSERVAÇÕES', marginL + 5, y + 7);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CINZA_ESCURO);
    doc.text(linhasObs, marginL + 5, y + 13);
    y += alturaObs + 6;
  }

  // =====================================================
  // 7. RODAPÉ
  // =====================================================

  // Endereço da empresa (se configurado)
  const endereco = [config.rua, config.bairro, config.cidade, config.estado]
    .filter(Boolean)
    .join(', ');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...CINZA_MEDIO);

  if (endereco) {
    doc.text(endereco, pageW / 2, pageH - 14, { align: 'center' });
  }

  if (config.cnpj) {
    doc.text(`CNPJ: ${config.cnpj}`, pageW / 2, pageH - 10, { align: 'center' });
  }

  doc.text(
    `Orçamento gerado por ${empresa}`,
    pageW / 2,
    pageH - 6,
    { align: 'center' }
  );

  // =====================================================
  // SALVA O ARQUIVO
  // =====================================================

  /*
    doc.save() dispara o download no browser.
    O nome do arquivo é gerado automaticamente com:
    - número do orçamento
    - nome do cliente (sem espaços)
    .replace(/\s+/g, '-') substitui espaços por hífens
    .toLowerCase() converte para minúsculas
  */
  const nomeArquivo = `orcamento-${orcamento.numero}-${
    orcamento.clienteNome.replace(/\s+/g, '-').toLowerCase()
  }.pdf`;

  doc.save(nomeArquivo);
  mostrarToast(`PDF "${nomeArquivo}" baixado!`);
}

/*
  HELPER: Converte cor hex (#2563eb) para array RGB ([37, 99, 235])
  =====================================================
  parseInt(hex, 16) converte uma string hexadecimal para número.
  Ex: 'eb' em base 16 = 235 em base 10.

  >> 16 = deslocamento de bits à direita (divide por 256)
  & 0xff = máscara que pega só os últimos 8 bits (0-255)

  Isso parece complexo, mas é a forma padrão de extrair
  os componentes RGB de um hex em JavaScript.
*/
function hexParaRgb(hex) {
  // Remove o # se existir
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  return [
    (num >> 16) & 0xff, // componente vermelho (R)
    (num >> 8)  & 0xff, // componente verde (G)
     num        & 0xff, // componente azul (B)
  ];
}
