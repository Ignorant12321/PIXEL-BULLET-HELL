import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 10,
  name: '星环镇压者',
  kind: 'Boss',
  boss: true,
  reward: 160,
  phases: [
    { at: 0.5, sequence: [['raider', 3]], interval: [0.5, 0.75] },
    {
      delay: 0.7,
      pool: [
        { type: 'raider', count: 6, weight: 3 },
        { type: 'gunner', count: 5, weight: 2 }
      ],
      interval: [0.6, 0.9]
    },
    { delay: 1.8, sequence: [['boss', 1]], interval: 1.4 }
  ]
});
