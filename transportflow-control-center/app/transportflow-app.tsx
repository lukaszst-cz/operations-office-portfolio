"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  customers,
  documents,
  drivers,
  formatMoney,
  marginPercent,
  orders as initialOrders,
  vehicles,
  type Driver,
  type DocumentRecord,
  type TransportOrder,
} from "../lib/demo-data";

type ModuleKey = "dashboard" | "orders" | "fleet" | "drivers" | "customers" | "documents" | "finance" | "management" | "access";
type DocumentViewRecord = DocumentRecord & { version?: number; uploaded?: boolean };

const modules: Array<{ key: ModuleKey; number: string; label: string; count?: number }> = [
  { key: "dashboard", number: "01", label: "Centrum operacyjne" },
  { key: "orders", number: "02", label: "Zlecenia", count: 12 },
  { key: "fleet", number: "03", label: "Flota", count: 50 },
  { key: "drivers", number: "04", label: "e-CRM Kierowcy", count: 58 },
  { key: "customers", number: "05", label: "CRM Klienci", count: 12 },
  { key: "documents", number: "06", label: "Dokumenty", count: 8 },
  { key: "finance", number: "07", label: "Finanse i marża" },
  { key: "management", number: "08", label: "KPI zarządcze" },
  { key: "access", number: "09", label: "Role i dostęp" },
];

const moduleDescriptions: Record<ModuleKey, { eyebrow: string; title: string; description: string }> = {
  dashboard: { eyebrow: "SOBOTA, 29 SIERPNIA 2026", title: "Dzień dobry, Łukasz", description: "Flota pracuje stabilnie. Trzy sprawy wymagają dziś uwagi." },
  orders: { eyebrow: "TMS · REALIZACJA", title: "Zlecenia transportowe", description: "Planowanie, trasy, rentowność i kontrola realizacji w jednym rejestrze." },
  fleet: { eyebrow: "TMS · ZASOBY", title: "Flota 50 zestawów", description: "Dostępność, kierowcy, przebiegi, spalanie, serwis i koszty stałe." },
  drivers: { eyebrow: "E-CRM · KIEROWCY", title: "Zespół kierowców", description: "58 indywidualnych kart, dostępów, dokumentów i rozliczeń." },
  customers: { eyebrow: "CRM · SPRZEDAŻ", title: "Klienci i szanse", description: "Relacje, oferty, limity kredytowe, kontakty i historia współpracy." },
  documents: { eyebrow: "COMPLIANCE", title: "Dokumenty i blokady", description: "Wspólna kontrola terminów firmy, pojazdów, kierowców i zleceń." },
  finance: { eyebrow: "CONTROLLING", title: "Finanse i rentowność", description: "Marża zleceń, koszty floty, należności i wynik operacyjny." },
  management: { eyebrow: "ZARZĄDZANIE", title: "KPI i decyzje operacyjne", description: "Wskaźniki dla właściciela oraz kierownictwa, z możliwością zejścia do źródłowych rejestrów." },
  access: { eyebrow: "BEZPIECZEŃSTWO", title: "Role i zakres dostępu", description: "Każdy użytkownik otrzymuje tylko informacje potrzebne w swojej pracy." },
};

function Badge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "amber" | "red" | "gray" | "blue" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function PanelHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="panel-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action}</div>;
}

function OrderStatus({ status }: { status: TransportOrder["status"] }) {
  const tone = status === "Blokada" ? "red" : status === "Planowane" ? "gray" : status === "Załadunek" ? "blue" : "green";
  return <Badge tone={tone}>{status}</Badge>;
}

