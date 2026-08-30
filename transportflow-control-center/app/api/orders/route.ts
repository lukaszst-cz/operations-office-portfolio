import { customers, orders, type TransportOrder } from "../../../lib/demo-data";

const headers = { "Cache-Control": "no-store" };

function demoOrder(payload: Partial<TransportOrder>) {
  const customer = customers.find((item) => item.id === payload.customerId) ?? customers[0];
  return {
    id: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    customerId: customer.id,
    customer: customer.name,
    route: String(payload.route ?? "Trasa testowa"),
    cargo: String(payload.cargo ?? "Ładunek testowy"),
    vehicle: "Do przypisania",
    driver: "Do przypisania",
    status: "Planowane" as const,
    eta: "Do ustalenia",
    loadedKm: Number(payload.loadedKm ?? 0),
    emptyKm: Number(payload.emptyKm ?? 0),
    salePrice: Number(payload.salePrice ?? 0),
    totalCost: Number(payload.totalCost ?? 0),
    currency: payload.currency === "PLN" ? "PLN" as const : "EUR" as const,
  };
}

export async function GET() {
  return Response.json({ orders, demo: true, reset: "odświeżenie strony" }, { headers });
}

export async function POST(request: Request) {
  const payload = await request.json() as Partial<TransportOrder>;
  if (!payload.route?.trim() || !payload.cargo?.trim()) {
    return Response.json({ error: "Uzupełnij trasę i ładunek." }, { status: 400, headers });
  }
  return Response.json({ order: demoOrder(payload), demo: true }, { status: 201, headers });
}

export async function PATCH(request: Request) {
  const payload = await request.json() as { id?: string; status?: TransportOrder["status"]; eta?: string };
  const source = orders.find((order) => order.id === payload.id);
  if (!source || !payload.status) return Response.json({ error: "Nie znaleziono zlecenia." }, { status: 404, headers });
  return Response.json({ order: { ...source, status: payload.status, eta: payload.eta?.trim() || source.eta }, demo: true }, { headers });
}
