import { renderTabs } from './dom.js';
import { armoryRouteSelection, nodeState } from './armory-view.js';
import { contentModeForTab, initialShopTab } from './shop-view.js';

export function createShopPanel(game, data, U, elements, callbacks) {
  const e = elements;
  const cb = callbacks || {};
  let tab = initialShopTab(data.shopTabs);
  let armoryRoute = 'core';
  let lastCoins = -1;
  let dirty = true;

  function markDirty() {
    dirty = true;
  }

  function render() {
    const view = game.view();
    if (!dirty && view.coins === lastCoins) return;
    if (!e.shopGrid) return;

    e.shopCoin.textContent = U.num(view.coins);
    renderTabs(e.shopTabs, data.shopTabs, tab, function (nextTab) {
      tab = nextTab;
      if (contentModeForTab(tab) === 'armory' && armoryRoute === 'overview') armoryRoute = 'core';
      dirty = true;
      render();
    }, U);

    if (contentModeForTab(tab) === 'armory') {
      renderArmory();
      lastCoins = game.view().coins;
      dirty = false;
      return;
    }

    e.shopGrid.className = 'grid';
    const items = data.upgrades.filter(function (item) { return item.category === tab; });
    if (!items.length) {
      e.shopGrid.innerHTML = '<article class="empty-state">当前分组暂无可购买项目。</article>';
      lastCoins = view.coins;
      dirty = false;
      return;
    }

    e.shopGrid.innerHTML = items.map(function (item) {
      const lv = game.level(item.id);
      const price = game.cost(item);
      const maxed = lv >= item.max && item.type !== 'service' && item.type !== 'blind';
      const isFull = game.full(item.id);
      const disabled = maxed || isFull || view.coins < price;
      const lvText = item.type === 'service' ? '存入道具栏' : item.type === 'blind' ? '随机回报' : 'Lv ' + lv + '/' + item.max;
      return [
        '<article class="item">',
        U.icon(item.icon, data.icons),
        '<div><h3>' + U.escapeHtml(item.name) + '</h3><div class="meta">' + lvText + '</div></div>',
        '<p>' + U.escapeHtml(item.desc) + '</p>',
        '<footer><span class="price">￥ ' + U.num(price) + '</span>',
        '<button data-buy="' + item.id + '"' + (disabled ? ' disabled' : '') + '>' + (maxed || isFull ? '已满' : '购买') + '</button>',
        '</footer></article>'
      ].join('');
    }).join('');

    e.shopGrid.querySelectorAll('[data-buy]').forEach(function (btn) {
      btn.onclick = function () {
        if (game.buy(btn.dataset.buy)) {
          dirty = true;
          if (cb.onBought) cb.onBought();
          render();
        }
      };
    });

    lastCoins = view.coins;
    dirty = false;
  }

  function renderArmory() {
    const armory = game.armoryView();
    e.shopCoin.textContent = U.num(armory.coins);
    e.shopGrid.className = 'armory-grid shop-armory-grid';
    const selection = armoryRouteSelection(armory, armoryRoute);
    armoryRoute = selection.activeRouteId;
    const subnav = [
      '<nav class="armory-subnav" aria-label="军械库路线">',
      selection.tabs.map(function (item) {
        return '<button type="button" class="' + (item.active ? 'active' : '') + '" data-armory-route-tab="' + item.id + '">' +
          '<span>' + U.escapeHtml(item.name) + '</span><small>￥' + U.num(item.spent) + '</small></button>';
      }).join(''),
      '</nav>'
    ].join('');
    const body = selection.mode === 'overview' ? renderArmoryOverview(selection.groups) : selection.groups.map(renderArmoryRoute).join('');
    e.shopGrid.innerHTML = subnav + '<div class="armory-content ' + selection.mode + '">' + body + '</div>';

    e.shopGrid.querySelectorAll('[data-armory-route-tab]').forEach(function (btn) {
      btn.onclick = function () {
        armoryRoute = btn.dataset.armoryRouteTab;
        dirty = true;
        render();
      };
    });

    e.shopGrid.querySelectorAll('[data-armory-open-route]').forEach(function (btn) {
      btn.onclick = function () {
        armoryRoute = btn.dataset.armoryOpenRoute;
        dirty = true;
        render();
      };
    });

    e.shopGrid.querySelectorAll('[data-armory-buy]').forEach(function (btn) {
      btn.onclick = function () {
        if (game.buyArmoryNode(btn.dataset.armoryBuy)) {
          dirty = true;
          if (cb.onBought) cb.onBought();
          render();
        }
      };
    });
    e.shopGrid.querySelectorAll('[data-respec-route]').forEach(function (btn) {
      btn.onclick = function () {
        if (game.respecArmoryRoute(btn.dataset.respecRoute)) {
          dirty = true;
          if (cb.onBought) cb.onBought();
          render();
        }
      };
    });
  }

  function renderArmoryOverview(groups) {
    return [
      '<section class="armory-overview" aria-label="军械库概览">',
      groups.map(function (group) {
        const pct = group.total ? Math.round(group.purchased / group.total * 100) : 0;
        return [
          '<article class="armory-route-card">',
          '<header><div><h3>' + U.escapeHtml(group.name) + '</h3><p>已投入 ￥' + U.num(group.spent) + '</p></div>',
          '<button type="button" data-armory-open-route="' + group.routeId + '">查看</button></header>',
          '<div class="route-progress"><i style="width:' + pct + '%"></i></div>',
          '<footer><span>等级 ' + group.purchased + '/' + group.total + '</span><span>可升级 ' + group.available + '</span></footer>',
          '</article>'
        ].join('');
      }).join(''),
      '</section>'
    ].join('');
  }

  function renderArmoryRoute(group) {
      const edgeMarkup = group.edges.map(function (edge) {
        const mid = (edge.x1 + edge.x2) / 2;
        return '<path d="M ' + edge.x1.toFixed(2) + ' ' + edge.y1.toFixed(2) + ' C ' + mid.toFixed(2) + ' ' + edge.y1.toFixed(2) + ', ' + mid.toFixed(2) + ' ' + edge.y2.toFixed(2) + ', ' + edge.x2.toFixed(2) + ' ' + edge.y2.toFixed(2) + '" />';
      }).join('');
      return [
        '<section class="armory-tree-route">',
        '<header><div><h3>' + U.escapeHtml(group.name) + '</h3><p>已投入 ￥' + U.num(group.spent) + '</p></div>',
        '<button class="route-reset" data-respec-route="' + group.routeId + '" title="' + U.escapeHtml(group.resetAction.title) + '"' + (group.resetAction.disabled ? ' disabled' : '') + ' aria-label="' + U.escapeHtml(group.name + group.resetAction.title) + '">' + group.resetAction.label + '</button></header>',
        '<div class="armory-tree" style="--tier-count:' + Math.max(1, group.tiers.length) + '">',
        '<svg class="armory-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + edgeMarkup + '</svg>',
        group.nodes.map(function (node) {
          const lv = (armory.levels && armory.levels[node.id]) || 0;
          const state = nodeState(node, armory.levels || {}, armory.coins);
          const label = state === 'maxed' ? '已满' : state === 'locked' ? '前置' : state === 'exclusive' ? '互斥' : state === 'coins' ? '不足' : '升级';
          return [
            '<article class="armory-tree-node armory-node ' + state + '" style="--x:' + node.x.toFixed(2) + ';--y:' + node.y.toFixed(2) + '">',
            '<div class="armory-node-icon">' + U.icon(node.icon, data.icons) + '</div>',
            '<div><h4>' + U.escapeHtml(node.name) + '</h4><p>' + U.escapeHtml(node.desc) + '</p>',
            '<small>Tier ' + node.tier + (node.branch ? ' · ' + U.escapeHtml(node.branch) : '') + ' · Lv ' + lv + '/' + node.max + '</small></div>',
            '<footer><span>￥ ' + U.num(node.cost) + '</span><button data-armory-buy="' + node.id + '"' + (state !== 'available' ? ' disabled' : '') + '>' + label + '</button></footer>',
            '</article>'
          ].join('');
        }).join(''),
        '</div></section>'
      ].join('');
  }

  return { render, markDirty };
}
