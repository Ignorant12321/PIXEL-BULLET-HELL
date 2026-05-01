import test from 'node:test';
import assert from 'node:assert/strict';

import {
  nextShipSelectPage,
  shipSelectPageForSelection,
  visibleShipPage
} from '../src/js/ui/ship-select-view.js';

const ships = ['swift', 'guard', 'ranger', 'scarlet', 'weaver', 'aegis'].map(function (id) {
  return { id };
});

test('ship select shows three ships per page', function () {
  assert.deepEqual(visibleShipPage(ships, 0).ships.map(function (ship) { return ship.id; }), ['swift', 'guard', 'ranger']);
  assert.deepEqual(visibleShipPage(ships, 1).ships.map(function (ship) { return ship.id; }), ['scarlet', 'weaver', 'aegis']);
});

test('ship select page follows the selected ship and wraps arrow navigation', function () {
  assert.equal(shipSelectPageForSelection(ships, 'weaver'), 1);
  assert.equal(nextShipSelectPage(ships, 0, 1), 1);
  assert.equal(nextShipSelectPage(ships, 1, 1), 0);
  assert.equal(nextShipSelectPage(ships, 0, -1), 1);
});
