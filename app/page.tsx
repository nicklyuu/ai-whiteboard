'use client';

import { useState, useRef, useEffect } from 'react';
import Whiteboard from '@/components/Whiteboard';
import useStore from '@/store/useStore';
import { generateMindMap } from '@/lib/gemini';
import { Send, Mic, Bot, User, Sparkles } from 'lucide-react';
import { Node, Edge, MarkerType } from 'reactflow';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messages = useStore((state) => state.messages);
  const addMessage = useStore((state) => state.addMessage);
  const addGraphData = useStore((state) => state.addGraphData);
  const currentNodes = useStore((state) => state.nodes);
  const currentEdges = useStore((state) => state.edges);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userText = inputValue;
    addMessage('user', userText);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Prepare context for AI (convert React Flow nodes/edges to simple format)
      const contextNodes = currentNodes.map(n => ({ 
        id: n.id, 
        label: (n.data.label as string) || '', 
        type: (n.data.type as any) || 'default'
      }));
      
      const contextEdges = currentEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: (e.label as string) || ''
      }));

      // Call Gemini API with context
      const { graph, reply } = await generateMindMap(userText, contextNodes, contextEdges);
      
      // Create a unique prefix for this generation to avoid ID collisions
      const prefix = `gen-${Date.now()}`;

      // Helper to prefix IDs IF they are new nodes. 
      // If the ID exists in currentNodes, we should keep it as is (to allow connection).
      const getUniqueId = (id: string) => {
          // Check if this ID refers to an existing node
          const exists = currentNodes.some(n => n.id === id);
          if (exists) return id;
          return `${prefix}-${id}`;
      };

      // Helper to get style based on type
      const getNodeStyle = (type?: string) => {
        switch (type) {
          case 'role':
            return { background: '#dbeafe', borderColor: '#3b82f6' }; // blue-100, blue-500
          case 'tech':
            return { background: '#dcfce7', borderColor: '#22c55e' }; // green-100, green-500
          case 'risk':
            return { background: '#fee2e2', borderColor: '#ef4444' }; // red-100, red-500
          case 'default':
          default:
            return { background: '#ffffff', borderColor: '#e2e8f0' }; // white, slate-200
        }
      };

      // Convert to React Flow Nodes
      const newNodes: Node[] = graph.nodes.map((node) => {
        const style = getNodeStyle(node.type);
        return {
          id: getUniqueId(node.id),
          data: { label: node.label, type: node.type || 'default' }, // Store type in data for future context
          position: { x: 0, y: 0 }, // Initial position, will be calculated by dagre
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

      // Convert to React Flow Edges
      const newEdges: Edge[] = graph.edges.map((edge) => ({
        id: getUniqueId(edge.id || `e-${edge.source}-${edge.target}`),
        source: getUniqueId(edge.source),
        target: getUniqueId(edge.target),
        label: edge.label,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#64748b' },
      }));

      addGraphData(newNodes, newEdges);
      addMessage('ai', reply);

    } catch (error) {
      console.error('Failed to generate graph:', error);
      addMessage('ai', 'Sorry, I failed to generate the visualization. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-white font-sans text-slate-900">
      {/* Sidebar - Chat Interface */}
      <div className="w-[350px] flex flex-col border-r border-slate-200 bg-white shadow-xl z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-white">
          <div className="bg-blue-600 p-1.5 rounded-lg">
             <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-slate-800">AI Architect</h1>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50" ref={scrollRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-blue-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
             <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <Sparkles size={16} className="text-blue-600 animate-pulse" />
                 </div>
                 <div className="text-xs text-slate-400 flex items-center">Thinking...</div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-slate-100 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              placeholder="Describe your idea..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isProcessing}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="absolute right-2 top-1.5 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="mt-2 flex justify-center">
             <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Mic size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* Right Canvas */}
      <div className="flex-1 relative bg-slate-50">
        <Whiteboard />
      </div>
    </main>
  );
}
