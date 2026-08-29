# Przypadki testowe, PrintFlow Portal PWA

| ID | Priorytet | Scenariusz | Kroki | Oczekiwany rezultat |
|---|---|---|---|---|
| PWA-01 | P1 | Strona startowa | Otwórz portal | Widoczne są trzy tryby: klient, działy, opis działania. |
| PWA-02 | P1 | Wyszukanie zlecenia | Wpisz `ZM-2024-018`, wybierz „Sprawdź status” | Widoczne są: etap, termin, zaliczka, dostawa i przebieg etapów. |
| PWA-03 | P1 | Nieprawidłowy kod | Wpisz nieistniejący kod | Pokazuje się komunikat o braku zlecenia, bez błędu aplikacji. |
| PWA-04 | P1 | Widok działów | Wybierz „Panel działów” | Widoczne są kolejki, podsumowanie oraz przyciski przejścia etapów. |
| PWA-05 | P1 | Filtrowanie roli | W panelu działów wybierz „Jakość” | Widoczne są wyłącznie zlecenia aktualnie przypisane do jakości. |
| PWA-06 | P1 | Przejście etapu | Wybierz przycisk przejścia wybranego zlecenia | Etap aktualizuje się lokalnie, a kolejka jest odświeżona. |
| PWA-07 | P2 | Reset danych | Wybierz „Przywróć dane demonstracyjne” | Dane wracają do stanu początkowego. |
| PWA-08 | P1 | Manifest PWA | Otwórz `manifest.webmanifest` | Ma nazwę, ikonę, `display: standalone`, poprawny start i scope. |
| PWA-09 | P1 | Service worker | Sprawdź plik `sw.js` | Cache zawiera HTML, CSS, JavaScript, manifest i ikonę. |
| PWA-10 | P2 | Instrukcja instalacji | Otwórz `instrukcja.html` | Zawiera kroki dla Androida, Apple, komputera i uruchomienia lokalnego. |
| PWA-11 | P2 | Odnośniki techniczne | Otwórz opis aplikacji | Widoczne są odnośniki do kodu, QA i instrukcji. |
| PWA-12 | P3 | Instalacja Android | Otwórz w Chrome na fizycznym Androidzie | Pojawia się instalacja lub opcja dodania do ekranu głównego. |
| PWA-13 | P3 | Instalacja Apple | Otwórz w Safari na fizycznym iPhonie/iPadzie | Działa „Do ekranu początkowego”. |
| PWA-14 | P2 | Dostępność widoków | Przełącz widok klawiaturą lub czytnikiem ekranu | Aktywny tryb ma stan `aria-selected`, a fokus jest widoczny. |
| PWA-15 | P2 | Aktualizacja PWA | Zaktualizuj pliki i ponownie otwórz portal | Nowa wersja cache zastępuje poprzednią; nawigacja pobiera aktualny HTML. |
