# TransportFlow 360, od zapytania ofertowego do zapłaty

## Cel projektu

Zbudowanie zanonimizowanego modelu pokazującego pełną świadomość procesu transportowego, a nie tylko rejestr pojazdów. Projekt łączy sprzedaż, dyspozycję, kierowców, flotę, zgodność, finanse, klienta oraz osobny moduł najmu taxi i samochodów kontenerowych z windą.

## Zakres demonstracji

- lata 2018–2024, do 31 lipca 2024;
- 20 zestawów ciężkich: 12 chłodni, 4 cysterny i 4 plandeki;
- 26 kierowców-pracowników: 24 bazowych i 2 rezerwowych;
- przewozy krajowe i międzynarodowe, PLN/EUR;
- zlecenia kontraktowe i spot/giełdowe;
- 14 samochodów osobowych wynajmowanych pod taxi, 1 auto właściciela i 3 kontenery z windą;
- 20-arkuszowy model Excel, portal PWA, aplikacja Python/SQLite i pakiet QA.

## Najważniejsza logika

Proces zaczyna się od kompletnego RFQ, przechodzi przez kalkulację kosztu i stawki za kilometr, negocjacje, potwierdzenie zlecenia, kontrolę dokumentów, dobór zestawu i kierowcy, plan trasy i czasu pracy, załadunek, monitoring, dostawę, POD/CMR, fakturę i płatność.

Brak ważnego dokumentu, legalnego czasu pracy, ATP/ADR/TDT/SENT, certyfikatu mycia lub dokumentu dostawy zatrzymuje właściwy etap. Dane z karty kierowcy są pobierane maksymalnie co 28 dni, a z jednostki pojazdowej co 90 dni.

## Dostęp i odpowiedzialność

Każda rola ma własny widok. Klient widzi tylko swoje zlecenie, ETA, etap, lokalizację pojazdu realizującego przewóz i POD. Kierowca widzi przydzielone zadanie. Flota widzi serwis i terminy. Finanse widzą koszty, faktury i rentowność. Pełny przekrój ma wyłącznie właściciel/administrator.

Publiczna wersja demonstruje tę architekturę przełącznikiem ról. Produkcyjne wdrożenie wymagałoby logowania, serwerowych uprawnień RBAC, szyfrowania, kopii zapasowych, audytu i integracji telematycznej.

## Technologie i weryfikacja

- HTML, CSS i JavaScript, strona oraz portal PWA;
- Excel, formuły, dashboard, RACI, checki, walidacje i definicje pól;
- Python, SQLite i JSON, lokalny model danych, API i reguły procesu;
- QA, strategia, przypadki testowe, macierz śledzenia oraz raport wykonania.

Wszystkie dane są syntetyczne. Projekt nie stanowi porady prawnej, podatkowej ani oferty transportowej.

[Otwórz TransportFlow 360](https://lukaszst-cz.github.io/operations-office-portfolio/transportflow-360/)
