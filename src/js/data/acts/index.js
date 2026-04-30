import act01 from './act-01/index.js';
import act02 from './act-02/index.js';

function flattenWaves(acts) {
  const list = [];
  acts.forEach(function (act, actIndex) {
    act.waves.forEach(function (wave) {
      list.push(Object.assign({}, wave, {
        actId: act.id,
        actName: act.name,
        actCodename: act.codename,
        actIndex,
        localWave: wave.wave,
        globalWave: list.length + 1
      }));
    });
  });
  return list;
}

export const acts = [act01, act02];
export const waves = flattenWaves(acts);

export default acts;
