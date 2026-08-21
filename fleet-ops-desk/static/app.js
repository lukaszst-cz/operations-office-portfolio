const currency = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 });
const chart = document.querySelector('#chart');

const highest = Math.max(...window.dashboardTrend.map(item => item.amount));
chart.innerHTML = window.dashboardTrend.map(item => {
  const height = Math.max(12, Math.round(item.amount / highest * 100));
  return `<div class="bar-wrap"><span class="value">${currency.format(item.amount)}</span><div class="bar" style="height:${height}%"></div><span>${item.year}</span></div>`;
}).join('');

const search = document.querySelector('#search');
const status = document.querySelector('#status');
const rows = document.querySelector('#vehicle-rows');

async function refreshVehicles() {
  const params = new URLSearchParams({ q: search.value, status: status.value });
  const response = await fetch(`/api/vehicles?${params}`);
  const vehicles = await response.json();
  rows.innerHTML = vehicles.map(vehicle => `
    <tr><td>${vehicle.code}</td><td>${vehicle.vehicle_type}</td>
    <td><span class="tag ${vehicle.status.toLowerCase().replace(' ', '-')}">${vehicle.status}</span></td>
    <td>${vehicle.fuel}</td><td>${vehicle.cargo_lift ? 'Tak' : '—'}</td>
    <td>${currency.format(vehicle.annual_cost)}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">Brak pojazdów dla wybranych filtrów.</td></tr>';
}

search.addEventListener('input', refreshVehicles);
status.addEventListener('change', refreshVehicles);
