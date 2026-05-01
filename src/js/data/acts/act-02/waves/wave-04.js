import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 4,
  name: '干扰同步',
  kind: '精英',
  elite: true,
  reward: 154,
  phases: [
    { at: 0.5, sequence: [['jammer', 2]], interval: [0.75, 1] },
    {
      delay: 0.6,
      pool: [
        { type: 'jammer', count: 4, weight: 1 },
        { type: 'riftHunter', count: 8, weight: 3 }
      ],
      interval: [0.55, 0.85]
    },
    { delay: 1, sequence: [['elite', 2]], interval: [1, 1.35] }
  ]
});
