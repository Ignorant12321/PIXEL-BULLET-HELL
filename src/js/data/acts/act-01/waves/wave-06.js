import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 6,
  name: '炮艇夹击',
  kind: '普通',
  reward: 70,
  phases: [
    { at: 0.45, sequence: [['raider', 4]], interval: [0.5, 0.75] },
    {
      delay: 0.6,
      pool: [
        { type: 'raider', count: 8, weight: 3 },
        { type: 'gunner', count: 5, weight: 2 }
      ],
      interval: [0.55, 0.85]
    },
    { delay: 0.9, sequence: [['tank', 4]], interval: [0.85, 1.2] }
  ]
});
