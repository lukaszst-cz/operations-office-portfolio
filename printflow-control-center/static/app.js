const pln = value => new Intl.NumberFormat('pl-PL', {style:'currency', currency:'PLN', maximumFractionDigits:0}).format(value);
const role = document.querySelector('#role');
const search = document.querySelector('#search');
const stage = document.querySelector('#stage');
const dialog = document.querySelector('#order-dialog');

function esc(value) {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

async function load() {
  const query = new URLSearchParams({role: role.value, q: search.value, stage: stage.value});
  const [dashboard, orders] = await Promise.all([
    fetch(`/api/dashboard?role=${encodeURIComponent(role.value)}`).then(r => r.json()),
    fetch(`/api/orders?${query}`).then(r => r.json())
  ]);
  document.querySelector('#cards').innerHTML = `
    <article><span>Widoczne zlecenia</span><strong>${dashboard.orders}</strong><small>widok: ${esc(dashboard.role)}</small></article>
    <article><span>Wartość netto</span><strong>${pln(dashboard.net_value)}</strong><small>aktywny zakres</small></article>
    <article><span>Marża</span><strong>${dashboard.margin_pct}%</strong><small>${pln(dashboard.margin)}</small></article>
    <article class="${dashboard.alerts ? 'warning-card' : ''}"><span>Alerty</span><strong>${dashboard.alerts}</strong><small>wymagają uwagi</small></article>`;
  document.querySelector('#pipeline').innerHTML = Object.entries(dashboard.stages).map(([name,count]) =>
    `<button data-stage="${esc(name)}" class="pipeline-step ${stage.value === name ? 'active' : ''}"><strong>${count}</strong><span>${esc(name)}</span></button>`).join('');
  document.querySelectorAll('.pipeline-step').forEach(button => button.addEventListener('click', () => {stage.value = button.dataset.stage; load();}));
  document.querySelector('#orders').innerHTML = orders.length ? orders.map(order => `
    <tr><td><strong>${esc(order.order_code)}</strong><small>${order.quantity.toLocaleString('pl-PL')} szt.</small></td>
    <td>${esc(order.client_code)}<small>${esc(order.product_type)}</small></td>
    <td><span class="tag">${esc(order.stage)}</span></td><td>${esc(order.deadline)}</td>
    <td>${pln(order.net_value)}<small>koszt ${pln(order.total_cost)}</small></td>
    <td><strong class="${order.margin_pct < 18 ? 'low' : 'good'}">${order.margin_pct}%</strong></td>
    <td>${order.alerts.length ? order.alerts.map(a => `<span class="alert">${esc(a)}</span>`).join('') : '<span class="ok">Bez alertów</span>'}</td>
    <td><button class="advance" data-id="${order.id}" title="Przejdź do następnego etapu">→</button></td></tr>`).join('') : '<tr><td colspan="8" class="empty">Brak zleceń dla wybranego widoku.</td></tr>';
  document.querySelectorAll('.advance').forEach(button => button.addEventListener('click', () => advance(button.dataset.id)));
}

async function advance(id) {
  const response = await fetch(`/api/orders/${id}/advance`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({role:role.value})});
  const result = await response.json();
  if (!result.ok) alert(result.errors.join('\n'));
  await load();
}

document.querySelector('#new-order').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#order-form').addEventListener('submit', async event => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target));
  const response = await fetch('/api/orders', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
  const result = await response.json();
  if (!result.ok) {document.querySelector('#form-error').textContent = result.errors.join(' · '); return;}
  dialog.close(); event.target.reset(); await load();
});
[role, stage].forEach(el => el.addEventListener('change', load));
let timer; search.addEventListener('input', () => {clearTimeout(timer); timer = setTimeout(load, 180);});
document.querySelector('input[name="deadline"]').value = new Date(Date.now() + 7*864e5).toISOString().slice(0,10);
load();
