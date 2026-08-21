"""Automatyczne testy PrintFlow Control Center — wyłącznie dane syntetyczne."""

from __future__ import annotations

import io
import json
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path
from wsgiref.util import setup_testing_defaults

import sys

PROJECT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_DIR))

import app


class PrintFlowTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.original_database = app.DATABASE
        app.DATABASE = Path(self.temp_dir.name) / "test.sqlite3"
        app.initialise_database(reset=True)

    def tearDown(self) -> None:
        app.DATABASE = self.original_database
        self.temp_dir.cleanup()

    @staticmethod
    def valid_payload(**overrides):
        payload = {
            "client_code": "qa-client-01",
            "product_type": "Katalog",
            "quantity": 1000,
            "deadline": (date.today() + timedelta(days=10)).isoformat(),
            "net_value": 5000,
            "logistics_cost": 120,
            "transport_type": "Kurier",
        }
        payload.update(overrides)
        return payload

    def call_api(self, path: str, method: str = "GET", payload=None, query: str = ""):
        environ = {}
        setup_testing_defaults(environ)
        body = json.dumps(payload or {}).encode("utf-8") if payload is not None else b""
        environ.update(
            PATH_INFO=path,
            REQUEST_METHOD=method,
            QUERY_STRING=query,
            CONTENT_LENGTH=str(len(body)),
            wsgi_input=io.BytesIO(body),
        )
        environ["wsgi.input"] = environ.pop("wsgi_input")
        response = {}

        def start_response(status, headers):
            response["status"] = status
            response["headers"] = dict(headers)

        raw = b"".join(app.application(environ, start_response))
        response["body"] = raw
        if response["headers"].get("Content-Type", "").startswith("application/json"):
            response["json"] = json.loads(raw.decode("utf-8"))
        return response

    def test_seed_is_deterministic_and_complete(self):
        self.assertEqual(app.dashboard()["orders"], 30)
        self.assertEqual(len(app.STAGES), 12)
        self.assertEqual(sum(app.dashboard()["stages"].values()), 30)

    def test_owner_sees_all_orders_but_operational_role_is_limited(self):
        self.assertEqual(len(app.list_orders("Właściciel")), 30)
        handel = app.list_orders("Handel")
        self.assertLess(len(handel), 30)
        self.assertTrue(all(item["stage"] in app.visible_stages("Handel") for item in handel))

    def test_create_order_normalises_client_and_calculates_costs(self):
        result = app.create_order(self.valid_payload())
        self.assertTrue(result["ok"])
        order = result["order"]
        self.assertEqual(order["client_code"], "QA-CLIENT-01")
        self.assertEqual(order["stage"], "Zapytanie")
        self.assertEqual(order["material_cost"], 1600)
        self.assertEqual(order["labour_cost"], 900)
        self.assertEqual(order["deposit_required"], 1500)

    def test_rejects_zero_quantity_and_value(self):
        result = app.create_order(self.valid_payload(quantity=0, net_value=0))
        self.assertFalse(result["ok"])
        self.assertIn("Nakład musi być większy od zera", result["errors"])
        self.assertIn("Wartość netto musi być większa od zera", result["errors"])

    def test_rejects_invalid_product_transport_and_date(self):
        errors = app.validate_order(self.valid_payload(
            product_type="Nieznany", transport_type="Dron", deadline="31-02-2026"
        ))
        self.assertIn("Nieobsługiwany rodzaj produktu", errors)
        self.assertIn("Nieobsługiwany rodzaj transportu", errors)
        self.assertIn("Nieprawidłowa liczba lub data", errors)

    def test_advance_records_audit_history(self):
        created = app.create_order(self.valid_payload())["order"]
        advanced = app.advance_order(created["id"], "Handel")
        self.assertTrue(advanced["ok"])
        self.assertEqual(advanced["order"]["stage"], "Oferta")
        db = app.connection()
        try:
            history = db.execute(
                "SELECT stage, actor_role FROM stage_history WHERE order_id=? ORDER BY id", (created["id"],)
            ).fetchall()
        finally:
            db.close()
        self.assertEqual([(row["stage"], row["actor_role"]) for row in history],
                         [("Zapytanie", "Handel"), ("Oferta", "Handel")])

    def test_unknown_order_cannot_advance(self):
        result = app.advance_order(999999, "Właściciel")
        self.assertFalse(result["ok"])
        self.assertIn("Nie znaleziono zlecenia", result["errors"])

    def test_closed_order_cannot_advance(self):
        db = app.connection()
        try:
            order_id = db.execute("SELECT id FROM orders LIMIT 1").fetchone()[0]
            db.execute("UPDATE orders SET stage='Zamknięte' WHERE id=?", (order_id,))
            db.commit()
        finally:
            db.close()
        result = app.advance_order(order_id, "Właściciel")
        self.assertFalse(result["ok"])
        self.assertIn("Zlecenie jest już zamknięte", result["errors"])

    def test_metrics_raise_financial_and_process_alerts(self):
        row = {
            "stage": "Produkcja", "deadline": (date.today() - timedelta(days=2)).isoformat(),
            "net_value": 1000, "material_cost": 600, "labour_cost": 300,
            "logistics_cost": 50, "deposit_required": 300, "deposit_paid": 0,
            "artwork_approved": 0,
        }
        metrics = app.order_metrics(row)
        self.assertIn("Brak pełnej zaliczki", metrics["alerts"])
        self.assertIn("Brak akceptacji projektu", metrics["alerts"])
        self.assertTrue(any("Termin przekroczony" in alert for alert in metrics["alerts"]))
        self.assertIn("Marża poniżej 18%", metrics["alerts"])

    def test_search_and_stage_filters_can_be_combined(self):
        sample = app.list_orders()[0]
        result = app.list_orders(query=sample["client_code"], stage=sample["stage"])
        self.assertGreaterEqual(len(result), 1)
        self.assertTrue(all(item["client_code"] == sample["client_code"] for item in result))
        self.assertTrue(all(item["stage"] == sample["stage"] for item in result))

    def test_export_has_synthetic_metadata_and_no_private_identifiers(self):
        exported = app.export_data()
        self.assertEqual(exported["metadata"]["type"], "synthetic-demo")
        serialised = json.dumps(exported, ensure_ascii=False).lower()
        for forbidden in ("@gmail.com", "pesel", "regon", "numer vin"):
            self.assertNotIn(forbidden, serialised)

    def test_dashboard_endpoint_returns_json(self):
        response = self.call_api("/api/dashboard", query="role=Handel")
        self.assertEqual(response["status"], "200 OK")
        self.assertEqual(response["json"]["role"], "Handel")

    def test_post_endpoint_returns_201_for_valid_order(self):
        response = self.call_api("/api/orders", "POST", self.valid_payload())
        self.assertEqual(response["status"], "201 Created")
        self.assertTrue(response["json"]["ok"])

    def test_post_endpoint_returns_400_for_invalid_order(self):
        response = self.call_api("/api/orders", "POST", self.valid_payload(quantity=-5))
        self.assertEqual(response["status"], "400 Bad Request")
        self.assertFalse(response["json"]["ok"])

    def test_static_path_traversal_is_rejected(self):
        response = self.call_api("/static/../app.py")
        self.assertEqual(response["status"], "404 Not Found")

    def test_role_cannot_advance_unrelated_stage(self):
        db = app.connection()
        try:
            order_id = db.execute("SELECT id FROM orders LIMIT 1").fetchone()[0]
            db.execute("UPDATE orders SET stage='Produkcja' WHERE id=?", (order_id,))
            db.commit()
        finally:
            db.close()
        result = app.advance_order(order_id, "Finanse")
        self.assertFalse(result["ok"])
        self.assertIn("Ta rola nie obsługuje bieżącego etapu", result["errors"])

    def test_database_rejects_duplicate_order_code(self):
        db = app.connection()
        try:
            with self.assertRaises(Exception):
                db.execute(
                    "INSERT INTO orders SELECT id+1000, order_code, client_code, product_type, quantity, "
                    "stage, deadline, net_value, material_cost, labour_cost, logistics_cost, "
                    "deposit_required, deposit_paid, artwork_approved, transport_type, created_at, updated_at "
                    "FROM orders LIMIT 1"
                )
        finally:
            db.close()

    def test_dashboard_margin_reconciles_with_orders(self):
        orders = app.list_orders()
        expected_value = round(sum(float(item["net_value"]) for item in orders), 2)
        expected_margin = round(sum(float(item["margin"]) for item in orders), 2)
        data = app.dashboard()
        self.assertEqual(data["net_value"], expected_value)
        self.assertEqual(data["margin"], expected_margin)

    def test_export_endpoint_has_download_header(self):
        response = self.call_api("/api/export")
        self.assertEqual(response["status"], "200 OK")
        self.assertIn("attachment", response["headers"]["Content-Disposition"])
        self.assertIn("printflow-demo-export.json", response["headers"]["Content-Disposition"])

    def test_unknown_endpoint_returns_404(self):
        response = self.call_api("/api/not-existing")
        self.assertEqual(response["status"], "404 Not Found")


if __name__ == "__main__":
    unittest.main(verbosity=2)
