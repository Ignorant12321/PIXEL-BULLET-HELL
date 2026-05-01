import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 7,
  name: '火线穿插',
  kind: '普通',
  reward: 76,
  phases: [
    { at: 0.35, sequence: [['scout', 5]], interval: [0.38, 0.6] },
    {
      delay: 0.4,
      pool: [
        { type: 'scout', count: 10, weight: 4 },
        { type: 'raider', count: 11, weight: 3 },
        { type: 'gunner', count: 3, weight: 1 }
      ],
      interval: [0.42, 0.7]
    },
    { delay: 0.8, sequence: [['gunner', 2]], interval: [0.7, 1] }
  ]
});
