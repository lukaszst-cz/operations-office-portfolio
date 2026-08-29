# ZIELONA MARKA PrintFlow Control Center

Mała aplikacja demonstracyjna pokazująca proces obsługi zlecenia poligraficznego od zapytania i oferty do produkcji, logistyki, faktury i zamknięcia.

## Co prezentuje projekt

- **Python**, API, logika procesu, walidacja i obliczenia;
- **SQLite / SQL**, zlecenia i historia zmian statusu;
- **JSON**, konfiguracja etapów, ról, produktów i transportu oraz eksport danych;
- **HTML, CSS i JavaScript**, responsywny interfejs aplikacji;
- **model odpowiedzialności**, właściciel widzi całość, a role operacyjne przypisane etapy;
- **kontrolę procesu**, alerty zaliczki, akceptacji projektu, terminu i niskiej marży.

Wszystkie dane i identyfikatory są **syntetyczne**. Projekt nie zawiera prawdziwych klientów, pracowników, zamówień, dokumentów ani danych finansowych firmy.

## Uruchomienie

Nie są wymagane żadne zewnętrzne biblioteki. W katalogu projektu uruchom:

```powershell
python app.py
```

Następnie otwórz `http://127.0.0.1:8010`.

## Portfolio QA, warsztat mocnego mida

Projekt zawiera kompletny pakiet jakościowy przygotowany w stylu pracy QA:

- strategię testów i macierz ryzyka P1–P3;
- 16 przypadków testowych: pozytywnych, negatywnych, granicznych i eksploracyjnych;
- checklistę smoke oraz regresji procesu i interfejsu;
- przykładowe raporty defektów z priorytetem, dotkliwością i rekomendacją;
- 20 automatycznych testów Python obejmujących logikę, API, SQLite, role, alerty, eksport i bezpieczeństwo ścieżek;
- macierz śledzenia wymagań, bramki jakości GO/NO-GO i workflow GitHub Actions;
- podsumowanie testów z kryteriami decyzji GO/NO-GO.

Materiały znajdują się w katalogu [`qa`](qa/TEST_STRATEGY.md), a testy automatyczne w [`tests`](tests/test_printflow.py).

## Uruchomienie testów

```powershell
python -m unittest discover -s tests -v
```

Testy korzystają z osobnej tymczasowej bazy SQLite i nie modyfikują danych demonstracyjnych aplikacji.

## Kontrola demonstracji

```powershell
python app.py --reset --check
```

Kontrola sprawdza 30 syntetycznych zamówień, 12 etapów procesu, widoki ról, alerty, marżę i eksport JSON.

## Najważniejsze endpointy

- `GET /api/dashboard?role=Właściciel`, KPI dla wybranej roli;
- `GET /api/orders`, lista i filtry zleceń;
- `POST /api/orders`, utworzenie nowego zapytania;
- `POST /api/orders/{id}/advance`, przejście do następnego etapu;
- `GET /api/export`, pobranie zanonimizowanego eksportu JSON.

## Zakres wersji portfolio

To aplikacja portfolio, a nie system produkcyjny. Wybór roli demonstruje filtrowanie procesu, ale nie jest technicznym mechanizmem uwierzytelniania ani kontroli dostępu. Kolejny etap może objąć rzeczywiste RBAC, import XLSX/JSON, historię zmian w interfejsie i raporty okresowe.
