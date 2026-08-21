# Przykładowe raporty defektów

Poniższe zgłoszenia dokumentują sposób raportowania. Status „naprawiony” oznacza, że kontrola istnieje w aktualnej wersji demonstracyjnej.

## PF-BUG-001 — przejście zamkniętego zlecenia

- Priorytet / dotkliwość: P1 / wysoka
- Warunki: zlecenie ma etap `Zamknięte`.
- Kroki: wywołać akcję przejścia do kolejnego etapu.
- Oczekiwane: odmowa i czytelny komunikat.
- Aktualne: kontrola zwraca „Zlecenie jest już zamknięte”.
- Status: naprawiony, pokryty testem automatycznym.

## PF-BUG-002 — próba przejścia ścieżki statycznej

- Priorytet / dotkliwość: P1 / krytyczna
- Kroki: wykonać `GET /static/../app.py`.
- Oczekiwane: 404 i brak treści kodu źródłowego.
- Aktualne: ścieżka jest normalizowana i weryfikowana względem katalogu `static`.
- Status: naprawiony, pokryty testem automatycznym.

## PF-BUG-003 — brak pełnej semantyki autoryzacji

- Priorytet / dotkliwość: P1 / wysoka
- Obserwacja: wybór roli jest filtrem demonstracyjnym, nie uwierzytelnianiem.
- Ryzyko: użytkownik może sam wskazać rolę właściciela.
- Rekomendacja: w wersji produkcyjnej dodać logowanie, sesje, RBAC po stronie serwera i testy uprawnień.
- Status: zaakceptowane ograniczenie wersji portfolio; jawnie opisane w README.

## PF-BUG-004 — brak idempotencji tworzenia zapytania

- Priorytet / dotkliwość: P2 / średnia
- Obserwacja: ponowienie żądania POST może utworzyć drugi rekord.
- Rekomendacja: dodać klucz idempotencji lub identyfikator zapytania klienta.
- Status: backlog wersji produkcyjnej.
