# BRIEFING — REDESIGN guilherme-build.html
**Data:** 06/05/2026

## Problema atual
A página provavelmente não tem números reais, não conta a narrativa de nômade/builder, não tem case studies dos projetos e o CTA não é direto o suficiente para o mercado BR.

## O que precisa estar na página, nessa ordem

### HERO
- Headline que comunica o posicionamento real: designer industrial que constrói software para pequenos negócios brasileiros, operando da Ásia. Não "desenvolvedor web". Não "consultor de IA".
- Sub-headline com a proposta de valor em uma linha
- CTA direto: botão WhatsApp abrindo conversa (número: +55 51 99547-8349)

### PROVA SOCIAL / NÚMEROS
- 1.041 tutores migrados para o Pets Go Control
- 4 filiais operando em Porto Alegre
- Sistema em produção desde [data]
- Números reais, visíveis, sem esconder

### PROJETOS — case studies, não links
**Pets Go Control:**
- Problema: pet shops sem sistema de gestão integrado
- Solução: sistema completo offline-first, zero dependências
- Resultado: 1.041 clientes + 1.382 pets importados, 4 filiais
- Link para o deploy + screenshot ou demo gif se possível

**Nutri Control:**
- Problema: nutricionistas gerenciando pacientes em planilha
- Solução: sistema completo com evolução de IMC, exames, PDF
- Status: em busca do primeiro cliente pagante (honestidade aqui é diferencial)
- Link para o deploy

### SOBRE
- Narrativa real: Designer Industrial por 9 anos (Brasil + Suíça) → aprendeu a construir software usando IA → opera micro-agência de Chiang Mai, Tailândia
- Sem corpo de texto longo. 3-4 linhas no máximo.

### SERVIÇOS (opcional, só se couber sem poluir)
- Sistemas de gestão para pequenos negócios
- Automações WhatsApp + n8n
- Ticket: R$800–R$2.500/mês recorrente

### CONTATO
- WhatsApp direto: +55 51 99547-8349
- Nada mais. Sem formulário.

## DESIGN
- Manter: dark, Clash Display + Satoshi, terracota
- Melhorar: hierarquia visual, espaçamento, legibilidade mobile
- Referência estética: levels.io — minimalista, direto, sem firula
- O produto fala por si — não sobrecarregar com elementos decorativos
- Responsivo mobile-first (cliente BR acessa pelo celular)

## RESTRIÇÕES TÉCNICAS
- Vanilla JS puro, zero dependências externas
- Single file HTML
- Deploy: `npx wrangler pages deploy . --project-name=andarilho-digital --branch=main --commit-dirty=true`
- Verificar: https://andarilho-digital.pages.dev/guilherme-build.html
