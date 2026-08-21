# Macierz śledzenia wymagań

| Wymaganie | Ryzyko | Przypadki | Automatyzacja | Kryterium akceptacji |
|---|---|---|---|---|
| RQ-01: 12-etapowy workflow | P1 | 001, 006, 008 | `test_seed_*`, `test_advance_*`, `test_closed_*` | każdy etap skonfigurowany, brak przejścia po zamknięciu |
| RQ-02: widoki ról | P1 | 002 | `test_owner_*`, `test_role_cannot_*` | rola widzi i obsługuje tylko przypisany zakres |
| RQ-03: poprawne zamówienie | P1 | 003 | `test_create_*`, `test_post_*201*` | rekord, kod, koszty i zaliczka zgodne z regułami |
| RQ-04: walidacja wejścia | P1 | 004, 005 | `test_rejects_*`, `test_post_*400*` | błędne wartości odrzucone z informacją |
| RQ-05: audyt zmian | P1 | 006 | `test_advance_records_*` | etap i aktor zapisani w historii |
| RQ-06: alerty operacyjne | P1 | 009 | `test_metrics_*` | zaliczka, akceptacja, termin i marża kontrolowane |
| RQ-07: filtrowanie | P2 | 010 | `test_search_*` | filtry łączą się bez utraty warunków |
| RQ-08: KPI | P1 | 001 | `test_dashboard_margin_reconciles_*` | sumy dashboardu uzgodnione z rekordami |
| RQ-09: eksport | P1 | 011 | `test_export_*` | syntetyczne metadane, nagłówek pobrania, brak PII |
| RQ-10: bezpieczeństwo ścieżek | P1 | 013 | `test_static_path_*` | próba traversal kończy się 404 |
| RQ-11: integralność bazy | P1 | 001, 003 | `test_database_rejects_duplicate_*` | unikalny kod zlecenia wymuszony w SQLite |
| RQ-12: responsywność i dostępność | P2 | 014, 015 | manualna | widok 375 px i obsługa klawiaturą bez blokad |

Macierz jest aktualizowana przy każdej zmianie reguły biznesowej. Brak powiązania wymagania z testem blokuje decyzję GO.
