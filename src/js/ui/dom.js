export const $ = function (id) { return document.getElementById(id); };

export function safeRatio(U, v, max) {
  const r = Number(max) > 0 ? Number(v) / Number(max) : 0;
  return U.clamp(Number.isFinite(r) ? r : 0, 0, 1);
}

export function renderTabs(host, tabs, active, onSelect, U) {
  if (!host) return;
  host.innerHTML = tabs.map(function (tab) {
    return '<button class="' + (tab.id === active ? 'active' : '') + '" data-tab="' + tab.id + '">' + U.escapeHtml(tab.name) + '</button>';
  }).join('');
  host.querySelectorAll('button').forEach(function (btn) {
    btn.onclick = function () { onSelect(btn.dataset.tab); };
  });
}
