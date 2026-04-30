function wave(n, cfg) {
  return Object.assign({ wave: n }, cfg);
}

export const difficulty = {
  waves: {
    wave01: wave(1, { normal: { hp: 1.38, attack: 1.25, speed: 1.08, fire: 1.10 }, elite: { hp: 1.28, attack: 1.20, speed: 1.06, fire: 1.10 }, boss: { hp: 1.12, attack: 1.12, speed: 1.04, fire: 1.08 }, spawn: 0.90 }),
    wave02: wave(2, { normal: { hp: 1.44, attack: 1.30, speed: 1.10, fire: 1.12 }, elite: { hp: 1.32, attack: 1.24, speed: 1.07, fire: 1.12 }, boss: { hp: 1.14, attack: 1.14, speed: 1.04, fire: 1.10 }, spawn: 0.89 }),
    wave03: wave(3, { normal: { hp: 1.50, attack: 1.35, speed: 1.11, fire: 1.14 }, elite: { hp: 1.36, attack: 1.28, speed: 1.08, fire: 1.14 }, boss: { hp: 1.16, attack: 1.16, speed: 1.05, fire: 1.12 }, spawn: 0.88 }),
    wave04: wave(4, { normal: { hp: 1.56, attack: 1.40, speed: 1.12, fire: 1.16 }, elite: { hp: 1.40, attack: 1.32, speed: 1.09, fire: 1.16 }, boss: { hp: 1.18, attack: 1.18, speed: 1.05, fire: 1.14 }, spawn: 0.87 }),
    wave05: wave(5, { normal: { hp: 1.62, attack: 1.45, speed: 1.13, fire: 1.18 }, elite: { hp: 1.44, attack: 1.36, speed: 1.10, fire: 1.18 }, boss: { hp: 1.20, attack: 1.20, speed: 1.06, fire: 1.16 }, spawn: 0.86 }),
    wave06: wave(6, { normal: { hp: 1.68, attack: 1.50, speed: 1.14, fire: 1.20 }, elite: { hp: 1.48, attack: 1.40, speed: 1.11, fire: 1.20 }, boss: { hp: 1.22, attack: 1.22, speed: 1.06, fire: 1.18 }, spawn: 0.85 }),
    wave07: wave(7, { normal: { hp: 1.74, attack: 1.55, speed: 1.15, fire: 1.22 }, elite: { hp: 1.52, attack: 1.44, speed: 1.12, fire: 1.22 }, boss: { hp: 1.24, attack: 1.24, speed: 1.07, fire: 1.20 }, spawn: 0.84 }),
    wave08: wave(8, { normal: { hp: 1.82, attack: 1.62, speed: 1.16, fire: 1.24 }, elite: { hp: 1.58, attack: 1.50, speed: 1.13, fire: 1.24 }, boss: { hp: 1.28, attack: 1.28, speed: 1.07, fire: 1.22 }, spawn: 0.83 }),
    wave09: wave(9, { normal: { hp: 1.90, attack: 1.70, speed: 1.17, fire: 1.26 }, elite: { hp: 1.64, attack: 1.56, speed: 1.14, fire: 1.26 }, boss: { hp: 1.32, attack: 1.32, speed: 1.08, fire: 1.24 }, spawn: 0.82 }),
    wave10: wave(10, { normal: { hp: 2.00, attack: 1.82, speed: 1.18, fire: 1.30 }, elite: { hp: 1.72, attack: 1.64, speed: 1.15, fire: 1.30 }, boss: { hp: 1.45, attack: 1.42, speed: 1.08, fire: 1.28 }, spawn: 0.80 })
  }
};

export default difficulty;
