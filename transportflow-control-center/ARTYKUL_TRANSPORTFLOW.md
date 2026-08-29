# TransportFlow. Jeden system, który porządkuje transport od zapytania do płatności

W transporcie najwięcej czasu nie znika na samej trasie. Znika między telefonem, wiadomością, arkuszem, dokumentem, kierowcą, dyspozytorem i księgowością. Każdy ma swoją część pracy, ale kiedy dane są rozproszone, cała firma pracuje wolniej, a właściciel często dowiaduje się o problemie dopiero wtedy, gdy problem kosztuje pieniądze.

Właśnie dlatego powstał TransportFlow. To system TMS i CRM dla firm transportowych, który łączy operacje, flotę, kierowców, klientów, dokumenty i finanse w jednym miejscu. Nie chodzi o kolejny panel z tabelkami. Chodzi o codzienne narzędzie, które pozwala szybciej podejmować decyzje i spokojniej prowadzić firmę.

## Od czego zaczęliśmy

Punktem wyjścia była firma z flotą około 50 zestawów ciężarowych. W systemie uwzględniliśmy 30 chłodni, 10 plandek, 5 cystern spożywczych i 5 cystern ADR. To ważne, ponieważ każda z tych grup pracuje inaczej, ma inne dokumenty, wymagania i ryzyka.

Od początku założyliśmy też, że system ma obsługiwać wielu kierowców. Każdy z nich docelowo otrzymuje własny dostęp i widzi tylko swoje zlecenia, pojazd, zadania, dokumenty oraz rozliczenia. Dzięki temu kierowca nie musi dzwonić z każdą prostą sprawą, a dyspozytor nie musi ręcznie przekazywać tej samej informacji kilka razy.

## Co znajduje się w systemie

TransportFlow porządkuje cały cykl zlecenia. Od pierwszego zapytania klienta, przez wycenę i planowanie, aż po potwierdzenie dostawy, fakturę, płatność i archiwum.

W części operacyjnej można prowadzić zlecenia, widzieć trasę, przypisany pojazd, kierowcę, status realizacji, ETA, koszty i marżę. Dyspozytor od razu widzi, co jest zaplanowane, co jest w trasie, co wymaga działania i gdzie pojawiła się blokada.

Moduł floty pokazuje dostępność pojazdów, przebiegi, spalanie, terminy serwisowe i koszty stałe. Dzięki temu łatwiej podjąć decyzję, który zestaw skierować do kolejnego zlecenia i gdzie może pojawić się przestój.

E-CRM kierowców to nie tylko lista osób. To indywidualne karty kierowców z dostępnością, przypisaniami, czasem pracy, dokumentami i ostrzeżeniami. W praktyce oznacza to mniej sytuacji, w których kierowca zostaje przypisany do pracy mimo brakującego dokumentu albo zbliżającego się terminu badania.

CRM klientów pozwala prowadzić relacje handlowe, oferty, limity kredytowe, historię kontaktów i miesięczny wolumen współpracy. Firma nie widzi już klienta tylko jako pojedynczego zlecenia. Widzi pełną relację, jej potencjał i ryzyko.

## Dokumenty bez szukania po wiadomościach

Jednym z najważniejszych elementów jest pełny obieg dokumentów. System prowadzi dokument od zapytania, przez ofertę i zlecenie, aż do CMR, WZ, certyfikatów, potwierdzenia dostawy, faktury i archiwum.

Dokument można przypisać do firmy, pojazdu, kierowcy albo konkretnego zlecenia. Ma on status, termin, wersję oraz informację, czy brak dokumentu blokuje proces. Jeżeli brakuje certyfikatu wymaganego do załadunku, system jasno pokazuje blokadę. Nie trzeba odkrywać jej w ostatniej chwili.

Kierowca po zakończeniu zlecenia może przekazać cyfrowe potwierdzenie wykonania albo dołączyć zdjęcie czy plik PDF, na przykład podpisany dokument dostawy. To skraca drogę dokumentu od samochodu do biura i przyspiesza rozliczenie z klientem.

## KPI, które pomagają zarządzać, a nie tylko patrzeć na liczby

Dobry system dla transportu powinien pomagać właścicielowi i kierownictwu reagować zanim problem urośnie. Dlatego powstał osobny pulpit KPI.

W jednym widoku można sprawdzić przychód z aktywnych zleceń, marżę operacyjną, wykorzystanie floty, puste kilometry, należności, pozycje po terminie oraz ryzyko dokumentowe. Każdy wskaźnik prowadzi dalej, bezpośrednio do źródłowego rejestru.

W finansach jest kolejka płatności z warunkami handlowymi klienta, terminem płatności, należnościami po terminie i sprawami wymagającymi kontaktu. Dzięki temu kontrola pieniądza nie kończy się na wystawionej fakturze. Właściciel widzi, co powinno wpłynąć, kiedy i gdzie trzeba zareagować.

## Dostęp z telefonu i wygoda pracy w trasie

System został przygotowany jako PWA. Oznacza to, że można go zainstalować na telefonie lub tablecie i używać w wygodnej, mobilnej formie. To szczególnie ważne dla kierowców, którzy potrzebują prostego widoku swoich zadań, a nie rozbudowanego panelu biurowego.

Klient również ma osobny widok. Zobaczy tylko własne przewozy, etap realizacji, ETA i dokumenty dotyczące jego firmy. Nie widzi wewnętrznych kosztów, marż ani danych innych klientów.

## Z czego korzystałem podczas budowy

Interfejs powstał w React i TypeScript. Dzięki temu system jest szybki, responsywny i łatwiejszy do dalszej rozbudowy. Warstwa aplikacyjna została przygotowana z użyciem Vinext oraz środowiska Cloudflare Workers.

Dane są projektowane dla relacyjnej bazy D1, a dokumenty dla magazynu plików R2. Model danych i migracje obsługuje Drizzle ORM. Dla części mobilnej przygotowany został manifest instalacyjny i service worker, czyli fundament PWA.

To nie są technologie użyte dla samej technologii. Każda z nich ma konkretny cel. Stabilne dane, możliwość rozbudowy, szybki dostęp, obsługa dokumentów oraz gotowość do wdrożenia w firmie transportowej, która chce rosnąć.

## Co to daje firmie transportowej

Największą wartością nie jest sam ekran. Wartością jest krótszy czas operacyjny. Mniej telefonów z pytaniem o status. Mniej szukania dokumentów. Mniej zleceń prowadzonych w kilku miejscach. Mniej niespodzianek przy płatnościach i terminach.

TransportFlow ma dać właścicielowi kontrolę, dyspozytorowi porządek, kierowcy prostotę, księgowości komplet dokumentów, a klientowi poczucie, że współpracuje z firmą dobrze zorganizowaną.

To jest kierunek dla firm, które nie chcą już tylko obsługiwać transportu. Chcą prowadzić go mądrzej, szybciej i z większym spokojem.

## Co dalej

Obecna wersja jest kompletnym demonstratorem funkcjonalnym i dobrym punktem do prezentacji dla potencjalnych klientów. Przed uruchomieniem na prawdziwych danych należy podłączyć produkcyjne logowanie, serwerowe uprawnienia, kopie zapasowe oraz wybrane integracje, na przykład telematykę, księgowość, paliwo lub wymianę dokumentów z partnerami.

Najważniejsze jest jednak już gotowe: wspólna logika pracy transportu, dokumentów, relacji i finansów. Teraz można rozwijać ją dokładnie w kierunku potrzeb konkretnej firmy.
