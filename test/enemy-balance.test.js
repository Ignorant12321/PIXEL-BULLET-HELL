import test from 'node:test';
import assert from 'node:assert/strict';

import data from '../src/js/data/index.js';

function waveTotal(wave) {
  return wave.entries.reduce(function (sum, entry) { return sum + entry[1]; }, 0);
}

test('enemy speeds use a slower readable profile while preserving roles', function () {
  const expectedMaxSpeed = {
    scout: 80,
    riftHunter: 64,
    raider: 50,
    splitter: 42,
    jammer: 40,
    gunner: 34,
    tank: 30,
    shieldWarden: 28,
    elite: 25,
    boss: 15,
    voidMothership: 14
  };

  Object.keys(expectedMaxSpeed).forEach(function (id) {
    assert.ok(data.enemies[id].speed <= expectedMaxSpeed[id], id + ' speed should be slowed');
  });
  assert.ok(data.enemies.scout.speed > data.enemies.raider.speed, 'scout remains the fastest basic enemy');
  assert.ok(data.enemies.raider.speed > data.enemies.tank.speed, 'raider remains faster than tank');
  assert.ok(data.enemies.boss.speed > data.enemies.voidMothership.speed, 'act two boss remains the slowest threat');
});

test('enemy durability, ranged pressure, and rewards keep each enemy distinctive', function () {
  assert.ok(data.enemies.tank.hp > data.enemies.raider.hp * 2, 'tank is distinctly durable');
  assert.ok(data.enemies.shieldWarden.hp > data.enemies.gunner.hp, 'shield warden is tougher than gunner');
  assert.ok(data.enemies.gunner.bulletDamage > data.enemies.raider.bulletDamage, 'gunner supplies ranged pressure');
  assert.ok(data.enemies.jammer.ability && data.enemies.jammer.ability.type === 'jam', 'jammer keeps control identity');
  assert.ok(data.enemies.splitter.ability && data.enemies.splitter.ability.type === 'split', 'splitter keeps swarm identity');
  assert.ok(data.enemies.voidMothership.hp > data.enemies.boss.hp, 'act two boss is the thickest unit');
});

test('waves contain denser enemy counts after slowing enemies down', function () {
  const actOneTotals = data.acts[0].waves.map(waveTotal);
  const actTwoTotals = data.acts[1].waves.map(waveTotal);

  assert.deepEqual(actOneTotals, [14, 18, 21, 15, 26, 21, 31, 24, 41, 15]);
  assert.deepEqual(actTwoTotals, [20, 26, 21, 16, 26, 17, 29, 16, 34, 11]);
});
