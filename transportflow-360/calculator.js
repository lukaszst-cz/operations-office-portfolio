const defaults = { reefer: { consumption: 29, tolls: 680, driver: 950, fixed: 760, other: 760 }, tanker: { consumption: 32, tolls: 520, driver: 760, fixed: 850, other: 1030 }, curtain: { consumption: 27, tolls: 600, driver: 820, fixed: 650, other: 500 } };
const ids = ["loadedKm","emptyKm","fuelPrice","consumption","tolls","driverCost","fixedAllocation","otherCosts","margin","eurRate"];
const number = (id) => Number(document.getElementById(id).value || 0);
const format = (value, currency) => new Intl.NumberFormat("pl-PL", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

function applyVehicleDefaults() {
  const selected = defaults[document.getElementById("vehicleType").value];
  document.getElementById("consumption").value = selected.consumption;
  document.getElementById("tolls").value = selected.tolls;
  document.getElementById("driverCost").value = selected.driver;
  document.getElementById("fixedAllocation").value = selected.fixed;
  document.getElementById("otherCosts").value = selected.other;
}

function calculate(event) {
  event?.preventDefault();
  const loaded = number("loadedKm");
  const empty = number("emptyKm");
  const totalKm = loaded + empty;
  const margin = number("margin") / 100;
  const fuel = totalKm * number("consumption") / 100 * number("fuelPrice");
  const toll = number("tolls");
  const driver = number("driverCost");
  const fixedAndOther = number("fixedAllocation") + number("otherCosts");
  const totalCostPln = fuel + toll + driver + fixedAndOther;
  const minPricePln = margin >= 1 ? 0 : totalCostPln / (1 - margin);
  const divisor = document.getElementById("currency").value === "EUR" ? number("eurRate") : 1;
  const currency = document.getElementById("currency").value;
  document.getElementById("totalKm").textContent = `${Math.round(totalKm).toLocaleString("pl-PL")} km`;
  document.getElementById("emptyShare").textContent = totalKm ? `${Math.round(empty / totalKm * 100)}%` : "0%";
  document.getElementById("totalCost").textContent = format(totalCostPln / divisor, currency);
  document.getElementById("costPerTotalKm").textContent = format(totalKm ? totalCostPln / totalKm / divisor : 0, currency);
  document.getElementById("minPrice").textContent = format(minPricePln / divisor, currency);
  document.getElementById("sellRate").textContent = format(loaded ? minPricePln / loaded / divisor : 0, currency);
  document.getElementById("fuelCost").textContent = format(fuel / divisor, currency);
  document.getElementById("tollCost").textContent = format(toll / divisor, currency);
  document.getElementById("driverCostOut").textContent = format(driver / divisor, currency);
  document.getElementById("otherCostOut").textContent = format(fixedAndOther / divisor, currency);
  document.getElementById("marginWarning").textContent = loaded <= 0 ? "Kilometry płatne muszą być większe od zera." : margin < .05 ? "Marża poniżej 5% wymagałaby zgody osoby zarządzającej. Wynik pozostaje demonstracyjny." : "Wynik jest symulacją portfolio. Przed ofertą produkcyjną wymagana jest aktualizacja kosztów, tras, podatków i wymagań prawnych.";
}

document.getElementById("rateForm").addEventListener("submit", calculate);
document.getElementById("vehicleType").addEventListener("change", () => { applyVehicleDefaults(); calculate(); });
document.getElementById("currency").addEventListener("change", calculate);
ids.forEach((id) => document.getElementById(id).addEventListener("input", calculate));
document.getElementById("resetCalc").addEventListener("click", () => {
  document.getElementById("vehicleType").value = "reefer"; document.getElementById("currency").value = "PLN";
  document.getElementById("loadedKm").value = 820; document.getElementById("emptyKm").value = 140; document.getElementById("fuelPrice").value = 6.25; document.getElementById("margin").value = 15; document.getElementById("eurRate").value = 4.30;
  applyVehicleDefaults(); calculate();
});
calculate();
