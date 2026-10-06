# FamilySyncKids++

**Dwa panele. Jedna rodzina. Mniej przypominania.**

FamilySyncKids++ to privacy-first system organizacji dla rodzica i dziecka. Dziecko dostaje prosty panel codzienny, a rodzic pełniejszy widok wspólnych spraw, terminów i rzeczy wymagających pomocy.

Projekt powstał jako oczyszczona, uniwersalna kopia funkcjonalna rzeczywistego systemu rodzinnego — bez danych konkretnego dziecka, szkoły czy rodziny.

## Strona projektu

Po opublikowaniu repo jako statycznej strony główny plik `index.html` jest landing page FamilySyncKids++.

Na stronie są:
- opis produktu,
- interaktywny podgląd Panelu dziecka i Panelu rodzica,
- sekcja „Jak to działa”,
- funkcje,
- model prywatności,
- FAQ,
- link do demo,
- pobieranie pustego template.

## Wypróbuj

- [Demo](prototype/index.html) — przykładowe dane, dwa panele i interakcje
- [Pusty template](template/index.html) — wersja do użycia z własnym dzieckiem
- [Instrukcja startowa](docs/GETTING-STARTED.md)

## Panel dziecka

- START / szybki dostęp
- Mój dzień i 7 dni
- rutyny
- szkoła
- czytelnia
- aktywność
- czas gry START / STOP
- szybka notatka
- **„Jaki miałem dzień?”** — buźka + jedno zdanie
- Rodzic i ja / wspólny inbox
- **„Potrzebuję pomocy”**
- Lobby / XP / misje / osiągnięcia / przywileje

Pełna mapa: [docs/PANEL-DZIECKA.md](docs/PANEL-DZIECKA.md)

## Panel rodzica

- „Co u dziecka”
- pełne statusy i terminy
- rzeczy wymagające pomocy
- szkoła — widok organizacyjny
- czytanie, aktywność, czas gry i check-iny
- wspólny inbox
- zarządzanie misjami
- prywatna warstwa rodzica
- archiwum

Pełna mapa: [docs/PANEL-RODZICA.md](docs/PANEL-RODZICA.md)

## Jedna sprawa = jeden rekord

Panele nie duplikują wspólnych informacji.

Pełny obieg rodzica:

`Do zrobienia → W toku → Czeka → Gotowe → Archiwum`

Uproszczony widok dziecka:

`Do zrobienia → Robię → Gotowe`

Widoczność:
- **Dziecko**
- **Wspólne**
- **Tylko rodzic**

Do rekordu mogą należeć także: właściciel, termin, priorytet i flaga „Potrzebuję pomocy”.

Więcej: [docs/INTERAKCJE.md](docs/INTERAKCJE.md) oraz [docs/ACCESS-MATRIX.md](docs/ACCESS-MATRIX.md).

## Pobierz pustą wersję

Najprostszy start:

1. Pobierz `template/index.html`.
2. Otwórz plik w przeglądarce.
3. Wpisz nick dziecka oraz nazwę rodzica.
4. Dodaj własne rutyny, zadania, szkołę, książki i pozostałe moduły.
5. Używaj **Eksport JSON** jako kopii zapasowej.

Template działa lokalnie i nie wymaga backendu ani konta.

## Prywatność

Podstawowa wersja jest **local-first**. Dane są przechowywane w przeglądarce użytkownika.

Repo nie zawiera:
- danych realnego dziecka,
- adresów,
- szkoły, klasy ani nauczycieli powiązanych z realną osobą,
- realnych ocen i frekwencji,
- zdjęć i nagrań,
- danych zdrowotnych,
- dokumentów rodzinnych lub formalnych,
- prywatnych URL Notion/Drive,
- eksportów użytkowników.

Zobacz [SECURITY.md](SECURITY.md) i [docs/PRIVACY.md](docs/PRIVACY.md).

## Dokumentacja

- [BRAND.md](BRAND.md) — marka FamilySyncKids++
- [ROADMAP.md](ROADMAP.md) — kierunek rozwoju
- [CHANGELOG.md](CHANGELOG.md) — historia zmian
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — architektura
- [PANEL-DZIECKA.md](docs/PANEL-DZIECKA.md)
- [PANEL-RODZICA.md](docs/PANEL-RODZICA.md)
- [INTERAKCJE.md](docs/INTERAKCJE.md)
- [NOTION-SCHEMA.md](docs/NOTION-SCHEMA.md)
- [ACCESS-MATRIX.md](docs/ACCESS-MATRIX.md)
- [GETTING-STARTED.md](docs/GETTING-STARTED.md)

## Status

Aktualny etap: **produkt demonstracyjny + pusty template + gotowa strona statyczna**.

Repo `xyz` pozostaje obecnie prywatne. Publiczna publikacja i produkcyjny hosting są oddzielną decyzją właściciela.
