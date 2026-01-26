'use client';

import { useState, useRef, useEffect } from 'react';
import Whiteboard from '@/components/Whiteboard';
import Lobby from '@/components/Lobby';
import ProjectSetupModal from '@/components/ProjectSetupModal';
import useStore from '@/store/useStore';
import { Send, Mic, Bot, User, Sparkles, Home as HomeIcon } from 'lucide-react';
import { Node, Edge, MarkerType } from 'reactflow';
import { generateGraphData } from '@/lib/ai';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messages = useStore((state) => state.messages);
  const addMessage = useStore((state) => state.addMessage);
  const addGraphData = useStore((state) => state.addGraphData);
  const clearGraph = useStore((state) => state.clearGraph);
  const removeNodes = useStore((state) => state.removeNodes);
  const appMode = useStore((state) => state.appMode);
  const setAppMode = useStore((state) => state.setAppMode);
  const projectContext = useStore((state) => state.projectContext);
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
      const currentNodes = useStore.getState().nodes;
      const simplifiedNodes = currentNodes.map(n => ({ id: n.id, label: n.data.label }));
      const response = await generateGraphData(userText, simplifiedNodes, appMode, projectContext);
      
      const graphData = response.graph || { nodes: [], edges: [] };
      const reply = response.reply;
      const shouldReset = response.shouldReset;
      const deletedNodeIds = response.deletedNodeIds || [];

      if (shouldReset) {
        clearGraph();
      } else if (deletedNodeIds.length > 0) {
        removeNodes(deletedNodeIds);
      }
      
      const newNodes = (graphData.nodes || []).map((node: any) => ({
        id: node.id,
        type: node.type || 'default', // Support custom types from AI
        data: { label: node.label },
        position: node.position || { x: 0, y: 0 }, // Use AI provided position if available
        style: node.type === 'sticky-note' ? undefined : { 
            background: '#ffffff', 
            border: '1px solid #94a3b8',  
            borderRadius: '6px',
            width: 140,
            padding: '8px',
            textAlign: 'center'
        },
      }));

      const newEdges = (graphData.edges || []).map((edge: any) => ({
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

      if (newNodes.length > 0 || newEdges.length > 0) {
        addGraphData(newNodes, newEdges);
      }
      addMessage('ai', reply);

    } catch (error) {
      console.error("AI Error:", error);
      addMessage('ai', "Sorry, I encountered an error while processing your request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (appMode === 'lobby') {
    return <Lobby />;
  }

  const showProjectSetup = appMode === 'brainstorm' && !projectContext.isInitialized;
  const isBrainstorm = appMode === 'brainstorm';

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-white font-sans text-slate-900">
      {showProjectSetup && <ProjectSetupModal />}
      
      {/* Sidebar - Chat Interface */}
      <div className={`w-[350px] flex flex-col border-r shadow-xl z-10 transition-colors duration-300 ${
        isBrainstorm 
          ? 'bg-zinc-900 border-zinc-800' 
          : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isBrainstorm 
            ? 'bg-zinc-900 border-zinc-800' 
            : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${appMode === 'brainstorm' ? 'bg-yellow-500' : 'bg-blue-600'}`}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`font-bold ${isBrainstorm ? 'text-zinc-100' : 'text-slate-800'}`}>
                AI {appMode === 'brainstorm' ? 'Brainstorm' : 'Architect'}
              </h1>
              <p className={`text-xs capitalize ${isBrainstorm ? 'text-zinc-400' : 'text-slate-400'}`}>
                {appMode} Mode
              </p>
            </div>
          </div>
          <button 
            onClick={() => setAppMode('lobby')}
            className={`p-2 rounded-lg transition-colors ${
              isBrainstorm 
                ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' 
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
            title="Back to Lobby"
          >
            <HomeIcon size={18} />
          </button>
        </div>

        {/* Messages List */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-5 ${
          isBrainstorm ? 'bg-zinc-900' : 'bg-slate-50'
        }`} ref={scrollRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : isBrainstorm 
                    ? 'bg-zinc-800 border border-zinc-700 text-yellow-500' 
                    : 'bg-white border border-slate-200 text-blue-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : isBrainstorm
                    ? 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
             <div className="flex gap-3">
                 <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                   isBrainstorm 
                     ? 'bg-zinc-800 border-zinc-700' 
                     : 'bg-white border-slate-200'
                 }`}>
                    <Sparkles size={16} className={`${isBrainstorm ? 'text-yellow-500' : 'text-blue-600'} animate-pulse`} />
                 </div>
                 <div className={`text-xs flex items-center ${isBrainstorm ? 'text-zinc-500' : 'text-slate-400'}`}>Thinking...</div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${
          isBrainstorm 
            ? 'bg-zinc-900 border-zinc-800' 
            : 'bg-white border-slate-100'
        }`}>
          <div className="relative">
            <input
              type="text"
              className={`w-full border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 outline-none transition-all ${
                isBrainstorm
                  ? 'bg-zinc-800 text-white placeholder-zinc-500 focus:ring-yellow-500/50'
                  : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-blue-500/50'
              }`}
              placeholder="Describe your idea..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isProcessing}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className={`absolute right-2 top-1.5 p-1.5 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isBrainstorm 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="mt-2 flex justify-center">
             <button className={`transition-colors ${
               isBrainstorm 
                 ? 'text-zinc-600 hover:text-zinc-400' 
                 : 'text-slate-400 hover:text-slate-600'
             }`}>
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
