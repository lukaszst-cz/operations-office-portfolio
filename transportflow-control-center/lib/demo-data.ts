export type VehicleStatus = "W trasie" | "Baza" | "Serwis";
export type DriverStatus = "W trasie" | "Dostępny" | "Urlop" | "Chorobowe" | "Szkolenie";

export type Vehicle = {
  id: string;
  registration: string;
  type: string;
  make: string;
  year: number;
  status: VehicleStatus;
  driverId: string;
  odometer: number;
  fuelAverage: number;
  nextService: string;
  monthlyLease: number;
};

export type Driver = {
  id: string;
  name: string;
  initials: string;
  base: string;
  status: DriverStatus;
  assignedVehicle: string;
  currentOrder: string;
  hoursWeek: number;
  hoursTwoWeeks: number;
  documentCompleteness: number;
  cardDue: string;
  medicalDue: string;
  accountStatus: "Aktywne" | "Zaproszenie wysłane" | "Wstrzymane";
  compliance: "Zgodny" | "Uwaga" | "Blokada";
};

export type Customer = {
  id: string;
  name: string;
  segment: string;
  owner: string;
  stage: "Klient aktywny" | "Oferta" | "Lead" | "Wstrzymany";
  paymentDays: number;
  creditLimit: number;
  openBalance: number;
  ordersMonth: number;
  lastContact: string;
};

export type TransportOrder = {
  id: string;
  customerId: string;
  customer: string;
  route: string;
  vehicle: string;
  driver: string;
  status: "Planowane" | "Załadunek" | "W trasie" | "Dostawa" | "Blokada";
  eta: string;
  loadedKm: number;
  emptyKm: number;
  salePrice: number;
  totalCost: number;
  currency: "PLN" | "EUR";
  cargo: string;
  temperature?: string;
};

export type DocumentRecord = {
  id: string;
  scope: "Kierowca" | "Pojazd" | "Firma" | "Zlecenie";
  scopeCode: string;
  type: string;
  dueDate: string;
  status: "Ważny" | "Do odnowienia" | "Brak" | "Oczekuje";
  blocks: string;
};

