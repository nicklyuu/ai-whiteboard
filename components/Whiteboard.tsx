'use client';

import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant
} from 'reactflow';
import { useShallow } from 'zustand/react/shallow';
import 'reactflow/dist/style.css';
import useStore from '../store/useStore';
import ContextMenu from './ContextMenu';
import { expandNode } from '@/lib/ai';
import StickyNoteNode from './StickyNoteNode';
import BrainstormToolbar from './BrainstormToolbar';
import TrashBin from './TrashBin';

const nodeTypes = {
  'sticky-note': StickyNoteNode,
};

// Helper to select only needed state slices to prevent unnecessary re-renders
const selector = (state: any) => ({
  nodes: state.nodes,
  edges: state.edges,
  appMode: state.appMode,
  projectContext: state.projectContext,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  toggleFold: state.toggleFold,
  removeNodes: state.removeNodes,
});

export default function Whiteboard() {
  const { nodes, edges, appMode, projectContext, onNodesChange, onEdgesChange, onConnect, toggleFold, removeNodes } = useStore(useShallow(selector));
  const [menu, setMenu] = useState<{ id: string; top: number; left: number; label: string } | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const trashBinRef = useRef<HTMLDivElement>(null);

  const onNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
    if (!trashBinRef.current) return;
    
    const trashRect = trashBinRef.current.getBoundingClientRect();
    const { clientX, clientY } = event;
  
    // Simple collision detection
    const isOver = 
      clientX >= trashRect.left && 
      clientX <= trashRect.right && 
      clientY >= trashRect.top && 
      clientY <= trashRect.bottom;
  
    setIsOverTrash(isOver);
  }, []);
  
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    if (isOverTrash) {
      // Execute deletion
      removeNodes([node.id]);
      setIsOverTrash(false);
    }
  }, [isOverTrash, removeNodes]);

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      toggleFold(node.id);
    },
    [toggleFold]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setMenu({
        id: node.id,
        top: event.clientY,
        left: event.clientX,
        label: (node.data.label as string) || '',
      });
    },
    [],
  );

  const onPaneClick = useCallback(() => setMenu(null), []);

  const handleExpand = useCallback(async () => {
    if (!menu) return;
    const { id, label } = menu;
    setMenu(null); // Close menu

    try {
      const currentNodes = useStore.getState().nodes;
      const addGraphData = useStore.getState().addGraphData;
      const addMessage = useStore.getState().addMessage;
      
      // Prepare context string
      const contextString = currentNodes.map(n => n.data.label).join(", ");

      // Call AI
      const graphData = await expandNode(id, label, contextString, projectContext);
      
      const newNodes = graphData.nodes.map((node: any) => ({
        id: node.id,
        data: { label: node.label },
        position: { x: 0, y: 0 },
        style: { 
            background: '#ffffff', 
            border: '1px solid #94a3b8', 
            borderRadius: '6px',
            width: 140,
            padding: '8px',
            textAlign: 'center'
        },
      }));

      const newEdges = graphData.edges.map((edge: any) => ({
        id: `edge-${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
            type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#64748b' }
      }));

      addGraphData(newNodes, newEdges);
      addMessage('ai', `I've expanded the concept: "${label}"`);

    } catch (error) {
      console.error('Failed to expand node:', error);
      useStore.getState().addMessage('ai', 'Sorry, I failed to expand this node. Please try again.');
    }
  }, [menu]);

  // Dynamic Background Config based on Mode
  const isBrainstorm = appMode === 'brainstorm';
  const bgColor = isBrainstorm ? '#18181b' : '#f8fafc'; // Deep Zinc vs Slate-50
  // Lighter dots for brainstorm mode to increase visibility without being overwhelming
  const dotColor = isBrainstorm ? '#3f3f46' : '#e2e8f0'; 

  return (
    <div className={`w-full h-full relative ${isBrainstorm ? 'bg-[#18181b]' : 'bg-slate-50'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        fitView
        attributionPosition="bottom-right"
      >
        <Background gap={24} size={2} color={dotColor} variant={BackgroundVariant.Dots} />
        <Controls className={isBrainstorm ? 'bg-white/10 border-white/20 text-white fill-white' : ''} />
        <MiniMap 
            nodeColor={(node) => {
                return '#3b82f6'; // blue-500
            }}
            maskColor={isBrainstorm ? "rgba(0, 0, 0, 0.7)" : "rgb(241, 245, 249, 0.7)"}
            className={isBrainstorm ? 'bg-neutral-800 border-neutral-700' : ''}
        />
      </ReactFlow>
      <TrashBin ref={trashBinRef} isOver={isOverTrash} />
      {menu && (
        <ContextMenu
          x={menu.left}
          y={menu.top}
          onExpand={handleExpand}
          onClose={() => setMenu(null)}
        />
      )}
      {appMode === 'brainstorm' && <BrainstormToolbar />}
    </div>
  );
}
