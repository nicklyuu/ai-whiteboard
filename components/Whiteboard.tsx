'use client';

import React, { useCallback, useState } from 'react';
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
} from 'reactflow';
import { useShallow } from 'zustand/react/shallow';
import 'reactflow/dist/style.css';
import useStore from '../store/useStore';
import ContextMenu from './ContextMenu';
import { expandNode } from '@/lib/ai';

// Helper to select only needed state slices to prevent unnecessary re-renders
const selector = (state: any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  toggleFold: state.toggleFold,
});

export default function Whiteboard() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, toggleFold } = useStore(useShallow(selector));
  const [menu, setMenu] = useState<{ id: string; top: number; left: number; label: string } | null>(null);

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
      const graphData = await expandNode(id, label, contextString);
      
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

  return (
    <div className="w-full h-full bg-slate-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        fitView
        attributionPosition="bottom-right"
      >
        <Background gap={16} size={1} color="#e2e8f0" />
        <Controls />
        <MiniMap 
            nodeColor={(node) => {
                return '#3b82f6'; // blue-500
            }}
            maskColor="rgb(241, 245, 249, 0.7)"
        />
        <Panel position="top-right" className="bg-white/80 backdrop-blur p-2 rounded-lg shadow-sm border border-gray-100 text-xs text-gray-500">
           AI Generated Canvas
        </Panel>
      </ReactFlow>
      {menu && (
        <ContextMenu
          x={menu.left}
          y={menu.top}
          onExpand={handleExpand}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
