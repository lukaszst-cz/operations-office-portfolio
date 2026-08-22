"""TransportFlow Control Center — lokalne demo Python + SQLite.

Wyłącznie dane syntetyczne. Aplikacja nie jest produkcyjnym TMS-em.
"""
from __future__ import annotations

import argparse
import json
import sqlite3
from datetime import date, timedelta
from html import escape
from pathlib import Path
from urllib.parse import parse_qs
from wsgiref.simple_server import make_server

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "transportflow_demo.sqlite3"


def connection() -> sqlite3.Connection:
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


def initialise_database() -> None:
    db = connection()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS vehicles (
          id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, vehicle_type TEXT NOT NULL,
          start_year INTEGER NOT NULL, status TEXT NOT NULL, monthly_lease REAL NOT NULL,
          tachograph_due TEXT NOT NULL, specialist_document_due TEXT
        );
        CREATE TABLE IF NOT EXISTS drivers (
          id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, employment_status TEXT NOT NULL,
          card_download_due TEXT NOT NULL, driving_hours_week REAL NOT NULL,
          driving_hours_two_weeks REAL NOT NULL, compliance_status TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, source_type TEXT NOT NULL,
          currency TEXT NOT NULL, payment_days INTEGER NOT NULL, credit_status TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY, order_code TEXT UNIQUE NOT NULL,
          customer_id INTEGER NOT NULL REFERENCES customers(id),
          vehicle_id INTEGER REFERENCES vehicles(id), driver_id INTEGER REFERENCES drivers(id),
          route TEXT NOT NULL, loaded_km REAL NOT NULL, empty_km REAL NOT NULL,
          total_cost REAL NOT NULL, sale_price REAL NOT NULL, status TEXT NOT NULL,
          pod_received INTEGER NOT NULL DEFAULT 0, invoice_status TEXT NOT NULL DEFAULT 'Nie wystawiona'
        );
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY, scope TEXT NOT NULL, scope_code TEXT NOT NULL,
          document_type TEXT NOT NULL, due_date TEXT, status TEXT NOT NULL,
          blocking_process TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id),
          event_time TEXT NOT NULL, event_type TEXT NOT NULL, description TEXT NOT NULL
        );
        """
    )
    if db.execute("SELECT COUNT(*) FROM vehicles").fetchone()[0]:
        db.close()
        return

    distribution = ["Chłodnia"] * 12 + ["Cysterna spożywcza"] * 2 + ["Cysterna ADR"] * 2 + ["Plandeka"] * 4
    years = [2018] * 4 + [2019] * 3 + [2020] * 2 + [2021] * 3 + [2022] * 3 + [2023] * 3 + [2024] * 2
    lease = {"Chłodnia": 15000, "Cysterna spożywcza": 17800, "Cysterna ADR": 17800, "Plandeka": 12400}
    today = date(2024, 7, 31)
    vehicles = []
    for index, (vehicle_type, year) in enumerate(zip(distribution, years), 1):
        vehicles.append((f"TF-{index:03d}", vehicle_type, year, "Aktywny" if index not in (7, 18) else "Serwis", lease[vehicle_type], str(today + timedelta(days=30 + index * 6)), str(today + timedelta(days=50 + index * 7))))
    db.executemany("INSERT INTO vehicles(code,vehicle_type,start_year,status,monthly_lease,tachograph_due,specialist_document_due) VALUES(?,?,?,?,?,?,?)", vehicles)

    drivers = []
    for index in range(1, 27):
        week = 24 + (index % 6) * 4.5
        two_weeks = week + 30 + (index % 4) * 3
        due = today + timedelta(days=(index % 8) * 4 + 1)
        status = "Uwaga" if two_weeks > 84 or (due - today).days <= 3 else "Zgodny"
        drivers.append((f"DR-{index:03d}", "Pracownik", str(due), week, two_weeks, status))
    db.executemany("INSERT INTO drivers(code,employment_status,card_download_due,driving_hours_week,driving_hours_two_weeks,compliance_status) VALUES(?,?,?,?,?,?)", drivers)

    customers = [("KON-001", "Kontrakt", "PLN", 30, "Aktywny"), ("KON-002", "Kontrakt", "EUR", 45, "Aktywny"), ("GIE-001", "Giełda", "EUR", 14, "Aktywny")]
    db.executemany("INSERT INTO customers(code,source_type,currency,payment_days,credit_status) VALUES(?,?,?,?,?)", customers)
    orders = [
        ("TF-240718", 1, 1, 1, "Warszawa → Berlin", 820, 140, 4890, 5753, "W trasie", 0, "Nie wystawiona"),
        ("TF-240719", 2, 19, 2, "Garwolin → Brno", 750, 100, 4004, 4711, "Załadunek", 0, "Nie wystawiona"),
        ("TF-240720", 3, 15, 14, "Płock → Rotterdam", 620, 80, 4560, 5365, "Blokada dokumentów", 0, "Wstrzymana"),
    ]
    db.executemany("INSERT INTO orders(order_code,customer_id,vehicle_id,driver_id,route,loaded_km,empty_km,total_cost,sale_price,status,pod_received,invoice_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", orders)
    docs = [
        ("Firma", "ORG-001", "CKZ zarządzającego transportem", None, "Ważny", "Dostęp do rynku"),
        ("Firma", "ORG-001", "Licencja wspólnotowa", "2028-12-31", "Ważny", "Transport międzynarodowy"),
        ("Pojazd", "TF-015", "Certyfikat mycia cysterny", "2024-07-30", "Brak", "Wyjazd"),
        ("Kierowca", "DR-014", "Odczyt karty kierowcy", "2024-08-03", "Do wykonania", "Zgodność czasu pracy"),
        ("Pojazd", "TF-001", "ATP", "2025-02-28", "Ważny", "Ładunek chłodniczy"),
    ]
    db.executemany("INSERT INTO documents(scope,scope_code,document_type,due_date,status,blocking_process) VALUES(?,?,?,?,?,?)", docs)
    events = [(1, "2024-07-31T08:30", "STATUS", "Wyjazd z załadunku"), (1, "2024-07-31T11:20", "TEMPERATURA", "+4°C — bez odchyleń"), (3, "2024-07-31T09:10", "BLOKADA", "Brak certyfikatu mycia")]
    db.executemany("INSERT INTO events(order_id,event_time,event_type,description) VALUES(?,?,?,?)", events)
    db.commit(); db.close()


def dashboard() -> dict:
    db = connection()
    fleet = dict(db.execute("SELECT COUNT(*) vehicles, SUM(status='Aktywny') active, ROUND(SUM(monthly_lease),2) monthly_lease FROM vehicles").fetchone())
    drivers = dict(db.execute("SELECT COUNT(*) drivers, SUM(compliance_status='Uwaga') alerts FROM drivers").fetchone())
    orders = [dict(row) for row in db.execute("""SELECT o.order_code,o.route,o.loaded_km,o.empty_km,o.total_cost,o.sale_price,o.status,c.source_type,c.currency,v.vehicle_type,d.code driver_code FROM orders o JOIN customers c ON c.id=o.customer_id JOIN vehicles v ON v.id=o.vehicle_id JOIN drivers d ON d.id=o.driver_id ORDER BY o.id""").fetchall()]
    documents = [dict(row) for row in db.execute("SELECT scope,scope_code,document_type,due_date,status,blocking_process FROM documents ORDER BY status DESC,due_date").fetchall()]
    db.close()
    return {"fleet": fleet, "drivers": drivers, "orders": orders, "documents": documents}


def order_margin(order: dict) -> float:
    return (order["sale_price"] - order["total_cost"]) / order["sale_price"] if order["sale_price"] else 0


def render() -> str:
    data = dashboard()
    rows = "".join(f"<tr><td><b>{escape(o['order_code'])}</b></td><td>{escape(o['vehicle_type'])}</td><td>{escape(o['route'])}</td><td>{escape(o['driver_code'])}</td><td>{escape(o['status'])}</td><td>{order_margin(o):.1%}</td></tr>" for o in data["orders"])
    doc_rows = "".join(f"<tr><td>{escape(d['scope_code'])}</td><td>{escape(d['document_type'])}</td><td>{escape(d['status'])}</td><td>{escape(d['blocking_process'])}</td></tr>" for d in data["documents"])
    return f"""<!doctype html><html lang='pl'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>TransportFlow Control Center</title><style>{STYLE}</style></head><body><header><p>PYTHON · SQLITE · API · QA</p><h1>TransportFlow Control Center</h1><span>DANE SYNTETYCZNE</span></header><main><section class='cards'><article><small>Zestawy</small><b>{data['fleet']['vehicles']}</b><p>{data['fleet']['active']} aktywnych</p></article><article><small>Leasing / mies.</small><b>{data['fleet']['monthly_lease']:,.0f} zł</b><p>model netto</p></article><article><small>Kierowcy</small><b>{data['drivers']['drivers']}</b><p>{data['drivers']['alerts']} alertów zgodności</p></article><article><small>Zlecenia demo</small><b>{len(data['orders'])}</b><p>3 scenariusze</p></article></section><section class='panel'><p class='label'>OPERACJE</p><h2>Zlecenia i marża</h2><div class='wrap'><table><thead><tr><th>ID</th><th>Typ</th><th>Trasa</th><th>Kierowca</th><th>Status</th><th>Marża</th></tr></thead><tbody>{rows}</tbody></table></div></section><section class='panel'><p class='label'>COMPLIANCE</p><h2>Dokumenty i blokady</h2><div class='wrap'><table><thead><tr><th>Zakres</th><th>Dokument</th><th>Status</th><th>Blokuje</th></tr></thead><tbody>{doc_rows}</tbody></table></div></section></main><footer>TransportFlow 360 · lokalna aplikacja portfolio · brak danych rzeczywistych</footer></body></html>"""


STYLE = """*{box-sizing:border-box}body{margin:0;background:#f3f1e8;color:#071c25;font-family:Arial,sans-serif}header{background:#071c25;color:white;padding:2rem max(1rem,calc((100vw - 1100px)/2));position:relative}header p,.label{color:#72ddd2;font:700 .7rem monospace;letter-spacing:.1em}header h1{margin:.4rem 0;font-size:clamp(2.2rem,5vw,4rem)}header span{position:absolute;right:max(1rem,calc((100vw - 1100px)/2));top:2rem;color:#f4b860;font:700 .7rem monospace}main{max-width:1100px;margin:auto;padding:2rem 1rem}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#c8cec8}.cards article{background:white;padding:1.2rem}.cards small,.cards p{color:#53636a}.cards b{display:block;font-size:2rem;color:#0d8178;margin:.5rem 0}.panel{background:white;margin-top:1rem;padding:1.4rem}.panel h2{font-size:1.8rem;margin:.3rem 0 1rem}.wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:.82rem}th,td{border:1px solid #c8cec8;padding:.7rem;text-align:left}th{background:#0a2631;color:white}footer{max-width:1100px;margin:auto;padding:2rem 1rem;color:#53636a;font-size:.75rem}@media(max-width:700px){.cards{grid-template-columns:repeat(2,1fr)}}"""


def response(start_response, status: str, body: bytes, content_type: str):
    start_response(status, [("Content-Type", content_type), ("Content-Length", str(len(body)))])
    return [body]


def application(environ, start_response):
    path = environ.get("PATH_INFO", "/")
    if path == "/":
        return response(start_response, "200 OK", render().encode(), "text/html; charset=utf-8")
    if path == "/api/dashboard":
        return response(start_response, "200 OK", json.dumps(dashboard(), ensure_ascii=False).encode(), "application/json; charset=utf-8")
    if path == "/api/orders":
        query = parse_qs(environ.get("QUERY_STRING", "")); status = query.get("status", [""])[0]
        orders = dashboard()["orders"]; result = [o for o in orders if not status or o["status"] == status]
        return response(start_response, "200 OK", json.dumps(result, ensure_ascii=False).encode(), "application/json; charset=utf-8")
    return response(start_response, "404 Not Found", b"Not found", "text/plain; charset=utf-8")


def check() -> None:
    data = dashboard()
    assert data["fleet"]["vehicles"] == 20
    assert data["drivers"]["drivers"] == 26
    assert sum(o["vehicle_type"] == "Chłodnia" for o in data["orders"]) == 1
    assert any(d["document_type"] == "Odczyt karty kierowcy" for d in data["documents"])
    assert all(0 <= order_margin(o) < 1 for o in data["orders"])
    print("OK: complete anonymous TransportFlow demo dataset.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(); parser.add_argument("--check", action="store_true"); args = parser.parse_args()
    initialise_database()
    if args.check: check()
    else:
        print("TransportFlow Control Center: http://127.0.0.1:8025")
        make_server("127.0.0.1", 8025, application).serve_forever()
