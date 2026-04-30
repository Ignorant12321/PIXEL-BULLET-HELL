import { getWaveDifficulty } from '../data/difficulty.js';

export function buildSpawnQueue(wave, waveIndex, data) {
  let t = 0.38;
  const queue = [];
  const waveCfg = getWaveDifficulty(data, waveIndex);
  const spawnScale = waveCfg.spawn || 1;
  wave.entries.forEach(function (entry) {
    const type = entry[0], count = entry[1];
    for (let i = 0; i < count; i++) {
      t += ((type === 'tank' || type === 'elite' || type === 'boss') ? 1.05 : 0.48) * spawnScale;
      queue.push({ time: t, type, spawned: false });
    }
  });
  return queue;
}
