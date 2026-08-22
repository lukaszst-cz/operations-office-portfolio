# Operations & Office Management Portfolio — Łukasz S.

Praktyczne, zanonimizowane portfolio kompetencji z obszaru koordynacji operacyjnej, administracji, floty, obsługi B2B, raportowania i cyfrowej organizacji pracy.

## Co pokazuje repozytorium

- **Koordynacja operacyjna:** zlecenia, priorytety, zasoby, terminy i rozliczenia.
- **Excel i raportowanie:** edytowalny dashboard KPI, formuły, tabele i wykresy.
- **Flota 2018–2024:** rejestr 18 pojazdów, w tym 3 kontenerowych z windą i kontrolą UDT.
- **Finansowanie:** symulacja 11 leasingów uruchomionych w latach 2018–2023.
- **Najem:** umowy dla klientów krajowych i zagranicznych, kaucje, potrącenia, płatności oraz protokoły wydania i zwrotu.
- **Taxi:** rejestr montażu taksometrów, legalizacji, urządzeń fiskalnych, oznakowania i kosztów serwisu.
- **Ryzyko i koszty:** ubezpieczenia, szkody, przestoje, pojazdy zastępcze oraz koszty eksploatacyjne.
- **Analizy okresowe:** porównania roczne, kwartalne, miesięczne, tygodniowe i dzienne z poprzednim oraz kolejnym okresem.
- **AI w pracy biurowej:** praktyczne wykorzystanie ChatGPT, Claude Code i OpenAI Codex przy zachowaniu kontroli merytorycznej i poufności danych.
- **Python, SQL i CSS:** miniaplikacja [Fleet Ops Desk](fleet-ops-desk/README.md) — lokalny panel SQLite do prezentacji floty, kosztów, najmu i leasingu.
- **PrintFlow 360:** zanonimizowany model Order-to-Cash dla przedsiębiorstwa poligraficzno-logistycznego — 44 arkusze, 499 pól, dashboard KPI, RACI, produkcja trzyzmianowa, rozliczenia pracowników, nieruchomość i flota.
- **PrintFlow QA — mocny mid:** strategia oparta na ryzyku, macierz śledzenia, bramki GO/NO-GO, 16 przypadków testowych, smoke i regresja, raporty defektów oraz 20 automatycznych testów Python uruchamianych w GitHub Actions.
- **TransportFlow 360:** kompletny proces transportu krajowego i międzynarodowego dla 20 zestawów (12 chłodni, 4 cysterny, 4 plandeki), 26 kierowców, najmu 14 taxi i 3 kontenerów z windą — Excel, PWA, Python/SQLite i QA.

## Portfolio online

Strona startowa znajduje się w pliku [`index.html`](index.html) i jest przygotowana do publikacji przez GitHub Pages.

### ZIELONA MARKA — strona demonstracyjna i portal PWA

Publiczny fragment portfolio pokazujący, jak model procesu poligraficznego można przełożyć na stronę prezentacyjną, portal statusów zleceń i panel działów:

