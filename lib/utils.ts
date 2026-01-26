export function calculateGridLayout(nodes: any[]) {
  const columns = Math.ceil(Math.sqrt(nodes.length));
  const GAP = 40;
  const CARD_SIZE = 280;
  return nodes.map((node, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const x = col * (CARD_SIZE + GAP);
    const y = row * (CARD_SIZE + GAP);
    return {
      ...node,
      position: { x, y }
    };
  });
}
