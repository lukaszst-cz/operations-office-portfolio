# Protokół testów — PrintFlow Portal PWA

## 1. Cel

Potwierdzić, że demonstracyjny portal umożliwia sprawdzenie przykładowego statusu zlecenia, widok kolejki dla działów, lokalną symulację przejścia etapu oraz udostępnia poprawne elementy PWA.

## 2. Zakres

| Obszar | W zakresie | Poza zakresem |
|---|---|---|
| Portal klienta | wyszukiwanie danych demo, status, termin, zaliczka, dostawa | prawdziwe konta klientów i dane osobowe |
| Panel działów | role, filtrowanie, przejście etapu, reset danych | produkcyjne RBAC i współdzielony workflow |
| PWA | manifest, service worker, ikona, instrukcje instalacji | publikacja w Google Play / App Store |
| Kod | struktura HTML, JavaScript, manifest, cache | audyt pentestowy, obciążeniowy i RODO |
| Python | linki i instrukcja lokalnego projektu Control Center | wdrożenie backendu produkcyjnego |

## 3. Środowisko testowe

- Wersja: demonstracyjna, publiczna GitHub Pages.
- Test funkcjonalny: lokalny serwer HTTP, przeglądarka Chromium.
- Kontrola kodu: Node.js (walidacja składni i asercje statyczne).
- Dane: wyłącznie `KLIENT DEMO` oraz przykładowe kody `ZM-2024-xxx`.

## 4. Kryteria wejścia

1. Portal otwiera się pod adresem PWA.
2. Pliki `index.html`, `app.js`, `app.css`, `manifest.webmanifest` i `sw.js` są dostępne.
3. Dane demonstracyjne nie zawierają danych osobowych ani kontrahentów rzeczywistych.

## 5. Kryteria zaliczenia

- Wszystkie przypadki oznaczone jako krytyczne są zaliczone.
- Brak błędów JavaScript w podstawowym przepływie klienta i działów.
- Manifest określa tryb `standalone`, a service worker zawiera zasoby aplikacji.
- Otwarte ograniczenia urządzeń są jawnie oznaczone, a nie ukryte jako zaliczone.

## 6. Ryzyka i ograniczenia

- PWA to statyczna demonstracja; dane są przechowywane lokalnie w `localStorage`.
- Nie testowano logowania, płatności, RODO, uprawnień ani API produkcyjnego — tych funkcji nie ma w wersji demo.
- Instalacja PWA na Androidzie, iPhonie i iPadzie wymaga fizycznych urządzeń oraz osobnego testu akceptacyjnego.

## 7. Rezultat

Wynik aktualnej kontroli i przypadki wykonane znajdują się w [raporcie wykonania](EXECUTION_REPORT.md).
