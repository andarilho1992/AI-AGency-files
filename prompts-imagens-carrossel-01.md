# Prompts — Imagens de fundo Carrossel 01
Gerador: Ideogram v2 (ideogram.ai)
Estilo base: cinematic realism, movie still, dramatic lighting
Aspect ratio: 4:5 (portrait)
Color style: dark, moody, amber/warm tones
Negative prompt (usar em todos): text, watermark, logo, stock photo look, corporate, cheerful, bright colors, flat lighting, HDR, oversaturated

---

## SLIDE 1 — Hook
> "Sua empresa ainda depende de você pra funcionar?"

**Objetivo visual:** Parar o scroll. Tensão humana + ambiente escuro dramático.

```
A tired business owner sitting alone at a messy desk late at night, single warm amber lamp casting dramatic shadows, stacks of papers and a glowing phone screen with notifications, face partially lit in chiaroscuro style, cinematic still from an indie film, shallow depth of field, dark background fading to black, grain texture, 4:5 portrait
```

**Variação (mais abstrata):**
```
Dark empty office at night, a single desk lamp casting a warm cone of amber light on an open laptop, chair pushed back as if someone just left, papers scattered, a coffee cup, sense of isolation and exhaustion, cinematic photography, film noir mood, dark color palette with warm amber highlights, 4:5 portrait
```

---

## SLIDE 2 — Problema
> Stat: 4h de espera média

**Objetivo visual:** Tensão da espera. Frio, impessoal, ansioso.

```
Close up of a smartphone lying face-up on a dark wooden table, screen showing unread messages with a timestamp, dramatic side lighting casting long shadows, cold blue-grey ambient light, the feeling of time passing and waiting, cinematic macro photography, shallow depth of field, dark moody atmosphere, 4:5 portrait
```

**Variação (mais humana):**
```
Person in a small shop or store looking anxiously at their phone, dark interior with one warm light source, shelves and products blurred in background, candid documentary style photography, tense body language, cinematic realism, muted color palette with warm skin tones against dark background, 4:5 portrait
```

---

## SLIDE 5 — Técnico
> "Não é chatbot. É um agente."

**Objetivo visual:** Inteligência, profundidade, tecnologia que pensa. Abstrato mas humano.

```
Dimly lit server room or tech environment, dramatic blue and amber lighting from screens and indicator lights, sense of quiet intelligence and constant operation, long exposure light trails suggesting data flow, cinematic sci-fi atmosphere grounded in reality, dark background with selective sharp details, film grain, 4:5 portrait
```

**Variação (mais conceitual):**
```
A person's hands typing on a keyboard in a very dark room, multiple screens reflected in their glasses, face partially illuminated by screen glow, ambient blue light with warm amber accents, cinematic focus on hands and face, the feeling of deep concentration and technical mastery, shallow depth of field, 4:5 portrait
```

---

## SLIDE 3 — SOLUÇÃO
> "Um agente de IA que responde, qualifica e agenda em menos de 30s"

**Objetivo visual:** Virada — de tensão para alívio. Sensação de controle, velocidade, inteligência operando. O overlay vai receber um gradiente laranja/ferrugem por cima, então a imagem precisa ser escura e com pouco detalhe no centro.

```
Abstract visualization of instant communication, glowing message bubbles appearing in a dark void, soft blue and amber light trails suggesting speed and automation, cinematic macro photography, deep dark background with selective luminous elements, no people, no text, sense of quiet efficiency and intelligence, 4:5 portrait
```

**Variação (mais humana):**
```
A relaxed business owner smiling at their phone in a warm café or home setting, soft golden hour light through a window, blurred background, the feeling of relief and ease, notifications arriving without stress, cinematic portrait photography, warm amber and brown tones, shallow depth of field, 4:5 portrait
```

> **Nota:** O overlay desse slide é um gradiente laranja/ferrugem da marca (`linear-gradient` com `#ae330a`). A imagem vai aparecer como textura de fundo — prefira a variação mais escura/abstrata para não brigar com o gradiente.

---

## SLIDE 7 — CTA
> "Seu negócio funcionando enquanto você dorme"

**Objetivo visual:** Aspiracional. Liberdade + tecnologia. A vida que o sistema possibilita.

```
Person working on a laptop from a rooftop or open terrace at dusk, city lights beginning to glow in the background, warm golden hour light fading into deep blue sky, relaxed posture, sense of freedom and control, cinematic travel photography aesthetic, shallow depth of field, rich warm tones contrasting with cool shadows, 4:5 portrait
```

**Variação (nômade):**
```
Minimalist workspace: a single laptop on a wooden table near a large window overlooking a tropical city at night, dramatic contrast between warm interior light and cool dark exterior, steam rising from a cup of coffee, serene and focused atmosphere, cinematic still life with depth, dark ambient lighting, 4:5 portrait
```

---

## CONFIGURAÇÕES NO IDEOGRAM

| Campo | Valor |
|-------|-------|
| Model | Ideogram 2.0 |
| Style | Cinematic |
| Aspect ratio | 4:5 |
| Color palette | Dark, Warm |
| Magic prompt | On (ajuda o modelo a expandir o prompt) |

## COMO USAR NO CARROSSEL

Depois de gerar a imagem:
1. Baixa como PNG
2. Me manda o caminho do arquivo
3. Embuto como base64 no HTML de cada slide
4. O overlay escuro já está configurado no CSS — só ajustar a opacidade se precisar

## DICA DE PROMPT

Se uma geração ficou quase boa mas com um detalhe errado, adiciona no final:
- `--no text` — remove texto acidental na imagem
- `dramatic chiaroscuro lighting` — aumenta o contraste dramático
- `shot on 35mm film` — adiciona grain e realismo cinematográfico
- `no faces visible` — se quiser evitar rostos (útil pra slides mais abstratos)
