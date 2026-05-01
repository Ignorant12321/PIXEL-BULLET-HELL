import test from 'node:test';
import assert from 'node:assert/strict';

import data from '../src/js/data/index.js';

const attackUpgradeIds = new Set([
  'damage', 'fireRate', 'range', 'lanes', 'pierce', 'crit',
  'sniper', 'beam', 'missile', 'drone', 'bombCore'
]);

test('ordinary shop no longer contains attack upgrades', function () {
  const ids = data.upgrades.map(function (item) { return item.id; });
  attackUpgradeIds.forEach(function (id) {
    assert.equal(ids.includes(id), false, id + ' should live in armoryRoutes');
  });
});

test('armory routes define unique valid nodes', function () {
  assert.ok(Array.isArray(data.armoryRoutes), 'armoryRoutes should be an array');
  assert.ok(data.armoryRoutes.length >= 20, 'armory should contain full attack routes');

  const ids = new Set();
  data.armoryRoutes.forEach(function (node) {
    assert.equal(typeof node.id, 'string');
    assert.equal(ids.has(node.id), false, 'duplicate node id ' + node.id);
    ids.add(node.id);
    assert.equal(typeof node.routeId, 'string', node.id + ' routeId');
    assert.ok(Number.isInteger(node.tier), node.id + ' tier');
    assert.ok(Number.isInteger(node.max), node.id + ' max');
    assert.ok(node.max > 0, node.id + ' max positive');
    assert.ok(Number.isInteger(node.cost), node.id + ' cost');
    assert.ok(node.cost > 0, node.id + ' cost positive');
    assert.ok(node.effects && typeof node.effects === 'object', node.id + ' effects');
  });

  data.armoryRoutes.forEach(function (node) {
    (node.prereq || []).forEach(function (id) {
      assert.equal(ids.has(id), true, node.id + ' missing prereq ' + id);
    });
    (node.locks || []).forEach(function (id) {
      assert.equal(ids.has(id), true, node.id + ' missing lock target ' + id);
    });
  });
});

test('armory exposes all planned attack routes', function () {
  const routeIds = new Set(data.armoryRoutes.map(function (node) { return node.routeId; }));
  ['cannon', 'sniper', 'beam', 'missile', 'drone', 'bomb', 'core'].forEach(function (routeId) {
    assert.equal(routeIds.has(routeId), true, 'missing route ' + routeId);
  });
});

test('weapon routes unlock their matching weapon from the starter node', function () {
  ['cannon', 'sniper', 'beam', 'missile', 'drone'].forEach(function (routeId) {
    const starter = data.armoryRoutes.find(function (node) {
      return node.routeId === routeId && node.tier === 1;
    });

    assert.ok(starter, routeId + ' starter exists');
    assert.equal(starter.effects.unlock, routeId, routeId + ' starter unlocks matching weapon');
  });
});
