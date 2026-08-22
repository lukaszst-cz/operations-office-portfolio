# Raport wykonania testów — PrintFlow Portal PWA

**Data kontroli:** 2026-08-22  
**Zakres:** wersja portfolio na danych syntetycznych.

| ID | Status | Dowód / wynik |
|---|---|---|
| PWA-01 | PASS | Widoczne tryby klienta, działów i opisu działania. |
| PWA-02 | PASS | Kod `ZM-2024-018` pokazuje zlecenie „Katalog produktowy”, etap, termin, zaliczkę i dostawę. |
| PWA-03 | PASS | Błędny kod generuje komunikat bez wyjątku JavaScript. |
| PWA-04 | PASS | Panel działów pokazuje sześć zleceń demonstracyjnych oraz podsumowanie. |
| PWA-05 | PASS | Filtr „Jakość” zwrócił jedno zlecenie w kolejce. |
| PWA-06 | PASS | Przejście do następnego etapu odświeża lokalny stan aplikacji. |
| PWA-07 | PASS | Reset odtwarza zestaw danych demonstracyjnych. |
| PWA-08 | PASS | Manifest zawiera nazwę, ikonę SVG, `display: standalone`, start i scope. |
| PWA-09 | PASS | Service worker cache'uje krytyczne pliki PWA. |
| PWA-10 | PASS | Publiczna instrukcja obejmuje Android, Apple, komputer, PWA i projekt Python. |
| PWA-11 | PASS | Opis aplikacji odsyła do kodu, QA i instrukcji. |
| PWA-12 | NOT EXECUTED | Wymaga testu akceptacyjnego na fizycznym urządzeniu Android. |
| PWA-13 | NOT EXECUTED | Wymaga testu akceptacyjnego na fizycznym iPhonie lub iPadzie. |
| PWA-14 | PASS | Interfejs ma stan `aria-selected` dla aktywnego widoku oraz wyraźny fokus klawiatury. |
| PWA-15 | PASS | Service worker używa wersjonowanego cache, usuwa starszy cache i aktywuje nową wersję. |

## Kontrole automatyczne

Plik `static_checks.mjs` waliduje kluczowe elementy struktury PWA i kończy pracę kodem błędu, jeśli brakuje wymaganego elementu. Wynik ostatniego uruchomienia: **PASS**.

## Decyzja jakościowa

**GO dla demonstracji portfolio.**

**NO-GO dla użycia produkcyjnego z prawdziwymi klientami.** Przed takim wdrożeniem wymagane są: backend, konta, uprawnienia, HTTPS, centralna baza, backup, monitoring, testy bezpieczeństwa i analiza zgodności z RODO.