export default function TransportFlowApp() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Wszystkie");
  const [orders, setOrders] = useState(initialOrders);
  const [documentRows, setDocumentRows] = useState<DocumentViewRecord[]>(documents);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<TransportOrder | null>(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showNewDocument, setShowNewDocument] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const hash = window.location.hash.slice(1) as ModuleKey;
    if (modules.some((module) => module.key === hash)) setActiveModule(hash);
    fetch("/api/orders")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload: { orders?: TransportOrder[] }) => {
        if (payload.orders?.length) setOrders(payload.orders);
      })
      .catch(() => undefined);
    fetch("/api/documents")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload: { documents?: DocumentViewRecord[] }) => {
        if (payload.documents?.length) setDocumentRows(payload.documents);
      })
      .catch(() => undefined);
  }, []);

  const heading = moduleDescriptions[activeModule];
  const normalizedQuery = query.trim().toLocaleLowerCase("pl");
  const matches = (...values: Array<string | number>) => !normalizedQuery || values.some((value) => String(value).toLocaleLowerCase("pl").includes(normalizedQuery));

  const filteredOrders = useMemo(() => orders.filter((order) => (statusFilter === "Wszystkie" || order.status === statusFilter) && matches(order.id, order.route, order.customer, order.driver, order.vehicle)), [orders, statusFilter, normalizedQuery]);
  const filteredVehicles = useMemo(() => vehicles.filter((vehicle) => (statusFilter === "Wszystkie" || vehicle.status === statusFilter) && matches(vehicle.id, vehicle.registration, vehicle.type, vehicle.make)), [statusFilter, normalizedQuery]);
  const filteredDrivers = useMemo(() => drivers.filter((driver) => (statusFilter === "Wszystkie" || driver.status === statusFilter || driver.compliance === statusFilter) && matches(driver.id, driver.name, driver.base, driver.assignedVehicle)), [statusFilter, normalizedQuery]);
  const filteredCustomers = useMemo(() => customers.filter((customer) => (statusFilter === "Wszystkie" || customer.stage === statusFilter) && matches(customer.id, customer.name, customer.segment, customer.owner)), [statusFilter, normalizedQuery]);
  const filteredDocuments = useMemo(() => documentRows.filter((document) => (statusFilter === "Wszystkie" || document.status === statusFilter || document.scope === statusFilter) && matches(document.id, document.scopeCode, document.type, document.blocks)), [documentRows, statusFilter, normalizedQuery]);

  function navigate(key: ModuleKey) {
    setActiveModule(key);
    setStatusFilter("Wszystkie");
    setQuery("");
    setSelectedDriver(null);
    setSelectedOrder(null);
    window.history.replaceState(null, "", `#${key}`);
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const customer = customers.find((item) => item.id === form.get("customer")) ?? customers[0];
    const totalCost = Number(form.get("cost")) || 4000;
    const salePrice = Number(form.get("price")) || 5000;
    const newOrder: TransportOrder = {
      id: `TF-260829-${String(orders.length + 1).padStart(3, "0")}`,
      customerId: customer.id,
      customer: customer.name,
      route: String(form.get("route") || "Poznań → Berlin"),
      cargo: String(form.get("cargo") || "Ładunek neutralny"),
      vehicle: "Do przypisania",
      driver: "Do przypisania",
      status: "Planowane",
      eta: "Do ustalenia",
      loadedKm: Number(form.get("loadedKm")) || 0,
      emptyKm: Number(form.get("emptyKm")) || 0,
      totalCost,
      salePrice,
      currency: String(form.get("currency")) === "PLN" ? "PLN" : "EUR",
    };
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(newOrder) });
      if (!response.ok) throw new Error();
      const payload = await response.json() as { order?: TransportOrder };
      setOrders((current) => [payload.order ?? newOrder, ...current]);
      notify(`Utworzono i zapisano zlecenie ${(payload.order ?? newOrder).id}`);
    } catch {
      setOrders((current) => [newOrder, ...current]);
      notify(`Utworzono zlecenie ${newOrder.id} w trybie demonstracyjnym`);
    }
    setShowNewOrder(false);
    setActiveModule("orders");
  }

  async function createDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/documents", { method: "POST", body: form });
      if (!response.ok) throw new Error();
      const payload = await response.json() as { document?: DocumentViewRecord };
      if (payload.document) setDocumentRows((current) => [payload.document!, ...current]);
      setShowNewDocument(false);
      setActiveModule("documents");
      notify("Dokument został zapisany i przekazany do weryfikacji.");
    } catch {
      notify("Nie udało się zapisać dokumentu. Spróbuj ponownie.");
    }
  }

  async function updateDocumentStatus(id: string, status: DocumentViewRecord["status"]) {
    try {
      const response = await fetch("/api/documents", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
      if (!response.ok) throw new Error();
      const payload = await response.json() as { document?: DocumentViewRecord };
      if (payload.document) setDocumentRows((current) => current.map((document) => document.id === id ? payload.document! : document));
      notify(status === "Ważny" ? "Dokument zatwierdzony." : "Status dokumentu został zmieniony.");
    } catch {
      notify("Nie udało się zmienić statusu dokumentu.");
    }
  }

  async function updateOrderStatus(id: string, status: TransportOrder["status"]) {
    try {
      const response = await fetch("/api/orders", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
      if (!response.ok) throw new Error();
      const payload = await response.json() as { order?: TransportOrder };
      if (payload.order) {
        setOrders((current) => current.map((order) => order.id === id ? payload.order! : order));
        setSelectedOrder(payload.order);
      }
      notify("Status zlecenia i historia operacji zostały zapisane.");
    } catch {
      notify("Nie udało się zaktualizować zlecenia.");
    }
  }

  const filters: Record<ModuleKey, string[]> = {
    dashboard: [],
    orders: ["Wszystkie", "Planowane", "Załadunek", "W trasie", "Dostawa", "Blokada"],
    fleet: ["Wszystkie", "W trasie", "Baza", "Serwis"],
    drivers: ["Wszystkie", "W trasie", "Dostępny", "Urlop", "Uwaga", "Blokada"],
    customers: ["Wszystkie", "Klient aktywny", "Oferta", "Lead", "Wstrzymany"],
    documents: ["Wszystkie", "Brak", "Do odnowienia", "Oczekuje", "Ważny"],
    finance: [],
    management: [],
    access: [],
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("dashboard")}><span className="brand-mark">TF</span><span>TransportFlow<small>CONTROL CENTER</small></span></button>
        <nav aria-label="Główna nawigacja">
          {modules.map((module) => <button className={activeModule === module.key ? "active" : ""} key={module.key} onClick={() => navigate(module.key)}><span>{module.number}</span>{module.label}{module.count ? <b>{module.count}</b> : null}</button>)}
        </nav>
        <div className="sidebar-foot"><div className="user-avatar">ŁS</div><div><strong>Łukasz Stępień</strong><small>Administrator</small></div><button aria-label="Otwórz menu użytkownika">•••</button></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="system-state"><span className="live-dot" /> System operacyjny <strong>aktywny</strong></div>
          <label className="global-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj w aktualnym module" aria-label="Szukaj" /></label>
          <div className="top-actions"><button className="ghost" onClick={() => notify("Brak nowych powiadomień")}>Powiadomienia <b>3</b></button><button className="primary" onClick={() => setShowNewOrder(true)}>+ Nowe zlecenie</button></div>
        </header>

        <div className="content">
          <div className="page-heading"><div><p className="eyebrow">{heading.eyebrow}</p><h1>{heading.title}</h1><p>{heading.description}</p></div><div className="demo-pill">DANE DEMONSTRACYJNE</div></div>
          {filters[activeModule].length > 0 ? <div className="filter-row" aria-label="Filtry">{filters[activeModule].map((filter) => <button className={statusFilter === filter ? "active" : ""} key={filter} onClick={() => setStatusFilter(filter)}>{filter}</button>)}</div> : null}

          {activeModule === "dashboard" && <Dashboard onNavigate={navigate} orderRows={orders} onSelectOrder={setSelectedOrder} />}
          {activeModule === "orders" && <OrdersView rows={filteredOrders} onNew={() => setShowNewOrder(true)} onSelectOrder={setSelectedOrder} />}
          {activeModule === "fleet" && <FleetView rows={filteredVehicles} />}
          {activeModule === "drivers" && <DriversView rows={filteredDrivers} onSelect={setSelectedDriver} />}
          {activeModule === "customers" && <CustomersView rows={filteredCustomers} />}
          {activeModule === "documents" && <DocumentsView rows={filteredDocuments} onNew={() => setShowNewDocument(true)} onUpdate={updateDocumentStatus} />}
          {activeModule === "finance" && <FinanceView orderRows={orders} />}
          {activeModule === "management" && <ManagementView orderRows={orders} onNavigate={navigate} />}
          {activeModule === "access" && <AccessView />}
        </div>
      </section>

      {selectedDriver ? <DriverDrawer driver={selectedDriver} onClose={() => setSelectedDriver(null)} /> : null}
      {selectedOrder ? <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={updateOrderStatus} /> : null}
      {showNewOrder ? <NewOrderModal onClose={() => setShowNewOrder(false)} onSubmit={createOrder} /> : null}
      {showNewDocument ? <NewDocumentModal onClose={() => setShowNewDocument(false)} onSubmit={createDocument} /> : null}
      {toast ? <div className="toast" role="status">✓ {toast}</div> : null}
    </main>
  );
}

