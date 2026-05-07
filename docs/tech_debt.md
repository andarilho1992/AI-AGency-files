# docs/tech_debt.md
_Atalhos técnicos conscientes. Registrar quando aceito, com justificativa e critério de quitação._

---

## Dívidas ativas

### TD-001 · Single-file HTML sem testes automatizados
**Arquivo:** `petsgo-crm-light.html`, `nutri-control.html`
**Atalho:** zero testes unitários ou de integração. Validação manual.
**Por quê foi aceito:** produto em fase de validação com cliente único. Overhead de setup de testes > velocidade de iteração necessária agora.
**Risco:** regressões não detectadas ao adicionar features. Já ocorreu: scroll reveal quebrou após refactor de classes.
**Critério de quitação:** quando o sistema tiver 3+ clientes pagantes ou quando a taxa de bugs reportados por sessão aumentar.
**Mitigação atual:** lessons.md documentando padrões de erro recorrentes.

---

### TD-002 · LocalStorage como único storage (sem sync)
**Arquivo:** `petsgo-crm-light.html`
**Atalho:** dados em localStorage — sem backup automático, sem sync entre dispositivos.
**Por quê foi aceito:** offline-first era prioridade 1 para Junior (internet instável no pet shop). Cloudflare D1 planejado mas não implementado.
**Risco:** perda de dados se localStorage for limpo pelo browser ou dispositivo trocado.
**Critério de quitação:** PWA + Cloudflare D1 (item #4 no backlog).
**Mitigação atual:** export manual de backup disponível no sistema.

---

### TD-003 · CSS inline e JS inline no mesmo arquivo HTML
**Arquivo:** todos os produtos (`petsgo-crm-light.html`, `nutri-control.html`, `guilherme-build.html`)
**Atalho:** arquitetura single-file — CSS e JS no mesmo HTML, sem bundler, sem módulos.
**Por quê foi aceito:** zero dependências externas é requisito de negócio (funciona offline, zero custo de servidor, deploy trivial). Não é acidente de arquitetura — é decisão deliberada.
**Risco:** arquivo `petsgo-crm-light.html` > 100KB. Difícil navegar sem ferramentas. Conflitos de edição em sessões longas.
**Critério de quitação:** nunca, enquanto o requisito de zero dependências externas se mantiver. Se mudar o requisito, avaliar.
**Mitigação atual:** funções nomeadas com prefixos por módulo. Grep por função antes de editar.

---

### TD-004 · Seed de dados hardcoded em arquivo separado
**Arquivo:** `petsgo-seed-todas-filiais.html`
**Atalho:** seed dos 1.041 tutores gerado uma vez, entregue manualmente. Sem pipeline de migração.
**Por quê foi aceito:** foi uma migração única de PDFs da operação. Não é dado que muda.
**Risco:** se Junior precisar de novo dispositivo ou reinstalar, precisa do arquivo de seed manualmente.
**Critério de quitação:** quando Cloudflare D1 estiver implementado — sync automático elimina necessidade de seed.

---

### TD-005 · NF-e sem ambiente de homologação testado
**Arquivo:** `petsgo-crm-light.html` + Cloudflare Worker (não implementado ainda)
**Atalho:** integração eNotas planejada mas sem ambiente de testes separado definido.
**Por quê foi aceito:** ainda não implementado — Junior não enviou o número inicial de nota.
**Risco:** testar direto em produção pode gerar notas inválidas registradas na SEFAZ.
**Critério de quitação:** quando a integração for implementada — obrigatório testar em ambiente homologação (`ambiente: "homologacao"` na API do eNotas) antes de ligar produção.

---

## Template para nova dívida

```markdown
### TD-XXX · Título
**Arquivo:** onde está
**Atalho:** o que foi feito de forma incompleta
**Por quê foi aceito:** justificativa real (prazo, prioridade, requisito)
**Risco:** o que pode quebrar
**Critério de quitação:** quando/como quitar
**Mitigação atual:** o que reduz o risco enquanto a dívida existe
```
