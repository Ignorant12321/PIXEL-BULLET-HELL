import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 3,
  name: '护盾前线',
  kind: '普通',
  reward: 132,
  phases: [
    { at: 0.55, sequence: [['shieldWarden', 2]], interval: [0.8, 1.1] },
    {
      delay: 0.6,
      pool: [
        { type: 'shieldWarden', count: 3, weight: 1 },
        { type: 'raider', count: 11, weight: 4 },
        { type: 'gunner', count: 3, weight: 2 }
      ],
      interval: [0.52, 0.82]
    },
    { delay: 0.8, sequence: [['gunner', 2]], interval: [0.75, 1.05] }
  ]
});
