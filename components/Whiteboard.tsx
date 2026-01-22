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
import { expandNode } from '@/lib/gemini';

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
      
      // Clean context nodes (same logic as generateMindMap)
      const contextNodes = currentNodes.map(n => ({ 
        id: n.id, 
        label: (n.data.label as string), 
        type: (n.data.type as any) 
      }));

      const { graph, reply } = await expandNode(label, id, contextNodes);
      
      const prefix = `exp-${Date.now()}`;

      const getUniqueId = (nodeId: string) => {
        const exists = currentNodes.some((n) => n.id === nodeId);
        if (exists) return nodeId;
        return `${prefix}-${nodeId}`;
      };

      const getNodeStyle = (type?: string) => {
        switch (type) {
          case 'role':
            return { background: '#dbeafe', borderColor: '#3b82f6' };
          case 'tech':
            return { background: '#dcfce7', borderColor: '#22c55e' };
          case 'risk':
            return { background: '#fee2e2', borderColor: '#ef4444' };
          case 'default':
          default:
            return { background: '#ffffff', borderColor: '#e2e8f0' };
        }
      };

      const newNodes: Node[] = graph.nodes.map((node) => {
        const style = getNodeStyle(node.type);
        return {
          id: getUniqueId(node.id),
          data: { label: node.label, type: node.type || 'default' },
          position: { x: 0, y: 0 },
          type: 'default',
          style: {
            background: style.background,
            color: '#334155',
            border: `1px solid ${style.borderColor}`,
            borderRadius: '8px',
            padding: '10px',
            width: 150,
            fontSize: '12px',
            fontWeight: 'normal',
            textAlign: 'center',
          },
        };
      });

      const newEdges: Edge[] = graph.edges.map((edge) => ({
        id: getUniqueId(edge.id || `e-${edge.source}-${edge.target}`),
        source: getUniqueId(edge.source),
        target: getUniqueId(edge.target),
        label: edge.label,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#64748b' },
      }));

      useStore.getState().addGraphData(newNodes, newEdges);
      useStore.getState().addMessage('ai', reply);
    } catch (error) {
      console.error('Expand node error:', error);
      useStore.getState().addMessage('ai', `展开 "${label}" 失败，请重试。`);
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
