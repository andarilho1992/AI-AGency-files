---
name: knowledge-ingestion
description: Showcase 6 — Bulk ingest books, courses, articles into searchable knowledge base. Extract → structure → index → sync.
model: claude-haiku-4-5-20251001
---

# Knowledge Ingestion System

## Trigger
`/knowledge-ingestion [source]` — when you have new material to absorb and make searchable.

## Pattern
Extract → transcribe → structure → index → sync to tracker.

---

## Source Types

**Book / PDF:**
- Paste key chapters or summary
- Agent extracts: core concepts, frameworks, actionable rules, quotes
- Save to `knowledge/books/[title].md`

**YouTube Video / Course:**
- Paste transcript or URL
- Agent extracts: key lessons, frameworks, before/after examples
- Save to `knowledge/courses/[title].md`

**Article / Thread:**
- Paste content
- Agent extracts: main argument, supporting data, tactical insights
- Save to `knowledge/articles/[topic].md`

**Podcast / Audio:**
- Paste transcript
- Agent extracts: guest insights, frameworks mentioned, resources cited
- Save to `knowledge/podcasts/[episode].md`

---

## Extraction Template
Each ingested item produces:

```
# [Title] — [Author/Source]
**Type:** Book / Course / Article / Podcast
**Date ingested:** [date]
**Relevance:** [Andarilho Digital / Um Forasteiro / Charles Fantasy / General]

## Core Concept (1 sentence)
[what this is about in plain language]

## Key Frameworks
- [Framework name]: [how it works + when to use]

## Actionable Rules
- [rule 1]
- [rule 2]

## Best Quotes
> "[quote]" — [speaker/author]

## Applied to My Business
[specific way this applies to Andarilho Digital, Pets Go, or Um Forasteiro]

## Tags
[topic1, topic2, topic3]
```

---

## Index File
Maintain `knowledge/INDEX.md`:
```
# Knowledge Base Index

## By Topic
- Sales: [link], [link]
- Automation: [link]
- Content: [link]

## Recently Added
- [date] [title] [type]
```

---

## Search Protocol
When looking for something in the knowledge base:
"Search knowledge/ directory for files tagged with [topic]"
Then read the 2-3 most relevant files before answering.

---

## Rules
- One file per source — don't merge multiple books into one file
- "Applied to My Business" section is mandatory — pure theory without application = waste
- Tag every file — makes search work
- Update INDEX.md every time a new file is added
- Use Haiku for extraction (bulk, cheap), Sonnet only if source is complex/strategic
