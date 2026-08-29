# PrintFlow Control Center, API demonstracyjne

Lokalne API aplikacji portfolio uruchamianej przez `python app.py`. Wszystkie odpowiedzi i dane wejściowe są demonstracyjne oraz syntetyczne. Nie jest to publiczne API produkcyjne i nie zawiera uwierzytelniania.

## Konfiguracja procesu

`GET /api/config`

Zwraca etapy, role, rodzaje produktów i transportu z pliku JSON konfiguracji.

## Dashboard

`GET /api/dashboard?role=Właściciel`

Zwraca liczbę zleceń, wartość modelową, marżę, alerty i podział według etapów. Parametr `role` pokazuje demonstracyjne filtrowanie etapów; nie jest mechanizmem kontroli dostępu.

## Lista zleceń

`GET /api/orders?role=Właściciel&q=KLIENT-01&stage=Produkcja`

Parametry opcjonalne:

- `role`, widok demonstracyjny roli;
- `q`, wyszukiwanie po kodzie zlecenia, kliencie lub produkcie;
- `stage`, dokładny etap procesu.

## Utworzenie zapytania

`POST /api/orders`

Przykładowe dane JSON:

```json
{
  "client_code": "KLIENT-DEMO-10",
  "product_type": "Katalog",
  "quantity": 1000,
  "deadline": "2026-09-15",
  "net_value": 5000,
  "transport_type": "Kurier"
}
```

Walidowane są wymagane pola, dodatni nakład i wartość, data oraz zgodność produktu i transportu z konfiguracją. Sukces zwraca `201 Created`; błąd walidacji `400 Bad Request`.

## Przejście etapu

`POST /api/orders/{id}/advance`

```json
{ "role": "Produkcja" }
```

Zmienia etap na kolejny, zapisuje wpis w historii i weryfikuje demonstracyjny zakres roli.

## Eksport

`GET /api/export`

Pobiera plik JSON z konfiguracją procesu oraz syntetycznymi zleceniami. Odpowiedź zawiera metadane `synthetic-demo`.

## Granice wersji portfolio

Przed użyciem z prawdziwymi klientami potrzebne są m.in. HTTPS, konta użytkowników, RBAC, centralna baza, backup, monitoring, rate limiting, logowanie audytowe i analiza RODO.
