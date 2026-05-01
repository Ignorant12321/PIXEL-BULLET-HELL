const splitter = {
  role: 'normal',
  name: '分裂载体',
  hp: 28,
  speed: 40,
  radius: 15,
  reward: 12,
  damage: 12,
  baseDamage: 14,
  bulletDamage: 0,
  score: 42,
  icon: 'elite',
  color: '#ff6370',
  ability: { type: 'split', into: 'riftHunter', count: 2, hpScale: 0.65 },
  desc: '被摧毁时会释放多个低生命裂隙猎手。'
};

export default splitter;
