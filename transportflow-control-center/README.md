# TransportFlow Control Center

Rozwijany system demonstracyjny TMS/CRM dla firmy transportowej zarządzającej flotą około 50 zestawów ciężarowych.

Projekt łączy operacje transportowe, relacje z klientami, e-CRM kierowców, flotę, dokumenty i finanse w jednym panelu. Wszystkie rekordy, firmy, osoby, trasy, kwoty i identyfikatory są syntetyczne.

## Zakres demonstratora

- dashboard operacyjny i alerty;
- 50 zestawów: 30 chłodni, 10 plandek, 5 cystern spożywczych i 5 cystern ADR;
- 58 kart kierowców z dostępnością, przypisaniami, czasem pracy i dokumentami;
- 12 klientów w CRM z etapami relacji, limitami i należnościami;
- rejestr zleceń z trasą, pojazdem, kierowcą, statusem, ETA, kosztem i marżą;
- pulpit KPI dla zarządzających: przychód, marża, wykorzystanie floty, puste kilometry, należności, terminy płatności i ryzyka zgodności;
- kolejka należności z warunkami płatności, pozycjami po terminie i sprawami do kontaktu;
- pełna mapa obiegu dokumentów od zapytania do płatności i archiwum;
- macierz ośmiu ról systemowych;
- trwały model relacyjnej bazy danych i dziennik audytowy;
- możliwość instalacji jako PWA;
- responsywny interfejs dla komputera, tabletu i telefonu.

## Role

- właściciel / administrator;
- dyspozytor;
- handlowiec;
- kadry / e-CRM;
- flota / serwis;
- księgowość;
- kierowca;
- klient.

Kierowca w portalu demonstracyjnym widzi wyłącznie własne zlecenia, pojazd, zadania, czas pracy, dokumenty oraz możliwość przekazania cyfrowego potwierdzenia lub pliku po dostawie. Klient widzi wyłącznie dane własnej firmy i swoich przewozów. Kontrola dostępu po stronie serwera jest wymagana przed wdrożeniem produkcyjnym.

## Obieg dokumentów

1. zapytanie i dane ładunku;
2. wycena i oferta;
3. zlecenie klienta i instrukcja transportowa;
4. kontrola dokumentów firmy, pojazdu i kierowcy;
5. załadunek, CMR, WZ i certyfikaty specjalistyczne;
6. dokumenty oraz zdarzenia trasy;
7. dostawa i POD;
8. faktura, płatność i archiwum.

Dokument ma zakres, właściciela, etap procesu, termin, status, wersję, miejsce zapisu i regułę blokady. Historia zdarzeń przechowuje zmiany, autora i czas operacji.

## Uruchomienie lokalne

```powershell
pnpm install
pnpm dev
```

Następnie otwórz `http://localhost:3000`.

## Kontrola jakości

```powershell
pnpm build
pnpm test
```

## Architektura

- interfejs: React, TypeScript i vinext;
- trwałe dane: relacyjna baza D1;
- pliki dokumentów: magazyn obiektowy R2;
- model danych: Drizzle ORM i wersjonowane migracje;
- instalacja mobilna: manifest PWA i service worker;
- wdrożenie: aplikacja zgodna ze środowiskiem Cloudflare Workers.

## Status i ograniczenia

To nadal wersja demonstracyjna, a nie gotowy produkt do obsługi prawdziwych przewozów. Przed wdrożeniem firmowym wymagane są: produkcyjne logowanie, serwerowe uprawnienia, szyfrowanie, kopie zapasowe, polityki retencji, monitoring, testy bezpieczeństwa, analiza prawna oraz integracje z telematyką, księgowością, paliwem i systemami zewnętrznymi.

Pierwszy prototyp Python i SQLite został zachowany w katalogu `legacy-python/` jako historia rozwoju projektu.
