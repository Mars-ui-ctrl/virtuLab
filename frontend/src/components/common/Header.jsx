import React from 'react';
import { useLab } from '../../context/LabContext';
import { EXPERIMENTS } from '../../data/mockData';
import { Play, RotateCcw, Save, FileText, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';

export const Header = ({ onRunSimulation, onResetSimulation, isRunning = false }) => {
  const { currentExperiment, selectExperiment, completeExperiment, openAIAssistant, navigateTo } = useLab();

  // Find other experiments in the same subject
  const sameSubjectExps = Object.values(EXPERIMENTS).filter(e => e.subject === currentExperiment.subject);

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xs">
      
      {/* Breadcrumb & Experiment Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <span 
            onClick={() => navigateTo('dashboard')}
            className="hover:text-indigo-600 cursor-pointer transition-colors"
          >
            Dashboard
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="capitalize text-slate-700">{currentExperiment.subject} Lab</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-indigo-600 font-bold">{currentExperiment.category}</span>
        </div>

        {/* Experiment switcher dropdown */}
        <select
          value={currentExperiment.id}
          onChange={(e) => selectExperiment(e.target.value)}
          className="bg-slate-100 hover:bg-slate-200/70 border border-slate-300/70 text-slate-800 font-bold text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
        >
          {sameSubjectExps.map(exp => (
            <option key={exp.id} value={exp.id}>
              {exp.title} ({exp.difficulty})
            </option>
          ))}
        </select>
      </div>

      {/* Right Controls Header Toolbar */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onResetSimulation}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all active:scale-95"
          title="Reset Canvas & Parameters"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset</span>
        </button>

        <button
          onClick={onRunSimulation}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
            isRunning 
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25 animate-pulse' 
              : 'gradient-primary hover:opacity-95 shadow-indigo-500/30'
          }`}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running Simulation...' : 'Run Simulation'}</span>
        </button>

        <button
          onClick={() => completeExperiment(currentExperiment.id)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          title="Submit & Finish Experiment"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Finish & Score</span>
        </button>

        <button
          onClick={() => openAIAssistant(`How do I complete ${currentExperiment.title}?`)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl hover:shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden md:inline">AI Guide</span>
        </button>
      </div>

    </div>
  );
};
