import test from 'node:test';
import assert from 'node:assert/strict';

import { createPlayer } from '../src/js/entities/factory.js';

const utils = {
  clamp: function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
};

test('createPlayer derives passive ship ability effects', function () {
  const player = createPlayer({
    shipId: 'guard',
    base: { x: 920 },
    h: 540
  }, {
    starships: [{
      id: 'guard',
      icon: 'shipGuard',
      hp: 112,
      damage: 2,
      speed: 218,
      range: 320,
      fireRate: -0.1,
      abilities: [
        { type: 'baseArmor', value: 0.1 },
        { type: 'coinBonus', value: 0.08 }
      ]
    }]
  }, utils);

  assert.equal(player.baseArmor, 0.1);
  assert.equal(player.coinBonus, 0.08);
});
