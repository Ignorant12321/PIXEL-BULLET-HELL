import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 1,
  name: '前哨侦察',
  kind: '普通',
  reward: 34,
  phases: [
    { at: 0.8, sequence: [['scout', 2]], interval: [0.7, 1] },
    {
      delay: 0.8,
      pool: [
        { type: 'scout', count: 4, weight: 3 },
        { type: 'raider', count: 6, weight: 2 }
      ],
      interval: [0.65, 0.95]
    },
    { delay: 1.1, sequence: [['raider', 2]], interval: [0.75, 1.05] }
  ]
});
