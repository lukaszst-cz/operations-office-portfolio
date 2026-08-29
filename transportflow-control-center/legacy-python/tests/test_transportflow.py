import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import app


class TransportFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.initialise_database()

    def test_fleet_and_drivers(self):
        data = app.dashboard()
        self.assertEqual(data["fleet"]["vehicles"], 20)
        self.assertEqual(data["drivers"]["drivers"], 26)

    def test_margin(self):
        for order in app.dashboard()["orders"]:
            self.assertGreater(app.order_margin(order), 0)

    def test_required_documents(self):
        types = {item["document_type"] for item in app.dashboard()["documents"]}
        self.assertIn("CKZ zarządzającego transportem", types)
        self.assertIn("Odczyt karty kierowcy", types)

    def test_workflow_download_periods(self):
        workflow = json.loads((ROOT / "workflow.json").read_text(encoding="utf-8"))
        self.assertEqual(workflow["tachograph_download_days"], {"driver_card": 28, "vehicle_unit": 90})


if __name__ == "__main__":
    unittest.main()
