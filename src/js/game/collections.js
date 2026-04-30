export function compactActive(list) {
  let write = 0;
  for (let read = 0; read < list.length; read++) {
    const item = list[read];
    if (!item || !item.active) continue;
    list[write] = item;
    write += 1;
  }
  list.length = write;
  return list;
}
