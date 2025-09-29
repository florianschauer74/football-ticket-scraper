#!/usr/bin/env python3
"""
scrape_ticket_releases.py
- Liest URLs aus Tab "Sources" in deinem Google Sheet.
- Ruft jede Seite per Playwright auf (Headless Browser).
- Sucht nach Ticket-Keywords & Datumsangaben.
- Schreibt oder aktualisiert die Ergebnisse im Tab "Games".
"""

import os
import re
import time
import logging

from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
from bs4 import BeautifulSoup
import dateparser
import pygsheets

# --- Konfiguration (kommt von GitHub Actions ENV) ---
SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE", "service_account.json")
SHEET_ID = os.getenv("SHEET_ID")  # <-- wir arbeiten mit der ID
SOURCES_SHEET_NAME = os.getenv("SOURCES_SHEET_NAME", "Sources")
OUTPUT_SHEET = os.getenv("OUTPUT_SHEET", "Games")
HEADLESS = os.getenv("HEADLESS", "true").lower() in ("1", "true", "yes")

# --- Logging ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# --- Keywords & Muster ---
TICKET_KEYWORDS = r'presale|pre[-\s]?sale|general sale|on sale|tickets on sale|ticket(s)? available|vorverkauf|tickets jetzt|ticketverkauf'
DATE_PATTERNS = [
    r'\b(\d{1,2}\.\s?\d{1,2}\.\s?\d{2,4})\b',
    r'\b(\d{1,2}\s(?:January|February|March|April|May|June|July|August|September|October|November|December)\s?\d{2,4})\b',
    r'\b([A-Za-z]{3,9}\s\d{1,2},\s?\d{4})\b'
]

# --- Hilfsfunktionen ---
def init_sheets():
    gc = pygsheets.authorize(service_account_file=SERVICE_ACCOUNT_FILE)
    return gc.open_by_key(SHEET_ID)  # <-- statt open(name)

def ensure_output_sheet(sh):
    try:
        return sh.worksheet_by_title(OUTPUT_SHEET)
    except:
        ws = sh.add_worksheet(OUTPUT_SHEET)
        headers = [
            "Spiel", "Datum", "Wettbewerb", "Stadion",
            "Ticket Release Datum", "Ticket Quelle", "Ticket Preis (ab)",
            "Flug Optionen (ab Wien)", "Hotel Optionen (pro Nacht)",
            "Notizen", "QuelleURL", "Letzte Prüfung"
        ]
        ws.update_row(1, headers)  # <-- Fix statt append_table()
        return ws

def get_source_urls(sh):
    try:
        ws = sh.worksheet_by_title(SOURCES_SHEET_NAME)
        vals = ws.get_col(1, include_tailing_empty=False)
        return vals[1:]  # Erste Zeile ist Header
    except Exception as e:
        logging.error("Keine Sources gefunden: %s", e)
        return []

def find_dates_in_text(text):
    results = []
    for pat in DATE_PATTERNS:
        for m in re.finditer(pat, text, flags=re.IGNORECASE):
            d = dateparser.parse(m.group(1), settings={"PREFER_DAY_OF_MONTH": "first"})
            if d:
                results.append(d.date().isoformat())
    return sorted(set(results))

def upsert_row(ws, url, data_row):
    all_vals = ws.get_col(11, include_tailing_empty=False)  # Spalte K = QuelleURL
    try:
        idx = all_vals.index(url) + 1
        ws.update_row(idx, data_row)
        logging.info("Update bestehend: %s", url)
    except ValueError:
        ws.append_table([data_row], start="A2", end=None, dimension="ROWS", overwrite=False)
        logging.info("Neu hinzugefügt: %s", url)

def parse_page_content(html, url):
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    found = re.search(TICKET_KEYWORDS, text, re.IGNORECASE)
    ticket_dates = find_dates_in_text(text)

    return {
        "ticket_date": ticket_dates[0] if ticket_dates else "",
        "notes": "Ticket-Info gefunden" if found else "Keine klaren Hinweise",
        "title": soup.title.text.strip() if soup.title else "",
        "h1": soup.find("h1").text.strip() if soup.find("h1") else ""
    }

def scrape_url_with_playwright(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=HEADLESS)
        page = browser.new_page()
        try:
            page.goto(url, timeout=60000)
            time.sleep(2)
            return page.content()
        except PWTimeout:
            logging.error("Timeout bei %s", url)
            return ""
        finally:
            browser.close()

# --- Main ---
def main():
    logging.info("Starte Scraper…")
    sh = init_sheets()
    ws_out = ensure_output_sheet(sh)
    urls = get_source_urls(sh)

    logging.info("Gefundene Quellen: %d", len(urls))
    for url in urls:
        logging.info("Prüfe %s", url)
        html = scrape_url_with_playwright(url)
        if not html:
            continue
        parsed = parse_page_content(html, url)
        row = [
            parsed.get("title") or "",
            "", "", "",                 # Datum, Wettbewerb, Stadion
            parsed.get("ticket_date", ""),
            "Clubseite",
            "", "", "",                 # Ticket Preis, Flug, Hotel
            parsed.get("notes", ""),
            url,
            time.strftime("%Y-%m-%d %H:%M")
        ]
        upsert_row(ws_out, url, row)
        time.sleep(2)

    logging.info("Fertig ✅")

if __name__ == "__main__":
    main()
