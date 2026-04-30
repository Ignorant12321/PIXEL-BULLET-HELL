export function getWaveDifficulty(data, waveIndex) {
  const wave = ((data || {}).waves || [])[waveIndex] || {};
  const difficulty = (data || {}).difficulty || {};
  const actId = wave.actId || 'act-01';
  const local = wave.localWave || wave.wave || (waveIndex + 1);
  const waveNo = String(local).padStart(2, '0');
  const actTable = ((difficulty.acts || {})[actId] || {}).waves || difficulty.waves || {};

  if (Array.isArray(actTable)) return actTable[local - 1] || {};
  return actTable['wave' + waveNo] || actTable[waveNo] || actTable[String(local)] || {};
}

export default { getWaveDifficulty };
