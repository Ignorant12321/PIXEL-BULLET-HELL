export const SHIP_PAGE_SIZE = 3;

export function shipSelectPageForSelection(starships, selectedId, pageSize) {
  const size = pageSize || SHIP_PAGE_SIZE;
  const idx = (starships || []).findIndex(function (ship) { return ship.id === selectedId; });
  return idx < 0 ? 0 : Math.floor(idx / size);
}

export function shipSelectPageCount(starships, pageSize) {
  const size = pageSize || SHIP_PAGE_SIZE;
  return Math.max(1, Math.ceil(((starships || []).length || 0) / size));
}

export function normalizeShipSelectPage(starships, page, pageSize) {
  const count = shipSelectPageCount(starships, pageSize);
  return Math.max(0, Math.min(count - 1, Number(page) || 0));
}

export function visibleShipPage(starships, page, pageSize) {
  const size = pageSize || SHIP_PAGE_SIZE;
  const current = normalizeShipSelectPage(starships, page, size);
  const start = current * size;
  return {
    page: current,
    pageCount: shipSelectPageCount(starships, size),
    ships: (starships || []).slice(start, start + size)
  };
}

export function nextShipSelectPage(starships, page, direction, pageSize) {
  const count = shipSelectPageCount(starships, pageSize);
  const current = normalizeShipSelectPage(starships, page, pageSize);
  return (current + direction + count) % count;
}
