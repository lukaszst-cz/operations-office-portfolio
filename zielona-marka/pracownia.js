const form = document.querySelector("#calcForm");
const estimateValue = document.querySelector("#estimateValue");
const estimateNote = document.querySelector("#estimateNote");
const estimateBreakdown = document.querySelector("#estimateBreakdown");
const flowOutput = document.querySelector("#flowOutput");

const money = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("pl-PL");

function getValues() {
  const data = new FormData(form);
  return Object.fromEntries([...data].map(([key, value]) => [key, Number(value)]));
}

function renderCalculator() {
  if (!form.reportValidity()) return;
  const { format, quantity, pages, colour, paper, finish, pack, delivery, deadline } = getValues();
  const preparation = 220;
  const print = quantity * pages * format * colour * paper * 0.028;
  const finishing = finish + quantity * (finish ? 0.045 : 0);
  const logistics = pack + delivery;
  const subtotal = preparation + print + finishing + logistics;
  const modelValue = Math.round(subtotal * deadline * 1.18);
  const deposit = Math.round(modelValue * 0.3);
  const leadTime = deadline >= 1.35 ? "2–3 dni robocze" : deadline >= 1.15 ? "4–6 dni roboczych" : "7–10 dni roboczych";
  const controlPoints = [
    ["01", "Kwalifikacja", "parametry, nakład, termin"],
    ["02", "Kalkulacja", "materiał, druk, wykończenie"],
    ["03", "Akceptacja", "plik, proof i zaliczka"],
    ["04", "Produkcja", "plan, jakość i pakowanie"],
    ["05", "Dostawa", "wydanie, przewóz i faktura"]
  ];
  estimateValue.textContent = money.format(modelValue);
  estimateNote.textContent = `Model dla nakładu ${number.format(quantity)} egz., ${number.format(pages)} stron. Orientacyjny czas: ${leadTime}.`;
  estimateBreakdown.innerHTML = [
    ["Przygotowanie", preparation], ["Druk i materiał", Math.round(print)], ["Wykończenie", Math.round(finishing)], ["Pakowanie i dostawa", logistics], ["Model zaliczki 30%", deposit]
  ].map(([label, value]) => `<div><dt>${label}</dt><dd>${money.format(value)}</dd></div>`).join("");
  flowOutput.innerHTML = controlPoints.map(([id, title, description]) => `<article><span class="number">${id}</span><h3>${title}</h3><p>${description}</p></article>`).join("");
}

form.addEventListener("submit", (event) => { event.preventDefault(); renderCalculator(); });
form.addEventListener("change", renderCalculator);

const DEMO = {
  2023: { orders: [49, 52, 58, 61, 64, 59, 62, 67, 65, 69, 72, 74], onTime: [89, 91, 90, 92, 90, 93, 91, 92, 94, 93, 92, 95], lead: [8.2, 7.8, 8.1, 7.6], value: [184, 201, 214, 232], deposit: 93, quality: 96, transport: 89 },
  2024: { orders: [63, 67, 71, 74, 78, 76, 81, 84, 82, 88, 91, 96], onTime: [92, 93, 94, 93, 95, 94, 96, 95, 95, 97, 96, 97], lead: [7.4, 7.1, 6.9, 6.5], value: [231, 248, 269, 295], deposit: 96, quality: 98, transport: 94 }
};
const labels = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];
const yearSelect = document.querySelector("#yearSelect");
const kpiCards = document.querySelector("#kpiCards");
const onTimeChart = document.querySelector("#onTimeChart");
const processChart = document.querySelector("#processChart");
const quarterBody = document.querySelector("#quarterBody");

function average(values) { return values.reduce((sum, value) => sum + value, 0) / values.length; }
function change(current, previous) { return Math.round(((current - previous) / previous) * 100); }
function signed(value) { return `${value >= 0 ? "+" : ""}${value}% r/r`; }

function renderKpi() {
  const year = yearSelect.value;
  const data = DEMO[year];
  const previous = DEMO[year === "2024" ? "2023" : "2024"];
  const totalOrders = data.orders.reduce((sum, value) => sum + value, 0);
  const totalValue = data.value.reduce((sum, value) => sum + value, 0);
  const avgOnTime = average(data.onTime);
  const previousOrders = previous.orders.reduce((sum, value) => sum + value, 0);
  const previousValue = previous.value.reduce((sum, value) => sum + value, 0);
  kpiCards.innerHTML = [
    ["Zlecenia", number.format(totalOrders), signed(change(totalOrders, previousOrders))],
    ["Terminowość", `${avgOnTime.toFixed(1)}%`, `${avgOnTime >= average(previous.onTime) ? "+" : ""}${(avgOnTime - average(previous.onTime)).toFixed(1)} pp r/r`],
    ["Wartość modelowa", `${totalValue.toFixed(0)} tys. zł`, signed(change(totalValue, previousValue))],
    ["Śr. czas realizacji", `${average(data.lead).toFixed(1)} dni`, `${(average(previous.lead) - average(data.lead)).toFixed(1)} dnia szybciej`]
  ].map(([label, value, detail]) => `<article><small>${label}</small><strong>${value}</strong><span>${detail}</span></article>`).join("");
  onTimeChart.innerHTML = data.onTime.map((value, index) => `<div><small>${value}%</small><span style="height:${value}%"></span><b>${labels[index]}</b></div>`).join("");
  const process = [["Zaliczki potwierdzone", data.deposit], ["Kontrola jakości", data.quality], ["Dostawy w terminie", data.transport], ["Akceptacje plików", Math.round(avgOnTime - 1)]];
  processChart.innerHTML = process.map(([label, value]) => `<div><span>${label}</span><i><span style="width:${value}%"></span></i><b>${value}%</b></div>`).join("");
  quarterBody.innerHTML = [0, 1, 2, 3].map((index) => {
    const start = index * 3;
    const orders = data.orders.slice(start, start + 3).reduce((sum, value) => sum + value, 0);
    const onTime = average(data.onTime.slice(start, start + 3));
    return `<tr><td>Q${index + 1}</td><td>${number.format(orders)}</td><td>${onTime.toFixed(1)}%</td><td>${data.lead[index].toFixed(1)} dni</td><td>${data.value[index]} tys. zł</td></tr>`;
  }).join("");
}

yearSelect.addEventListener("change", renderKpi);
renderCalculator();
renderKpi();

document.querySelectorAll("p,h1,h2,h3,small,b,span,button,a,label,legend,dt,dd").forEach((element) => {
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) node.nodeValue = node.nodeValue.replace(/(^|[\s\u00A0])([AaIiOoUuWwZz])\s+/g, "$1$2\u00A0");
  });
});
