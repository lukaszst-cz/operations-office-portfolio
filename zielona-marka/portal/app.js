const STAGES = [
  ["Zapytanie", "Handel"], ["Oferta", "Handel"], ["Zaliczka", "Finanse"],
  ["Akceptacja plików", "Przygotowalnia / DTP"], ["Produkcja", "Produkcja"],
  ["Wykończenie", "Introligatornia"], ["Kontrola jakości", "Jakość"],
  ["Magazynowanie", "Magazyn"], ["Logistyka", "Logistyka"], ["Faktura", "Finanse"],
  ["Zamknięcie", "Finanse"]
];

const INTERNAL_ROLES = [
  "Właściciel / administrator", "Handel", "Finanse", "Przygotowalnia / DTP",
  "Produkcja", "Introligatornia", "Jakość", "Magazyn", "Logistyka", "Kadry", "Flota / transport"
];

const SUPPORT_ROLE_INFO = {
  "Kadry": "Widok wsparcia: obsada zmian, ewidencja czasu, pracownicy sezonowi i agencyjni oraz dane do rozliczenia.",
  "Flota / transport": "Widok wsparcia: dostępność pojazdów, plan dostaw, terminy serwisowe, dokumenty i koszty transportu."
};

const DEFAULT_ORDERS = [
  { code: "ZM-2024-018", client: "KLIENT DEMO 01", title: "Katalog produktowy", quantity: "2 500 egz.", step: 6, deadline: "18 lipca", delivery: "Kurier", deposit: "opłacona", priority: "standard" },
  { code: "ZM-2024-021", client: "KLIENT DEMO 02", title: "Materiały POS", quantity: "850 kompletów", step: 4, deadline: "16 lipca", delivery: "Transport firmowy", deposit: "opłacona", priority: "wysoki" },
  { code: "ZM-2024-024", client: "KLIENT DEMO 03", title: "Teczki ofertowe", quantity: "1 200 egz.", step: 3, deadline: "22 lipca", delivery: "Odbiór własny", deposit: "oczekuje", priority: "standard" },
  { code: "ZM-2024-027", client: "KLIENT DEMO 04", title: "Instrukcje składane", quantity: "4 000 egz.", step: 1, deadline: "25 lipca", delivery: "Kurier", deposit: "wymagana", priority: "standard" },
  { code: "ZM-2024-031", client: "KLIENT DEMO 05", title: "Opakowania jednostkowe", quantity: "1 500 szt.", step: 7, deadline: "14 lipca", delivery: "Transport dedykowany", deposit: "opłacona", priority: "wysoki" },
  { code: "ZM-2024-034", client: "KLIENT DEMO 06", title: "Wizytówki", quantity: "500 kompletów", step: 2, deadline: "29 lipca", delivery: "Kurier", deposit: "oczekuje", priority: "niski" }
];

const storageKey = "printflow-portal-demo-v2";
let orders = JSON.parse(localStorage.getItem(storageKey) || "null") || structuredClone(DEFAULT_ORDERS);
let activeRole = "Właściciel / administrator";
let deferredPrompt;

const clientResult = document.querySelector("#clientResult");
const searchMessage = document.querySelector("#searchMessage");
const roleTabs = document.querySelector("#roleTabs");
const taskList = document.querySelector("#taskList");
const departmentSummary = document.querySelector("#departmentSummary");

function save() { localStorage.setItem(storageKey, JSON.stringify(orders)); }
function stage(order) { return STAGES[order.step]; }
function displayStage(order) { return stage(order)[0]; }

function renderClient(code = document.querySelector("#orderCode").value.trim().toUpperCase()) {
  const order = orders.find((item) => item.code === code);
  searchMessage.textContent = order ? "" : "Nie znaleziono zlecenia demonstracyjnego. Spróbuj ZM-2024-018.";
  if (!order) { clientResult.innerHTML = ""; return; }
  const timeline = STAGES.map(([name], index) => `<div class="${index < order.step ? "done" : index === order.step ? "current" : ""}">${name}</div>`).join("");
  clientResult.innerHTML = `<article class="order-card"><div class="order-meta"><div><p>${order.code} · ${order.client}</p><h3>${order.title}</h3><p>Aktualny etap: <b>${displayStage(order)}</b></p></div><span class="status-chip">${order.priority.toUpperCase()} PRIORYTET</span></div><div class="details"><div><small>Nakład</small><b>${order.quantity}</b></div><div><small>Planowany termin</small><b>${order.deadline}</b></div><div><small>Dostawa</small><b>${order.delivery}</b></div><div><small>Zaliczka</small><b>${order.deposit}</b></div><div><small>Osoba / dział prowadzący</small><b>${stage(order)[1]}</b></div><div><small>Zakres widoku</small><b>Demonstracyjny, bez autoryzacji</b></div></div><div class="timeline" aria-label="Etapy zlecenia">${timeline}</div></article>`;
}

