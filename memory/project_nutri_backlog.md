---
name: Nutri Control — Backlog de features (cliente nutricionista)
description: Mudanças solicitadas por cliente real para o Nutri Control. Implementar quando Guilherme pedir.
type: project
originSessionId: a358548c-1c33-415d-a444-f1502b588eb6
---
## Contexto

Cliente nutricionista enviou lista detalhada de features via WhatsApp em 06/05/2026.
É a primeira prospect real do Nutri Control. **Fechar ela antes de codar.**
Sistema atual: https://andarilho-digital.pages.dev/nutri-control.html

---

## O que já existe (não recriar)

- Diário alimentar com foto ✅
- Avaliação da refeição (nível de fome + saciedade + nota em estrelas) ✅
- Botão comentar ✅
- Prontuário básico ✅
- IMC / TMB automático ✅
- Agenda ✅
- Pacientes ✅

---

## Módulo 1 — Diário Alimentar (expandir o que existe)

Estado atual: foto + fome + saciedade + nota + comentar.

**Adicionar:**
- Campo de emoção envolvida na refeição (select ou texto livre)
- Nutricionista pode dar nota à refeição (além do paciente)
- Nutricionista pode comentar e o paciente vê o feedback
- Histórico visual do diário por semana/mês

---

## Módulo 2 — Consultas dentro do paciente

- Lista de consultas realizadas (data, tipo, observações)
- Próximas consultas agendadas
- Link para o prontuário de cada consulta
- Integrado com o módulo de Agenda existente

---

## Módulo 3 — Faturamento por paciente

- Histórico de pagamentos: data, valor, forma de pagamento
- Baseado nos planos já cadastrados no sistema
- Alertas de quando precisa pagar novamente
- Status: pago / em aberto / atrasado

---

## Módulo 4 — Antropometria (PRIORITÁRIO para nutricionista)

### Fórmulas de % de gordura corporal (implementar todas com seletor):
- Pollock 3 dobras
- Pollock 7 dobras
- Petroski
- Guedes
- Durnin
- Faulkner
- Nenhuma (só medidas brutas)

### Circunferências corporais (cm):
- Cintura
- Quadril
- RCQ (Relação Cintura-Quadril — calcular automaticamente)
- Outros campos opcionais (braço, coxa, panturrilha)

### Dados já existentes para manter:
- Peso (kg)
- Altura (cm)
- IMC (automático)
- TMB (automático)

### Evolução:
- Gráfico de evolução de cada parâmetro ao longo do tempo
- Tabela comparativa entre avaliações

---

## Módulo 5 — Exames Laboratoriais (expandir o que existe)

**Adicionar ao módulo atual:**
- Upload de PDF dos exames ✅ (já existe)
- Comparação entre dois exames: mostrar % de mudança por parâmetro
- Ex: "Colesterol total: 210 → 185 (-11,9%)"
- Highlight automático: melhorou (verde) / piorou (vermelho) / estável (cinza)
- Campo para a nutricionista comentar cada resultado

---

## Módulo 6 — Anamnese estruturada

Dois formulários longos com campos específicos.

### Primeira Consulta:
- Objetivo e motivação
- Histórico de dietas anteriores (o que funcionou / não funcionou)
- Expectativas sobre o acompanhamento
- Histórico de peso (efeito sanfona, alterações ponderais)
- Padrão de peso dos pais e de quem mora junto
- Melhor corpo já teve
- Saúde na infância / tipo de parto
- Cirurgias e impacto atual
- Ansiedade 0–10
- Estresse 0–10
- Acompanhamento psiquiátrico/psicológico
- Memória e foco
- Dores de cabeça
- Atividade física: gosta? recuperação? intensidade?
- Escala de Bristol (hábito intestinal visual)
- Escala de hidratação
- Hábito urinário
- Hábito intestinal
- QPC: alergias, intolerâncias, medicamentos, suplementos (quem prescreveu), doenças atuais, exames

