import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 8,
  name: '双精英关',
  kind: '精英',
  elite: true,
  reward: 100,
  phases: [
    { at: 0.45, sequence: [['raider', 4]], interval: [0.48, 0.75] },
    {
      delay: 0.5,
      pool: [
        { type: 'raider', count: 8, weight: 3 },
        { type: 'tank', count: 3, weight: 1 },
        { type: 'gunner', count: 5, weight: 2 }
      ],
      interval: [0.55, 0.9]
    },
    { delay: 1, sequence: [['tank', 2], ['elite', 2]], interval: [0.9, 1.25] }
  ]
});
