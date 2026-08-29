import { env } from "cloudflare:workers";
import { customers, documents as demoDocuments, drivers, orders, vehicles } from "../lib/demo-data";

const ORGANIZATION_ID = "ORG-DEMO";

export function getDatabase(): D1Database {
  if (!env.DB) throw new Error("Brak połączenia z bazą danych.");
  return env.DB;
}

export async function ensureDatabase() {
  const db = getDatabase();
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS organizations (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS drivers (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, full_name TEXT NOT NULL, base TEXT NOT NULL, availability_status TEXT NOT NULL, account_status TEXT NOT NULL, compliance_status TEXT NOT NULL, driving_hours_week INTEGER NOT NULL DEFAULT 0, driving_hours_two_weeks INTEGER NOT NULL DEFAULT 0, document_completeness INTEGER NOT NULL DEFAULT 0, card_download_due TEXT, medical_due TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (organization_id) REFERENCES organizations(id))"),
    db.prepare("CREATE TABLE IF NOT EXISTS vehicles (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, registration TEXT NOT NULL, vehicle_type TEXT NOT NULL, make TEXT NOT NULL, production_year INTEGER NOT NULL, operational_status TEXT NOT NULL, assigned_driver_id TEXT, odometer INTEGER NOT NULL DEFAULT 0, fuel_average REAL NOT NULL DEFAULT 0, next_service_at TEXT, monthly_lease REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (organization_id) REFERENCES organizations(id), FOREIGN KEY (assigned_driver_id) REFERENCES drivers(id))"),
    db.prepare("CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, name TEXT NOT NULL, segment TEXT NOT NULL, sales_owner TEXT NOT NULL, lifecycle_stage TEXT NOT NULL, payment_days INTEGER NOT NULL DEFAULT 30, credit_limit REAL NOT NULL DEFAULT 0, open_balance REAL NOT NULL DEFAULT 0, last_contact_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (organization_id) REFERENCES organizations(id))"),
    db.prepare("CREATE TABLE IF NOT EXISTS transport_orders (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, customer_id TEXT NOT NULL, customer_name TEXT NOT NULL, vehicle_id TEXT, vehicle_registration TEXT NOT NULL, driver_id TEXT, driver_name TEXT NOT NULL, route TEXT NOT NULL, cargo TEXT NOT NULL, temperature TEXT, status TEXT NOT NULL, eta TEXT NOT NULL, loaded_km INTEGER NOT NULL DEFAULT 0, empty_km INTEGER NOT NULL DEFAULT 0, sale_price REAL NOT NULL DEFAULT 0, total_cost REAL NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'EUR', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (organization_id) REFERENCES organizations(id), FOREIGN KEY (customer_id) REFERENCES customers(id), FOREIGN KEY (vehicle_id) REFERENCES vehicles(id), FOREIGN KEY (driver_id) REFERENCES drivers(id))"),
    db.prepare("CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, scope TEXT NOT NULL, scope_code TEXT NOT NULL, document_type TEXT NOT NULL, workflow_stage TEXT NOT NULL, status TEXT NOT NULL, due_date TEXT, process_block TEXT, owner_user_id TEXT, version INTEGER NOT NULL DEFAULT 1, storage_key TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS workflow_events (id INTEGER PRIMARY KEY AUTOINCREMENT, organization_id TEXT NOT NULL, order_id TEXT, document_id TEXT, actor_user_id TEXT, event_type TEXT NOT NULL, previous_value TEXT, new_value TEXT, description TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, assignee_user_id TEXT, driver_id TEXT, customer_id TEXT, order_id TEXT, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Otwarte', due_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, organization_id TEXT NOT NULL, actor_user_id TEXT, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, payload TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
  ]);
  await db.batch([
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_org_registration ON vehicles (organization_id, registration)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_vehicles_org_status ON vehicles (organization_id, operational_status)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_drivers_org_status ON drivers (organization_id, availability_status)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_drivers_org_compliance ON drivers (organization_id, compliance_status)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_customers_org_stage ON customers (organization_id, lifecycle_stage)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_orders_org_status ON transport_orders (organization_id, status)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_orders_org_customer ON transport_orders (organization_id, customer_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_orders_org_driver ON transport_orders (organization_id, driver_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_documents_org_scope ON documents (organization_id, scope, scope_code)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_documents_org_status_due ON documents (organization_id, status, due_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_audit_org_entity_time ON audit_log (organization_id, entity_type, entity_id, created_at)"),
  ]);

  await db.prepare("INSERT OR IGNORE INTO organizations (id, name) VALUES (?, ?)").bind(ORGANIZATION_ID, "TransportFlow Demo").run();
  const count = await db.prepare("SELECT COUNT(*) AS total FROM transport_orders WHERE organization_id = ?").bind(ORGANIZATION_ID).first<{ total: number }>();
  if ((count?.total ?? 0) === 0) await seedDatabase(db);
  const documentCount = await db.prepare("SELECT COUNT(*) AS total FROM documents WHERE organization_id = ?").bind(ORGANIZATION_ID).first<{ total: number }>();
  if ((documentCount?.total ?? 0) === 0) await seedDocuments(db);
  await db.prepare("PRAGMA optimize").run();
  return db;
}

async function seedDatabase(db: D1Database) {
  await db.batch(drivers.map((driver) => db.prepare("INSERT OR IGNORE INTO drivers (id, organization_id, full_name, base, availability_status, account_status, compliance_status, driving_hours_week, driving_hours_two_weeks, document_completeness, card_download_due, medical_due) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(driver.id, ORGANIZATION_ID, driver.name, driver.base, driver.status, driver.accountStatus, driver.compliance, driver.hoursWeek, driver.hoursTwoWeeks, driver.documentCompleteness, driver.cardDue, driver.medicalDue)));
  await db.batch(vehicles.map((vehicle) => db.prepare("INSERT OR IGNORE INTO vehicles (id, organization_id, registration, vehicle_type, make, production_year, operational_status, assigned_driver_id, odometer, fuel_average, next_service_at, monthly_lease) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(vehicle.id, ORGANIZATION_ID, vehicle.registration, vehicle.type, vehicle.make, vehicle.year, vehicle.status, vehicle.driverId, vehicle.odometer, vehicle.fuelAverage, vehicle.nextService, vehicle.monthlyLease)));
  await db.batch(customers.map((customer) => db.prepare("INSERT OR IGNORE INTO customers (id, organization_id, name, segment, sales_owner, lifecycle_stage, payment_days, credit_limit, open_balance, last_contact_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(customer.id, ORGANIZATION_ID, customer.name, customer.segment, customer.owner, customer.stage, customer.paymentDays, customer.creditLimit, customer.openBalance, customer.lastContact)));
  await db.batch(orders.map((order, index) => db.prepare("INSERT OR IGNORE INTO transport_orders (id, organization_id, customer_id, customer_name, vehicle_id, vehicle_registration, driver_id, driver_name, route, cargo, temperature, status, eta, loaded_km, empty_km, sale_price, total_cost, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(order.id, ORGANIZATION_ID, order.customerId, order.customer, vehicles[index].id, order.vehicle, drivers[index].id, order.driver, order.route, order.cargo, order.temperature ?? null, order.status, order.eta, order.loadedKm, order.emptyKm, order.salePrice, order.totalCost, order.currency)));
  await seedDocuments(db);
}

async function seedDocuments(db: D1Database) {
  await db.batch(demoDocuments.map((document) => db.prepare("INSERT OR IGNORE INTO documents (id, organization_id, scope, scope_code, document_type, workflow_stage, status, due_date, process_block, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)").bind(document.id, ORGANIZATION_ID, document.scope, document.scopeCode, document.type, document.scope === "Zlecenie" ? "Planowanie" : "Zgodność", document.status, document.dueDate, document.blocks)));
}

export { ORGANIZATION_ID };