- [Start tutaj — jedna strona prowadząca przez całe portfolio](https://lukaszst-cz.github.io/operations-office-portfolio/zielona-marka/udostepnij.html)
- [Strona demonstracyjna ZIELONEJ MARKI](https://lukaszst-cz.github.io/operations-office-portfolio/zielona-marka/)
- [Jak powstawał projekt — osobisty opis procesu](https://lukaszst-cz.github.io/operations-office-portfolio/zielona-marka/jak-powstal-projekt.html)
- [PrintFlow Portal — klient i działy](https://lukaszst-cz.github.io/operations-office-portfolio/zielona-marka/portal/)
- [Opis powstania aplikacji](https://lukaszst-cz.github.io/operations-office-portfolio/zielona-marka/portal/o-aplikacji.html)
- [Instrukcja PWA dla Androida, Apple i komputera](https://lukaszst-cz.github.io/operations-office-portfolio/zielona-marka/portal/instrukcja.html)
- [Pakiet QA portalu](zielona-marka/portal/qa/README.md)
- [Pracownia procesów: kalkulator i dashboard KPI](https://lukaszst-cz.github.io/operations-office-portfolio/zielona-marka/pracownia.html)
- [Case study PrintFlow: RACI, wyjątki, dokumenty, API i QA](https://lukaszst-cz.github.io/operations-office-portfolio/zielona-marka/case-study.html)

Portal PWA pokazuje dwie perspektywy: klienta sprawdzającego status pojedynczego zlecenia oraz działów pracujących na własnych kolejkach. Jest instalowalny na Androidzie, iPhonie i iPadzie bez Google Play ani App Store. Dane są syntetyczne, a lokalne zmiany zapisują się wyłącznie w przeglądarce.

### TransportFlow 360 — transport ciężki, taxi i kontenery

- [Strona startowa projektu](https://lukaszst-cz.github.io/operations-office-portfolio/transportflow-360/)
- [Transport ciężki i cykl życia zestawu](https://lukaszst-cz.github.io/operations-office-portfolio/transportflow-360/flota.html)
- [Najem taxi i samochody kontenerowe z windą](https://lukaszst-cz.github.io/operations-office-portfolio/transportflow-360/taxi-kontenery.html)
- [Portal ról i status klienta](https://lukaszst-cz.github.io/operations-office-portfolio/transportflow-360/portal/)
- [Artykuł o powstawaniu projektu](https://lukaszst-cz.github.io/operations-office-portfolio/transportflow-360/jak-powstal-projekt.html)
- [Skoroszyt TransportFlow 360](transportflow-360/assets/TransportFlow_360_demo.xlsx)
- [Aplikacja Python/SQLite i dokumentacja QA](transportflow-control-center/README.md)

## Przykład Excel

W katalogu `assets` znajduje się edytowalny skoroszyt `dashboard_operacyjny_demo.xlsx`. Zawiera 10 połączonych arkuszy: Dashboard, Pojazdy, Serwis i terminy, Koszty, Szkody i najem, Najem i umowy, Leasing i taxi, Analizy okresowe, Słowniki i Instrukcja.

## PrintFlow 360 — pełny skoroszyt

Plik [`ZIELONA_MARKA_PrintFlow_360_demo.xlsx`](assets/ZIELONA_MARKA_PrintFlow_360_demo.xlsx) zawiera 44 połączone arkusze, 499 zdefiniowanych pól, dashboard KPI, instrukcje działowe, macierz RACI oraz syntetyczne dane procesu poligraficzno-logistycznego.

Skoroszyt jest publicznym materiałem demonstracyjnym. Wszystkie osoby, klienci, pracownicy, pojazdy, umowy, dokumenty, daty operacyjne i kwoty jednostkowe są losowe lub zanonimizowane. Plik nie zawiera makr, połączeń zewnętrznych ani metadanych autora.

### Model odpowiedzialności i dostępu

W rzeczywistym sposobie pracy poszczególne osoby korzystały tylko z arkuszy, zakresów i informacji przypisanych do ich działu oraz odpowiedzialności. Handel, DTP, produkcja, jakość, magazyn, logistyka, kadry, księgowość i flota pracowały na właściwych dla siebie częściach procesu.

Twórca systemu i właściciel procesu miał pełny dostęp do całego skoroszytu: parametrów, słowników, kontroli, dashboardu, rentowności, kosztów, rozliczeń i raportowania zarządczego. Publiczny plik demonstracyjny pokazuje pełną architekturę wyłącznie po to, aby zaprezentować sposób zaprojektowania rozwiązania.

W danych demonstracyjnych znajduje się m.in. 168 rekordów kosztowych z lat 2018–2024, 21 umów najmu, 11 leasingów oraz 5 przykładów wyposażenia samochodów do pracy taxi.

> Wszystkie kwoty, daty i identyfikatory są symulacją. Portfolio nie zawiera rzeczywistych rejestracji, VIN, danych klientów, pracowników, finansujących, ubezpieczycieli ani poufnych dokumentów firmowych.

## Studia przypadku

1. [Koordynacja operacji i floty](case-studies/01-operacje-i-flota.md)
2. [Dokumentacja transportowa](case-studies/02-dokumentacja-transportowa.md)
3. [Obsługa kluczowych klientów i produkcja](case-studies/03-obsluga-b2b-i-produkcja.md)
4. [Second Brain i cyfrowa organizacja informacji](case-studies/04-second-brain.md)
5. [ZIELONA MARKA PrintFlow 360](case-studies/05-printflow-360.md)
6. [TransportFlow 360 — od zapytania do zapłaty](case-studies/06-transportflow-360.md)

## Kontakt

- [LinkedIn](https://www.linkedin.com/in/%C5%82ukasz-st-cz-300ab6428/)
- [GitHub](https://github.com/lukaszst-cz)