function Dashboard({ onNavigate, orderRows, onSelectOrder }: { onNavigate: (key: ModuleKey) => void; orderRows: TransportOrder[]; onSelectOrder: (order: TransportOrder) => void }) {
  const totalSale = orderRows.reduce((sum, order) => sum + order.salePrice, 0);
  const totalProfit = orderRows.reduce((sum, order) => sum + order.salePrice - order.totalCost, 0);
  const margin = totalProfit / totalSale * 100;
  const urgentDrivers = drivers.filter((driver) => driver.compliance !== "Zgodny").slice(0, 3);
  return <>
    <section className="kpi-grid" aria-label="Najważniejsze wskaźniki">
      <article><div className="kpi-label">Flota</div><div className="kpi-value">50 <small>pojazdów</small></div><div className="meter"><i style={{ width: "86%" }} /></div><p><span className="trend">43 w trasie</span><span>4 baza · 3 serwis</span></p></article>
      <article><div className="kpi-label">Aktywne zlecenia</div><div className="kpi-value">{orderRows.length} <small>dzisiaj</small></div><div className="micro-bars"><i /><i /><i /><i /><i /></div><p><span className="trend">+ 8,4%</span><span>vs. poprzedni tydzień</span></p></article>
      <article><div className="kpi-label">Marża operacyjna</div><div className="kpi-value">{margin.toFixed(1).replace(".", ",")}<small>%</small></div><div className="meter amber"><i style={{ width: `${Math.min(100, margin * 4)}%` }} /></div><p><span className="trend">+ 1,6 pp</span><span>cel miesięczny 17%</span></p></article>
      <article className="alert-card"><div className="kpi-label">Wymaga uwagi</div><div className="kpi-value">3 <small>alerty</small></div><p className="alert-copy">Dokumenty 2 · trasa 1</p><button onClick={() => onNavigate("documents")}>Przejdź do centrum alertów →</button></article>
    </section>
    <div className="dashboard-grid">
      <section className="panel dispatch"><PanelHeading eyebrow="REALIZACJA" title="Aktualne zlecenia" action={<button className="text-button" onClick={() => onNavigate("orders")}>Wszystkie zlecenia →</button>} /><OrdersTable rows={orderRows.slice(0, 5)} compact onSelect={onSelectOrder} /></section>
      <aside className="panel driver-panel"><PanelHeading eyebrow="E-CRM KIEROWCY" title="Sprawy zespołu" action={<span className="count">{urgentDrivers.length}</span>} /><div className="driver-list">{urgentDrivers.map((driver) => <article key={driver.id}><span className={`driver-avatar ${driver.compliance === "Blokada" ? "danger" : "warning"}`}>{driver.initials}</span><div><strong>{driver.name}</strong><small>{driver.compliance === "Blokada" ? "Blokada dokumentów" : `Karta kierowcy · ${driver.cardDue}`}</small></div><button onClick={() => onNavigate("drivers")} aria-label={`Otwórz kartę ${driver.name}`}>›</button></article>)}</div><div className="team-summary"><div><strong>58</strong><small>kierowców</small></div><div><strong>52</strong><small>aktywnych</small></div><div><strong>89%</strong><small>kompletność akt</small></div></div><button className="secondary" onClick={() => onNavigate("drivers")}>Otwórz e-CRM Kierowcy</button></aside>
    </div>
    <section className="fleet-strip panel"><PanelHeading eyebrow="STRUKTURA FLOTY" title="50 zestawów ciężarowych" /><div className="fleet-types"><article><b>30</b><span>Chłodnie</span></article><article><b>10</b><span>Plandeki</span></article><article><b>5</b><span>Cysterny spożywcze</span></article><article><b>5</b><span>Cysterny ADR</span></article><button onClick={() => onNavigate("fleet")}>Zobacz całą flotę →</button></div></section>
  </>;
}

