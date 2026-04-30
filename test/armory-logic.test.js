import test from 'node:test';
import assert from 'node:assert/strict';

import { createArmoryState, createArmorySystem } from '../src/js/game/armory.js';

const routes = [
  { id: 'core-damage', routeId: 'core', tier: 1, max: 2, cost: 50, effects: { damage: 1 } },
  { id: 'core-rate', routeId: 'core', tier: 2, max: 1, cost: 60, prereq: ['core-damage'], effects: { fireRate: 0.2 } },
  { id: 'cannon-root', routeId: 'cannon', tier: 1, max: 1, cost: 70, effects: { unlock: 'cannon', damage: 1 } },
  { id: 'cannon-storm', routeId: 'cannon', tier: 2, branch: 'storm', max: 1, cost: 90, prereq: ['cannon-root'], locks: ['cannon-heavy'], effects: { lanes: 1 } },
  { id: 'cannon-heavy', routeId: 'cannon', tier: 2, branch: 'heavy', max: 1, cost: 90, prereq: ['cannon-root'], locks: ['cannon-storm'], effects: { pierce: 1 } }
];

function makeSystem(phase) {
  const state = {
    phase: phase || 'ready',
    coins: 500,
    armory: createArmoryState(routes)
  };
  return { state, armory: createArmorySystem(routes, state) };
}

test('buys nodes only when affordable and prereqs are met', function () {
  const ctx = makeSystem();

  assert.equal(ctx.armory.buy('core-rate').ok, false);
  assert.equal(ctx.armory.buy('core-rate').reason, 'locked');

  assert.equal(ctx.armory.buy('core-damage').ok, true);
  assert.equal(ctx.state.coins, 450);
  assert.equal(ctx.armory.buy('core-rate').ok, true);
  assert.equal(ctx.state.coins, 390);
});

test('prevents mutually exclusive branches', function () {
  const ctx = makeSystem();

  assert.equal(ctx.armory.buy('cannon-root').ok, true);
  assert.equal(ctx.armory.buy('cannon-storm').ok, true);

  const result = ctx.armory.buy('cannon-heavy');
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'exclusive');
});

test('derives combat effects from purchased levels', function () {
  const ctx = makeSystem();
  ctx.armory.buy('core-damage');
  ctx.armory.buy('core-damage');
  ctx.armory.buy('core-rate');
  ctx.armory.buy('cannon-root');

  assert.deepEqual(ctx.armory.effects(), {
    damage: 3,
    fireRate: 0.2,
    unlocks: { cannon: true }
  });
});

test('respec is blocked during combat and refunds route investment minus ten percent fee', function () {
  const playing = makeSystem('playing');
  playing.armory.buy('cannon-root');
  assert.equal(playing.armory.respecRoute('cannon').ok, false);
  assert.equal(playing.armory.respecRoute('cannon').reason, 'combat');

  const ctx = makeSystem('intermission');
  ctx.armory.buy('cannon-root');
  ctx.armory.buy('cannon-heavy');
  assert.equal(ctx.state.coins, 340);

  const result = ctx.armory.respecRoute('cannon');
  assert.equal(result.ok, true);
  assert.equal(result.refund, 140);
  assert.equal(ctx.state.coins, 480);
  assert.equal(ctx.state.armory.levels['cannon-root'], 0);
  assert.equal(ctx.state.armory.levels['cannon-heavy'], 0);
});
