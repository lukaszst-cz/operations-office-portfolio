import { env } from "cloudflare:workers";
import { ensureDatabase, ORGANIZATION_ID } from "../../../db/runtime";

type DocumentRow = {
  id: string;
  scope: "Kierowca" | "Pojazd" | "Firma" | "Zlecenie";
  scope_code: string;
  document_type: string;
  due_date: string | null;
  status: "Ważny" | "Do odnowienia" | "Brak" | "Oczekuje";
  process_block: string | null;
  version: number;
  storage_key: string | null;
};

function serialize(row: DocumentRow) {
  return {
    id: row.id,
    scope: row.scope,
    scopeCode: row.scope_code,
    type: row.document_type,
    dueDate: row.due_date ?? "—",
    status: row.status,
    blocks: row.process_block ?? "—",
    version: row.version,
    uploaded: Boolean(row.storage_key),
  };
}

export async function GET() {
  try {
    const db = await ensureDatabase();
    const result = await db.prepare("SELECT id, scope, scope_code, document_type, due_date, status, process_block, version, storage_key FROM documents WHERE organization_id = ? ORDER BY CASE status WHEN 'Brak' THEN 0 WHEN 'Do odnowienia' THEN 1 WHEN 'Oczekuje' THEN 2 ELSE 3 END, due_date").bind(ORGANIZATION_ID).all<DocumentRow>();
    return Response.json({ documents: result.results.map(serialize) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Nie udało się odczytać dokumentów." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const type = String(form.get("type") ?? "").trim();
    const scope = String(form.get("scope") ?? "").trim();
    const scopeCode = String(form.get("scopeCode") ?? "").trim();
    const dueDate = String(form.get("dueDate") ?? "").trim() || null;
    const blocks = String(form.get("blocks") ?? "").trim() || "Brak blokady";
    const file = form.get("file");
    const allowedScopes = ["Kierowca", "Pojazd", "Firma", "Zlecenie"];
    if (!type || !scopeCode || !allowedScopes.includes(scope)) return Response.json({ error: "Uzupełnij rodzaj dokumentu i zakres." }, { status: 400 });
    if (file instanceof File && file.size > 10 * 1024 * 1024) return Response.json({ error: "Plik może mieć maksymalnie 10 MB." }, { status: 400 });
    const db = await ensureDatabase();
    const count = await db.prepare("SELECT COUNT(*) AS total FROM documents WHERE organization_id = ?").bind(ORGANIZATION_ID).first<{ total: number }>();
    const id = `DOC-${String((count?.total ?? 0) + 1).padStart(3, "0")}`;
    const safeName = file instanceof File ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_") : "brak-pliku";
    const storageKey = file instanceof File && file.size > 0 ? `${ORGANIZATION_ID}/${id}/v1-${safeName}` : null;
    if (file instanceof File && file.size > 0) {
      await env.DOCUMENTS.put(storageKey!, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
    }
    const status = storageKey ? "Oczekuje" : "Brak";
    await db.batch([
      db.prepare("INSERT INTO documents (id, organization_id, scope, scope_code, document_type, workflow_stage, status, due_date, process_block, version, storage_key) VALUES (?, ?, ?, ?, ?, 'Planowanie', ?, ?, ?, 1, ?)").bind(id, ORGANIZATION_ID, scope, scopeCode, type, status, dueDate, blocks, storageKey),
      db.prepare("INSERT INTO workflow_events (organization_id, document_id, event_type, new_value, description) VALUES (?, ?, 'DOCUMENT_CREATED', ?, ?)").bind(ORGANIZATION_ID, id, status, `Dodano dokument: ${type}`),
      db.prepare("INSERT INTO audit_log (organization_id, action, entity_type, entity_id, payload) VALUES (?, 'CREATE', 'document', ?, ?)").bind(ORGANIZATION_ID, id, JSON.stringify({ scope, scopeCode, type, storageKey })),
    ]);
    const row = await db.prepare("SELECT id, scope, scope_code, document_type, due_date, status, process_block, version, storage_key FROM documents WHERE id = ?").bind(id).first<DocumentRow>();
    return Response.json({ document: row ? serialize(row) : null }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Nie udało się dodać dokumentu." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json() as { id?: string; status?: DocumentRow["status"] };
    const allowed = ["Ważny", "Do odnowienia", "Brak", "Oczekuje"];
    if (!payload.id || !payload.status || !allowed.includes(payload.status)) return Response.json({ error: "Niepoprawna zmiana statusu." }, { status: 400 });
    const db = await ensureDatabase();
    const current = await db.prepare("SELECT status FROM documents WHERE organization_id = ? AND id = ?").bind(ORGANIZATION_ID, payload.id).first<{ status: string }>();
    if (!current) return Response.json({ error: "Nie znaleziono dokumentu." }, { status: 404 });
    await db.batch([
      db.prepare("UPDATE documents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE organization_id = ? AND id = ?").bind(payload.status, ORGANIZATION_ID, payload.id),
      db.prepare("INSERT INTO workflow_events (organization_id, document_id, event_type, previous_value, new_value, description) VALUES (?, ?, 'DOCUMENT_STATUS', ?, ?, ?)").bind(ORGANIZATION_ID, payload.id, current.status, payload.status, `Zmiana statusu dokumentu na ${payload.status}`),
    ]);
    const row = await db.prepare("SELECT id, scope, scope_code, document_type, due_date, status, process_block, version, storage_key FROM documents WHERE id = ?").bind(payload.id).first<DocumentRow>();
    return Response.json({ document: row ? serialize(row) : null });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Nie udało się zmienić statusu dokumentu." }, { status: 500 });
  }
}