const firstNames = ["Adam", "Anna", "Bartosz", "Beata", "Daniel", "Dorota", "Grzegorz", "Iwona", "Jakub", "Jan", "Kamil", "Karol", "Katarzyna", "Krzysztof", "Łukasz", "Magdalena", "Marek", "Marcin", "Michał", "Monika", "Paweł", "Piotr", "Rafał", "Robert", "Tomasz", "Wojciech", "Zofia", "Mariusz", "Agnieszka"];
const lastNames = ["Kowalski", "Nowak", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Jankowski", "Mazur", "Krawczyk", "Piotrowski", "Grabowski", "Pawłowski", "Michalski", "Zając", "Król", "Wieczorek", "Jabłoński", "Wróbel", "Malinowski", "Olszewski", "Jaworski", "Kaczmarek", "Stępień"];
const bases = ["Poznań", "Łódź", "Warszawa", "Gdańsk", "Wrocław"];
const registrations = ["PO", "EL", "WA", "GD", "DW"];
const vehicleTypes = [
  ...Array(30).fill("Chłodnia"),
  ...Array(5).fill("Cysterna spożywcza"),
  ...Array(5).fill("Cysterna ADR"),
  ...Array(10).fill("Plandeka"),
];
const makes = ["DAF XG", "Volvo FH", "Scania R", "Mercedes Actros", "MAN TGX"];

function isoAfter(days: number) {
  const date = new Date(Date.UTC(2026, 7, 29 + days));
  return date.toISOString().slice(0, 10);
}

export const drivers: Driver[] = Array.from({ length: 58 }, (_, index) => {
  const number = index + 1;
  const name = `${firstNames[index % firstNames.length]} ${lastNames[(index * 7) % lastNames.length]}`;
  const first = name.split(" ")[0][0];
  const last = name.split(" ")[1][0];
  const status: DriverStatus = number <= 43 ? "W trasie" : number <= 52 ? "Dostępny" : number <= 55 ? "Urlop" : number <= 57 ? "Chorobowe" : "Szkolenie";
  const compliance = number === 14 ? "Blokada" : number % 11 === 0 || number % 17 === 0 ? "Uwaga" : "Zgodny";
  return {
    id: `DRV-${String(number).padStart(3, "0")}`,
    name,
    initials: `${first}${last}`,
    base: bases[index % bases.length],
    status,
    assignedVehicle: number <= 50 ? `TF-${String(number).padStart(3, "0")}` : "Rezerwowy",
    currentOrder: number <= 12 ? `TF-260829-${String(number).padStart(3, "0")}` : number <= 43 ? `TF-260828-${String(number).padStart(3, "0")}` : " - ",
    hoursWeek: 22 + ((number * 3) % 23),
    hoursTwoWeeks: 52 + ((number * 5) % 35),
    documentCompleteness: compliance === "Blokada" ? 72 : compliance === "Uwaga" ? 84 : 92 + (number % 9),
    cardDue: isoAfter(compliance === "Blokada" ? -1 : compliance === "Uwaga" ? 4 + (number % 5) : 35 + number),
    medicalDue: isoAfter(70 + number * 4),
    accountStatus: number <= 55 ? "Aktywne" : number <= 57 ? "Zaproszenie wysłane" : "Wstrzymane",
    compliance,
  };
});

export const vehicles: Vehicle[] = Array.from({ length: 50 }, (_, index) => {
  const number = index + 1;
  const prefix = registrations[index % registrations.length];
  return {
    id: `TF-${String(number).padStart(3, "0")}`,
    registration: `${prefix} ${2 + (number % 8)}TF${String(10 + number).padStart(2, "0")}`,
    type: vehicleTypes[index],
    make: makes[index % makes.length],
    year: 2019 + (number % 8),
    status: number <= 43 ? "W trasie" : number <= 47 ? "Baza" : "Serwis",
    driverId: drivers[index].id,
    odometer: 248000 + number * 9831,
    fuelAverage: Number((24.8 + (number % 9) * 0.85).toFixed(1)),
    nextService: isoAfter(number >= 48 ? 1 + number - 48 : 20 + number * 2),
    monthlyLease: 10800 + (number % 7) * 1250,
  };
});

export const customers: Customer[] = [
  ["KLI-001", "Baltic Fresh Logistics", "FMCG / chłodnia", "Anna Lis", "Klient aktywny", 30, 220000, 74600, 18, "Dzisiaj, 09:12"],
  ["KLI-002", "Nordline Components", "Automotive", "Marek Pawlak", "Klient aktywny", 45, 310000, 128400, 14, "Wczoraj, 15:40"],
  ["KLI-003", "Central Food Trade", "Żywność", "Anna Lis", "Klient aktywny", 30, 180000, 53200, 12, "28.08, 11:05"],
  ["KLI-004", "WestPort Distribution", "Logistyka", "Tomasz Król", "Oferta", 30, 150000, 0, 0, "27.08, 13:20"],
  ["KLI-005", "GreenField Produce", "Rolnictwo", "Anna Lis", "Klient aktywny", 21, 140000, 41800, 9, "26.08, 10:32"],
  ["KLI-006", "Industria Parts Europe", "Przemysł", "Marek Pawlak", "Lead", 30, 90000, 0, 0, "25.08, 16:48"],
  ["KLI-007", "ColdChain Partner", "Chłodnia", "Anna Lis", "Klient aktywny", 30, 200000, 92700, 16, "25.08, 08:20"],
  ["KLI-008", "Rhine Market Supply", "Retail", "Tomasz Król", "Oferta", 45, 175000, 0, 0, "24.08, 12:05"],
  ["KLI-009", "Adriatic Tank Services", "Cysterna", "Marek Pawlak", "Klient aktywny", 30, 260000, 108200, 11, "22.08, 09:50"],
  ["KLI-010", "Vistula Packaging", "Opakowania", "Tomasz Król", "Klient aktywny", 30, 120000, 36900, 8, "21.08, 14:10"],
  ["KLI-011", "Bohemia Retail Group", "Retail", "Anna Lis", "Lead", 21, 80000, 0, 0, "20.08, 11:25"],
  ["KLI-012", "Alpine Ingredients", "Żywność", "Marek Pawlak", "Wstrzymany", 60, 100000, 98400, 4, "18.08, 15:00"],
].map((row) => ({ id: row[0] as string, name: row[1] as string, segment: row[2] as string, owner: row[3] as string, stage: row[4] as Customer["stage"], paymentDays: row[5] as number, creditLimit: row[6] as number, openBalance: row[7] as number, ordersMonth: row[8] as number, lastContact: row[9] as string }));

const routes = [
  ["Poznań → Hamburg", "Mrożonki", "-18°C"], ["Łódź → Rotterdam", "Komponenty", ""], ["Warszawa → Brno", "Nabiał", "+4°C"],
  ["Gdańsk → Berlin", "Opakowania", ""], ["Wrocław → Lyon", "Warzywa", "+6°C"], ["Płock → Antwerpia", "Olej spożywczy", ""],
  ["Szczecin → Praga", "Elektronika", ""], ["Katowice → Wiedeń", "Części maszyn", ""], ["Poznań → Malmö", "Mięso", "-20°C"],
  ["Gdynia → Lipsk", "Chemia ADR", ""], ["Łódź → Monachium", "Tekstylia", ""], ["Warszawa → Budapeszt", "Żywność sucha", ""],
];
const orderStatuses: TransportOrder["status"][] = ["W trasie", "Załadunek", "Planowane", "Blokada", "W trasie", "Dostawa", "W trasie", "Planowane", "Załadunek", "W trasie", "Dostawa", "W trasie"];

export const orders: TransportOrder[] = routes.map((route, index) => {
  const number = index + 1;
  const totalCost = 4100 + index * 245 + (index % 3) * 380;
  const targetMargin = 0.124 + (index % 6) * 0.017;
  const salePrice = Math.round(totalCost / (1 - targetMargin));
  return {
    id: `TF-260829-${String(number).padStart(3, "0")}`,
    customerId: customers[index].id,
    customer: customers[index].name,
    route: route[0],
    cargo: route[1],
    temperature: route[2] || undefined,
    vehicle: vehicles[index].registration,
    driver: drivers[index].name,
    status: orderStatuses[index],
    eta: index === 3 ? "+ 42 min" : `${13 + (index % 7)}:${String(10 + index * 4).padStart(2, "0").slice(-2)}`,
    loadedKm: 510 + index * 63,
    emptyKm: 42 + (index % 5) * 27,
    totalCost,
    salePrice,
    currency: index % 4 === 0 ? "PLN" : "EUR",
  };
});

export const documents: DocumentRecord[] = [
  { id: "DOC-001", scope: "Kierowca", scopeCode: "DRV-014", type: "Karta kierowcy  -  odczyt", dueDate: isoAfter(-1), status: "Brak", blocks: "Nowe zlecenie" },
  { id: "DOC-002", scope: "Pojazd", scopeCode: "TF-048", type: "Badanie techniczne", dueDate: isoAfter(2), status: "Do odnowienia", blocks: "Wyjazd" },
  { id: "DOC-003", scope: "Kierowca", scopeCode: "DRV-022", type: "Badania lekarskie", dueDate: isoAfter(4), status: "Do odnowienia", blocks: "Dyspozycyjność" },
  { id: "DOC-004", scope: "Zlecenie", scopeCode: "TF-260829-004", type: "Certyfikat mycia cysterny", dueDate: isoAfter(0), status: "Brak", blocks: "Załadunek" },
  { id: "DOC-005", scope: "Pojazd", scopeCode: "TF-009", type: "ATP", dueDate: isoAfter(11), status: "Do odnowienia", blocks: "Ładunek chłodniczy" },
  { id: "DOC-006", scope: "Firma", scopeCode: "ORG-001", type: "Licencja wspólnotowa", dueDate: isoAfter(420), status: "Ważny", blocks: "Transport międzynarodowy" },
  { id: "DOC-007", scope: "Zlecenie", scopeCode: "TF-260828-038", type: "POD / CMR", dueDate: isoAfter(-2), status: "Oczekuje", blocks: "Faktura" },
  { id: "DOC-008", scope: "Kierowca", scopeCode: "DRV-033", type: "Świadectwo kwalifikacji", dueDate: isoAfter(16), status: "Do odnowienia", blocks: "Dyspozycyjność" },
];

export const formatMoney = (value: number, currency = "PLN") => new Intl.NumberFormat("pl-PL", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
export const marginPercent = (order: TransportOrder) => ((order.salePrice - order.totalCost) / order.salePrice) * 100;
