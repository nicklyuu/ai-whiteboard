import React, { useState } from 'react';
import useStore from '@/store/useStore';
import { generateInitialIdeas } from '@/lib/ai';
import { getNonOverlappingPosition } from '@/lib/layout';
import { Node } from 'reactflow';
import { Loader2, Rocket, Target, Users, AlertTriangle } from 'lucide-react';

export default function ProjectSetupModal() {
  const { projectContext, setProjectContext, addGraphData, addMessage, nodes } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    audience: '',
    constraints: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goal) return;

    setLoading(true);
    
    // Update store context but keep isInitialized false until we are done
    const newContext = { ...formData, isInitialized: true };
    setProjectContext(newContext);

    try {
      // Generate initial ideas
      const result = await generateInitialIdeas(newContext);
      
      if (result && result.nodes) {
        // AI now returns nodes with positions, so we just map them directly
        const newNodes: Node[] = result.nodes.map((n: any) => ({
            id: n.id || `init-${Date.now()}-${Math.random()}`,
            type: 'sticky-note',
            data: { label: n.label },
            position: n.position || { x: 0, y: 0 },
        }));
        
        addGraphData(newNodes, []);
        addMessage('ai', `🚀 Project "${formData.name}" started! I've generated some initial ideas based on your goals.`);
      }
    } catch (error) {
      console.error(error);
      addMessage('ai', "Failed to generate initial ideas, but project context is set.");
    } finally {
      setLoading(false);
      // Ensure context is fully set and modal closes
      // The modal closes because isInitialized becomes true
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-800 border border-zinc-700 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            开启新的风暴
          </h2>
          <p className="text-yellow-100 mt-1 text-sm">Project Onboarding</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-1">项目名称 Project Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder-zinc-500"
              placeholder="e.g. NextGen Coffee App"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <Target className="w-4 h-4 text-yellow-500" /> 
              核心目标 / 一句话描述 (必填)
            </label>
            <textarea 
              required
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all resize-none placeholder-zinc-500"
              placeholder="e.g. 一个帮助远程工作者找到最佳咖啡馆的应用..."
              value={formData.goal}
              onChange={e => setFormData({...formData, goal: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Users className="w-4 h-4 text-green-500" />
                目标用户
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:ring-2 focus:ring-yellow-500 outline-none placeholder-zinc-500"
                placeholder="e.g. 学生, 极客"
                value={formData.audience}
                onChange={e => setFormData({...formData, audience: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                限制 / 偏好
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:ring-2 focus:ring-yellow-500 outline-none placeholder-zinc-500"
                placeholder="e.g. 无硬件, 低预算"
                value={formData.constraints}
                onChange={e => setFormData({...formData, constraints: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !formData.goal}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                正在生成初始创意...
              </>
            ) : (
              <>
                开始风暴 Start Brainstorming
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
