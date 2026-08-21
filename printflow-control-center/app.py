"""ZIELONA MARKA PrintFlow Control Center — bezpieczna aplikacja portfolio.

Python standard library + SQLite + JSON. Wszystkie dane są syntetyczne.
"""

from __future__ import annotations

import argparse
import json
import random
import sqlite3
from datetime import date, timedelta
from html import escape
from pathlib import Path
from urllib.parse import parse_qs
from wsgiref.simple_server import make_server


BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "printflow_demo.sqlite3"
STATIC_DIR = BASE_DIR / "static"
CONFIG = json.loads((BASE_DIR / "data" / "workflow.json").read_text(encoding="utf-8"))
STAGES = CONFIG["stages"]


def connection() -> sqlite3.Connection:
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db


def initialise_database(reset: bool = False) -> None:
    if reset and DATABASE.exists():
        DATABASE.unlink()
    db = connection()
    db.executescript(
        """
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY,
            order_code TEXT NOT NULL UNIQUE,
            client_code TEXT NOT NULL,
            product_type TEXT NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            stage TEXT NOT NULL,
            deadline TEXT NOT NULL,
            net_value REAL NOT NULL CHECK(net_value >= 0),
            material_cost REAL NOT NULL CHECK(material_cost >= 0),
            labour_cost REAL NOT NULL CHECK(labour_cost >= 0),
            logistics_cost REAL NOT NULL CHECK(logistics_cost >= 0),
            deposit_required REAL NOT NULL CHECK(deposit_required >= 0),
            deposit_paid REAL NOT NULL CHECK(deposit_paid >= 0),
            artwork_approved INTEGER NOT NULL DEFAULT 0,
            transport_type TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS stage_history (
            id INTEGER PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id),
            stage TEXT NOT NULL,
            changed_at TEXT NOT NULL,
            actor_role TEXT NOT NULL
        );
        """
    )
    if db.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 0:
        seed_orders(db)
    db.commit()
    db.close()


