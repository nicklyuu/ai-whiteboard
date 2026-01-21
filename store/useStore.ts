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
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
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
