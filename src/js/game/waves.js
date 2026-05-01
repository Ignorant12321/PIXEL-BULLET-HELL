import { getWaveDifficulty } from '../data/difficulty.js';
import { summarizeWaveEntries } from '../data/acts/wave-utils.js';

export { summarizeWaveEntries };

function legacyInterval(type) {
  return (type === 'tank' || type === 'elite' || type === 'boss' || type === 'voidMothership') ? 1.05 : 0.48;
}

function intervalValue(interval, rng) {
  if (Array.isArray(interval)) {
    const min = Number(interval[0]) || 0;
    const max = Number(interval[1]) || min;
    return min + (max - min) * rng();
  }
  return Number(interval);
}

function pushSpawn(queue, type, time) {
  queue.push({ time, type, spawned: false });
}

function choosePoolItem(pool, rng) {
  const available = pool.filter(function (item) { return item.remaining > 0; });
  const totalWeight = available.reduce(function (sum, item) { return sum + (item.weight || 1); }, 0);
  let roll = rng() * totalWeight;
  for (let i = 0; i < available.length; i++) {
    roll -= available[i].weight || 1;
    if (roll <= 0) return available[i];
  }
  return available[available.length - 1];
}

function buildPhaseQueue(phases, spawnScale, rng) {
  let t = 0;
  const queue = [];
  (phases || []).forEach(function (phase) {
    if (typeof phase.at === 'number') t = phase.at;
    if (typeof phase.delay === 'number') t += phase.delay;
    const interval = phase.interval || [0.45, 0.75];
    (phase.sequence || phase.entries || []).forEach(function (entry) {
      const type = entry[0], count = entry[1];
      for (let i = 0; i < count; i++) {
        t += intervalValue(interval, rng) * spawnScale;
        pushSpawn(queue, type, t);
      }
    });
    const pool = (phase.pool || []).map(function (item) {
      return { type: item.type, remaining: item.count || 0, weight: item.weight || 1 };
    });
    while (pool.some(function (item) { return item.remaining > 0; })) {
      const item = choosePoolItem(pool, rng);
      item.remaining -= 1;
      t += intervalValue(interval, rng) * spawnScale;
      pushSpawn(queue, item.type, t);
    }
  });
  return queue;
}

export function buildSpawnQueue(wave, waveIndex, data, rng) {
  let t = 0.38;
  const queue = [];
  const waveCfg = getWaveDifficulty(data, waveIndex);
  const spawnScale = waveCfg.spawn || 1;
  const random = rng || Math.random;
  if (Array.isArray(wave.phases)) return buildPhaseQueue(wave.phases, spawnScale, random);
  wave.entries.forEach(function (entry) {
    const type = entry[0], count = entry[1];
    for (let i = 0; i < count; i++) {
      t += legacyInterval(type) * spawnScale;
      pushSpawn(queue, type, t);
    }
  });
  return queue;
}
