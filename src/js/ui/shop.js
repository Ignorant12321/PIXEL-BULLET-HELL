import { renderTabs } from './dom.js';
import { armoryRouteSelection, nextArmoryZoom, nodeState } from './armory-view.js';
import { contentModeForTab, initialShopTab } from './shop-view.js';

export function createShopPanel(game, data, U, elements, callbacks) {
  const e = elements;
  const cb = callbacks || {};
  let tab = initialShopTab(data.shopTabs);
  let armoryRoute = 'core';
  const armoryZoom = {};
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
        return '<button type="button" class="armory-route-tab' + (item.active ? ' active' : '') + '" data-armory-route-tab="' + item.id + '">' +
          '<span>' + U.escapeHtml(item.name) + '</span></button>';
      }).join(''),
      '</nav>'
    ].join('');
    const body = selection.mode === 'overview' ? renderArmoryOverview(selection.groups) : selection.groups.map(function (group) {
      return renderArmoryRoute(group, armory);
    }).join('');
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
    bindArmoryDragScroll();
    e.shopGrid.querySelectorAll('[data-armory-pan]').forEach(function (btn) {
      btn.onclick = function () {
        const tree = btn.closest('[data-armory-dragscroll]');
        if (tree) panArmoryTree(tree, btn.dataset.armoryPan);
      };
    });
    e.shopGrid.querySelectorAll('[data-armory-zoom]').forEach(function (btn) {
      btn.onclick = function () {
        const tree = btn.closest('[data-armory-dragscroll]');
        const routeId = tree && tree.dataset.armoryRoute;
        if (!routeId) return;
        armoryZoom[routeId] = nextArmoryZoom(armoryZoom[routeId] || 1, btn.dataset.armoryZoom);
        dirty = true;
        render();
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

  function panArmoryTree(tree, dir) {
    const maxLeft = Math.max(0, tree.scrollWidth - tree.clientWidth);
    const maxTop = Math.max(0, tree.scrollHeight - tree.clientHeight);
    const target = {
      left: dir === 'left' ? 0 : dir === 'right' ? maxLeft : dir === 'center' ? Math.round(maxLeft / 2) : tree.scrollLeft,
      top: dir === 'top' ? 0 : dir === 'bottom' ? maxTop : dir === 'center' ? Math.round(maxTop / 2) : tree.scrollTop
    };
    tree.scrollTo(Object.assign({ behavior: 'smooth' }, target));
  }

  function bindArmoryDragScroll() {
    e.shopGrid.querySelectorAll('[data-armory-dragscroll]').forEach(function (tree) {
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let left = 0;
      let top = 0;
      tree.onpointerdown = function (ev) {
        if (ev.button !== 0 || ev.target.closest('.armory-tree-node, button')) return;
        dragging = true;
        startX = ev.clientX;
        startY = ev.clientY;
        left = tree.scrollLeft;
        top = tree.scrollTop;
        tree.classList.add('dragging');
        tree.setPointerCapture(ev.pointerId);
      };
      tree.onpointermove = function (ev) {
        if (!dragging) return;
        tree.scrollLeft = left - (ev.clientX - startX);
        tree.scrollTop = top - (ev.clientY - startY);
      };
      tree.onpointerup = tree.onpointercancel = function (ev) {
        if (!dragging) return;
        dragging = false;
        tree.classList.remove('dragging');
        try { tree.releasePointerCapture(ev.pointerId); } catch (_) {}
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

  function renderArmoryRoute(group, armory) {
      const zoom = armoryZoom[group.routeId] || 1;
      const edgeMarkup = group.edges.map(function (edge) {
        const mid = (edge.x1 + edge.x2) / 2;
        return '<path d="M ' + edge.x1.toFixed(2) + ' ' + edge.y1.toFixed(2) + ' C ' + mid.toFixed(2) + ' ' + edge.y1.toFixed(2) + ', ' + mid.toFixed(2) + ' ' + edge.y2.toFixed(2) + ', ' + edge.x2.toFixed(2) + ' ' + edge.y2.toFixed(2) + '" />';
      }).join('');
      return [
        '<section class="armory-tree-route">',
        '<header><div><h3>' + U.escapeHtml(group.name) + '</h3><p>已投入 ￥' + U.num(group.spent) + '</p></div>',
        '<button class="route-reset" data-respec-route="' + group.routeId + '" title="' + U.escapeHtml(group.resetAction.title) + '"' + (group.resetAction.disabled ? ' disabled' : '') + ' aria-label="' + U.escapeHtml(group.name + group.resetAction.title) + '">' + group.resetAction.label + '</button></header>',
        '<div class="armory-tree" data-armory-dragscroll data-armory-route="' + group.routeId + '" style="--tier-count:' + Math.max(1, group.tiers.length) + ';--armory-zoom:' + zoom + '">',
        '<nav class="armory-tree-zoom" aria-label="树图缩放">',
        '<button type="button" data-armory-zoom="out" title="缩小">-</button>',
        '<button type="button" data-armory-zoom="reset" title="100%">' + Math.round(zoom * 100) + '%</button>',
        '<button type="button" data-armory-zoom="in" title="放大">+</button>',
        '</nav>',
        '<nav class="armory-tree-nav" aria-label="树图定位">',
        '<button type="button" data-armory-pan="top" title="顶部">↑</button>',
        '<button type="button" data-armory-pan="left" title="左侧">←</button>',
        '<button type="button" data-armory-pan="center" title="居中">◎</button>',
        '<button type="button" data-armory-pan="right" title="右侧">→</button>',
        '<button type="button" data-armory-pan="bottom" title="底部">↓</button>',
        '</nav>',
        '<div class="armory-tree-canvas">',
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
            '<footer class="armory-node-action"><span class="armory-node-price">￥' + U.num(node.cost) + '</span><button data-armory-buy="' + node.id + '"' + (state !== 'available' ? ' disabled' : '') + '>' + label + '</button></footer>',
            '</article>'
          ].join('');
        }).join(''),
        '</div></div></section>'
      ].join('');
  }

  return { render, markDirty };
}
