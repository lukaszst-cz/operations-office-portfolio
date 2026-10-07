# FamilySyncKids++

**Dwa panele. Jedna rodzina. Mniej przypominania.**

FamilySyncKids++ jest local-first panelem organizacji dla rodzica i dziecka. Aktualna użyteczna wersja to **FamilySyncKids++ Local 1.0**.

## Uruchom

- **Aplikacja:** [app/](app/)
- **Landing page:** [landing/](landing/)
- **Demo:** [prototype/](prototype/)
- **Instrukcja:** [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md)

Dawny katalog `template/` przekierowuje do aktualnej aplikacji.

## Co działa

Panel dziecka:
- zadania i uproszczone statusy,
- rutyny dzienne,
- „Jaki miałem dzień?”,
- wiadomości i „Potrzebuję pomocy”,
- czytanie,
- aktywność,
- timer gry,
- misje i XP,
- szkoła,
- notatki i historia.

Panel rodzica:
- pełne statusy, priorytety i terminy,
- kolejka sygnałów pomocy,
- wspólny inbox,
- ostatnie check-iny,
- historia czytania, aktywności i gry,
- zarządzanie rutynami, misjami i szkołą,
- archiwum,
- eksport/import danych.

## Zasada architektury

**Jedna sprawa = jeden rekord źródłowy.**

Panel dziecka i Panel rodzica pokazują różne widoki tych samych danych zamiast tworzyć kopie.

## Dane i prywatność

Local 1.0 zapisuje dane w `localStorage` przeglądarki. Nie wymaga konta ani backendu FamilySyncKids++.

Dostępne są:
- kopia JSON,
- import kopii,
- odświeżanie danych między kartami tej samej przeglądarki,
- podstawowy cache offline.

**Nie ma jeszcze automatycznej synchronizacji między różnymi urządzeniami.**

Repo nie powinno zawierać prawdziwych danych dziecka, szkoły, zdrowia, spraw rodzinnych ani prywatnych linków.

## Status

**Local 1.0 — użyteczna wersja lokalna.**

Następny duży etap: bezpieczna synchronizacja multi-device z oddzielnym dostępem rodzica i dziecka.
