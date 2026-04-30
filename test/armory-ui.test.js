import test from 'node:test';
import assert from 'node:assert/strict';

import {
  armoryRouteSelection,
  armoryRouteSummary,
  armoryRouteTabs,
  armoryTreeLayout,
  nodeState
} from '../src/js/ui/armory-view.js';

const routes = [
  { id: 'a-root', routeId: 'alpha', tier: 1, max: 1, cost: 50, effects: {}, name: 'Root' },
  { id: 'a-left', routeId: 'alpha', tier: 2, max: 1, cost: 80, prereq: ['a-root'], locks: ['a-right'], effects: {}, name: 'Left' },
  { id: 'a-right', routeId: 'alpha', tier: 2, max: 1, cost: 80, prereq: ['a-root'], locks: ['a-left'], effects: {}, name: 'Right' },
  { id: 'b-root', routeId: 'beta', tier: 1, max: 2, cost: 30, effects: {}, name: 'Beta' }
];

test('armoryRouteSummary groups nodes by route and investment', function () {
  const summary = armoryRouteSummary({
    routes,
    levels: { 'a-root': 1, 'a-left': 1, 'a-right': 0, 'b-root': 2 },
    phase: 'intermission'
  });

  assert.equal(summary.length, 2);
  assert.equal(summary[0].routeId, 'alpha');
  assert.equal(summary[0].spent, 130);
  assert.equal(summary[0].canRespec, true);
  assert.equal(summary[1].spent, 60);
});

test('nodeState reports locked, exclusive, maxed, and available states', function () {
  const levels = { 'a-root': 1, 'a-left': 1, 'a-right': 0 };

  assert.equal(nodeState(routes[0], levels, 999), 'maxed');
  assert.equal(nodeState(routes[1], levels, 999), 'maxed');
  assert.equal(nodeState(routes[2], levels, 999), 'exclusive');
  assert.equal(nodeState({ id: 'late', prereq: ['missing'], max: 1, cost: 5 }, levels, 999), 'locked');
  assert.equal(nodeState({ id: 'poor', max: 1, cost: 1000 }, levels, 5), 'coins');
  assert.equal(nodeState({ id: 'open', max: 1, cost: 5 }, levels, 999), 'available');
});

test('armoryTreeLayout returns tiered nodes, connector edges, and compact reset controls', function () {
  const layout = armoryTreeLayout({
    routes,
    levels: { 'a-root': 1, 'a-left': 0, 'a-right': 0 },
    coins: 999,
    phase: 'intermission'
  });
  const alpha = layout.find(function (group) { return group.routeId === 'alpha'; });

  assert.ok(alpha, 'alpha route exists');
  assert.equal(alpha.resetAction.compact, true);
  assert.equal(alpha.resetAction.label, '↺');
  assert.equal(alpha.resetAction.disabled, false);
  assert.deepEqual(alpha.tiers.map(function (tier) { return tier.tier; }), [1, 2]);
  assert.equal(alpha.edges.some(function (edge) {
    return edge.from === 'a-root' && edge.to === 'a-left';
  }), true);
  assert.equal(alpha.edges.some(function (edge) {
    return edge.from === 'a-root' && edge.to === 'a-right';
  }), true);
  assert.ok(alpha.nodes.every(function (node) {
    return Number.isFinite(node.x) && Number.isFinite(node.y) && node.state;
  }));
});

test('armoryRouteTabs exposes a second-level route menu with core as default', function () {
  const view = {
    routes,
    levels: { 'a-root': 1, 'b-root': 2 },
    coins: 999,
    phase: 'intermission'
  };
  const tabs = armoryRouteTabs(view, 'missing');

  assert.deepEqual(tabs.map(function (tab) { return tab.id; }), ['overview', 'alpha', 'beta']);
  assert.equal(tabs[0].name, '概览');
  assert.equal(tabs[1].spent, 50);
  assert.equal(tabs[2].spent, 60);
  assert.equal(tabs[1].active, true);
});

test('armoryRouteSelection shows one tree at a time and reserves overview for compact cards', function () {
  const view = {
    routes,
    levels: { 'a-root': 1, 'b-root': 2 },
    coins: 999,
    phase: 'intermission'
  };
  const selected = armoryRouteSelection(view, 'beta');
  const overview = armoryRouteSelection(view, 'overview');

  assert.equal(selected.mode, 'tree');
  assert.equal(selected.activeRouteId, 'beta');
  assert.deepEqual(selected.groups.map(function (group) { return group.routeId; }), ['beta']);
  assert.equal(overview.mode, 'overview');
  assert.equal(overview.groups.length, 2);
  assert.equal(overview.groups.every(function (group) { return group.compact === true; }), true);
});
