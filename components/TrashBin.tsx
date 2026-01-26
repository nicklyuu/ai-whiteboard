import React, { forwardRef } from 'react';
import { Trash2 } from 'lucide-react';

interface TrashBinProps {
  isOver: boolean;
}

const TrashBin = forwardRef<HTMLDivElement, TrashBinProps>(({ isOver }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute bottom-8 right-8 z-50 p-4 rounded-full transition-all duration-300 flex items-center justify-center border-2
        ${
          isOver
            ? 'bg-red-500/90 border-red-600 scale-125 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse'
            : 'bg-slate-200/50 border-slate-300/50 hover:bg-slate-300/80 hover:border-slate-400'
        }
      `}
      title="Drag node here to delete"
    >
      <Trash2 
        className={`transition-all duration-300 ${
          isOver ? 'w-8 h-8 text-white' : 'w-6 h-6 text-slate-500'
        }`} 
      />
    </div>
  );
});

TrashBin.displayName = 'TrashBin';

export default TrashBin;
