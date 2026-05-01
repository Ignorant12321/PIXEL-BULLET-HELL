import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 10,
  name: '虚空母舰',
  kind: 'Boss',
  boss: true,
  reward: 260,
  phases: [
    { at: 0.65, sequence: [['shieldWarden', 2]], interval: [0.8, 1.1] },
    {
      delay: 0.8,
      pool: [
        { type: 'shieldWarden', count: 3, weight: 1 },
        { type: 'jammer', count: 5, weight: 2 }
      ],
      interval: [0.65, 0.95]
    },
    { delay: 2, sequence: [['voidMothership', 1]], interval: 1.6 }
  ]
});
