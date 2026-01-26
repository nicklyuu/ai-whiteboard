import React from 'react';
import useStore from '@/store/useStore';
import { Lightbulb, Network, Calendar, ArrowRight } from 'lucide-react';

const Lobby = () => {
  const setAppMode = useStore(state => state.setAppMode);

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80 pointer-events-none"></div>
      
      <div className="relative z-10 text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          AI Project Incubation Space
        </h1>
        <p className="text-slate-400 text-lg">Select a workspace to begin your journey</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl w-full px-8 justify-center relative z-10">
        {/* Brainstorming Card */}
        <div 
          onClick={() => setAppMode('brainstorm')}
          className="group cursor-pointer bg-slate-800/50 backdrop-blur-sm hover:bg-yellow-500/10 hover:border-yellow-500/50 border border-slate-700 rounded-2xl p-8 flex-1 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/20"
        >
          <div className="bg-yellow-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Lightbulb className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-yellow-400 transition-colors">Brainstorming</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            激发灵感，便利贴式的创意整理。
            <br/>
            Creative Facilitator Mode
          </p>
          <div className="flex items-center text-yellow-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
            Enter Room <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>

        {/* Structure Card */}
        <div 
          onClick={() => setAppMode('structure')}
          className="group cursor-pointer bg-slate-800/50 backdrop-blur-sm hover:bg-blue-500/10 hover:border-blue-500/50 border border-slate-700 rounded-2xl p-8 flex-1 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Network className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">Architecture</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            严谨梳理，系统化的层级结构。
            <br/>
            Solution Architect Mode
          </p>
          <div className="flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
            Enter Room <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>

        {/* Planning Card */}
        <div 
          className="group cursor-not-allowed bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 flex-1 opacity-60"
        >
          <div className="bg-slate-700/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 grayscale">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-slate-500">Planning</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            排期估算，任务与资源管理。
            <br/>
            Project Manager Mode
          </p>
          <span className="inline-block px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-400 border border-slate-600">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
