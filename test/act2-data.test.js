import test from 'node:test';
import assert from 'node:assert/strict';

import data from '../src/js/data/index.js';
import { getWaveDifficulty } from '../src/js/data/difficulty.js';

test('second act is registered and flattened after act one', function () {
  assert.equal(data.acts.length, 2);
  assert.equal(data.acts[1].id, 'act-02');
  assert.equal(data.acts[1].waves.length, 10);
  assert.equal(data.waves.length, 20);
  assert.equal(data.waves[9].actId, 'act-01');
  assert.equal(data.waves[10].actId, 'act-02');
  assert.equal(data.waves[10].globalWave, 11);
});

test('act two uses its own difficulty table', function () {
  const actOne = getWaveDifficulty(data, 0);
  const actTwo = getWaveDifficulty(data, 10);

  assert.equal(actOne.wave, 1);
  assert.equal(actTwo.wave, 1);
  assert.ok(actTwo.normal.hp > actOne.normal.hp);
  assert.ok(actTwo.spawn <= actOne.spawn);
});

test('act two introduces richer enemy abilities', function () {
  ['riftHunter', 'shieldWarden', 'jammer', 'splitter', 'voidMothership'].forEach(function (id) {
    assert.ok(data.enemies[id], 'missing enemy ' + id);
    assert.ok(data.enemies[id].ability, id + ' should define an ability');
  });

  assert.equal(data.enemies.riftHunter.ability.type, 'blink');
  assert.equal(data.enemies.shieldWarden.ability.type, 'shield');
  assert.equal(data.enemies.jammer.ability.type, 'jam');
  assert.equal(data.enemies.splitter.ability.type, 'split');
  assert.equal(data.enemies.voidMothership.ability.type, 'summon');
});
