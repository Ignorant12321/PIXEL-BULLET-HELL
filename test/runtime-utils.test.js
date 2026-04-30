import test from 'node:test';
import assert from 'node:assert/strict';

import { nearestTargetInRange } from '../src/js/game/targets.js';
import { compactActive } from '../src/js/game/collections.js';

test('nearestTargetInRange returns the nearest active enemy without sorting callers', function () {
  const state = {
    player: { x: 400, y: 100, radius: 10 },
    enemies: [
      { x: 310, y: 100, radius: 10, active: false, id: 'inactive' },
      { x: 260, y: 100, radius: 10, active: true, id: 'far' },
      { x: 340, y: 103, radius: 10, active: true, id: 'near' }
    ]
  };

  const target = nearestTargetInRange(state, 160, 0);
  assert.equal(target.id, 'near');
});

test('compactActive mutates arrays in place and keeps active entries', function () {
  const a = { active: true };
  const b = { active: false };
  const c = { active: true };
  const list = [a, null, b, c];
  const same = compactActive(list);

  assert.equal(same, list);
  assert.deepEqual(list, [a, c]);
});
