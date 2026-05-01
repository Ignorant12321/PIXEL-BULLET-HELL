import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 6,
  name: '护航火网',
  kind: '普通',
  reward: 152,
  phases: [
    { at: 0.55, sequence: [['shieldWarden', 2]], interval: [0.8, 1.1] },
    {
      delay: 0.6,
      pool: [
        { type: 'shieldWarden', count: 4, weight: 1 },
        { type: 'jammer', count: 5, weight: 2 },
        { type: 'gunner', count: 4, weight: 2 }
      ],
      interval: [0.58, 0.9]
    },
    { delay: 0.8, sequence: [['gunner', 2]], interval: [0.75, 1.05] }
  ]
});
