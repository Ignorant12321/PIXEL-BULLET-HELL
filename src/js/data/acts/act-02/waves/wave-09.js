import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 9,
  name: '虚空合围',
  kind: '普通',
  reward: 178,
  phases: [
    { at: 0.4, sequence: [['riftHunter', 4]], interval: [0.45, 0.7] },
    {
      delay: 0.45,
      pool: [
        { type: 'riftHunter', count: 8, weight: 3 },
        { type: 'splitter', count: 9, weight: 3 },
        { type: 'gunner', count: 5, weight: 2 },
        { type: 'tank', count: 4, weight: 1 }
      ],
      interval: [0.45, 0.75]
    },
    { delay: 0.8, sequence: [['gunner', 2], ['tank', 2]], interval: [0.8, 1.1] }
  ]
});
