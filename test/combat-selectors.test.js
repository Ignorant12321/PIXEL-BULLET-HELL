import test from 'node:test';
import assert from 'node:assert/strict';

import { createCombatSelectors } from '../src/js/game/selectors.js';

function makeState(effects) {
  return {
    player: {
      damageBase: 2,
      fireRateBonus: 0.1,
      baseRange: 360,
      baseArmor: 0.05,
      coinBonus: 0.08
    },
    buff: { overdrive: 0, bounty: 0 },
    armoryEffects: effects || {}
  };
}

const baseCfg = function () {
  return { rangeUpgrade: 45 };
};

test('combat selectors combine ship and armory effects', function () {
  const selectors = createCombatSelectors(makeState({
    damage: 3,
    fireRate: 0.36,
    range: 90,
    crit: 0.16,
    pierce: 2,
    cannonRate: 0.1
  }), baseCfg);

  assert.equal(selectors.damage(), 5);
  assert.equal(selectors.fireRate(), 1.46);
  assert.equal(selectors.range(), 450);
  assert.equal(selectors.critChance(), 0.16);
  assert.equal(selectors.pierce(), 2);
  assert.equal(selectors.cannonRateBonus(), 0.1);
});

test('weapon unlocks come from armory effects while cannon remains default', function () {
  const selectors = createCombatSelectors(makeState({ unlocks: { sniper: true } }), baseCfg);

  assert.equal(selectors.weaponUnlocked('cannon'), true);
  assert.equal(selectors.weaponUnlocked('sniper'), true);
  assert.equal(selectors.weaponUnlocked('beam'), false);
});
