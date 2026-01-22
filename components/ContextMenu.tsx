import React, { useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onExpand: () => void;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onExpand, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="absolute z-50 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-48 animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        onClick={onExpand}
        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
      >
        <Sparkles size={16} className="text-blue-500" />
        AI Expand (AI 展开)
      </button>
    </div>
  );
}
