# FamilySyncKids++ — start

## Aktualna wersja

Do codziennego używania otwórz:

**`/familysynckids-plus-plus/app/`**

To jest właściwa aplikacja **FamilySyncKids++ Local 1.0**. Katalog `prototype/` służy tylko do prezentacji, a dawny `template/` przekierowuje do aplikacji.

## Pierwszy start

1. Otwórz aplikację.
2. W oknie pierwszego uruchomienia wpisz nick dziecka i nazwę rodzica.
3. Przejdź do **Panelu rodzica** i dodaj pierwsze zadania, rutyny, misje lub informację szkolną.
4. Przełącz się na **Panel dziecka** — wspólne rekordy pojawią się automatycznie.
5. Używaj przycisku **Kopia JSON**, aby okresowo zapisywać kopię danych.

## Obieg informacji

Jedna wspólna sprawa ma jeden rekord.

- rodzic dodaje zadanie → dziecko widzi je w swoim uproszczonym widoku,
- dziecko zmienia status na „Robię” lub „Gotowe” → rodzic widzi odpowiednio „W toku” lub „Gotowe”,
- dziecko wybiera „Potrzebuję pomocy” → rodzic dostaje sygnał w kolejce pomocy,
- wiadomość dziecka z flagą pomocy → pojawia się w inboxie i kolejce rodzica,
- check-in „Jaki miałem dzień?” → pojawia się w ostatnich check-inach rodzica,
- informacja szkolna wpisana przez rodzica → jest widoczna w Panelu dziecka.

## Co działa lokalnie

- zadania, statusy, priorytety i terminy,
- rutyny resetowane codziennie,
- wiadomości rodzic ↔ dziecko,
- kolejka „Potrzebuję pomocy”,
- check-in dnia,
- szybkie notatki,
- czytelnia i postęp,
- aktywność,
- timer i historia gry,
- misje, XP i osiągnięcia,
- szkoła,
- archiwum,
- eksport i import JSON,
- synchronizacja pomiędzy kartami tej samej przeglądarki,
- podstawowe działanie offline.

## Ważne ograniczenie

Local 1.0 **nie synchronizuje jeszcze automatycznie dwóch różnych urządzeń**. Dane są zapisane w `localStorage` konkretnej przeglądarki. Do przeniesienia danych na inne urządzenie użyj eksportu/importu JSON.

Prawdziwy multi-device wymaga osobnej, zabezpieczonej warstwy kont i synchronizacji.
