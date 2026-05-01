import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 3,
  name: '装甲试探',
  kind: '普通',
  reward: 52,
  phases: [
    { at: 0.45, sequence: [['scout', 3]], interval: [0.5, 0.75] },
    {
      delay: 0.5,
      pool: [
        { type: 'scout', count: 5, weight: 3 },
        { type: 'raider', count: 8, weight: 2 }
      ],
      interval: [0.48, 0.75]
    },
    { delay: 0.8, sequence: [['raider', 2], ['tank', 3]], interval: [0.8, 1.15] }
  ]
});
