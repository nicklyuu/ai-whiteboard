import React, { useState } from 'react';
import { Flame, Grid2X2, Loader2, LayoutGrid } from 'lucide-react';
import useStore from '@/store/useStore';
import { scamperIdeation, autoCluster } from '@/lib/ai';
import { calculateGridLayout } from '@/lib/utils';
import { getNonOverlappingPosition, getClusterLayout } from '@/lib/layout';
import { Node } from 'reactflow';

export default function BrainstormToolbar() {
  const [loading, setLoading] = useState<string | null>(null);
  const { nodes, addGraphData, addMessage, setNodes, projectContext } = useStore();

  const handleSCAMPER = async () => {
    // Check for selected node
    const selectedNode = nodes.find(n => n.selected);
    
    if (!selectedNode) {
      alert("Please select a sticky note first!");
      return;
    }

    setLoading('scamper');
    try {
      const context = nodes.map(n => n.data.label).join(", ");
      const result = await scamperIdeation(selectedNode.data.label, context, projectContext);
      
      if (result && result.nodes) {
        const newNodes: Node[] = result.nodes.map((n: any, i: number) => {
            // Position around the selected node
            const pos = getNonOverlappingPosition(
                nodes, 
                selectedNode.position.x, 
                selectedNode.position.y,
                200, 200
            );
            
            return {
                id: `scamper-${Date.now()}-${i}`,
                type: 'sticky-note',
                data: { label: n.label },
                position: pos,
                selected: false
            };
        });
        
        addGraphData(newNodes, []);
        addMessage('ai', `🔥 Generated ${newNodes.length} disruptive ideas using SCAMPER!`);
      }
    } catch (e) {
      console.error(e);
      addMessage('ai', "Failed to generate SCAMPER ideas.");
    } finally {
      setLoading(null);
    }
  };

  const handleAutoCluster = async () => {
    if (nodes.length < 3) {
        alert("Need at least 3 notes to cluster!");
        return;
    }

    setLoading('cluster');
    try {
      const result = await autoCluster(nodes.map(n => ({ id: n.id, label: n.data.label })));
      
      if (result && result.clusters) {
        // Calculate new layout
        const newNodes = getClusterLayout(nodes, result.clusters);
        
        // Add Group Titles
        const titleNodes: Node[] = result.clusters.map((cluster: any, i: number) => {
            // Find position of the first node in this cluster to place title above it
            const firstNodeId = cluster.nodeIds[0];
            const firstNode = newNodes.find(n => n.id === firstNodeId);
            
            if (!firstNode) return null;

            return {
                id: `group-title-${i}-${Date.now()}`,
                type: 'default', 
                data: { label: cluster.title },
                position: { 
                    x: firstNode.position.x, 
                    y: firstNode.position.y - 80 
                },
                style: { 
                    background: 'transparent', 
                    border: 'none', 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#475569',
                    width: 300,
                    textAlign: 'left',
                    boxShadow: 'none'
                },
                draggable: true
            };
        }).filter(Boolean) as Node[]; // Cast to Node[] to fix type issue

        setNodes([...newNodes, ...titleNodes]);
        addMessage('ai', `🧹 Organized ideas into ${result.clusters.length} clusters using KJ Method.`);
      }
    } catch (e) {
      console.error(e);
      addMessage('ai', "Failed to cluster ideas.");
    } finally {
      setLoading(null);
    }
  };

  const handleGridLayout = () => {
    const newNodes = calculateGridLayout(nodes);
    setNodes(newNodes);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2 z-50">
      <button
        onClick={handleSCAMPER}
        disabled={!!loading}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        title="SCAMPER: Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse"
      >
        {loading === 'scamper' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4 text-orange-500" />}
        SCAMPER Idea
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <button
        onClick={handleAutoCluster}
        disabled={!!loading}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        title="Group related ideas together"
      >
         {loading === 'cluster' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Grid2X2 className="w-4 h-4 text-indigo-500" />}
        Auto Cluster
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <button
        onClick={handleGridLayout}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        title="Arrange notes in a grid"
      >
        <LayoutGrid className="w-4 h-4 text-blue-500" />
        一键整理 (Grid)
      </button>
    </div>
  );
}