function renderRoles() {
  roleTabs.innerHTML = INTERNAL_ROLES.map((role) => `<button class="${role === activeRole ? "active" : ""}" type="button" role="tab" aria-selected="${role === activeRole}" data-role="${role}">${role}</button>`).join("");
  roleTabs.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => { activeRole = button.dataset.role; renderDepartments(); }));
}

function renderDepartments() {
  renderRoles();
  const visible = orders.filter((order) => activeRole === "Właściciel / administrator" || stage(order)[1] === activeRole);
  const overdue = visible.filter((order) => order.priority === "wysoki").length;
  const deposits = visible.filter((order) => order.deposit !== "opłacona").length;
  departmentSummary.innerHTML = `<article><small>W kolejce</small><b>${visible.length}</b></article><article><small>Wysoki priorytet</small><b>${overdue}</b></article><article><small>Do kontroli zaliczki</small><b>${deposits}</b></article><article><small>Wybrany widok</small><b>${activeRole}</b></article>`;
  taskList.innerHTML = visible.length ? visible.map((order) => `<article class="task"><div><p class="current-stage">${displayStage(order)} · ${stage(order)[1]}</p><h3>${order.code}, ${order.title}</h3><p>${order.client} · ${order.quantity} · termin: ${order.deadline}</p></div><div><p>Zaliczka: <b>${order.deposit}</b></p><p>Dostawa: <b>${order.delivery}</b></p></div><button class="advance" data-code="${order.code}" ${order.step === STAGES.length - 1 ? "disabled" : ""}>Przejdź do etapu: ${order.step === STAGES.length - 1 ? "zakończono" : STAGES[order.step + 1][0]}</button></article>`).join("") : `<article class="support-role"><p class="current-stage">ROLA WSPARCIA PROCESU</p><h3>${activeRole}</h3><p>${SUPPORT_ROLE_INFO[activeRole] || "Brak zleceń oczekujących w tym widoku."}</p></article>`;
  taskList.querySelectorAll(".advance").forEach((button) => button.addEventListener("click", () => {
    const order = orders.find((item) => item.code === button.dataset.code);
    if (order && order.step < STAGES.length - 1) { order.step += 1; save(); renderDepartments(); renderClient(); }
  }));
}

function changeMode(mode) {
  document.querySelectorAll(".mode").forEach((button) => {
    const selected = button.dataset.mode === mode;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  document.querySelector("#clientView").hidden = mode !== "client";
  document.querySelector("#departmentsView").hidden = mode !== "departments";
  document.querySelector("#aboutView").hidden = mode !== "about";
}

document.querySelectorAll(".mode").forEach((button) => button.addEventListener("click", () => changeMode(button.dataset.mode)));
document.querySelector("#orderSearch").addEventListener("submit", (event) => { event.preventDefault(); renderClient(); });
document.querySelector("#resetButton").addEventListener("click", () => { orders = structuredClone(DEFAULT_ORDERS); save(); renderClient(); renderDepartments(); });

window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); deferredPrompt = event; document.querySelector("#installButton").hidden = false; });
document.querySelector("#installButton").addEventListener("click", async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = undefined; document.querySelector("#installButton").hidden = true; });

if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
renderClient();
renderDepartments();

// Chroni polskie jednoliterowe wyrazy przed pozostaniem na końcu wiersza.
document.querySelectorAll("p,h1,h2,h3,small,b,span,button,a,label").forEach((element) => {
  element.childNodes.forEach((node) => { if (node.nodeType === Node.TEXT_NODE) node.nodeValue = node.nodeValue.replace(/(^|[\s\u00A0])([AaIiOoUuWwZz])\s+/g, "$1$2\u00A0"); });
});
