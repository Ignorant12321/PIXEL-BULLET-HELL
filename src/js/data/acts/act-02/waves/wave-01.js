import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 1,
  name: '裂隙余波',
  kind: '普通',
  reward: 112,
  phases: [
    { at: 0.5, sequence: [['raider', 3]], interval: [0.52, 0.8] },
    {
      delay: 0.6,
      pool: [
        { type: 'raider', count: 7, weight: 3 },
        { type: 'riftHunter', count: 6, weight: 2 }
      ],
      interval: [0.55, 0.85]
    },
    { delay: 0.9, sequence: [['tank', 4]], interval: [0.85, 1.2] }
  ]
});
