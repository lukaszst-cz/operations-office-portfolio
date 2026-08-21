"""Fleet Ops Desk — demonstracyjna aplikacja Python + SQLite.

Bez danych firmowych, osobowych, rejestracyjnych ani finansowych z rzeczywistej działalności.
"""

from __future__ import annotations

import argparse
import json
import sqlite3
from datetime import date
from html import escape
from pathlib import Path
from urllib.parse import parse_qs
from wsgiref.simple_server import make_server


BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "fleet_demo.sqlite3"
STATIC_DIR = BASE_DIR / "static"


def connection() -> sqlite3.Connection:
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db


def initialise_database() -> None:
    """Create a repeatable, safe sample dataset if the database is empty."""
    db = connection()
    db.executescript(
        """
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            vehicle_type TEXT NOT NULL,
            status TEXT NOT NULL,
            fuel TEXT NOT NULL,
            cargo_lift INTEGER NOT NULL DEFAULT 0,
            annual_cost REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS costs (
            id INTEGER PRIMARY KEY,
            vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
            cost_date TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS rentals (
            id INTEGER PRIMARY KEY,
            vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
            client_group TEXT NOT NULL,
            deposit REAL NOT NULL,
            deduction REAL NOT NULL,
            rental_status TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS leases (
            id INTEGER PRIMARY KEY,
            vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
            start_year INTEGER NOT NULL,
            monthly_fee REAL NOT NULL,
            lease_status TEXT NOT NULL
        );
        """
    )
    exists = db.execute("SELECT COUNT(*) FROM vehicles").fetchone()[0]
    if exists:
        db.close()
        return

    vehicle_types = [
        ("FL-01", "Kontener", "Dostępny", "Diesel", 1, 24400),
        ("FL-02", "Kontener", "W najmie", "Diesel", 1, 26100),
        ("FL-03", "Kontener", "Serwis", "Diesel", 1, 23800),
        ("FL-04", "Kombi", "Dostępny", "Benzyna", 0, 17200),
        ("FL-05", "Kombi", "W najmie", "Hybryda", 0, 18500),
        ("FL-06", "Sedan", "Dostępny", "Benzyna", 0, 15900),
        ("FL-07", "Van", "Dostępny", "Diesel", 0, 20100),
        ("FL-08", "Van", "W najmie", "Diesel", 0, 21400),
        ("FL-09", "Kombi", "Dostępny", "Diesel", 0, 16800),
        ("FL-10", "Sedan", "W najmie", "Hybryda", 0, 17700),
        ("FL-11", "Van", "Dostępny", "Diesel", 0, 19700),
        ("FL-12", "Kombi", "Serwis", "Benzyna", 0, 16500),
        ("FL-13", "Sedan", "Dostępny", "Benzyna", 0, 15200),
        ("FL-14", "Van", "W najmie", "Diesel", 0, 21900),
        ("FL-15", "Kombi", "Dostępny", "Hybryda", 0, 18100),
        ("FL-16", "Sedan", "Dostępny", "Benzyna", 0, 15400),
        ("FL-17", "Van", "Dostępny", "Diesel", 0, 20500),
        ("FL-18", "Kombi", "W najmie", "Diesel", 0, 17600),
    ]
    db.executemany(
        "INSERT INTO vehicles (code, vehicle_type, status, fuel, cargo_lift, annual_cost) VALUES (?, ?, ?, ?, ?, ?)",
        vehicle_types,
    )

    vehicles = db.execute("SELECT id, annual_cost FROM vehicles ORDER BY id").fetchall()
    categories = ("Serwis", "Ubezpieczenie", "Paliwo", "Opony")
    costs: list[tuple[int, str, str, float]] = []
    for year in range(2018, 2025):
        for index, vehicle in enumerate(vehicles):
            # 7 × 18 × 4 = 504 transparent sample records for period analysis.
            for month, category in enumerate(categories, start=2):
                ratio = (0.18, 0.12, 0.48, 0.22)[month - 2]
                amount = round(vehicle["annual_cost"] * ratio * (0.76 + year % 3 * 0.04), 2)
                costs.append((vehicle["id"], f"{year}-{month:02d}-{(index % 20) + 1:02d}", category, amount))
    db.executemany("INSERT INTO costs (vehicle_id, cost_date, category, amount) VALUES (?, ?, ?, ?)", costs)

    rentals = []
    for index in range(21):
        vehicle_id = (index % 18) + 1
        deposit = 2000 + (index % 4) * 500
        deduction = 0 if index % 5 else 350 + (index % 3) * 120
        rentals.append((vehicle_id, "Klient krajowy" if index % 3 else "Klient zagraniczny", deposit, deduction, "Zamknięta" if index < 14 else "Aktywna"))
    db.executemany(
        "INSERT INTO rentals (vehicle_id, client_group, deposit, deduction, rental_status) VALUES (?, ?, ?, ?, ?)",
        rentals,
    )

    leases = []
    for index in range(11):
        leases.append(((index % 18) + 1, 2018 + index % 6, 1250 + index * 85, "Aktywny" if index >= 6 else "Zakończony"))
    db.executemany(
        "INSERT INTO leases (vehicle_id, start_year, monthly_fee, lease_status) VALUES (?, ?, ?, ?)",
        leases,
    )
    db.commit()
    db.close()


