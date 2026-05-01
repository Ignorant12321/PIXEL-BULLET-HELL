const jammer = {
  role: 'normal',
  name: '干扰舰',
  hp: 32,
  speed: 38,
  radius: 15,
  reward: 13,
  damage: 12,
  baseDamage: 15,
  bulletDamage: 6,
  score: 48,
  fireEvery: 1.8,
  icon: 'gunner',
  color: '#ffab4d',
  ability: { type: 'jam', duration: 3 },
  desc: '发射干扰弹，命中后短时间降低机动和火力节奏。'
};

export default jammer;
