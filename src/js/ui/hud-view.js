function formatNumber(value) {
  const text = String(Math.max(0, Math.floor(Number(value) || 0)));
  return text.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function buildHudReadouts(view, totalWaves) {
  const actNo = (view.actIndex || 0) + 1;
  const allWaves = Math.max(1, Number(totalWaves) || 1);
  const actWaveTotal = Math.min(10, allWaves);
  const localWave = Math.max(1, Number(view.localWave) || (Number(view.waveIndex) || 0) + 1);
  const globalWave = Math.max(1, Number(view.globalWave) || (Number(view.waveIndex) || 0) + 1);
  return [
    { id: 'score', icon: '★', label: '分数', value: formatNumber(view.score), detail: '本局得分' },
    { id: 'coin', icon: '￥', label: '晶币', value: formatNumber(view.coins), detail: '可用资金' },
    {
      id: 'wave',
      icon: '⚔',
      label: 'ACT ' + String(actNo).padStart(2, '0'),
      value: localWave + ' / ' + actWaveTotal,
      detail: '总波次 ' + globalWave + '/' + allWaves + ' · ' + (view.actCodename || '星环封锁')
    },
    { id: 'best', icon: '🏆', label: '最高分', value: formatNumber(view.best), detail: '历史最佳' }
  ];
}
