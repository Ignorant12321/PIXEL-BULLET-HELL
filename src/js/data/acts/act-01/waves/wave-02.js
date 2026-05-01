import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 2,
  name: '碎片带冲突',
  kind: '普通',
  reward: 42,
  phases: [
    { at: 0.5, sequence: [['scout', 3]], interval: [0.55, 0.85] },
    {
      delay: 0.6,
      pool: [
        { type: 'scout', count: 6, weight: 3 },
        { type: 'raider', count: 7, weight: 2 }
      ],
      interval: [0.5, 0.8]
    },
    { delay: 0.9, sequence: [['raider', 2]], interval: [0.65, 0.9] }
  ]
});
