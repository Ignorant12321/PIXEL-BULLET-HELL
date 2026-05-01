function addEntryCount(counts, order, type, count) {
  if (!counts[type]) order.push(type);
  counts[type] = (counts[type] || 0) + count;
}

export function summarizeWaveEntries(phases) {
  const counts = {};
  const order = [];
  (phases || []).forEach(function (phase) {
    (phase.sequence || phase.entries || []).forEach(function (entry) {
      addEntryCount(counts, order, entry[0], entry[1]);
    });
    (phase.pool || []).forEach(function (item) {
      addEntryCount(counts, order, item.type, item.count || 0);
    });
  });
  return order.map(function (type) { return [type, counts[type]]; });
}

export function defineWave(wave) {
  return Object.assign({}, wave, {
    entries: summarizeWaveEntries(wave.phases)
  });
}