function OrdersTable({ rows, compact = false, onSelect }: { rows: TransportOrder[]; compact?: boolean; onSelect?: (order: TransportOrder) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>Zlecenie / trasa</th>{!compact && <th>Klient</th>}<th>Zestaw</th><th>Kierowca</th><th>Status</th><th>ETA</th><th>Marża</th></tr></thead><tbody>{rows.map((order) => <tr className={onSelect ? "clickable" : ""} onClick={() => onSelect?.(order)} key={order.id}><td><strong>{order.id}</strong><small>{order.route}</small></td>{!compact && <td><strong>{order.customer}</strong><small>{order.cargo}{order.temperature ? ` · ${order.temperature}` : ""}</small></td>}<td>{order.vehicle}</td><td>{order.driver}</td><td><OrderStatus status={order.status} /></td><td className={order.status === "Blokada" ? "danger-text" : ""}>{order.eta}</td><td><strong>{marginPercent(order).toFixed(1).replace(".", ",")}%</strong><small>{formatMoney(order.salePrice - order.totalCost, order.currency)}</small></td></tr>)}</tbody></table>{rows.length === 0 ? <div className="empty-state">Brak rekordów spełniających wybrane kryteria.</div> : null}</div>;
}

function OrdersView({ rows, onNew, onSelectOrder }: { rows: TransportOrder[]; onNew: () => void; onSelectOrder: (order: TransportOrder) => void }) {
  return <section className="panel module-panel"><PanelHeading eyebrow="REJESTR OPERACYJNY" title={`${rows.length} zleceń`} action={<button className="primary small" onClick={onNew}>+ Dodaj zlecenie</button>} /><OrdersTable rows={rows} onSelect={onSelectOrder} /></section>;
}

function FleetView({ rows }: { rows: typeof vehicles }) {
  return <section className="panel module-panel"><PanelHeading eyebrow="EWIDENCJA" title={`${rows.length} pojazdów`} action={<span className="summary-note">43 trasa · 4 baza · 3 serwis</span>} /><div className="table-wrap"><table><thead><tr><th>Pojazd</th><th>Typ</th><th>Kierowca</th><th>Status</th><th>Przebieg</th><th>Spalanie</th><th>Najbliższy serwis</th><th>Leasing / mies.</th></tr></thead><tbody>{rows.map((vehicle) => { const driver = drivers.find((item) => item.id === vehicle.driverId); return <tr key={vehicle.id}><td><strong>{vehicle.registration}</strong><small>{vehicle.id} · {vehicle.make} · {vehicle.year}</small></td><td>{vehicle.type}</td><td>{driver?.name}</td><td><Badge tone={vehicle.status === "Serwis" ? "red" : vehicle.status === "Baza" ? "gray" : "green"}>{vehicle.status}</Badge></td><td>{vehicle.odometer.toLocaleString("pl-PL")} km</td><td>{vehicle.fuelAverage.toFixed(1).replace(".", ",")} l/100 km</td><td>{vehicle.nextService}</td><td>{formatMoney(vehicle.monthlyLease)}</td></tr>; })}</tbody></table>{rows.length === 0 ? <div className="empty-state">Brak pojazdów spełniających wybrane kryteria.</div> : null}</div></section>;
}

function DriversView({ rows, onSelect }: { rows: Driver[]; onSelect: (driver: Driver) => void }) {
  return <><section className="driver-kpis"><article><span>Wszyscy kierowcy</span><b>58</b><small>55 aktywnych kont</small></article><article><span>Dostępni do pracy</span><b>52</b><small>43 w trasie · 9 w bazie</small></article><article><span>Dokumenty</span><b>89%</b><small>średnia kompletność akt</small></article><article className="warn"><span>Ryzyko zgodności</span><b>7</b><small>1 blokada · 6 ostrzeżeń</small></article></section><section className="panel module-panel"><PanelHeading eyebrow="KARTOTEKA I DOSTĘPY" title={`${rows.length} kierowców`} action={<button className="primary small">+ Dodaj kierowcę</button>} /><div className="table-wrap"><table><thead><tr><th>Kierowca</th><th>Baza</th><th>Dostęp</th><th>Dostępność</th><th>Pojazd / zlecenie</th><th>Czas 7 / 14 dni</th><th>Dokumenty</th><th></th></tr></thead><tbody>{rows.map((driver) => <tr className="clickable" key={driver.id} onClick={() => onSelect(driver)}><td><span className={`table-avatar ${driver.compliance === "Blokada" ? "danger" : driver.compliance === "Uwaga" ? "warning" : ""}`}>{driver.initials}</span><span className="person-cell"><strong>{driver.name}</strong><small>{driver.id}</small></span></td><td>{driver.base}</td><td><Badge tone={driver.accountStatus === "Aktywne" ? "green" : driver.accountStatus === "Wstrzymane" ? "red" : "amber"}>{driver.accountStatus}</Badge></td><td>{driver.status}</td><td><strong>{driver.assignedVehicle}</strong><small>{driver.currentOrder}</small></td><td>{driver.hoursWeek} h / {driver.hoursTwoWeeks} h</td><td><Badge tone={driver.compliance === "Zgodny" ? "green" : driver.compliance === "Blokada" ? "red" : "amber"}>{driver.documentCompleteness}% · {driver.compliance}</Badge></td><td>›</td></tr>)}</tbody></table>{rows.length === 0 ? <div className="empty-state">Brak kierowców spełniających wybrane kryteria.</div> : null}</div></section></>;
}

function CustomersView({ rows }: { rows: typeof customers }) {
  const pipeline = customers.filter((customer) => customer.stage === "Lead" || customer.stage === "Oferta").reduce((sum, customer) => sum + customer.creditLimit, 0);
  return <><section className="crm-kpis"><article><span>Aktywni klienci</span><b>8</b><small>92 zlecenia w miesiącu</small></article><article><span>Leady i oferty</span><b>4</b><small>pipeline {formatMoney(pipeline)}</small></article><article><span>Należności otwarte</span><b>{formatMoney(customers.reduce((sum, customer) => sum + customer.openBalance, 0))}</b><small>1 klient blisko limitu</small></article></section><section className="panel module-panel"><PanelHeading eyebrow="RELACJE B2B" title={`${rows.length} firm`} action={<button className="primary small">+ Dodaj firmę</button>} /><div className="table-wrap"><table><thead><tr><th>Firma</th><th>Segment</th><th>Etap</th><th>Opiekun</th><th>Zlecenia / mies.</th><th>Limit / wykorzystanie</th><th>Ostatni kontakt</th></tr></thead><tbody>{rows.map((customer) => { const usage = customer.creditLimit ? customer.openBalance / customer.creditLimit * 100 : 0; return <tr key={customer.id}><td><strong>{customer.name}</strong><small>{customer.id}</small></td><td>{customer.segment}</td><td><Badge tone={customer.stage === "Klient aktywny" ? "green" : customer.stage === "Wstrzymany" ? "red" : "blue"}>{customer.stage}</Badge></td><td>{customer.owner}</td><td>{customer.ordersMonth}</td><td><strong>{formatMoney(customer.openBalance)} / {formatMoney(customer.creditLimit)}</strong><div className="mini-meter"><i style={{ width: `${Math.min(100, usage)}%` }} /></div></td><td>{customer.lastContact}</td></tr>; })}</tbody></table>{rows.length === 0 ? <div className="empty-state">Brak firm spełniających wybrane kryteria.</div> : null}</div></section></>;
}

function DocumentsView({ rows, onNew, onUpdate }: { rows: DocumentViewRecord[]; onNew: () => void; onUpdate: (id: string, status: DocumentViewRecord["status"]) => void }) {
  const flow = [
    ["01", "Zapytanie", "RFQ i dane ładunku", "done"],
    ["02", "Oferta", "Wycena i akceptacja", "done"],
    ["03", "Zlecenie", "Umowa i instrukcja", "done"],
    ["04", "Planowanie", "Pojazd, kierowca, zgodność", "active"],
    ["05", "Załadunek", "CMR, WZ, certyfikaty", "waiting"],
    ["06", "Transport", "Statusy i dokumenty trasy", "waiting"],
    ["07", "Dostawa", "POD i podpis odbiorcy", "waiting"],
    ["08", "Rozliczenie", "Faktura, płatność, archiwum", "waiting"],
  ];
  return <>
    <section className="document-kpis"><article><span>Blokady procesu</span><b>2</b><small>wymagają działania teraz</small></article><article><span>Termin do 14 dni</span><b>3</b><small>przypomnienia wysłane</small></article><article><span>Kompletność</span><b>94%</b><small>firma · flota · kierowcy</small></article></section>
    <section className="panel document-flow-panel"><PanelHeading eyebrow="OBIEG A–Z" title="Dokumenty zlecenia TF-260829-004" action={<Badge tone="red">1 blokada</Badge>} /><div className="document-flow">{flow.map((stage) => <article className={stage[3]} key={stage[0]}><span>{stage[0]}</span><div><strong>{stage[1]}</strong><small>{stage[2]}</small></div></article>)}</div><div className="flow-note"><strong>Blokada: brak certyfikatu mycia cysterny.</strong><span>System nie pozwoli zatwierdzić załadunku do czasu uzupełnienia i akceptacji dokumentu.</span><button>Otwórz teczkę zlecenia →</button></div></section>
    <section className="panel module-panel"><PanelHeading eyebrow="TERMINY, WERSJE I REGUŁY" title={`${rows.length} dokumentów w widoku`} action={<button className="primary small" onClick={onNew}>+ Dodaj dokument</button>} /><div className="table-wrap"><table><thead><tr><th>Dokument</th><th>Zakres</th><th>Dotyczy</th><th>Termin</th><th>Status</th><th>Blokuje proces</th><th>Akcja</th></tr></thead><tbody>{rows.map((document) => <tr key={document.id}><td><strong>{document.type}</strong><small>{document.id} · wersja {document.version ?? 1}{document.uploaded ? " · plik dołączony" : ""}</small></td><td>{document.scope}</td><td>{document.scopeCode}</td><td>{document.dueDate}</td><td><Badge tone={document.status === "Ważny" ? "green" : document.status === "Brak" ? "red" : "amber"}>{document.status}</Badge></td><td>{document.blocks}</td><td>{document.status === "Ważny" ? <button className="row-action" onClick={() => onUpdate(document.id, "Do odnowienia")}>Oznacz termin</button> : <button className="row-action" onClick={() => onUpdate(document.id, "Ważny")}>Zatwierdź</button>}</td></tr>)}</tbody></table>{rows.length === 0 ? <div className="empty-state">Brak dokumentów spełniających wybrane kryteria.</div> : null}</div></section>
  </>;
}

function FinanceView({ orderRows }: { orderRows: TransportOrder[] }) {
  const sale = orderRows.reduce((sum, order) => sum + order.salePrice, 0);
  const cost = orderRows.reduce((sum, order) => sum + order.totalCost, 0);
  const profit = sale - cost;
  const lease = vehicles.reduce((sum, vehicle) => sum + vehicle.monthlyLease, 0);
  const receivables = customers.filter((customer) => customer.openBalance > 0).sort((a, b) => b.openBalance - a.openBalance).slice(0, 6);
  const overdue = receivables.slice(0, 1).reduce((sum, customer) => sum + customer.openBalance, 0);
  return <><section className="finance-kpis"><article><span>Przychód z aktywnych zleceń</span><b>{formatMoney(sale, "EUR")}</b><small>model uproszczony, waluty przeliczone</small></article><article><span>Marża kwotowa</span><b>{formatMoney(profit, "EUR")}</b><small>{(profit / sale * 100).toFixed(1).replace(".", ",")}% marży</small></article><article><span>Leasing floty / miesiąc</span><b>{formatMoney(lease)}</b><small>50 zestawów</small></article><article><span>Po terminie</span><b>{formatMoney(overdue)}</b><small>1 pozycja wymaga kontaktu</small></article></section><div className="finance-grid"><section className="panel"><PanelHeading eyebrow="RENTOWNOŚĆ" title="Marża zleceń" /><div className="margin-list">{orderRows.slice(0, 8).map((order) => <article key={order.id}><div><strong>{order.id}</strong><small>{order.route}</small></div><div className="margin-bar"><i style={{ width: `${Math.min(100, marginPercent(order) * 4)}%` }} /></div><b>{marginPercent(order).toFixed(1).replace(".", ",")}%</b></article>)}</div></section><section className="panel"><PanelHeading eyebrow="NALEŻNOŚCI I TERMINY" title="Kolejka płatności" /><div className="balance-list">{receivables.map((customer, index) => { const paymentState = index === 0 ? "Po terminie: 4 dni" : index === 1 ? "Termin: dzisiaj" : `Termin: za ${index * 3 + 2} dni`; return <article key={customer.id}><div><strong>{customer.name}</strong><small>{paymentState} · warunki {customer.paymentDays} dni</small></div><div className="payment-value"><b>{formatMoney(customer.openBalance)}</b><Badge tone={index === 0 ? "red" : index === 1 ? "amber" : "green"}>{index === 0 ? "Kontakt" : index === 1 ? "Dzisiaj" : "W terminie"}</Badge></div></article>; })}</div></section></div></>;
}

function ManagementView({ orderRows, onNavigate }: { orderRows: TransportOrder[]; onNavigate: (key: ModuleKey) => void }) {
  const sale = orderRows.reduce((sum, order) => sum + order.salePrice, 0);
  const cost = orderRows.reduce((sum, order) => sum + order.totalCost, 0);
  const margin = sale ? (sale - cost) / sale * 100 : 0;
  const emptyKm = orderRows.reduce((sum, order) => sum + order.emptyKm, 0);
  const totalKm = orderRows.reduce((sum, order) => sum + order.emptyKm + order.loadedKm, 0);
  const openBalance = customers.reduce((sum, customer) => sum + customer.openBalance, 0);
  const topCustomers = [...customers].sort((a, b) => b.ordersMonth - a.ordersMonth).slice(0, 5);
  const statusRows = ["Planowane", "Załadunek", "W trasie", "Dostawa", "Blokada"] as const;
  return <>
    <section className="management-grid">
      <button className="management-card" onClick={() => onNavigate("finance")}><span>Przychód operacyjny</span><b>{formatMoney(sale, "EUR")}</b><small>aktywny portfel zleceń</small><i style={{ width: "78%" }} /></button>
      <button className="management-card" onClick={() => onNavigate("finance")}><span>Marża operacyjna</span><b>{margin.toFixed(1).replace(".", ",")}%</b><small>cel miesięczny: 17,0%</small><i className="amber" style={{ width: `${Math.min(100, margin * 4)}%` }} /></button>
      <button className="management-card" onClick={() => onNavigate("fleet")}><span>Wykorzystanie floty</span><b>86%</b><small>43 z 50 zestawów w trasie</small><i style={{ width: "86%" }} /></button>
      <button className="management-card" onClick={() => onNavigate("orders")}><span>Puste kilometry</span><b>{totalKm ? (emptyKm / totalKm * 100).toFixed(1).replace(".", ",") : "0,0"}%</b><small>cel operacyjny poniżej 10%</small><i className="amber" style={{ width: `${Math.min(100, totalKm ? emptyKm / totalKm * 6 : 0)}%` }} /></button>
      <button className="management-card" onClick={() => onNavigate("customers")}><span>Należności otwarte</span><b>{formatMoney(openBalance)}</b><small>monitorowanie płatności i limitów</small><i className="blue" style={{ width: "62%" }} /></button>
      <button className="management-card alert" onClick={() => onNavigate("documents")}><span>Ryzyko zgodności</span><b>3 sprawy</b><small>2 dokumenty i 1 blokada trasy</small><i className="red" style={{ width: "32%" }} /></button>
    </section>
    <section className="management-summary panel">
      <PanelHeading eyebrow="PULPIT DECYZYJNY" title="Co wymaga decyzji dzisiaj" action={<button className="text-button" onClick={() => onNavigate("documents")}>Otwórz dokumenty →</button>} />
      <div className="decision-list"><article><Badge tone="red">Pilne</Badge><div><strong>Certyfikat mycia cysterny do zlecenia TF-260829-004</strong><small>Bez akceptacji nie można potwierdzić załadunku.</small></div><button onClick={() => onNavigate("documents")}>Sprawdź</button></article><article><Badge tone="amber">Dzisiaj</Badge><div><strong>Trzy dokumenty z terminem do 14 dni</strong><small>Kontrola kierowców i floty przed kolejnymi przypisaniami.</small></div><button onClick={() => onNavigate("drivers")}>Przejdź</button></article><article><Badge tone="blue">Kontrola</Badge><div><strong>Jeden klient zbliża się do limitu kredytowego</strong><small>Warto potwierdzić warunki następnego zlecenia.</small></div><button onClick={() => onNavigate("customers")}>Otwórz CRM</button></article></div>
    </section>
    <div className="management-detail-grid">
      <section className="panel"><PanelHeading eyebrow="REALIZACJA" title="Portfel według etapu" /><div className="management-list">{statusRows.map((status) => { const count = orderRows.filter((order) => order.status === status).length; return <article key={status}><div><OrderStatus status={status} /><small>{count} zleceń</small></div><div className="management-bar"><i style={{ width: `${Math.max(8, count / Math.max(1, orderRows.length) * 100)}%` }} /></div><b>{orderRows.length ? (count / orderRows.length * 100).toFixed(0) : 0}%</b></article>; })}</div></section>
      <section className="panel"><PanelHeading eyebrow="KLIENCI" title="Największy wolumen" /><div className="management-list">{topCustomers.map((customer) => <article key={customer.id}><div><strong>{customer.name}</strong><small>{customer.ordersMonth} zleceń miesięcznie</small></div><div className="management-bar"><i className="blue" style={{ width: `${Math.max(10, customer.ordersMonth / Math.max(1, topCustomers[0].ordersMonth) * 100)}%` }} /></div><b>{formatMoney(customer.openBalance)}</b></article>)}</div></section>
    </div>
    <section className="management-footnote"><strong>Zakres zarządczy:</strong> wynik i marża, jakość realizacji, wykorzystanie floty, puste kilometry, należności, zgodność dokumentów oraz sprawy wymagające decyzji. Każdy kafel otwiera rejestr źródłowy.</section>
  </>;
}

function AccessView() {
  const roles = [
    ["Właściciel / administrator", "Pełny dostęp", "Wszystkie moduły, konfiguracja, użytkownicy i raporty"],
    ["Dyspozytor", "Operacje", "Zlecenia, flota, kierowcy, trasy, statusy i dokumenty operacyjne"],
    ["Handlowiec", "CRM i oferty", "Klienci, kontakty, wyceny, stawki sprzedaży i historia relacji"],
    ["Kadry / e-CRM", "Kierowcy", "Akta, umowy, badania, szkolenia, dostępność i zdarzenia"],
    ["Flota / serwis", "Pojazdy", "Serwis, szkody, opony, dokumenty, leasing i koszty techniczne"],
    ["Księgowość", "Finanse", "Faktury, płatności, koszty i należności bez danych lokalizacji"],
    ["Kierowca", "Tylko własne dane", "Własne zlecenia, pojazd, zadania, czas pracy, dokumenty i rozliczenia"],
    ["Klient", "Tylko własne zlecenia", "Etap, ETA, dokument dostawy i faktury własnej firmy"],
  ];
  return <><section className="access-callout"><div><span>INDYWIDUALNY DOSTĘP</span><h2>Każde konto ma własną rolę i zakres danych.</h2><p>Kierowcy oraz klienci nie widzą danych innych osób ani wewnętrznej rentowności firmy. Każda istotna zmiana będzie przypisana do użytkownika i zapisana w historii.</p></div><div className="access-stat"><b>8</b><span>ról systemowych</span><small>uprawnienia kontrolowane po stronie serwera</small></div></section><section className="panel module-panel"><PanelHeading eyebrow="MACIERZ UPRAWNIEŃ" title="Role systemowe" action={<span className="summary-note">Sprawdź widoki demonstracyjne</span>} /><div className="role-grid">{roles.map((role) => <article key={role[0]}><div className="role-icon">{role[0].split(" ").slice(0, 2).map((part) => part[0]).join("")}</div><div><strong>{role[0]}</strong><Badge tone="blue">{role[1]}</Badge><p>{role[2]}</p></div></article>)}</div><div className="role-links"><a href="/driver">Otwórz portal kierowcy →</a><a href="/customer">Otwórz portal klienta →</a></div></section></>;
}

function DriverDrawer({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  return <div className="overlay" onMouseDown={onClose}><aside className="drawer" onMouseDown={(event) => event.stopPropagation()}><button className="close" onClick={onClose} aria-label="Zamknij">×</button><div className="profile-head"><span className={`profile-avatar ${driver.compliance === "Blokada" ? "danger" : driver.compliance === "Uwaga" ? "warning" : ""}`}>{driver.initials}</span><div><p className="eyebrow">{driver.id}</p><h2>{driver.name}</h2><p>{driver.base} · prawo jazdy C+E</p></div></div><div className="profile-badges"><Badge tone={driver.accountStatus === "Aktywne" ? "green" : "amber"}>Dostęp: {driver.accountStatus}</Badge><Badge tone={driver.compliance === "Zgodny" ? "green" : driver.compliance === "Blokada" ? "red" : "amber"}>{driver.compliance}</Badge></div><section><h3>Bieżące przypisanie</h3><dl><div><dt>Status</dt><dd>{driver.status}</dd></div><div><dt>Pojazd</dt><dd>{driver.assignedVehicle}</dd></div><div><dt>Zlecenie</dt><dd>{driver.currentOrder}</dd></div></dl></section><section><h3>Czas pracy</h3><div className="time-cards"><article><b>{driver.hoursWeek} h</b><span>ostatnie 7 dni</span></article><article><b>{driver.hoursTwoWeeks} h</b><span>ostatnie 14 dni</span></article></div></section><section><h3>Dokumenty</h3><dl><div><dt>Kompletność akt</dt><dd>{driver.documentCompleteness}%</dd></div><div><dt>Odczyt karty</dt><dd>{driver.cardDue}</dd></div><div><dt>Badania lekarskie</dt><dd>{driver.medicalDue}</dd></div></dl></section><div className="drawer-actions"><a className="primary drawer-link" href="/driver">Otwórz portal kierowcy</a><button className="ghost" onClick={() => window.alert("Zadanie zostało przygotowane dla kierowcy w wersji demonstracyjnej.")}>Wyślij zadanie</button></div><p className="privacy-note">Kierowca na własnym koncie widzi wyłącznie informacje przypisane do niego.</p></aside></div>;
}

function OrderDrawer({ order, onClose, onUpdate }: { order: TransportOrder; onClose: () => void; onUpdate: (id: string, status: TransportOrder["status"]) => void }) {
  const stages: TransportOrder["status"][] = ["Planowane", "Załadunek", "W trasie", "Dostawa"];
  return <div className="overlay" onMouseDown={onClose}><aside className="drawer" onMouseDown={(event) => event.stopPropagation()}><button className="close" onClick={onClose} aria-label="Zamknij">×</button><div className="profile-head"><span className="profile-avatar">TF</span><div><p className="eyebrow">{order.id}</p><h2>{order.route}</h2><p>{order.customer} · {order.cargo}</p></div></div><div className="profile-badges"><OrderStatus status={order.status} /><Badge tone="blue">{order.currency}</Badge></div><section><h3>Plan i realizacja</h3><dl><div><dt>Pojazd</dt><dd>{order.vehicle}</dd></div><div><dt>Kierowca</dt><dd>{order.driver}</dd></div><div><dt>ETA</dt><dd>{order.eta}</dd></div><div><dt>Kilometry</dt><dd>{order.loadedKm + order.emptyKm} km</dd></div></dl></section><section><h3>Rentowność</h3><dl><div><dt>Sprzedaż</dt><dd>{formatMoney(order.salePrice, order.currency)}</dd></div><div><dt>Koszt</dt><dd>{formatMoney(order.totalCost, order.currency)}</dd></div><div><dt>Marża</dt><dd>{marginPercent(order).toFixed(1).replace(".", ",")}%</dd></div></dl></section><section><h3>Zmień etap zlecenia</h3><div className="status-actions">{stages.map((stage) => <button className={order.status === stage ? "active" : ""} key={stage} onClick={() => onUpdate(order.id, stage)}>{stage}</button>)}<button className={order.status === "Blokada" ? "active danger" : "danger"} onClick={() => onUpdate(order.id, "Blokada")}>Blokada</button></div></section><div className="drawer-actions"><button className="primary" onClick={() => window.location.href = "/driver"}>Portal kierowcy</button><button className="ghost" onClick={onClose}>Zamknij</button></div></aside></div>;
}

function NewDocumentModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="overlay modal-overlay" onMouseDown={onClose}><form className="modal" onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="close" onClick={onClose} aria-label="Zamknij">×</button><p className="eyebrow">NOWY DOKUMENT</p><h2>Dodaj plik do obiegu</h2><div className="form-grid"><label>Zakres<select name="scope"><option>Kierowca</option><option>Pojazd</option><option>Firma</option><option>Zlecenie</option></select></label><label>Identyfikator<input name="scopeCode" required placeholder="np. TF-260829-001" /></label><label className="wide">Rodzaj dokumentu<input name="type" required placeholder="np. POD / CMR po dostawie" /></label><label>Termin<input name="dueDate" type="date" /></label><label>Blokuje proces<input name="blocks" defaultValue="Brak blokady" /></label><label className="wide">Plik PDF lub zdjęcie<input name="file" type="file" accept="image/*,application/pdf" /></label></div><div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>Anuluj</button><button type="submit" className="primary">Zapisz dokument</button></div><p className="form-note">Plik trafia do teczki dokumentowej, otrzymuje status weryfikacji i pozostawia ślad w historii.</p></form></div>;
}

function NewOrderModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="overlay modal-overlay" onMouseDown={onClose}><form className="modal" onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="close" onClick={onClose} aria-label="Zamknij">×</button><p className="eyebrow">NOWY REKORD</p><h2>Dodaj zlecenie transportowe</h2><div className="form-grid"><label className="wide">Klient<select name="customer" defaultValue={customers[0].id}>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}</select></label><label className="wide">Trasa<input name="route" required placeholder="np. Poznań → Berlin" /></label><label className="wide">Ładunek<input name="cargo" required placeholder="Rodzaj ładunku" /></label><label>Kilometry ładowne<input name="loadedKm" type="number" min="0" /></label><label>Puste kilometry<input name="emptyKm" type="number" min="0" /></label><label>Koszt<input name="cost" type="number" min="0" required /></label><label>Cena sprzedaży<input name="price" type="number" min="0" required /></label><label>Waluta<select name="currency"><option>EUR</option><option>PLN</option></select></label></div><div className="modal-actions"><button type="button" className="ghost" onClick={onClose}>Anuluj</button><button type="submit" className="primary">Utwórz zlecenie</button></div><p className="form-note">Rekord demonstracyjny. Przypisanie pojazdu i kierowcy nastąpi w planowaniu.</p></form></div>;
}
