function wave(n, cfg) {
  return Object.assign({ wave: n }, cfg);
}

export function getWaveDifficulty(data, waveIndex) {
  const waves = ((data || {}).difficulty || {}).waves || {};
  const waveNo = String(waveIndex + 1).padStart(2, '0');

  if (Array.isArray(waves)) {
    return waves[waveIndex] || {};
  }

  return waves['wave' + waveNo] || waves[waveNo] || waves[String(waveIndex + 1)] || {};
}

export const difficulty = {
  base: {
    coins: 80,
    baseHp: 160,
    maxBombs: 6,
    bulletSpeed: 560,
    rangeUpgrade: 45,
    hullUpgradeHp: 18,
    hullRepair: 34,
    baseRepair: 34,
    pickupHullRepair: 14,
    pickupBaseRepair: 16
  },
  waves: {
    wave01: wave(1, {
      normal: { hp: 1, attack: 1, speed: 1, fire: 1 },
      elite: { hp: 1, attack: 1, speed: 1, fire: 1 },
      boss: { hp: 1, attack: 1, speed: 1, fire: 1 },
      spawn: 1
    }),
    wave02: wave(2, {
      normal: { hp: 1.04, attack: 1.03, speed: 1.02, fire: 1.02 },
      elite: { hp: 1.02, attack: 1.02, speed: 1.01, fire: 1.02 },
      boss: { hp: 1, attack: 1, speed: 1, fire: 1 },
      spawn: 0.98
    }),
    wave03: wave(3, {
      normal: { hp: 1.08, attack: 1.06, speed: 1.04, fire: 1.04 },
      elite: { hp: 1.05, attack: 1.04, speed: 1.02, fire: 1.04 },
      boss: { hp: 1, attack: 1, speed: 1, fire: 1 },
      spawn: 0.97
    }),
    wave04: wave(4, {
      normal: { hp: 1.12, attack: 1.09, speed: 1.06, fire: 1.06 },
      elite: { hp: 1.08, attack: 1.07, speed: 1.03, fire: 1.05 },
      boss: { hp: 1, attack: 1, speed: 1, fire: 1 },
      spawn: 0.96
    }),
    wave05: wave(5, {
      normal: { hp: 1.16, attack: 1.12, speed: 1.08, fire: 1.08 },
      elite: { hp: 1.1, attack: 1.09, speed: 1.04, fire: 1.06 },
      boss: { hp: 1, attack: 1, speed: 1, fire: 1 },
      spawn: 0.95
    }),
    wave06: wave(6, {
      normal: { hp: 1.2, attack: 1.15, speed: 1.1, fire: 1.1 },
      elite: { hp: 1.12, attack: 1.11, speed: 1.05, fire: 1.08 },
      boss: { hp: 1, attack: 1, speed: 1, fire: 1 },
      spawn: 0.94
    }),
    wave07: wave(7, {
      normal: { hp: 1.24, attack: 1.18, speed: 1.12, fire: 1.12 },
      elite: { hp: 1.15, attack: 1.13, speed: 1.06, fire: 1.1 },
      boss: { hp: 1, attack: 1, speed: 1, fire: 1 },
      spawn: 0.93
    }),
    wave08: wave(8, {
      normal: { hp: 1.28, attack: 1.22, speed: 1.14, fire: 1.14 },
      elite: { hp: 1.18, attack: 1.16, speed: 1.07, fire: 1.12 },
      boss: { hp: 1, attack: 1, speed: 1, fire: 1 },
      spawn: 0.92
    }),
    wave09: wave(9, {
      normal: { hp: 1.32, attack: 1.26, speed: 1.15, fire: 1.16 },
      elite: { hp: 1.2, attack: 1.18, speed: 1.08, fire: 1.14 },
      boss: { hp: 1, attack: 1, speed: 1, fire: 1 },
      spawn: 0.91
    }),
    wave10: wave(10, {
      normal: { hp: 1.36, attack: 1.3, speed: 1.16, fire: 1.18 },
      elite: { hp: 1.22, attack: 1.2, speed: 1.09, fire: 1.16 },
      boss: { hp: 1.08, attack: 1.1, speed: 1.04, fire: 1.08 },
      spawn: 0.9
    })
  }
};

export default difficulty;
