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
