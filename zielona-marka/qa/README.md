# QA — narzędzia demonstracyjne ZIELONA MARKA

Ten pakiet potwierdza podstawową spójność statycznych narzędzi portfolio: kalkulatora zlecenia, dashboardu KPI i case study. Nie zastępuje testów produkcyjnego systemu, bezpieczeństwa ani audytu RODO.

## Zakres

- kalkulator ma pola specyfikacji, wykończenia, dostawy i wynik modelowy;
- wartość demonstracyjna nie jest przedstawiana jako oferta handlowa;
- dashboard zawiera syntetyczne porównanie 2023–2024, KPI miesięczne i kwartalne;
- case study zawiera RACI, wyjątki, dokumenty, API i QA;
- główna strona prowadzi do narzędzi oraz case study.

## Uruchomienie

```powershell
node qa/static_checks.mjs
```

## Wynik jakościowy

**GO dla publicznego portfolio na danych syntetycznych.**

**NO-GO dla użycia jako cennik, oferta lub produkcyjny system obsługi klienta.** Wersja rzeczywista wymagałaby walidacji biznesowej, kont, uprawnień, centralnej bazy danych, backendu, historii zmian i kontroli bezpieczeństwa.
