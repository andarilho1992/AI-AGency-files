"""
Andarilho Digital — 3-Agent Pipeline Template (Agent SDK)
Based on: Claude Code Advanced Guide Module 10

Pattern: Scraper Agent → Analysis Agent → Pitch Builder Agent

Usage:
  pip install anthropic
  python agents/pipeline-template.py --target "business-name.com.br"

Requires: ANTHROPIC_API_KEY in .env
"""

import os
import json
import argparse
from anthropic import Anthropic

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


# ── AGENT 1: SCRAPER ────────────────────────────────────────────────────────

def scraper_agent(target: str) -> dict:
    """Gathers public info about a business target."""
    print(f"\n[Agent 1 — Scraper] Researching: {target}")

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",  # Haiku — bulk extraction, low cost
        max_tokens=2000,
        system="""You are a business research specialist.
        Extract structured information about a business from its name/URL.
        Be factual. Flag confidence levels. Don't invent data.""",
        messages=[{
            "role": "user",
            "content": f"""Research this business and return JSON:
            Target: {target}

            Return exactly this structure:
            {{
                "name": "business name",
                "type": "business type (pet shop, clinic, restaurant, etc)",
                "location": "city, state if visible",
                "apparent_size": "solo / small (1-10) / medium (10-50)",
                "digital_presence": {{
                    "has_website": true/false,
                    "has_instagram": true/false,
                    "has_whatsapp_business": true/false,
                    "last_active": "estimate"
                }},
                "visible_pain_points": ["list of manual/analog problems visible"],
                "automation_score": 1-5,
                "confidence": "HIGH/MEDIUM/LOW"
            }}"""
        }]
    )

    try:
        text = response.content[0].text
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])
    except Exception as e:
        print(f"  [Error parsing scraper output] {e}")
        return {"name": target, "confidence": "LOW", "error": str(e)}


# ── AGENT 2: ANALYSIS ────────────────────────────────────────────────────────

def analysis_agent(research: dict) -> dict:
    """Identifies top automation opportunities and pitch angle."""
    print(f"\n[Agent 2 — Analysis] Finding opportunities for: {research.get('name')}")

    response = client.messages.create(
        model="claude-sonnet-4-6",  # Sonnet — judgment needed
        max_tokens=2000,
        system="""You are a B2B automation consultant for small Brazilian businesses.
        You identify the highest-ROI automation opportunities.
        Think in terms of: WhatsApp bots, CRM, scheduling, payment automation.
        Be specific and rank by implementation effort vs. client value.""",
        messages=[{
            "role": "user",
            "content": f"""Analyze this business research and identify opportunities:

            Research: {json.dumps(research, ensure_ascii=False, indent=2)}

            Return JSON:
            {{
                "top_opportunity": "single best automation for this business",
                "pain_in_their_words": "how the owner would describe the problem",
                "solution_frame": "what Andarilho Digital offers that solves it",
                "proof_point": "reference Pets Go CRM as proof (pet shop automation already built)",
                "price_anchor": "R$X/month — estimate based on value",
                "objections": ["likely objection 1", "likely objection 2"],
                "cta": "exact next step to propose"
            }}"""
        }]
    )

    try:
        text = response.content[0].text
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])
    except Exception as e:
        print(f"  [Error parsing analysis output] {e}")
        return {"error": str(e)}


# ── AGENT 3: PITCH BUILDER ────────────────────────────────────────────────────

def pitch_builder_agent(research: dict, analysis: dict) -> str:
    """Writes a ready-to-send WhatsApp first message."""
    print(f"\n[Agent 3 — Pitch Builder] Writing pitch for: {research.get('name')}")

    response = client.messages.create(
        model="claude-sonnet-4-6",  # Sonnet — client-facing, quality matters
        max_tokens=1000,
        system="""You are a direct, honest copywriter writing WhatsApp cold messages for
        a B2B AI automation agency in Brazil.
        Style: short, specific, no fluff, one clear ask.
        Never say 'innovative', 'passionate', 'synergy'.
        Max 3 lines for the message.""",
        messages=[{
            "role": "user",
            "content": f"""Write a WhatsApp cold message using this:

            Business: {research.get('name')} ({research.get('type')})
            Their pain: {analysis.get('pain_in_their_words')}
            Our offer: {analysis.get('solution_frame')}
            CTA: {analysis.get('cta')}

            Format:
            MESSAGE 1 (send now):
            [3 lines max — specific opening, pain, one ask]

            MESSAGE 2 (3 days if no reply):
            [2 lines — different angle, same CTA]

            OBJECTION PREP:
            {chr(10).join([f'- {obj}' for obj in analysis.get('objections', [])])}
            """
        }]
    )

    return response.content[0].text


# ── PIPELINE RUNNER ───────────────────────────────────────────────────────────

def run_pipeline(target: str, output_dir: str = "output/pipeline"):
    """Runs the full 3-agent pipeline and saves results."""
    os.makedirs(output_dir, exist_ok=True)

    print(f"\n{'='*50}")
    print(f"  PIPELINE START: {target}")
    print(f"{'='*50}")

    # Run agents sequentially (each feeds the next)
    research = scraper_agent(target)
    analysis = analysis_agent(research)
    pitch = pitch_builder_agent(research, analysis)

    # Save all outputs
    safe_name = target.replace(".", "-").replace("/", "-")
    output_path = f"{output_dir}/{safe_name}.md"

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(f"# Pipeline Output: {target}\n\n")
        f.write(f"## Research\n```json\n{json.dumps(research, ensure_ascii=False, indent=2)}\n```\n\n")
        f.write(f"## Analysis\n```json\n{json.dumps(analysis, ensure_ascii=False, indent=2)}\n```\n\n")
        f.write(f"## Pitch\n{pitch}\n")

    print(f"\n{'='*50}")
    print(f"  ✅ DONE — saved to {output_path}")
    print(f"{'='*50}\n")

    return output_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="3-Agent B2B Pitch Pipeline")
    parser.add_argument("--target", required=True, help="Business name or URL to research")
    parser.add_argument("--output", default="output/pipeline", help="Output directory")
    args = parser.parse_args()

    run_pipeline(args.target, args.output)
