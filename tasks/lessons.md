# tasks/lessons.md
_Padrões aprendidos com correções reais. Atualizar após qualquer erro corrigido pelo usuário._

---

## Padrões de erro — prevenção

### L-001 · Scroll reveal: flash de conteúdo
**Erro:** IntersectionObserver adicionava classe `.anim` após render inicial, causando elementos visíveis → invisíveis → visíveis.
**Causa raiz:** elementos sem `opacity:0` no CSS antes do observer rodar.
**Regra:** scroll reveal sempre usa par `.reveal` (opacity:0 no CSS) + `.visible` (transition para opacity:1 via observer). Nunca adicionar a classe de animação via JS — só a classe final de chegada.

```css
/* CORRETO */
.reveal { opacity:0; transform:translateY(18px); transition:opacity .55s ease, transform .55s ease }
.reveal.visible { opacity:1; transform:translateY(0) }
```

---

### L-002 · `transition: gap` tem suporte ruim
**Erro:** usar `transition: gap` em flex/grid para animar espaçamento no hover.
**Causa raiz:** propriedade `gap` não é animável em todos os browsers.
**Regra:** para animar movimento de ícone em hover, usar `transform: translateX(Xpx)` no elemento filho, não `gap` no container.

---

### L-003 · `diasTotal` calculado implicitamente
**Erro:** `diasTotal = Math.floor(valor/diario)` — se usuário não informava a diária, resultado era 0 ou NaN sem feedback claro.
**Causa raiz:** campo obrigatório não explicitado no UX; validação genérica `!diario` mostrava mensagem confusa.
**Regra:** sempre ter campo explícito de `diasTotal` (Nº de diárias) no formulário. Auto-calc bidirecional: (valor + dias → diária) e (valor + diária → dias). Validar que pelo menos um dos dois pares está preenchido.

---

### L-004 · Reserva financeira — não suavizar
**Erro:** memória registrou reserva como "~R$5k" quando o real era ~R$1.000.
**Causa raiz:** dado não verificado com o usuário antes de salvar.
**Regra:** nunca inferir dados financeiros — perguntar ou usar o que o usuário explicitou. Ao salvar em memory, indicar a data da confirmação.

---

### L-005 · Número de nota fiscal — não começar do 1 se já emitiu
**Contexto:** NF-e via eNotas para Junior.
**Regra:** se empresa já emitiu notas por outro sistema, SEFAZ rejeita numeração duplicada. Sempre verificar o último número emitido antes de configurar o número inicial. Nunca assumir que pode começar do 1.

---

### L-006 · sub-gerente, não gerente
**Erro:** texto dizia "gerente de hostel na Suíça" — usuário corrigiu para "sub-gerente de hostel".
**Regra:** em copy e biografia do Guilherme, o cargo na Suíça é sempre **sub-gerente de hostel nos Alpes** (EN: hostel assistant manager in Switzerland). Não inflar o título.

---

### L-007 · Fechar cliente antes de codar módulos do Nutri Control
**Regra:** qualquer módulo do Nutri Control (Antropometria e todos os seguintes) só deve ser implementado após contrato assinado e primeira mensalidade recebida. Não codar como "demonstração" ou "para mostrar para a cliente" — isso desvaloriza o trabalho.

---

### L-008 · PII fora do servidor
**Regra:** dados de clientes reais (tutores, pets, CPF, endereço) nunca sobem para o servidor público. Seed dos 1.041 tutores é entregue via WhatsApp direto ao Junior. Arquivo `petsgo-seed-todas-filiais.html` não vai para o deploy.

---

## Template para nova lição

```markdown
### L-XXX · Título curto
**Erro:** o que aconteceu de errado
**Causa raiz:** por que aconteceu
**Regra:** como evitar no futuro
```
