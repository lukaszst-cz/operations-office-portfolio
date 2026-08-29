# PrintFlow Portal PWA, pakiet QA

Pakiet opisuje kontrolę jakości publicznej, demonstracyjnej aplikacji PWA. Dotyczy wyłącznie danych syntetycznych i nie potwierdza gotowości do przetwarzania danych rzeczywistych klientów.

## Zawartość

- [Plan i protokół testów](TEST_PROTOCOL.md)
- [Przypadki testowe](TEST_CASES.md)
- [Raport wykonania testów](EXECUTION_REPORT.md)
- [Automatyczne kontrole statyczne](static_checks.mjs)

## Uruchomienie kontroli automatycznych

```powershell
node qa/static_checks.mjs
```

## Zakres

Kontrole obejmują podstawową strukturę PWA, manifest, aktualizację service workera, widoki klienta i działów, stan dostępności interfejsu, dane demonstracyjne oraz odnośniki do instrukcji. Testy urządzeń mobilnych (instalacja na Androidzie i Apple) wymagają potwierdzenia na fizycznych urządzeniach.

> Wersja portfolio nie ma kont użytkowników, centralnej bazy, autoryzacji ani backendu produkcyjnego. Testy nie zastępują audytu bezpieczeństwa, RODO ani testów akceptacyjnych dla realnego wdrożenia.
