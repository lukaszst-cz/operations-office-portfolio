# ZIELONA MARKA PrintFlow Control Center

Mała aplikacja demonstracyjna pokazująca proces obsługi zlecenia poligraficznego od zapytania i oferty do produkcji, logistyki, faktury i zamknięcia.

## Co prezentuje projekt

- **Python** — API, logika procesu, walidacja i obliczenia;
- **SQLite / SQL** — zlecenia i historia zmian statusu;
- **JSON** — konfiguracja etapów, ról, produktów i transportu oraz eksport danych;
- **HTML, CSS i JavaScript** — responsywny interfejs aplikacji;
- **model odpowiedzialności** — właściciel widzi całość, a role operacyjne przypisane etapy;
- **kontrolę procesu** — alerty zaliczki, akceptacji projektu, terminu i niskiej marży.

Wszystkie dane i identyfikatory są **syntetyczne**. Projekt nie zawiera prawdziwych klientów, pracowników, zamówień, dokumentów ani danych finansowych firmy.

## Uruchomienie

Nie są wymagane żadne zewnętrzne biblioteki. W katalogu projektu uruchom:

```powershell
python app.py
```

Następnie otwórz `http://127.0.0.1:8010`.

## Kontrola demonstracji

```powershell
python app.py --reset --check
```

Kontrola sprawdza 30 syntetycznych zamówień, 12 etapów procesu, widoki ról, alerty, marżę i eksport JSON.

## Najważniejsze endpointy

- `GET /api/dashboard?role=Właściciel` — KPI dla wybranej roli;
- `GET /api/orders` — lista i filtry zleceń;
- `POST /api/orders` — utworzenie nowego zapytania;
- `POST /api/orders/{id}/advance` — przejście do następnego etapu;
- `GET /api/export` — pobranie zanonimizowanego eksportu JSON.

## Zakres pierwszej wersji

To celowo niewielka aplikacja portfolio, a nie system produkcyjny. Kolejny etap może objąć import XLSX/JSON, historię zmian w interfejsie, uwierzytelnianie demonstracyjne, raporty okresowe i automatyczne testy jednostkowe.
