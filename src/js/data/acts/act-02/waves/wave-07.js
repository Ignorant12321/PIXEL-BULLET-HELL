import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 7,
  name: '双相压境',
  kind: '普通',
  reward: 164,
  phases: [
    { at: 0.4, sequence: [['riftHunter', 3]], interval: [0.5, 0.75] },
    {
      delay: 0.5,
      pool: [
        { type: 'riftHunter', count: 7, weight: 3 },
        { type: 'splitter', count: 7, weight: 2 },
        { type: 'raider', count: 12, weight: 4 }
      ],
      interval: [0.45, 0.72]
    }
  ]
});