def dashboard_data() -> dict[str, object]:
    db = connection()
    totals = db.execute(
        """
        SELECT
          COUNT(*) AS vehicles,
          SUM(cargo_lift) AS cargo_lifts,
          ROUND(SUM(annual_cost), 2) AS annual_cost
        FROM vehicles
        """
    ).fetchone()
    rentals = db.execute(
        "SELECT COUNT(*) AS contracts, ROUND(SUM(deposit), 2) AS deposits, ROUND(SUM(deduction), 2) AS deductions FROM rentals"
    ).fetchone()
    leases = db.execute("SELECT COUNT(*) AS leases, ROUND(SUM(monthly_fee), 2) AS monthly_fees FROM leases").fetchone()
    trend = db.execute(
        """
        SELECT substr(cost_date, 1, 4) AS year, ROUND(SUM(amount), 2) AS amount
        FROM costs GROUP BY year ORDER BY year
        """
    ).fetchall()
    db.close()
    return {
        "vehicles": dict(totals),
        "rentals": dict(rentals),
        "leases": dict(leases),
        "trend": [dict(row) for row in trend],
    }


def vehicle_rows(query: str = "", status: str = "") -> list[sqlite3.Row]:
    db = connection()
    rows = db.execute(
        """
        SELECT code, vehicle_type, status, fuel, cargo_lift, annual_cost
        FROM vehicles
        WHERE (code LIKE :query OR vehicle_type LIKE :query OR fuel LIKE :query)
          AND (:status = '' OR status = :status)
        ORDER BY code
        """,
        {"query": f"%{query}%", "status": status},
    ).fetchall()
    db.close()
    return rows


def pln(value: float) -> str:
    return f"{value:,.0f}".replace(",", " ") + " zł"


