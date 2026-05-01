import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 2,
  name: '闪断突袭',
  kind: '普通',
  reward: 122,
  phases: [
    { at: 0.4, sequence: [['scout', 4]], interval: [0.4, 0.62] },
    {
      delay: 0.5,
      pool: [
        { type: 'scout', count: 8, weight: 3 },
        { type: 'riftHunter', count: 10, weight: 3 }
      ],
      interval: [0.45, 0.72]
    },
    { delay: 0.8, sequence: [['gunner', 4]], interval: [0.7, 1] }
  ]
});
