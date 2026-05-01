const aegis = {
  id: "aegis",
  name: "曜盾号",
  icon: "shipAegis",
  role: "盾卫型",
  hp: 126,
  damage: 2,
  speed: 198,
  range: 330,
  fireRate: -0.08,
  bombs: 2,
  abilities: [
    { type: "waveShield", value: 1 },
    { type: "baseArmor", value: 0.16 }
  ],
  color: "#8fb7ff",
  special: "生命与基地减伤更强，每波获得护盾，适合第二幕高压波次。",
  brief: "高生命 / 高减伤 / 低机动"
};

export default aegis;
