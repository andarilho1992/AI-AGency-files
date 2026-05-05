#!/usr/bin/env python3
"""
Lead Scraper — Andarilho Digital
Raspa Google Maps por múltiplos nichos e cidade, exporta CSV único com deduplicação.
"""

import asyncio
import csv
import os
from datetime import datetime
from playwright.async_api import async_playwright

# ─── CONFIG ────────────────────────────────────────────────────────────────────
NICHOS = [
    "creche pet",
    "hotel para pets",
    "banho e tosa",
]
CIDADE      = "Porto Alegre"   # Altere a cidade aqui
MAX_POR_NICHO = 60             # Máximo de resultados por nicho
OUTPUT_DIR  = "leads"
# ───────────────────────────────────────────────────────────────────────────────


async def scroll_feed(page, target: int):
    feed = page.locator('div[role="feed"]')
    last_count = 0
    no_change = 0

    while True:
        count = await page.locator('div[role="feed"] > div').count()
        if count >= target or no_change >= 4:
            break
        if count == last_count:
            no_change += 1
        else:
            no_change = 0
        last_count = count
        await feed.evaluate("el => el.scrollBy(0, 900)")
        await page.wait_for_timeout(1800)


async def extract_place(page) -> dict:
    data = {"nome": "", "telefone": "", "endereco": "", "avaliacao": "", "website": "", "nicho": ""}

    try:
        data["nome"] = (await page.locator("h1").first.inner_text(timeout=4000)).strip()
    except Exception:
        pass

    try:
        rating = await page.locator("div.F7nice").first.inner_text(timeout=2000)
        data["avaliacao"] = rating.strip().replace("\n", " ")
    except Exception:
        pass

    try:
        tel = page.locator('a[href^="tel:"]').first
        if await tel.count() > 0:
            href = await tel.get_attribute("href")
            data["telefone"] = href.replace("tel:", "").strip()
    except Exception:
        pass

    try:
        addr = page.locator('button[data-item-id="address"]').first
        if await addr.count() > 0:
            data["endereco"] = (await addr.inner_text(timeout=2000)).strip()
    except Exception:
        pass

    try:
        site = page.locator('a[data-item-id*="authority"]').first
        if await site.count() > 0:
            data["website"] = (await site.get_attribute("href") or "").strip()
    except Exception:
        pass

    return data


async def scrape_nicho(page, nicho: str, max_results: int) -> list:
    query = f"{nicho} em {CIDADE}"
    url = f"https://www.google.com/maps/search/{'+'.join(query.split())}"

    print(f"\n  [{nicho.upper()}] Buscando: {query}")

    await page.goto(url, wait_until="networkidle", timeout=30000)
    await page.wait_for_timeout(3000)

    # Fecha popup de cookies se aparecer
    for label in ["Aceitar tudo", "Accept all", "Aceitar"]:
        try:
            btn = page.locator(f'button:has-text("{label}")')
            if await btn.count() > 0:
                await btn.first.click(timeout=2000)
                break
        except Exception:
            pass

    await scroll_feed(page, max_results)

    cards = await page.locator('div[role="feed"] a[href*="/maps/place/"]').all()
    total = min(len(cards), max_results)
    print(f"  Encontrados: {total} locais\n")

    results = []
    for i, card in enumerate(cards[:max_results]):
        try:
            await card.click()
            await page.wait_for_timeout(2200)

            data = await extract_place(page)
            data["nicho"] = nicho

            if data["nome"]:
                results.append(data)
                tel_icon = "TEL" if data["telefone"] else "   "
                name_col = data["nome"][:42].ljust(42)
                print(f"  [{i+1:02d}/{total}] [{tel_icon}]  {name_col}  {data['telefone']}")

        except Exception as e:
            print(f"  [{i+1:02d}/{total}] [ERR]  {e}")
            continue

        await page.wait_for_timeout(600)

    return results


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M")
    cidade_slug = CIDADE.replace(" ", "_")
    filename = f"{OUTPUT_DIR}/leads_{cidade_slug}_{ts}.csv"

    print(f"\n  Andarilho Digital — Lead Scraper")
    print(f"  Cidade: {CIDADE}")
    print(f"  Nichos: {', '.join(NICHOS)}")
    print(f"  Arquivo: {filename}")

    all_results = []
    seen_phones = set()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=80)
        context = await browser.new_context(
            locale="pt-BR",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
        )
        page = await context.new_page()

        for nicho in NICHOS:
            results = await scrape_nicho(page, nicho, MAX_POR_NICHO)

            for r in results:
                phone = r["telefone"]
                # Deduplica por telefone (quando tem); sem telefone sempre inclui
                if phone and phone in seen_phones:
                    continue
                if phone:
                    seen_phones.add(phone)
                all_results.append(r)

        await browser.close()

    # Salva CSV final
    fieldnames = ["nicho", "nome", "telefone", "endereco", "avaliacao", "website"]
    with open(filename, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_results)

    with_phone = sum(1 for r in all_results if r["telefone"])
    print(f"\n  === RESULTADO FINAL ===")
    print(f"  Total de leads: {len(all_results)}")
    print(f"  Com telefone:   {with_phone}")
    print(f"  Sem telefone:   {len(all_results) - with_phone}")
    print(f"  Duplicatas removidas por telefone")

    for nicho in NICHOS:
        n = sum(1 for r in all_results if r["nicho"] == nicho)
        print(f"  {nicho}: {n} leads")

    print(f"\n  Arquivo: {filename}\n")


if __name__ == "__main__":
    asyncio.run(main())
