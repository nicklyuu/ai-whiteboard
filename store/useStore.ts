import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';
import { getLayoutedElements } from '../utils/layout';

type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

type RFState = {
  nodes: Node[];
  edges: Edge[];
  messages: ChatMessage[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addMessage: (role: 'user' | 'ai', content: string) => void;
  addGraphData: (newNodes: Node[], newEdges: Edge[]) => void;
  layout: (direction?: 'LR' | 'TB') => void;
  toggleFold: (nodeId: string) => void;
};

const useStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  messages: [
    { 
      id: '1', 
      role: 'ai', 
      content: 'Hello! I am your whiteboard assistant. Tell me what to draw or explain a concept, and I will visualize it for you.' 
    }
  ],

  onNodesChange: (changes: NodeChange[]) => {
    const { nodes, edges } = get();
    
    // Check for deletion events to implement cascade delete
    const deletionChanges = changes.filter(c => c.type === 'remove');
    
    if (deletionChanges.length > 0) {
      const nodesToRemove = new Set<string>();
      
      // Helper to collect all descendants recursively
      const collectDescendants = (nodeId: string) => {
        nodesToRemove.add(nodeId);
        // Find all edges starting from this node
        const childEdges = edges.filter(e => e.source === nodeId);
        childEdges.forEach(edge => {
          if (!nodesToRemove.has(edge.target)) {
            collectDescendants(edge.target);
          }
        });
      };

      // For each deleted node, find its descendants
      deletionChanges.forEach((change: any) => {
        collectDescendants(change.id);
      });

      // Filter out all nodes and edges that are part of the deletion set
      const remainingNodes = nodes.filter(n => !nodesToRemove.has(n.id));
      const remainingEdges = edges.filter(e => !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target));

      set({
        nodes: remainingNodes,
        edges: remainingEdges,
      });
      return;
    }

    set({
      nodes: applyNodeChanges(changes, nodes),
    });
  },

  toggleFold: (nodeId: string) => {
    const { nodes, edges } = get();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Determine if we are hiding or showing based on the first child's state (or default to hiding)
    // Actually, let's track state on the parent node for better UX? 
    // For simplicity, let's find the direct children.
    const childEdges = edges.filter(e => e.source === nodeId);
    if (childEdges.length === 0) return; // Leaf node, nothing to fold

    const firstChildId = childEdges[0].target;
    const firstChild = nodes.find(n => n.id === firstChildId);
    const shouldHide = !firstChild?.hidden; // If first child is visible, we hide all.

    const nodesToToggle = new Set<string>();

    const collectDescendants = (currentId: string) => {
      const children = edges.filter(e => e.source === currentId).map(e => e.target);
      children.forEach(childId => {
        if (!nodesToToggle.has(childId)) {
          nodesToToggle.add(childId);
          collectDescendants(childId);
        }
      });
    };

    collectDescendants(nodeId);

    const updatedNodes = nodes.map(n => {
      if (nodesToToggle.has(n.id)) {
        return { ...n, hidden: shouldHide };
      }
      return n;
    });

    // Also toggle edges? React Flow hides edges connected to hidden nodes automatically usually, 
    // but let's keep edges state clean if needed. 
    // Actually, setting node.hidden is enough for React Flow.
    
    // We might want to update the layout if we hide things, but maybe just hiding is enough.
    // If we want to re-layout, we would call getLayoutedElements.
    // Let's just update visibility first.
    
    set({ nodes: updatedNodes });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, type: 'smoothstep', animated: true }, get().edges),
    });
  },

  addMessage: (role, content) => {
    set((state) => ({
      messages: [...state.messages, { id: Date.now().toString(), role, content }],
    }));
  },

  addGraphData: (newNodes, newEdges) => {
    const { nodes, edges } = get();
    
    // In a real app, you might want to check for duplicates or merge smartly
    const updatedNodes = [...nodes, ...newNodes];
    const updatedEdges = [...edges, ...newEdges];

    // Apply layout
    const layouted = getLayoutedElements(updatedNodes, updatedEdges, 'LR');
    
    set({ nodes: layouted.nodes, edges: layouted.edges });
  },

  layout: (direction = 'LR') => {
    const { nodes, edges } = get();
    const layouted = getLayoutedElements(nodes, edges, direction);
    set({ nodes: layouted.nodes, edges: layouted.edges });
  },
}));

export default useStore;
