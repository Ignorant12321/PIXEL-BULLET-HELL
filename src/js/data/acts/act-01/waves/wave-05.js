import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 5,
  name: '蜂群突入',
  kind: '普通',
  reward: 64,
  phases: [
    { at: 0.4, sequence: [['scout', 4]], interval: [0.42, 0.65] },
    {
      delay: 0.4,
      pool: [
        { type: 'scout', count: 9, weight: 4 },
        { type: 'raider', count: 9, weight: 2 }
      ],
      interval: [0.42, 0.7]
    },
    { delay: 0.9, sequence: [['tank', 4]], interval: [0.85, 1.15] }
  ]
});