def seed_orders(db: sqlite3.Connection) -> None:
    rng = random.Random(360)
    today = date.today()
    for index in range(1, 31):
        stage_index = (index * 5) % len(STAGES)
        stage = STAGES[stage_index]
        net = float(2500 + rng.randrange(0, 18000, 250))
        material = round(net * rng.uniform(0.22, 0.39), 2)
        labour = round(net * rng.uniform(0.12, 0.25), 2)
        logistics = float(rng.choice([0, 120, 240, 480, 750]))
        deposit_required = round(net * (0.3 if index % 4 else 0.5), 2)
        deposit_paid = deposit_required if stage_index >= 5 and index % 7 else 0.0
        artwork = 1 if stage_index >= 6 and index % 6 else 0
        deadline = today + timedelta(days=(index % 14) - 4)
        values = (
            f"PF-{today.year}-{index:03d}", f"KLIENT-{(index % 9) + 1:02d}",
            CONFIG["product_types"][index % len(CONFIG["product_types"])],
            rng.randrange(500, 25000, 500), stage, deadline.isoformat(), net,
            material, labour, logistics, deposit_required, deposit_paid, artwork,
            CONFIG["transport_types"][index % len(CONFIG["transport_types"])],
            (today - timedelta(days=index * 2)).isoformat(), today.isoformat(),
        )
        cursor = db.execute(
            """INSERT INTO orders (
                order_code, client_code, product_type, quantity, stage, deadline,
                net_value, material_cost, labour_cost, logistics_cost,
                deposit_required, deposit_paid, artwork_approved, transport_type,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            values,
        )
        db.execute(
            "INSERT INTO stage_history (order_id, stage, changed_at, actor_role) VALUES (?, ?, ?, ?)",
            (cursor.lastrowid, stage, today.isoformat(), "Generator demo"),
        )


def order_metrics(row: sqlite3.Row | dict) -> dict[str, object]:
    item = dict(row)
    total_cost = item["material_cost"] + item["labour_cost"] + item["logistics_cost"]
    margin = item["net_value"] - total_cost
    margin_pct = round(margin / item["net_value"] * 100, 1) if item["net_value"] else 0
    alerts: list[str] = []
    stage_index = STAGES.index(item["stage"])
    if stage_index >= STAGES.index("Prepress") and item["deposit_paid"] < item["deposit_required"]:
        alerts.append("Brak pełnej zaliczki")
    if stage_index >= STAGES.index("Produkcja") and not item["artwork_approved"]:
        alerts.append("Brak akceptacji projektu")
    days_left = (date.fromisoformat(item["deadline"]) - date.today()).days
    if item["stage"] != "Zamknięte" and days_left < 0:
        alerts.append(f"Termin przekroczony o {abs(days_left)} dni")
    elif item["stage"] != "Zamknięte" and days_left <= 2:
        alerts.append("Termin zagrożony")
    if margin_pct < 18:
        alerts.append("Marża poniżej 18%")
    item.update(total_cost=round(total_cost, 2), margin=round(margin, 2), margin_pct=margin_pct, alerts=alerts)
    return item


def visible_stages(role: str) -> list[str]:
    allowed = CONFIG["roles"].get(role, ["*"])
    return STAGES if "*" in allowed else allowed


def list_orders(role: str = "Właściciel", query: str = "", stage: str = "") -> list[dict[str, object]]:
    allowed = visible_stages(role)
    params: list[object] = [f"%{query}%", f"%{query}%", f"%{query}%"]
    where = "(order_code LIKE ? OR client_code LIKE ? OR product_type LIKE ?)"
    if stage:
        where += " AND stage = ?"
        params.append(stage)
    elif role != "Właściciel":
        where += f" AND stage IN ({','.join('?' for _ in allowed)})"
        params.extend(allowed)
    db = connection()
    rows = db.execute(f"SELECT * FROM orders WHERE {where} ORDER BY deadline, id", params).fetchall()
    db.close()
    return [order_metrics(row) for row in rows]


def dashboard(role: str = "Właściciel") -> dict[str, object]:
    orders = list_orders(role=role)
    total_value = sum(float(item["net_value"]) for item in orders)
    total_margin = sum(float(item["margin"]) for item in orders)
    alert_count = sum(len(item["alerts"]) for item in orders)
    stages = {stage: 0 for stage in STAGES}
    for item in orders:
        stages[str(item["stage"])] += 1
    return {
        "role": role,
        "orders": len(orders),
        "net_value": round(total_value, 2),
        "margin": round(total_margin, 2),
        "margin_pct": round(total_margin / total_value * 100, 1) if total_value else 0,
        "alerts": alert_count,
        "stages": stages,
    }


def validate_order(payload: dict) -> list[str]:
    required = ["client_code", "product_type", "quantity", "deadline", "net_value", "transport_type"]
    errors = [f"Brak pola: {field}" for field in required if payload.get(field) in (None, "")]
    try:
        if int(payload.get("quantity", 0)) <= 0:
            errors.append("Nakład musi być większy od zera")
        if float(payload.get("net_value", 0)) <= 0:
            errors.append("Wartość netto musi być większa od zera")
        date.fromisoformat(str(payload.get("deadline", "")))
    except (TypeError, ValueError):
        errors.append("Nieprawidłowa liczba lub data")
    if payload.get("product_type") not in CONFIG["product_types"]:
        errors.append("Nieobsługiwany rodzaj produktu")
    if payload.get("transport_type") not in CONFIG["transport_types"]:
        errors.append("Nieobsługiwany rodzaj transportu")
    return errors


def create_order(payload: dict) -> dict[str, object]:
    errors = validate_order(payload)
    if errors:
        return {"ok": False, "errors": errors}
    db = connection()
    today = date.today().isoformat()
    sequence = db.execute("SELECT COUNT(*) + 1 FROM orders").fetchone()[0]
    code = f"PF-{date.today().year}-{sequence:03d}"
    net = float(payload["net_value"])
    cursor = db.execute(
        """INSERT INTO orders (
            order_code, client_code, product_type, quantity, stage, deadline,
            net_value, material_cost, labour_cost, logistics_cost,
            deposit_required, deposit_paid, artwork_approved, transport_type,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'Zapytanie', ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)""",
        (code, str(payload["client_code"]).upper(), payload["product_type"], int(payload["quantity"]),
         payload["deadline"], net, round(net * 0.32, 2), round(net * 0.18, 2),
         float(payload.get("logistics_cost", 0)), round(net * 0.3, 2),
         payload["transport_type"], today, today),
    )
    db.execute("INSERT INTO stage_history (order_id, stage, changed_at, actor_role) VALUES (?, 'Zapytanie', ?, 'Handel')", (cursor.lastrowid, today))
    db.commit()
    row = db.execute("SELECT * FROM orders WHERE id = ?", (cursor.lastrowid,)).fetchone()
    db.close()
    return {"ok": True, "order": order_metrics(row)}


def advance_order(order_id: int, role: str) -> dict[str, object]:
    db = connection()
    row = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    if not row:
        db.close()
        return {"ok": False, "errors": ["Nie znaleziono zlecenia"]}
    index = STAGES.index(row["stage"])
    if index == len(STAGES) - 1:
        db.close()
        return {"ok": False, "errors": ["Zlecenie jest już zamknięte"]}
    next_stage = STAGES[index + 1]
    allowed = visible_stages(role)
    if role != "Właściciel" and row["stage"] not in allowed and next_stage not in allowed:
        db.close()
        return {"ok": False, "errors": ["Ta rola nie obsługuje bieżącego etapu"]}
    today = date.today().isoformat()
    db.execute("UPDATE orders SET stage = ?, updated_at = ? WHERE id = ?", (next_stage, today, order_id))
    db.execute("INSERT INTO stage_history (order_id, stage, changed_at, actor_role) VALUES (?, ?, ?, ?)", (order_id, next_stage, today, role))
    db.commit()
    updated = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    db.close()
    return {"ok": True, "order": order_metrics(updated)}


def export_data() -> dict[str, object]:
    return {"metadata": {"type": "synthetic-demo", "exported": date.today().isoformat()}, "workflow": CONFIG, "orders": list_orders()}


def render_app() -> str:
    options = "".join(f"<option>{escape(value)}</option>" for value in CONFIG["product_types"])
    transport = "".join(f"<option>{escape(value)}</option>" for value in CONFIG["transport_types"])
    roles = "".join(f"<option>{escape(value)}</option>" for value in CONFIG["roles"])
    stages = "".join(f"<option>{escape(value)}</option>" for value in STAGES)
    return f"""<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Demonstracyjna aplikacja do zarządzania procesem poligraficznym w Pythonie, SQLite i JSON.">
<title>PrintFlow Control Center</title><link rel="stylesheet" href="/static/styles.css"></head>
<body>
<header class="topbar"><div><p class="eyebrow">PYTHON · SQLITE · JSON · HTML/CSS</p><h1>PrintFlow <span>Control Center</span></h1></div><div class="head-actions"><label>Widok roli<select id="role">{roles}</select></label><span class="demo">DANE DEMONSTRACYJNE</span></div></header>
<main>
<section class="hero"><div><p class="eyebrow">ZIELONA MARKA · PORTFOLIO OPERACYJNE</p><h2>Zlecenie pod kontrolą — od zapytania do płatności.</h2><p>Mały system pokazujący przepływ pracy, odpowiedzialność ról, rentowność i alerty. Właściciel widzi całość, a pozostałe role tylko przypisane etapy.</p></div><button class="primary" id="new-order">+ Nowe zapytanie</button></section>
<section class="cards" id="cards" aria-label="Kluczowe wskaźniki"></section>
<section class="panel"><div class="panel-head"><div><p class="eyebrow">PRZEPŁYW PRACY</p><h2>Etapy zleceń</h2></div><a class="button" href="/api/export">Pobierz JSON</a></div><div id="pipeline" class="pipeline"></div></section>
<section class="panel"><div class="panel-head"><div><p class="eyebrow">REJESTR OPERACYJNY</p><h2>Zlecenia</h2></div><div class="filters"><input id="search" type="search" placeholder="Kod, klient lub produkt"><select id="stage"><option value="">Wszystkie etapy</option>{stages}</select></div></div><div class="table-wrap"><table><thead><tr><th>Zlecenie</th><th>Klient / produkt</th><th>Etap</th><th>Termin</th><th>Wartość</th><th>Marża</th><th>Alerty</th><th></th></tr></thead><tbody id="orders"></tbody></table></div></section>
<section class="about-grid"><article><h3>Co sprawdza system?</h3><ul><li>zaliczkę przed produkcją,</li><li>akceptację projektu,</li><li>ryzyko przekroczenia terminu,</li><li>marżę poniżej ustalonego progu.</li></ul></article><article><h3>Co pokazuje kod?</h3><ul><li>relacyjną bazę SQLite,</li><li>API i walidację w Pythonie,</li><li>konfigurację procesu w JSON,</li><li>responsywny interfejs HTML/CSS/JS.</li></ul></article></section>
</main>
<dialog id="order-dialog"><form id="order-form"><div class="dialog-head"><div><p class="eyebrow">NOWY REKORD DEMO</p><h2>Dodaj zapytanie</h2></div><button type="button" class="close" id="close-dialog">×</button></div><div class="form-grid"><label>Kod klienta<input name="client_code" required placeholder="KLIENT-10"></label><label>Produkt<select name="product_type">{options}</select></label><label>Nakład<input name="quantity" type="number" min="1" value="1000" required></label><label>Termin<input name="deadline" type="date" required></label><label>Wartość netto<input name="net_value" type="number" min="1" step="0.01" value="5000" required></label><label>Transport<select name="transport_type">{transport}</select></label></div><p id="form-error" class="form-error"></p><button class="primary" type="submit">Zapisz zapytanie</button></form></dialog>
<footer>PrintFlow Control Center · projekt demonstracyjny Łukasza S. · bez danych klientów i kontrahentów</footer>
<script src="/static/app.js"></script></body></html>"""


def send(start_response, status: str, body: bytes, content_type: str, headers=None):
    all_headers = [("Content-Type", content_type), ("Content-Length", str(len(body)))] + (headers or [])
    start_response(status, all_headers)
    return [body]


def json_response(start_response, data: object, status: str = "200 OK"):
    return send(start_response, status, json.dumps(data, ensure_ascii=False).encode(), "application/json; charset=utf-8")


def read_json(environ) -> dict:
    length = int(environ.get("CONTENT_LENGTH") or 0)
    return json.loads(environ["wsgi.input"].read(length).decode("utf-8") or "{}")


def application(environ, start_response):
    path, method = environ.get("PATH_INFO", "/"), environ.get("REQUEST_METHOD", "GET")
    params = parse_qs(environ.get("QUERY_STRING", ""))
    if path == "/":
        return send(start_response, "200 OK", render_app().encode(), "text/html; charset=utf-8")
    if path == "/api/config":
        return json_response(start_response, CONFIG)
    if path == "/api/dashboard":
        return json_response(start_response, dashboard(params.get("role", ["Właściciel"])[0]))
    if path == "/api/orders" and method == "GET":
        return json_response(start_response, list_orders(params.get("role", ["Właściciel"])[0], params.get("q", [""])[0], params.get("stage", [""])[0]))
    if path == "/api/orders" and method == "POST":
        result = create_order(read_json(environ))
        return json_response(start_response, result, "201 Created" if result["ok"] else "400 Bad Request")
    if path.startswith("/api/orders/") and path.endswith("/advance") and method == "POST":
        try:
            order_id = int(path.split("/")[3])
        except (ValueError, IndexError):
            return json_response(start_response, {"ok": False, "errors": ["Nieprawidłowy identyfikator"]}, "400 Bad Request")
        payload = read_json(environ)
        result = advance_order(order_id, payload.get("role", "Właściciel"))
        return json_response(start_response, result, "200 OK" if result["ok"] else "400 Bad Request")
    if path == "/api/export":
        body = json.dumps(export_data(), ensure_ascii=False, indent=2).encode()
        return send(start_response, "200 OK", body, "application/json; charset=utf-8", [("Content-Disposition", "attachment; filename=printflow-demo-export.json")])
    if path.startswith("/static/"):
        requested = (STATIC_DIR / path.removeprefix("/static/")).resolve()
        if STATIC_DIR not in requested.parents or not requested.is_file():
            return send(start_response, "404 Not Found", b"Not found", "text/plain")
        mime = "text/css; charset=utf-8" if requested.suffix == ".css" else "application/javascript; charset=utf-8"
        return send(start_response, "200 OK", requested.read_bytes(), mime)
    return send(start_response, "404 Not Found", b"Not found", "text/plain")


def check() -> None:
    data = dashboard()
    assert data["orders"] == 30
    assert len(data["stages"]) == 12
    assert sum(data["stages"].values()) == 30
    assert len(list_orders(role="Handel")) < 30
    assert export_data()["metadata"]["type"] == "synthetic-demo"
    sample = list_orders()[0]
    assert "margin_pct" in sample and "alerts" in sample
    print("OK: 30 synthetic orders, 12 stages, role views, alerts and JSON export verified.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--reset", action="store_true", help="Recreate the synthetic demo database")
    parser.add_argument("--port", type=int, default=8010)
    args = parser.parse_args()
    initialise_database(reset=args.reset)
    if args.check:
        check()
    else:
        print(f"PrintFlow Control Center: http://127.0.0.1:{args.port}")
        make_server("127.0.0.1", args.port, application).serve_forever()
