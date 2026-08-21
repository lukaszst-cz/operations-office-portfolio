# Bramki jakości i model decyzji GO/NO-GO

## Bramka 1 — kod i konfiguracja

- pliki Python i JSON są poprawne składniowo;
- konfiguracja zawiera dokładnie 12 unikalnych etapów;
- repozytorium nie zawiera bazy runtime ani danych osobowych.

## Bramka 2 — automatyzacja

- 20/20 testów automatycznych zakończonych powodzeniem;
- każdy test korzysta z izolowanej bazy tymczasowej;
- testy P1 obejmują workflow, finanse, audyt, role, integralność i eksport.

## Bramka 3 — regresja manualna

- smoke wykonany bez defektu blokującego;
- testy mobilne i klawiaturowe zaliczone;
- brak błędów konsoli w głównym przepływie.

## Bramka 4 — ryzyko i prywatność

- brak otwartych defektów krytycznych lub wysokich bez akceptacji ryzyka;
- eksport oznaczony jako syntetyczny;
- brak e-maili, PESEL, REGON, VIN i rzeczywistych danych klientów.

## Decyzja

- **GO**: wszystkie bramki spełnione;
- **GO warunkowe**: wyłącznie zaakceptowane defekty P3 z planem korekty;
- **NO-GO**: niezaliczony test P1, niespójne KPI, utrata audytu albo ryzyko ujawnienia danych.
