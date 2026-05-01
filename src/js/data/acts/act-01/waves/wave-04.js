import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 4,
  name: '精英压制',
  kind: '精英',
  elite: true,
  reward: 78,
  phases: [
    { at: 0.5, sequence: [['raider', 3]], interval: [0.5, 0.75] },
    {
      delay: 0.6,
      pool: [
        { type: 'raider', count: 7, weight: 3 },
        { type: 'gunner', count: 4, weight: 1 }
      ],
      interval: [0.55, 0.85]
    },
    { delay: 1.1, sequence: [['elite', 1]], interval: 1.2 }
  ]
});
