"use client";

import { useEffect, useState } from "react";
import type { TransportOrder } from "../../lib/demo-data";

const company = "Baltic Fresh Logistics";

export default function CustomerPortal() {
  const [orders, setOrders] = useState<TransportOrder[]>([]);
  const [tab, setTab] = useState<"orders" | "documents" | "billing">("orders");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    fetch("/api/orders")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload: { orders?: TransportOrder[] }) => setOrders((payload.orders ?? []).filter((order) => order.customer === company)))
      .catch(() => undefined);
  }, []);
  return <main className="customer-app"><header className="customer-top"><a href="/" className="driver-brand"><span>TF</span> TransportFlow</a><div><small>PORTAL KLIENTA</small><b>BF</b></div></header><section className="customer-hero"><p>WITAMY, BALTIC FRESH LOGISTICS</p><h1>Twoje przewozy w jednym miejscu</h1><span>Sprawdzaj etap realizacji, ETA i dokumenty własnych zleceń.</span></section><nav className="driver-tabs"><button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>Przewozy</button><button className={tab === "documents" ? "active" : ""} onClick={() => setTab("documents")}>Dokumenty</button><button className={tab === "billing" ? "active" : ""} onClick={() => setTab("billing")}>Rozliczenia</button></nav><section className="driver-content">{notice ? <div className="driver-notice">✓ {notice}</div> : null}{tab === "orders" && <section className="driver-card"><h2>Aktywne zlecenia</h2>{orders.length ? orders.map((order) => <article key={order.id}><div><b>{order.route}</b><span>{order.id} · ETA: {order.eta}</span></div><i className={order.status === "Blokada" ? "warning" : ""}>{order.status}</i></article>) : <div className="driver-empty">Brak aktywnych przewozów.</div>}<button className="driver-secondary" onClick={() => setNotice("Dyspozytor otrzymał prośbę o kontakt.")}>Poproś o kontakt</button></section>}{tab === "documents" && <section className="driver-card"><h2>Dokumenty przewozowe</h2><article><div><b>Instrukcja transportowa</b><span>TF-260829-001 · dostępna</span></div><i>Gotowy</i></article><article><div><b>POD / CMR</b><span>Po potwierdzeniu dostawy dokument pojawi się tutaj automatycznie.</span></div><i className="warning">Oczekuje</i></article><p className="customer-note">W tym widoku firma widzi wyłącznie dokumenty własnych zleceń. Dane innych klientów, zakupowe ceny oraz marża nie są dostępne.</p></section>}{tab === "billing" && <section className="driver-card"><h2>Rozliczenia</h2><article><div><b>Faktury oczekujące</b><span>Dokumenty pojawią się po poprawnym POD i weryfikacji.</span></div><i className="warning">1 w przygotowaniu</i></article><article><div><b>Warunki płatności</b><span>30 dni od poprawnie wystawionej faktury</span></div></article></section>}</section></main>;
}
