import test from 'node:test';
import assert from 'node:assert/strict';

import data from '../src/js/data/index.js';
import { contentModeForTab, initialShopTab } from '../src/js/ui/shop-view.js';

test('shop exposes armory as the first tab', function () {
  assert.equal(data.shopTabs[0].id, 'armory');
  assert.equal(data.shopTabs[0].name, '军械库');
});

test('shop view maps armory to route content and other tabs to item grids', function () {
  assert.equal(contentModeForTab('armory'), 'armory');
  assert.equal(contentModeForTab('forge'), 'items');
  assert.equal(contentModeForTab('item'), 'items');
});

test('shop opens on the first configured tab so armory is shown by default', function () {
  assert.equal(initialShopTab(data.shopTabs), 'armory');
  assert.equal(contentModeForTab(initialShopTab(data.shopTabs)), 'armory');
});
