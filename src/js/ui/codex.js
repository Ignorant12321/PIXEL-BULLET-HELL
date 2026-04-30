import { renderTabs } from './dom.js';

export function createCodexPanel(game, data, U, elements) {
  const e = elements;
  let tab = 'all';
  let dirty = true;

  function markDirty() {
    dirty = true;
  }

  function render() {
    if (!dirty || !e.codexGrid) return;

    renderTabs(e.codexTabs, data.codexTabs, tab, function (nextTab) {
      tab = nextTab;
      dirty = true;
      render();
    }, U);

    const items = data.codex.filter(function (item) { return tab === 'all' || item.category === tab; });
    e.codexGrid.innerHTML = items.map(function (item) {
      const open = game.unlocked(item.unlock);
      return [
        '<article class="item ' + (open ? '' : 'locked') + '">',
        U.icon(open ? item.icon : 'unknown', data.icons),
        '<div><h3>' + U.escapeHtml(open ? item.name : '未知信号') + '</h3><div class="meta">' + U.escapeHtml(item.category) + '</div></div>',
        '<p>' + U.escapeHtml(open ? item.desc : '继续战斗后会点亮该条目。') + '</p>',
        '<footer><span class="price">' + (open ? '已解锁' : '未解锁') + '</span></footer>',
        '</article>'
      ].join('');
    }).join('');
    dirty = false;
  }

  return { render, markDirty };
}
