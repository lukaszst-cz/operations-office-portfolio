# Przypadki testowe, TransportFlow 360

| ID | Obszar | Warunek | Oczekiwany rezultat |
|---|---|---|---|
| TF-001 | Flota | Uruchomienie danych demonstracyjnych | 20 zestawów, struktura 12/4/4 |
| TF-002 | Kierowcy | Odczyt dashboardu | 26 kierowców: 24 bazowych i 2 rezerwowych |
| TF-003 | Karta kierowcy | Ostatni odczyt + 28 dni | Wyliczony termin następnego pobrania; po terminie blokada |
| TF-004 | Tachograf pojazdu | Ostatni odczyt VU + 90 dni | Wyliczony termin i alert przed przekroczeniem |
| TF-005 | Czas pracy | Limit dzienny/tygodniowy/dwutygodniowy przekroczony | Brak przydziału kierowcy |
| TF-006 | Chłodnia | Brak ATP lub loggera | Blokada zlecenia |
| TF-007 | Cysterna | Brak certyfikatu mycia | Blokada wyjazdu |
| TF-008 | ADR | Brak ADR pojazdu/kierowcy albo SENT | Blokada operacji ADR |
| TF-009 | Wycena | Cena minimalna liczona z kosztów i marży | Cena jest większa od kosztu z ryzykiem |
| TF-010 | Fakturowanie | Brak POD/CMR | Faktura nie powstaje |
| TF-011 | Klient | Otwarcie własnego zlecenia | Widzi etap, ETA, lokalizację pojazdu i POD; nie widzi marży |
| TF-012 | Kierowca | Otwarcie aplikacji | Widzi tylko przypisane zadanie, dokumenty i czas pracy |
| TF-013 | Finanse | Otwarcie aplikacji | Widzi faktury, płatności i rentowność; nie widzi danych medycznych |
| TF-014 | Najem taxi | Szkoda i zaległość | Potrącenie nie przekracza kaucji |
| TF-015 | Kontener | UDT windy po terminie | Pojazd jest zablokowany |
| TF-016 | Anonimizacja | Skan publicznego repozytorium | Brak rzeczywistych nazw klientów, kierowców i numerów dokumentów |
