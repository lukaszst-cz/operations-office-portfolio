"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { formatMoney, type TransportOrder } from "../../lib/demo-data";

const assignedDriver = "Adam Kowalski";

export default function DriverPortal() {
  const [orders, setOrders] = useState<TransportOrder[]>([]);
  const [tab, setTab] = useState<"day" | "documents" | "tasks" | "profile">("day");
  const [showCompletion, setShowCompletion] = useState(false);
  const [digitalProof, setDigitalProof] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/orders")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload: { orders?: TransportOrder[] }) => setOrders((payload.orders ?? []).filter((order) => order.driver === assignedDriver)))
      .catch(() => undefined);
  }, []);

  const activeOrder = orders[0];

  function onFilesChanged(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []).slice(0, 6));
  }

  async function finishOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeOrder || saving) return;
    if (!digitalProof && files.length === 0) {
      setNotice("Dodaj co najmniej jedno zdjęcie lub zaznacz potwierdzenie cyfrowe.");
      return;
    }
    setSaving(true);
    try {
      for (const file of files) {
        const documentForm = new FormData();
        documentForm.set("scope", "Zlecenie");
        documentForm.set("scopeCode", activeOrder.id);
        documentForm.set("type", "POD / CMR po dostawie");
        documentForm.set("dueDate", "2026-08-29");
        documentForm.set("blocks", "Faktura");
        documentForm.set("file", file);
        const upload = await fetch("/api/documents", { method: "POST", body: documentForm });
        if (!upload.ok) throw new Error();
      }
      const response = await fetch("/api/orders", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: activeOrder.id, status: "Dostawa", eta: "Dostarczono" }) });
      if (!response.ok) throw new Error();
      const payload = await response.json() as { order?: TransportOrder };
      setOrders((current) => current.map((order) => order.id === activeOrder.id ? payload.order ?? { ...order, status: "Dostawa", eta: "Dostarczono" } : order));
      setShowCompletion(false);
      setFiles([]);
      setNote("");
      setNotice(digitalProof ? "Dostawa została potwierdzona cyfrowo." : "Zdjęcia zostały dołączone do teczki zlecenia.");
    } catch {
      setNotice("Nie udało się zapisać potwierdzenia. Spróbuj ponownie po odzyskaniu połączenia.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="driver-app">
    <header className="driver-top"><a href="/" className="driver-brand"><span>TF</span> TransportFlow</a><div><small>TRYB KIEROWCY</small><b>AK</b></div></header>
    <section className="driver-hero"><p>29 SIERPNIA 2026</p><h1>Dzień dobry, Adam</h1><span>Twój plan, dokumenty i najważniejsze zadania w jednym miejscu.</span></section>
    <nav className="driver-tabs" aria-label="Portal kierowcy"><button className={tab === "day" ? "active" : ""} onClick={() => setTab("day")}>Mój dzień</button><button className={tab === "documents" ? "active" : ""} onClick={() => setTab("documents")}>Dokumenty</button><button className={tab === "tasks" ? "active" : ""} onClick={() => setTab("tasks")}>Zadania</button><button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>Profil</button></nav>
    <section className="driver-content">
      {notice ? <div className="driver-notice">✓ {notice}</div> : null}
      {tab === "day" && <>{activeOrder ? <article className="driver-order"><div className="driver-order-head"><div><small>AKTYWNE ZLECENIE</small><h2>{activeOrder.route}</h2><p>{activeOrder.id} · {activeOrder.customer}</p></div><span className={`driver-status ${activeOrder.status === "Dostawa" ? "done" : ""}`}>{activeOrder.status}</span></div><div className="route-track"><i /><span>Załadunek</span><i /><span>W trasie</span><i className={activeOrder.status === "Dostawa" ? "done" : ""} /><span>Dostawa</span></div><dl><div><dt>Ładunek</dt><dd>{activeOrder.cargo}</dd></div><div><dt>Zestaw</dt><dd>{activeOrder.vehicle}</dd></div><div><dt>ETA</dt><dd>{activeOrder.eta}</dd></div><div><dt>Kontakt</dt><dd>Dyspozytornia 24/7</dd></div></dl><button className="driver-primary" onClick={() => setShowCompletion(true)}>{activeOrder.status === "Dostawa" ? "Zobacz potwierdzenie dostawy" : "Zakończ zlecenie i potwierdź dostawę"}</button></article> : <div className="driver-empty">Nie masz teraz aktywnego zlecenia.</div>}<section className="driver-card"><h2>Najbliższe zadania</h2><article><b>Odczyt karty kierowcy</b><span>Termin: 03.09.2026</span><button onClick={() => setTab("documents")}>Przejdź →</button></article><article><b>Kontrola temperatury</b><span>W trasie · co 2 godziny</span><button onClick={() => setNotice("Temperatura +4°C została zapisana w historii trasy.")}>Zapisz odczyt →</button></article></section></>}
      {tab === "documents" && <section className="driver-card"><h2>Moje dokumenty</h2><article><b>Prawo jazdy C+E</b><span>Ważne do 18.05.2030</span><i>Ważny</i></article><article><b>Odczyt karty kierowcy</b><span>Termin: 03.09.2026</span><i className="warning">Do wykonania</i></article><article><b>Badania lekarskie</b><span>Ważne do 07.02.2027</span><i>Ważne</i></article><button className="driver-secondary" onClick={() => setShowCompletion(true)}>Dodaj dokument do zlecenia</button></section>}
      {tab === "tasks" && <section className="driver-card"><h2>Lista zadań</h2><article><b>Potwierdź komplet dokumentów przed wyjazdem</b><span>Zlecenie TF-260829-001</span><button onClick={() => setNotice("Zadanie oznaczone jako wykonane.")}>Wykonano</button></article><article><b>Zapisz odczyt temperatury</b><span>Chłodnia · trasa Poznań → Hamburg</span><button onClick={() => setNotice("Odczyt temperatury zapisany.")}>Dodaj</button></article><article><b>Prześlij POD po dostawie</b><span>Wymagane przed przekazaniem do faktury</span><button onClick={() => setShowCompletion(true)}>Otwórz</button></article></section>}
      {tab === "profile" && <section className="driver-card"><h2>Mój profil i dostęp</h2><article><b>Adam Kowalski</b><span>DRV-001 · Poznań · Kierowca C+E</span><i>Aktywne</i></article><article><b>Zakres danych</b><span>Widoczne są wyłącznie Twoje zlecenia, dokumenty, zadania i rozliczenia.</span></article><article><b>Czas pracy</b><span>25 h / ostatnie 7 dni · 57 h / ostatnie 14 dni</span></article></section>}
    </section>
    {showCompletion && <div className="driver-overlay" onMouseDown={() => setShowCompletion(false)}><form className="driver-modal" onSubmit={finishOrder} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="driver-close" onClick={() => setShowCompletion(false)}>×</button><p>POTWIERDZENIE DOSTAWY</p><h2>Jak potwierdzasz zakończenie zlecenia?</h2><label className="digital-check"><input type="checkbox" checked={digitalProof} onChange={(event) => setDigitalProof(event.target.checked)} /> Potwierdzenie zostało podpisane cyfrowo</label><label className="driver-file">Zdjęcia POD / CMR / uwag<input type="file" accept="image/*,application/pdf" multiple onChange={onFilesChanged} /></label>{files.length ? <div className="file-list">{files.map((file) => <span key={file.name}>{file.name}</span>)}</div> : null}<label className="driver-file">Uwagi po dostawie<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Np. uszkodzenie opakowania, opóźnienie, brak palet" /></label><p className="driver-modal-note">Przy pełnym potwierdzeniu cyfrowym zdjęcie nie jest wymagane. Zawsze możesz dołączyć materiał dotyczący wyjątku lub szkody.</p><div><button type="button" className="driver-secondary" onClick={() => setShowCompletion(false)}>Wróć</button><button className="driver-primary" disabled={saving}>{saving ? "Zapisywanie..." : "Potwierdź dostawę"}</button></div></form></div>}
  </main>;
}
