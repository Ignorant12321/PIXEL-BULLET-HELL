import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 5,
  name: '裂变集群',
  kind: '普通',
  reward: 142,
  phases: [
    { at: 0.45, sequence: [['splitter', 3]], interval: [0.6, 0.85] },
    {
      delay: 0.5,
      pool: [
        { type: 'splitter', count: 5, weight: 2 },
        { type: 'scout', count: 13, weight: 4 }
      ],
      interval: [0.42, 0.68]
    },
    { delay: 0.8, sequence: [['tank', 5]], interval: [0.85, 1.2] }
  ]
});
