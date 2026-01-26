import React, { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Color palette for sticky notes
const COLORS = [
  '#fef3c7', // Yellow
  '#fce7f3', // Pink
  '#e0f2fe', // Blue
  '#dcfce7'  // Green
];

const StickyNoteNode = ({ data, id }: NodeProps) => {
  // Generate stable random values based on node ID
  // using useMemo to ensure they don't change on re-renders unless ID changes
  const style = useMemo(() => {
    // Simple hash function for stability
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Rotation between -3 and 3 degrees
    const rotation = (hash % 7) - 3; 
    
    // Pick a color
    const colorIndex = hash % COLORS.length;
    const backgroundColor = COLORS[colorIndex];
    
    return {
      transform: `rotate(${rotation}deg)`,
      backgroundColor,
      boxShadow: '4px 4px 0px rgba(0,0,0,0.4)', // Hard shadow
      // Removed fontFamily to allow font-black to work properly
    };
  }, [id]);

  return (
    <div 
      className="rounded-sm border-b border-r border-black/10 w-64 h-64 flex flex-col items-center justify-center transition-transform duration-200 hover:scale-105 hover:z-10"
      style={style}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} className="!bg-transparent !w-full !h-full !top-0 !left-0 !border-none !rounded-none !opacity-0" />
      <div className="relative w-full h-full flex items-center justify-center p-4 text-center">
        {/* 模拟马克笔效果 */}
        <span className="text-3xl font-black text-black leading-tight tracking-tight font-sans break-words w-full">
            {data.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={false} className="!bg-transparent !w-full !h-full !top-0 !left-0 !border-none !rounded-none !opacity-0" />
    </div>
  );
};

export default memo(StickyNoteNode);