### Segunda Consulta:
**Trato gastrointestinal:**
- Estômago: queimação, azia, alimentos que fazem mal, toma medicação?
- Intestino: frequência, bristol, rotina, alimentos que prendem/soltam
- Gases e arrotos (cheiro, dor, volume)
- Fígado
- Imunidade: frequência de infecções, gripes, COVID
- Bronquite / asma / sinusite
- Osteoporose / osteopenia / bursite / tendinite
- Infarto / AVC / pressão alta
- Doenças autoimunes
- Câncer
- Diabetes
- Depressão
- Tireoide
- Infecção urinária
- Retenção de líquido
- Pele / unhas / cabelos
- Libido

**Saúde da mulher:**
- TPM
- Fluxo menstrual (regular/irregular, datas últimos 2 anos)
- Cólicas
- Anticoncepcional / Glifage / Prazol (impacto no metabolismo B12/folato)
- Endometriose / SOP

**Anamnese Nutricional:**
- Dificuldades para manter dieta
- Gosta de cozinhar? Faz compras?
- Motivação para mudar: 1–10
- Prefere comprar / preparar / pedir
- Peso do prato no restaurante
- Rotina: treino / trabalho / estudo
- Aversões alimentares
- Período de maior fome
- Hidratação
- Recordatório 24h (o que comeu ontem — base para o plano alimentar)

---

## Módulo 7 — Prontuário por consulta

- Cada consulta tem um prontuário próprio
- Pode ser escrito pela nutricionista (texto livre)
- Ou ditado por voz (já tem transcrição no sistema — integrar)
- Visualização histórica de todos os prontuários do paciente

---

## Módulo 8 — Plano Alimentar

- Montagem do plano alimentar baseado no recordatório 24h e preferências
- Lista de substituições por grupo alimentar
- Dietas base pré-configuradas:
  - Vegetariana
  - Foco em emagrecimento (pacientes com canetas/ozempic)
  - Foco em constipação
- Lista de compras automática gerada a partir do plano
- Suplementações necessárias (campo separado)
- Paciente acessa o plano no app

---

## Módulo 9 — Sintomas correlacionados (painel da nutricionista)

Durante o atendimento, sistema exibe correlações automáticas:
- Dor de cabeça → deficiência de magnésio / hidratação / jejum prolongado
- Unhas quebradiças → zinco, biotina, ferro
- Queda de cabelo → ferro, B12, proteína
- TPM intensa → magnésio, ômega-3, vitamina B6
- Baixa energia → ferro, B12, vitamina D, tireóide

---

## Módulo 10 — Transcrição via Google Meet (FASE FUTURA)

**Complexidade: muito alta. Não implementar agora.**

- Nutricionista faz a consulta via Google Meet
- Sistema transcreve em tempo real via API (Whisper / Google Speech)
- IA estrutura a transcrição nos campos da anamnese automaticamente
- Depende de: integração com API de áudio em tempo real

**Pré-requisito:** todos os outros módulos prontos e funcionando primeiro.

---

## Ordem de implementação sugerida

1. **Antropometria** — mais crítico para o trabalho diário dela
2. **Anamnese estruturada** — diferencial competitivo forte
3. **Prontuário por consulta** — base para tudo
4. **Diário alimentar (expandido)** — já existe, só melhorar
5. **Plano alimentar** — entregável final de cada consulta
6. **Exames com comparação %** — alto valor percebido
7. **Consultas + faturamento por paciente** — gestão do negócio
8. **Sintomas correlacionados** — nice-to-have
9. **Transcrição Google Meet** — fase futura

---

## Decisão pendente

Fechar contrato com a cliente antes de implementar qualquer módulo.
Ticket sugerido: R$800–R$1.500/mês recorrente ou projeto fechado por fase.

**Why:** é a primeira cliente real. Cada módulo entregue aumenta o lock-in e justifica mensalidade.
**How to apply:** quando Guilherme pedir para implementar, verificar primeiro se ela já é cliente pagante.
