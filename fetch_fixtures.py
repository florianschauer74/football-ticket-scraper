#!/usr/bin/env python3
import os
import time
import logging
import requests
import pygsheets

# --- Konfiguration ---
SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE", "service_account.json")
SHEET_ID = os.getenv("SHEET_ID")
OUTPUT_SHEET = os.getenv("OUTPUT_SHEET", "Games")
API_KEY = os.getenv("FOOTBALL_DATA_API_KEY")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

BASE_URL = "https://api.football-data.org/v4"

# --- Wettbewerbe ---
COMPETITIONS = {
    "PL": "Premier League",
    "CL": "Champions League",
    "BL1": "Bundesliga",
    "SA": "Serie A",
    "PD": "La Liga",
    "FL1": "Ligue 1"
}

# --- Teams (angepasst nach deinem Wunsch) ---
TEAMS = {
    # Premier League
    "Liverpool FC": 64,
    "Arsenal FC": 57,
    "Manchester City": 65,
    "Chelsea FC": 61,
    "Tottenham Hotspur": 73,
    "Manchester United": 66,
    "Newcastle United": 67,

    # Bundesliga
    "FC Bayern München": 5,
    "Borussia Dortmund": 4,
    "Eintracht Frankfurt": 19,
    "Hamburger SV": 7,
    "FC Schalke 04": 6,
    "SV Werder Bremen": 12,

    # La Liga
    "FC Barcelona": 81,
    "Real Madrid CF": 86,
    "Atlético de Madrid": 78,
    "Sevilla FC": 559,
    "Real Betis Balompié": 90,
    "Valencia CF": 95,

    # Serie A
    "AC Milan": 98,
    "FC Internazionale Milano": 108,
    "AS Roma": 100,
    "Juventus FC": 109,
    "SSC Napoli": 113,

    # Ligue 1
    "Paris Saint-Germain": 524,
    "Olympique de Marseille": 516,
    "Olympique Lyonnais": 523,
}

# --- Hilfsfunktionen ---
def init_sheets():
    gc = pygsheets.authorize(service_account_file=SERVICE_ACCOUNT_FILE)
    return gc.open_by_key(SHEET_ID)

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
        ws.update_row(1, headers)
        return ws

def fetch_fixtures(team_id):
    url = f"{BASE_URL}/teams/{team_id}/matches?status=SCHEDULED"
    headers = {"X-Auth-Token": API_KEY}
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        logging.error("API Fehler %s: %s", r.status_code, r.text)
        return []
    return r.json().get("matches", [])

def main():
    logging.info("Starte Fixture Import…")
    sh = init_sheets()
    ws_out = ensure_output_sheet(sh)

    # Existierende Spiele einlesen (Kombi Spiel+Datum)
    existing = set()
    rows = ws_out.get_all_values(include_tailing_empty=False)[1:]  # skip header
    for r in rows:
        if len(r) >= 2:
            key = f"{r[0]}_{r[1]}"
            existing.add(key)

    for team, team_id in TEAMS.items():
        logging.info("Hole Spiele für %s", team)
        matches = fetch_fixtures(team_id)

        for m in matches:
            home = m["homeTeam"]["name"]
            away = m["awayTeam"]["name"]
            match_date = m["utcDate"][:10]
            comp_code = m["competition"]["code"]
            comp_name = COMPETITIONS.get(comp_code, comp_code)
            venue = m.get("venue", "")

            spiel = f"{home} vs {away}"
            key = f"{spiel}_{match_date}"

            if key in existing:
                logging.info("Überspringe (bereits vorhanden): %s", key)
                continue

            row = [
                spiel,
                match_date,
                comp_name,
                venue,
                "",  # Ticket Release Datum kommt vom Scraper
                "Fixture API",
                "", "", "",
                "Fixture geladen",
                "",
                time.strftime("%Y-%m-%d %H:%M")
            ]

            ws_out.append_table([row], start="A2", dimension="ROWS", overwrite=False)
            existing.add(key)

    logging.info("Fertig ✅")

if __name__ == "__main__":
    main()
