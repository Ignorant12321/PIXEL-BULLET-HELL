export const routeNames = {
  core: '通用核心',
  cannon: '单轨主炮',
  sniper: '狙击炮',
  beam: '高能射线',
  missile: '微型导弹舱',
  drone: '僚机中枢',
  bomb: '歼灭弹核心'
};

export function nodeState(node, levels, coins) {
  const lv = Number(levels[node.id]) || 0;
  if (lv >= node.max) return 'maxed';
  if ((node.prereq || []).some(function (id) { return (Number(levels[id]) || 0) <= 0; })) return 'locked';
  if ((node.locks || []).some(function (id) { return (Number(levels[id]) || 0) > 0; })) return 'exclusive';
  if (coins < node.cost) return 'coins';
  return 'available';
}

export function armoryRouteSummary(view) {
  const groups = [];
  const byId = {};
  (view.routes || []).forEach(function (node) {
    if (!byId[node.routeId]) {
      byId[node.routeId] = { routeId: node.routeId, name: routeNames[node.routeId] || node.routeId, nodes: [], spent: 0, canRespec: view.phase !== 'playing' };
      groups.push(byId[node.routeId]);
    }
    byId[node.routeId].nodes.push(node);
    byId[node.routeId].spent += (Number(view.levels[node.id]) || 0) * node.cost;
  });
  groups.forEach(function (group) {
    group.nodes.sort(function (a, b) { return a.tier - b.tier || a.id.localeCompare(b.id); });
  });
  return groups;
}

function defaultRouteId(groups) {
  if (groups.some(function (group) { return group.routeId === 'core'; })) return 'core';
  return (groups[0] && groups[0].routeId) || 'overview';
}

function normalizeRouteId(groups, routeId) {
  if (routeId === 'overview') return 'overview';
  if (groups.some(function (group) { return group.routeId === routeId; })) return routeId;
  return defaultRouteId(groups);
}

export function armoryRouteTabs(view, selectedRouteId) {
  const groups = armoryRouteSummary(view);
  const activeRouteId = normalizeRouteId(groups, selectedRouteId);
  const totalSpent = groups.reduce(function (sum, group) { return sum + group.spent; }, 0);
  return [{
    id: 'overview',
    name: '概览',
    spent: totalSpent,
    active: activeRouteId === 'overview'
  }].concat(groups.map(function (group) {
    return {
      id: group.routeId,
      name: group.name,
      spent: group.spent,
      active: group.routeId === activeRouteId
    };
  }));
}

function laneFor(node) {
  if (!node.branch) return 0;
  if (['storm', 'execute', 'emp', 'swarm', 'guard', 'nova'].includes(node.branch)) return -1;
  if (['heavy', 'armor', 'burn', 'siege', 'sync', 'blackout'].includes(node.branch)) return 1;
  return 0;
}

export function armoryTreeLayout(view) {
  return armoryRouteSummary(view).map(function (group) {
    const maxTier = group.nodes.reduce(function (max, node) { return Math.max(max, node.tier); }, 1);
    const nodes = group.nodes.map(function (node) {
      const lane = laneFor(node);
      return Object.assign({}, node, {
        lane,
        x: maxTier <= 1 ? 50 : ((node.tier - 1) / (maxTier - 1)) * 72 + 14,
        y: lane === 0 ? 50 : lane < 0 ? 24 : 76,
        level: Number((view.levels || {})[node.id]) || 0,
        state: nodeState(node, view.levels || {}, view.coins || 0)
      });
    });
    const tiers = [];
    const byTier = {};
    nodes.forEach(function (node) {
      if (!byTier[node.tier]) {
        byTier[node.tier] = { tier: node.tier, nodes: [] };
        tiers.push(byTier[node.tier]);
      }
      byTier[node.tier].nodes.push(node);
    });
    tiers.sort(function (a, b) { return a.tier - b.tier; });
    tiers.forEach(function (tier) {
      tier.nodes.sort(function (a, b) { return a.lane - b.lane || a.id.localeCompare(b.id); });
      if (tier.nodes.length > 1) {
        tier.nodes.forEach(function (node, idx) {
          node.y = 22 + (idx / (tier.nodes.length - 1)) * 56;
        });
      }
    });
    const byNode = {};
    nodes.forEach(function (node) { byNode[node.id] = node; });
    const edges = [];
    nodes.forEach(function (node) {
      (node.prereq || []).forEach(function (id) {
        if (!byNode[id]) return;
        edges.push({
          from: id,
          to: node.id,
          x1: byNode[id].x,
          y1: byNode[id].y,
          x2: node.x,
          y2: node.y
        });
      });
    });
    return Object.assign({}, group, {
      nodes,
      tiers,
      edges,
      resetAction: {
        compact: true,
        label: '↺',
        title: '重置路线',
        disabled: !group.canRespec || group.spent <= 0
      }
    });
  });
}

export function armoryRouteSelection(view, selectedRouteId) {
  const groups = armoryTreeLayout(view);
  const activeRouteId = normalizeRouteId(groups, selectedRouteId);
  const tabs = armoryRouteTabs(view, activeRouteId);
  if (activeRouteId === 'overview') {
    return {
      mode: 'overview',
      activeRouteId,
      tabs,
      groups: groups.map(function (group) {
        const purchased = group.nodes.reduce(function (sum, node) { return sum + node.level; }, 0);
        const total = group.nodes.reduce(function (sum, node) { return sum + node.max; }, 0);
        const available = group.nodes.filter(function (node) { return node.state === 'available'; }).length;
        return Object.assign({}, group, {
          compact: true,
          purchased,
          total,
          available
        });
      })
    };
  }
  return {
    mode: 'tree',
    activeRouteId,
    tabs,
    groups: groups.filter(function (group) { return group.routeId === activeRouteId; })
  };
}
