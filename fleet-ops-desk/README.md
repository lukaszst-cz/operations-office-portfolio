# Fleet Ops Desk, Python + SQLite + CSS

Mała, lokalna aplikacja demonstracyjna do zarządzania flotą. Pokazuje praktyczne użycie:

- **Python**, logika aplikacji i lokalny serwer HTTP bez zewnętrznych bibliotek;
- **SQLite / SQL**, pojazdy, koszty, najem oraz leasing;
- **HTML i CSS**, responsywny panel operacyjny;
- **JavaScript**, filtrowanie rejestru pojazdów w przeglądarce.

Wszystkie rekordy są generowane przez aplikację jako **dane demonstracyjne**. Baza `fleet_demo.sqlite3` powstaje lokalnie przy pierwszym uruchomieniu i nie jest wersjonowana.

## Uruchomienie

W katalogu `fleet-ops-desk` uruchom:

```powershell
python app.py
```

Następnie otwórz w przeglądarce: `http://127.0.0.1:8000`.

## Kontrola danych

```powershell
python app.py --check
```

Polecenie tworzy bazę, wykonuje zapytania kontrolne i sprawdza, że zakres demonstracji zawiera 18 pojazdów, 3 kontenery z windą, 11 leasingów oraz umowy najmu i koszty.
