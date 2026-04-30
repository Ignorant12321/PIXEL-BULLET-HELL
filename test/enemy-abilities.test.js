import test from 'node:test';
import assert from 'node:assert/strict';

import { applyEnemyAbility, createAbilityState } from '../src/js/game/enemy-abilities.js';

test('shield ability periodically reduces incoming damage', function () {
  const enemy = { ability: { type: 'shield', reduction: 0.55, cycle: 4, duration: 2 }, abilityState: createAbilityState({ type: 'shield' }) };
  enemy.abilityState.timer = 1;

  assert.equal(applyEnemyAbility('incomingDamage', enemy, { damage: 20 }).damage, 9);
});

test('split ability returns child spawns on death', function () {
  const enemy = { x: 120, y: 80, ability: { type: 'split', into: 'riftHunter', count: 3 } };
  const result = applyEnemyAbility('death', enemy, {});

  assert.equal(result.spawns.length, 3);
  assert.equal(result.spawns[0].type, 'riftHunter');
});

test('jam ability marks player with temporary jam on hit', function () {
  const state = { buff: { jam: 0 } };
  const enemy = { ability: { type: 'jam', duration: 3 } };

  applyEnemyAbility('hitPlayer', enemy, { state });

  assert.equal(state.buff.jam, 3);
});
