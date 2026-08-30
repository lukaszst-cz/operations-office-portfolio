import { documents, type DocumentRecord } from "../../../lib/demo-data";

const headers = { "Cache-Control": "no-store" };

export async function GET() {
  return Response.json({ documents, demo: true, reset: "odświeżenie strony" }, { headers });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const type = String(form.get("type") ?? "").trim();
  const scope = String(form.get("scope") ?? "").trim() as DocumentRecord["scope"];
  const scopeCode = String(form.get("scopeCode") ?? "").trim();
  const allowedScopes: DocumentRecord["scope"][] = ["Kierowca", "Pojazd", "Firma", "Zlecenie"];
  if (!type || !scopeCode || !allowedScopes.includes(scope)) {
    return Response.json({ error: "Uzupełnij rodzaj dokumentu i zakres." }, { status: 400, headers });
  }
  const file = form.get("file");
  if (file instanceof File && file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "Plik może mieć maksymalnie 10 MB." }, { status: 400, headers });
  }
  return Response.json({ document: {
    id: `DEMO-DOC-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    scope,
    scopeCode,
    type,
    dueDate: String(form.get("dueDate") ?? "") || " - ",
    status: "Oczekuje" as const,
    blocks: String(form.get("blocks") ?? "") || "Brak blokady",
    version: 1,
    uploaded: file instanceof File && file.size > 0,
  }, demo: true }, { status: 201, headers });
}

export async function PATCH(request: Request) {
  const payload = await request.json() as { id?: string; status?: DocumentRecord["status"] };
  const source = documents.find((document) => document.id === payload.id);
  if (!source || !payload.status) return Response.json({ error: "Nie znaleziono dokumentu." }, { status: 404, headers });
  return Response.json({ document: { ...source, status: payload.status, version: 1, uploaded: false }, demo: true }, { headers });
}
