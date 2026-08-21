# Strategia testów — PrintFlow Control Center

## 1. Cel i poziom jakości

Celem jest potwierdzenie, że demonstracyjny proces Order-to-Cash działa spójnie od zapytania do zamknięcia, a błędy danych nie prowadzą do niewiarygodnych KPI lub utraty historii zmian. Projekt prezentuje warsztat QA na poziomie mocnego mida: analizę ryzyka, śledzenie wymagań, projektowanie testów, pracę z danymi, API, SQL, regresję, automatyzację CI i raportowanie defektów.

## 2. Zakres

Testowane są: 12 etapów procesu, sześć widoków ról, walidacja zamówienia, marża i alerty, filtry, historia statusów, endpointy HTTP, eksport JSON, baza SQLite i podstawowe zabezpieczenie ścieżek statycznych.

Poza zakresem: rzeczywiste logowanie i autoryzacja, testy obciążeniowe środowiska produkcyjnego, integracje płatnicze/KSeF, prawdziwe dane klientów i automatyzacja przeglądarkowa na wielu silnikach.

## 3. Podejście oparte na ryzyku

| Ryzyko | Wpływ | Prawdopodobieństwo | Priorytet | Kontrola |
|---|---:|---:|---:|---|
| Produkcja bez zaliczki | wysoki | średnie | P1 | alert finansowy od etapu Prepress |
| Produkcja bez akceptacji projektu | wysoki | średnie | P1 | alert od etapu Produkcja |
| Błędna marża lub koszt | wysoki | średnie | P1 | testy wyliczeń i danych granicznych |
| Utrata historii statusu | wysoki | niskie | P1 | test przejścia i tabeli `stage_history` |
| Dostęp roli do obcego etapu | średni | średnie | P2 | test filtrowania etapów ról |
| Nieprawidłowe dane wejściowe | średni | wysokie | P2 | testy negatywne i walidacja API |
| Ujawnienie prywatnych danych | wysoki | niskie | P1 | kontrola eksportu i syntetyczności |

## 4. Poziomy i techniki

- testy jednostkowe: walidacja, alerty, marża i role;
- testy integracyjne: Python + SQLite, zapis historii i eksport;
- testy API: statusy HTTP, kontrakt JSON i błędne żądania;
- testy funkcjonalne manualne: formularz, filtry, dashboard, role;
- techniki: klasy równoważności, wartości brzegowe, tablice decyzyjne, przejścia stanów i testowanie eksploracyjne.

## 5. Kryteria wejścia i wyjścia

Wejście: aplikacja uruchamia się lokalnie, baza demo może zostać odtworzona, konfiguracja JSON jest poprawna. Wyjście: 100% testów P1 zaliczonych, brak otwartych defektów krytycznych, regresja automatyczna zakończona sukcesem, eksport nie zawiera danych osobowych.

## 6. Środowisko i dane

Python 3.11+, biblioteka standardowa, SQLite i przeglądarka. Testy automatyczne tworzą odrębną tymczasową bazę. Wszystkie rekordy, identyfikatory, daty i kwoty są syntetyczne.

## 7. Raportowanie

Wynik automatyczny: raport tekstowy `unittest`. Wynik manualny: `TEST_CASES.csv`. Defekty przykładowe: `DEFECT_REPORTS.md`. Decyzję o wydaniu dokumentuje `TEST_SUMMARY.md`.
