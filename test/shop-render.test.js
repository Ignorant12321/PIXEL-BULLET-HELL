import test from 'node:test';
import assert from 'node:assert/strict';

import { createShopPanel } from '../src/js/ui/shop.js';

function fakeElement() {
  return {
    textContent: '',
    className: '',
    innerHTML: '',
    querySelectorAll: function () { return []; }
  };
}

const U = {
  num: function (value) { return String(value); },
  escapeHtml: function (value) { return String(value); },
  icon: function (id) { return '<i>' + id + '</i>'; }
};

test('shop can render the default armory route tree without crashing', function () {
  const elements = {
    shopGrid: fakeElement(),
    shopCoin: fakeElement(),
    shopTabs: fakeElement()
  };
  const game = {
    view: function () { return { coins: 100 }; },
    armoryView: function () {
      return {
        routes: [
          { id: 'core-root', routeId: 'core', tier: 1, max: 1, cost: 50, effects: {}, name: 'Core', desc: 'Base', icon: 'core' }
        ],
        levels: { 'core-root': 0 },
        coins: 100,
        phase: 'intermission'
      };
    },
    buyArmoryNode: function () { return false; },
    respecArmoryRoute: function () { return false; }
  };
  const data = {
    shopTabs: [{ id: 'armory', name: '军械库' }],
    upgrades: [],
    icons: {}
  };

  const panel = createShopPanel(game, data, U, elements);

  assert.doesNotThrow(function () { panel.render(); });
  assert.match(elements.shopGrid.innerHTML, /Core/);
  assert.doesNotMatch(elements.shopGrid.innerHTML, /data-armory-route-tab="overview"/);
  assert.doesNotMatch(elements.shopGrid.innerHTML, /<small>￥/);
  assert.match(elements.shopGrid.innerHTML, /data-armory-dragscroll/);
  assert.match(elements.shopGrid.innerHTML, /armory-tree-canvas/);
  assert.match(elements.shopGrid.innerHTML, /class="armory-tree-nav"/);
  assert.match(elements.shopGrid.innerHTML, /data-armory-pan="bottom"/);
  assert.match(elements.shopGrid.innerHTML, /class="armory-node-action"/);
  assert.match(elements.shopGrid.innerHTML, /class="armory-route-tab active"/);
  assert.match(elements.shopGrid.innerHTML, /class="armory-node-price"/);
});
