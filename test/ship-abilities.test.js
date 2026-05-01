import test from 'node:test';
import assert from 'node:assert/strict';

import { applyShipEvent, shipEffects } from '../src/js/game/ship-abilities.js';

test('shipEffects derives passive effects from ability declarations', function () {
  const effects = shipEffects({
    abilities: [
      { type: 'baseArmor', value: 0.1 },
      { type: 'coinBonus', value: 0.08 },
      { type: 'baseArmor', value: 0.06 }
    ]
  });

  assert.equal(effects.baseArmor, 0.16);
  assert.equal(effects.coinBonus, 0.08);
});

test('applyShipEvent grants wave start shields from ship abilities', function () {
  const state = {
    buff: { shield: 0 },
    shieldCharges: 0
  };

  applyShipEvent('waveStart', {
    ship: {
      abilities: [
        { type: 'waveShield', value: 1 }
      ]
    },
    state,
    shieldLevel: 0
  });

  assert.equal(state.buff.shield, 6);
  assert.equal(state.shieldCharges, 1);
});
