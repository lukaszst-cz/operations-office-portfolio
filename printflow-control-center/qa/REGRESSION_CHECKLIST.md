# Checklista smoke i regresji

## Smoke przed każdym wydaniem

- [ ] Aplikacja startuje bez błędu i wyświetla dashboard.
- [ ] Widok właściciela pokazuje 30 syntetycznych zleceń po resecie.
- [ ] Można dodać poprawne zapytanie.
- [ ] Nie można zapisać zerowego nakładu ani wartości.
- [ ] Przejście statusu zapisuje się w historii.
- [ ] Filtr roli ogranicza widoczne etapy.
- [ ] Eksport JSON zawiera oznaczenie `synthetic-demo`.
- [ ] Nie są widoczne prawdziwe nazwiska, e-maile, VIN, PESEL ani REGON.

## Regresja procesu

- [ ] Wszystkie 12 etapów jest zgodnych z `workflow.json`.
- [ ] Zaliczka jest kontrolowana od etapu Prepress.
- [ ] Akceptacja projektu jest kontrolowana od Produkcji.
- [ ] Termin przeterminowany i zagrożony generuje właściwy alert.
- [ ] Marża poniżej 18% generuje alert.
- [ ] Zamknięte zlecenie nie przechodzi dalej.
- [ ] Wyszukiwanie i filtr etapu działają jednocześnie.
- [ ] Kod klienta jest normalizowany do wielkich liter.
- [ ] Dashboard jest zgodny z listą zleceń.
- [ ] Próba odczytu pliku spoza katalogu statycznego zwraca 404.

## Regresja interfejsu

- [ ] Widok desktopowy 1440 px jest czytelny.
- [ ] Widok mobilny 375 px nie traci funkcji.
- [ ] Formularz można obsłużyć klawiaturą.
- [ ] Komunikaty błędów są widoczne i zrozumiałe.
- [ ] Brak błędów JavaScript w konsoli przy typowym przepływie.
