import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 8,
  name: '裂隙精英群',
  kind: '精英',
  elite: true,
  reward: 190,
  phases: [
    { at: 0.55, sequence: [['shieldWarden', 3]], interval: [0.75, 1.05] },
    {
      delay: 0.6,
      pool: [
        { type: 'shieldWarden', count: 4, weight: 1 },
        { type: 'jammer', count: 6, weight: 2 }
      ],
      interval: [0.65, 0.95]
    },
    { delay: 1, sequence: [['elite', 3]], interval: [1, 1.35] }
  ]
});
