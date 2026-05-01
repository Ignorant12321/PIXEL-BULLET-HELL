import test from 'node:test';
import assert from 'node:assert/strict';

import data from '../src/js/data/index.js';

test('starship roster includes six distinct selectable models with icons', function () {
  const ids = data.starships.map(function (ship) { return ship.id; });
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, ['swift', 'guard', 'ranger', 'scarlet', 'weaver', 'aegis']);

  data.starships.forEach(function (ship) {
    assert.equal(typeof ship.name, 'string', ship.id + ' name');
    assert.ok(data.icons[ship.icon], ship.id + ' icon should be registered');
    assert.ok(ship.hp >= 70, ship.id + ' hp');
    assert.ok(ship.damage >= 1, ship.id + ' damage');
    assert.ok(ship.speed >= 180, ship.id + ' speed');
    assert.ok(ship.range >= 300, ship.id + ' range');
    assert.ok(ship.bombs >= 1, ship.id + ' bombs');
    assert.equal(typeof ship.special, 'string', ship.id + ' special');
    assert.equal(typeof ship.brief, 'string', ship.id + ' brief');
  });
});

test('starship special mechanics are declared as ability data', function () {
  const byId = Object.fromEntries(data.starships.map(function (ship) { return [ship.id, ship]; }));

  assert.deepEqual(byId.guard.abilities, [
    { type: 'waveShield', value: 1 },
    { type: 'baseArmor', value: 0.1 }
  ]);
  assert.deepEqual(byId.ranger.abilities, [
    { type: 'coinBonus', value: 0.08 }
  ]);
  assert.deepEqual(byId.weaver.abilities, [
    { type: 'coinBonus', value: 0.04 }
  ]);
  assert.deepEqual(byId.aegis.abilities, [
    { type: 'waveShield', value: 1 },
    { type: 'baseArmor', value: 0.16 }
  ]);

  data.starships.forEach(function (ship) {
    assert.equal(Object.hasOwn(ship, 'shieldAtWave'), false, ship.id + ' should not use legacy shieldAtWave');
    assert.equal(Object.hasOwn(ship, 'baseArmor'), false, ship.id + ' should not use legacy baseArmor');
    assert.equal(Object.hasOwn(ship, 'coinBonus'), false, ship.id + ' should not use legacy coinBonus');
  });
});