def render_dashboard() -> str:
    data = dashboard_data()
    vehicles = data["vehicles"]
    rentals = data["rentals"]
    leases = data["leases"]
    rows = "".join(
        f"<tr data-status='{escape(row['status'])}'><td>{escape(row['code'])}</td><td>{escape(row['vehicle_type'])}</td>"
        f"<td><span class='tag {row['status'].lower().replace(' ', '-')}'>{escape(row['status'])}</span></td>"
        f"<td>{escape(row['fuel'])}</td><td>{'Tak' if row['cargo_lift'] else '—'}</td><td>{pln(row['annual_cost'])}</td></tr>"
        for row in vehicle_rows()
    )
    trend_json = json.dumps(data["trend"], ensure_ascii=False)
    return f"""<!doctype html>
<html lang='pl'>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>
  <meta name='description' content='Demonstracyjny panel operacyjny floty w Pythonie i SQLite.'>
  <title>Fleet Ops Desk — demo</title>
  <link rel='stylesheet' href='/static/styles.css'>
</head>
<body>
  <header class='topbar'><div><p class='eyebrow'>PYTHON · SQLITE · CSS</p><h1>Fleet Ops Desk</h1></div><span class='demo'>DANE DEMONSTRACYJNE</span></header>
  <main>
    <section class='intro'><p>Prosty panel do kontroli floty, kosztów, najmu i leasingu. Każda wartość została wygenerowana na potrzeby portfolio — bez danych firmowych, klientów i rejestracji.</p></section>
    <section class='cards' aria-label='Kluczowe wskaźniki'>
      <article><span>Pojazdy</span><strong>{vehicles['vehicles']}</strong><small>{vehicles['cargo_lifts']} kontenery z windą</small></article>
      <article><span>Koszt roczny</span><strong>{pln(vehicles['annual_cost'])}</strong><small>model demonstracyjny</small></article>
      <article><span>Najem</span><strong>{rentals['contracts']} umów</strong><small>kaucje: {pln(rentals['deposits'])}</small></article>
      <article><span>Leasing</span><strong>{leases['leases']} umów</strong><small>raty: {pln(leases['monthly_fees'])}/mies.</small></article>
    </section>
    <section class='panel split'>
      <div><p class='eyebrow'>KOSZTY 2018–2024</p><h2>Trend kosztów w SQL</h2><div id='chart' class='chart' aria-label='Wykres rocznych kosztów'></div></div>
      <aside><h2>Co pokazuje projekt</h2><ul><li>relacyjna baza SQLite</li><li>zapytania agregujące i raporty okresowe</li><li>parametryzowane filtry SQL</li><li>panel HTML/CSS bez frameworków</li></ul></aside>
    </section>
    <section class='panel'>
      <div class='table-head'><div><p class='eyebrow'>REJESTR</p><h2>Pojazdy demonstracyjne</h2></div><div class='filters'><input id='search' type='search' placeholder='Szukaj typu lub paliwa' aria-label='Szukaj pojazdu'><select id='status' aria-label='Filtr statusu'><option value=''>Wszystkie statusy</option><option>Dostępny</option><option>W najmie</option><option>Serwis</option></select></div></div>
      <div class='table-wrap'><table><thead><tr><th>Kod</th><th>Typ</th><th>Status</th><th>Paliwo</th><th>Winda</th><th>Koszt roczny</th></tr></thead><tbody id='vehicle-rows'>{rows}</tbody></table></div>
    </section>
  </main>
  <footer>Fleet Ops Desk · portfolio techniczne Łukasza S. · Python 3 standard library + SQLite</footer>
  <script>window.dashboardTrend = {trend_json};</script><script src='/static/app.js'></script>
</body></html>"""


def response(start_response, status: str, content: bytes, content_type: str) -> list[bytes]:
    start_response(status, [("Content-Type", content_type), ("Content-Length", str(len(content)))])
    return [content]


def application(environ, start_response):
    path = environ.get("PATH_INFO", "/")
    if path == "/":
        return response(start_response, "200 OK", render_dashboard().encode(), "text/html; charset=utf-8")
    if path == "/api/dashboard":
        content = json.dumps(dashboard_data(), ensure_ascii=False).encode()
        return response(start_response, "200 OK", content, "application/json; charset=utf-8")
    if path == "/api/vehicles":
        params = parse_qs(environ.get("QUERY_STRING", ""))
        query = params.get("q", [""])[0]
        status = params.get("status", [""])[0]
        content = json.dumps([dict(row) for row in vehicle_rows(query, status)], ensure_ascii=False).encode()
        return response(start_response, "200 OK", content, "application/json; charset=utf-8")
    if path.startswith("/static/"):
        requested = (STATIC_DIR / path.removeprefix("/static/")).resolve()
        if STATIC_DIR not in requested.parents or not requested.is_file():
            return response(start_response, "404 Not Found", b"Not found", "text/plain")
        mime = "text/css; charset=utf-8" if requested.suffix == ".css" else "application/javascript; charset=utf-8"
        return response(start_response, "200 OK", requested.read_bytes(), mime)
    return response(start_response, "404 Not Found", b"Not found", "text/plain")


def check() -> None:
    data = dashboard_data()
    assert data["vehicles"]["vehicles"] == 18
    assert data["vehicles"]["cargo_lifts"] == 3
    assert data["rentals"]["contracts"] == 21
    assert data["leases"]["leases"] == 11
    assert len(data["trend"]) == 7
    print("OK: SQLite contains a complete, anonymous demonstration dataset.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Validate generated demo data and exit")
    args = parser.parse_args()
    initialise_database()
    if args.check:
        check()
    else:
        print("Fleet Ops Desk: http://127.0.0.1:8000")
        make_server("127.0.0.1", 8000, application).serve_forever()
