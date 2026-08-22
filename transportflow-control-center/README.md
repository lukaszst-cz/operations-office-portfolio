# TransportFlow Control Center

Lokalna aplikacja demonstracyjna Python + SQLite pokazująca:

- 20 zestawów: 12 chłodni, 4 cysterny i 4 plandeki;
- 26 pracowników-kierowców;
- zlecenia kontraktowe i giełdowe;
- koszty, ceny i marżę;
- dokumenty, terminy oraz blokady procesu;
- terminy odczytu kart kierowców i danych pojazdów;
- API JSON do odczytu dashboardu i zleceń.
- rozdzielenie widoków klienta, handlu, dyspozycji, kierowcy, floty, zgodności, finansów, najmu i właściciela.

Wszystkie dane są syntetyczne. Aplikacja nie jest produkcyjnym TMS-em.

Publiczna wersja portfolio demonstruje role na przełączniku, ale nie udaje produkcyjnego zabezpieczenia. Rzeczywiste wdrożenie wymaga logowania, RBAC po stronie serwera, szyfrowania, kopii zapasowych, dziennika audytowego i integracji z telematyką/GPS. Klient powinien widzieć lokalizację pojazdu realizującego jego zlecenie, a nie prywatną lokalizację kierowcy.

## Uruchomienie

```powershell
python app.py
```

Następnie otwórz `http://127.0.0.1:8025`.

## Kontrola danych

```powershell
python app.py --check
```

## Testy

```powershell
python -m unittest discover -s tests -v
```

Dokumentacja QA znajduje się w katalogu `qa/`.
