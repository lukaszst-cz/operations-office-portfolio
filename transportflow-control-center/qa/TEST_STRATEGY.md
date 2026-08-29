# Strategia testów, TransportFlow 360

## Cel

Potwierdzić, że demonstracja przedstawia spójny proces transportowy, kontroluje krytyczne bramki i nie ujawnia prawdziwych danych osób ani firm.

## Zakres

- proces od RFQ do zapłaty;
- flota 20 zestawów: 12 chłodni, 4 cysterny i 4 plandeki;
- 26 kierowców;
- odczyt kart kierowców maksymalnie co 28 dni i jednostek pojazdowych co 90 dni;
- CKZ, licencje, CMR/POD, ATP, ADR/TDT, SENT, UDT i dokumenty pojazdu;
- kalkulacja kosztu, minimalnej ceny i marży;
- moduły taxi/kontenery oddzielone od transportu ciężkiego;
- dostęp oparty na rolach;
- anonimizacja i dane syntetyczne.

## Poziomy testów

1. Testy jednostkowe Python, obliczenia, liczebność floty, dokumenty i konfiguracja.
2. Testy integracyjne, Python/SQLite/API JSON oraz spójność statusów.
3. Testy statyczne strony, linki, wymagane podstrony, 28/90 dni, role i komunikaty o danych demonstracyjnych.
4. Testy arkusza, formuły, checki, listy rozwijane, formaty, dashboard i brak błędów formuł.
5. Testy akceptacyjne, przejście scenariusza klienta, dyspozytora, kierowcy, floty, finansów i właściciela.

## Kryteria wejścia i wyjścia

- Wejście: zatwierdzona specyfikacja, dane syntetyczne, komplet wymaganych modułów.
- Wyjście: wszystkie testy automatyczne przechodzą, checki skoroszytu mają status PASS, wszystkie publiczne odsyłacze są poprawne, a ograniczenia demonstracji są jawnie opisane.

## Ryzyka poza zakresem demonstracji

- rzeczywista autoryzacja i logowanie;
- aktualna integracja GPS/telematyczna;
- produkcyjna wysyłka faktur, powiadomień i dokumentów;
- ocena prawna dla konkretnego ładunku, kraju i dnia realizacji.
