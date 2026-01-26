import { Node } from 'reactflow';

/**
 * Calculates a non-overlapping position for a new node.
 * Uses a spiral grid search algorithm to find the nearest empty spot.
 */
export function getNonOverlappingPosition(
  nodes: Node[], 
  centerX: number = 0, 
  centerY: number = 0, 
  width: number = 240, 
  height: number = 240
): { x: number, y: number } {
  // If no nodes, return center
  if (nodes.length === 0) return { x: centerX, y: centerY };

  // Spiral algorithm parameters
  let angle = 0;
  let radius = 0;
  const separation = Math.max(width, height) + 50; // Minimum distance between nodes
  const maxIterations = 100;
  
  // Grid search fallback
  // We'll check positions in a spiral pattern
  
  for (let i = 0; i < maxIterations; i++) {
    // Calculate potential position
    // First iteration is center (radius 0)
    // Then we spiral out
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // Check if this position overlaps with any existing node
    const hasOverlap = nodes.some(node => {
      const dx = node.position.x - x;
      const dy = node.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < separation;
    });
    
    if (!hasOverlap) {
      return { x, y };
    }
    
    // Increment spiral
    // Increase angle and radius
    angle += 1; // Approx 57 degrees
    radius = Math.sqrt(i + 1) * separation; // Square root growth for even area coverage
  }

  // Fallback if too crowded: just put it far away
  return { 
    x: centerX + (Math.random() - 0.5) * 1000, 
    y: centerY + (Math.random() - 0.5) * 1000 
  };
}

/**
 * Arrange nodes in a cluster layout based on groups.
 */
export function getClusterLayout(
  nodes: Node[], 
  groups: { title: string, nodeIds: string[] }[]
): Node[] {
  const updatedNodes = [...nodes];
  const groupPadding = 300; // Space between groups
  const nodeSpacing = 220; // Space between nodes in a group
  
  let currentX = 0;
  
  groups.forEach((group, groupIndex) => {
    const groupNodes = group.nodeIds;
    // Calculate grid size for this group (approx square)
    const cols = Math.ceil(Math.sqrt(groupNodes.length));
    
    groupNodes.forEach((nodeId, index) => {
      const nodeIndex = updatedNodes.findIndex(n => n.id === nodeId);
      if (nodeIndex === -1) return;
      
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      updatedNodes[nodeIndex] = {
        ...updatedNodes[nodeIndex],
        position: {
          x: currentX + col * nodeSpacing,
          y: row * nodeSpacing
        }
      };
    });
    
    // Add title node logic would be handled by caller (adding new nodes), 
    // here we just return positions.
    // Move X for next group
    currentX += (cols * nodeSpacing) + groupPadding;
  });
  
  return updatedNodes;
}
