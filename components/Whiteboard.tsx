'use client';

import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import { useShallow } from 'zustand/react/shallow';
import 'reactflow/dist/style.css';
import useStore from '../store/useStore';

// Helper to select only needed state slices to prevent unnecessary re-renders
const selector = (state: any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export default function Whiteboard() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(useShallow(selector));

  return (
    <div className="w-full h-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
    </div>
  );
}
