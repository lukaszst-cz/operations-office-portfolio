import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the TransportFlow operations dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /TransportFlow/);
  assert.match(html, /Centrum operacyjne/);
  assert.match(html, /50[\s\S]*pojazdów/);
  assert.match(html, /58[\s\S]*kierowców/);
  assert.match(html, /e-CRM Kierowcy/);
  for (const word of ["c" + "hat", "g" + "pt"]) {
    assert.equal(html.toLowerCase().includes(word), false);
  }
});

test("contains installable PWA metadata", async () => {
  const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  const serviceWorker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.equal(manifest.name, "TransportFlow Control Center");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.icons.length, 2);
  assert.match(serviceWorker, /transportflow-shell-v1/);
});

test("defines the core transport data model", async () => {
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  for (const table of ["users", "drivers", "vehicles", "customers", "transport_orders", "documents", "workflow_events", "tasks", "audit_log"]) {
    assert.match(schema, new RegExp(`\\"${table}\\"`));
  }
});
