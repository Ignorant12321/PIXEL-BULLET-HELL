import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 9,
  name: '封锁总攻',
  kind: '普通',
  reward: 92,
  phases: [
    { at: 0.35, sequence: [['scout', 5]], interval: [0.35, 0.55] },
    {
      delay: 0.35,
      pool: [
        { type: 'scout', count: 10, weight: 4 },
        { type: 'raider', count: 14, weight: 3 },
        { type: 'tank', count: 4, weight: 1 },
        { type: 'gunner', count: 4, weight: 2 }
      ],
      interval: [0.38, 0.65]
    },
    { delay: 0.8, sequence: [['tank', 2], ['gunner', 2]], interval: [0.75, 1.05] }
  ]
});
