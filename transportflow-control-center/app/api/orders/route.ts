import { ensureDatabase, ORGANIZATION_ID } from "../../../db/runtime";

type OrderRow = {
  id: string;
  customer_id: string;
  customer_name: string;
  vehicle_registration: string;
  driver_name: string;
  route: string;
  cargo: string;
  temperature: string | null;
  status: "Planowane" | "Załadunek" | "W trasie" | "Dostawa" | "Blokada";
  eta: string;
  loaded_km: number;
  empty_km: number;
  sale_price: number;
  total_cost: number;
  currency: "PLN" | "EUR";
};

function serialize(row: OrderRow) {
  return {
    id: row.id,
    customerId: row.customer_id,
    customer: row.customer_name,
    vehicle: row.vehicle_registration,
    driver: row.driver_name,
    route: row.route,
    cargo: row.cargo,
    temperature: row.temperature ?? undefined,
    status: row.status,
    eta: row.eta,
    loadedKm: row.loaded_km,
    emptyKm: row.empty_km,
    salePrice: row.sale_price,
    totalCost: row.total_cost,
    currency: row.currency,
  };
}

export async function GET() {
  try {
    const db = await ensureDatabase();
    const result = await db.prepare("SELECT id, customer_id, customer_name, vehicle_registration, driver_name, route, cargo, temperature, status, eta, loaded_km, empty_km, sale_price, total_cost, currency FROM transport_orders WHERE organization_id = ? ORDER BY created_at DESC, id DESC").bind(ORGANIZATION_ID).all<OrderRow>();
    return Response.json({ orders: result.results.map(serialize) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Nie udało się odczytać zleceń." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Partial<OrderRow> & { customerId?: string; customer?: string; loadedKm?: number; emptyKm?: number; salePrice?: number; totalCost?: number };
    if (!payload.customerId || !payload.customer || !payload.route?.trim() || !payload.cargo?.trim()) return Response.json({ error: "Uzupełnij klienta, trasę i ładunek." }, { status: 400 });
    const db = await ensureDatabase();
    const count = await db.prepare("SELECT COUNT(*) AS total FROM transport_orders WHERE organization_id = ?").bind(ORGANIZATION_ID).first<{ total: number }>();
    const id = `TF-260829-${String((count?.total ?? 0) + 1).padStart(3, "0")}`;
    const currency = payload.currency === "PLN" ? "PLN" : "EUR";
    await db.batch([
      db.prepare("INSERT INTO transport_orders (id, organization_id, customer_id, customer_name, vehicle_registration, driver_name, route, cargo, status, eta, loaded_km, empty_km, sale_price, total_cost, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Planowane', 'Do ustalenia', ?, ?, ?, ?, ?)").bind(id, ORGANIZATION_ID, payload.customerId, payload.customer, "Do przypisania", "Do przypisania", payload.route.trim(), payload.cargo.trim(), payload.loadedKm ?? 0, payload.emptyKm ?? 0, payload.salePrice ?? 0, payload.totalCost ?? 0, currency),
      db.prepare("INSERT INTO audit_log (organization_id, action, entity_type, entity_id, payload) VALUES (?, 'CREATE', 'transport_order', ?, ?)").bind(ORGANIZATION_ID, id, JSON.stringify({ route: payload.route, customerId: payload.customerId })),
    ]);
    const row = await db.prepare("SELECT id, customer_id, customer_name, vehicle_registration, driver_name, route, cargo, temperature, status, eta, loaded_km, empty_km, sale_price, total_cost, currency FROM transport_orders WHERE id = ?").bind(id).first<OrderRow>();
    return Response.json({ order: row ? serialize(row) : null }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Nie udało się utworzyć zlecenia." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json() as { id?: string; status?: OrderRow["status"]; eta?: string };
    const allowedStatuses: OrderRow["status"][] = ["Planowane", "Załadunek", "W trasie", "Dostawa", "Blokada"];
    if (!payload.id || !payload.status || !allowedStatuses.includes(payload.status)) {
      return Response.json({ error: "Niepoprawna aktualizacja zlecenia." }, { status: 400 });
    }
    const db = await ensureDatabase();
    const current = await db.prepare("SELECT status FROM transport_orders WHERE organization_id = ? AND id = ?").bind(ORGANIZATION_ID, payload.id).first<{ status: string }>();
    if (!current) return Response.json({ error: "Nie znaleziono zlecenia." }, { status: 404 });
    await db.batch([
      db.prepare("UPDATE transport_orders SET status = ?, eta = COALESCE(?, eta), updated_at = CURRENT_TIMESTAMP WHERE organization_id = ? AND id = ?").bind(payload.status, payload.eta?.trim() || null, ORGANIZATION_ID, payload.id),
      db.prepare("INSERT INTO workflow_events (organization_id, order_id, event_type, previous_value, new_value, description) VALUES (?, ?, 'STATUS', ?, ?, ?)").bind(ORGANIZATION_ID, payload.id, current.status, payload.status, `Zmiana statusu z ${current.status} na ${payload.status}`),
      db.prepare("INSERT INTO audit_log (organization_id, action, entity_type, entity_id, payload) VALUES (?, 'UPDATE', 'transport_order', ?, ?)").bind(ORGANIZATION_ID, payload.id, JSON.stringify({ previousStatus: current.status, status: payload.status })),
    ]);
    const row = await db.prepare("SELECT id, customer_id, customer_name, vehicle_registration, driver_name, route, cargo, temperature, status, eta, loaded_km, empty_km, sale_price, total_cost, currency FROM transport_orders WHERE id = ?").bind(payload.id).first<OrderRow>();
    return Response.json({ order: row ? serialize(row) : null });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Nie udało się zaktualizować zlecenia." }, { status: 500 });
  }
}
