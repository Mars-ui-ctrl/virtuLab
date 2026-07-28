import React from 'react';
import { useLab } from '../../context/LabContext';
import { Beaker, Zap, LayoutDashboard, GraduationCap, Sparkles, Bell, Search, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { currentView, navigateTo, studentStats, openAIAssistant } = useLab();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => navigateTo('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform p-2 border border-indigo-400/30">
            <img src="/favicon.svg" alt="VirtuLab Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              Virtu<span className="text-indigo-600">Lab</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-indigo-500 -mt-1">
              Virtual Science Labs
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/60">
          <button
            onClick={() => navigateTo('landing')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentView === 'landing' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentView === 'dashboard' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Dashboard
          </button>
          <button
            onClick={() => navigateTo('physics')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              ['physics', 'chemistry', 'electronics'].includes(currentView) 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Labs & Experiments
          </button>
          <button
            onClick={() => navigateTo('teacher')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentView === 'teacher' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Teacher Portal
          </button>
        </nav>

        {/* Action Controls & User Profile */}
        <div className="flex items-center space-x-3">
          
          {/* AI Assistant Quick Pill */}
          <button
            onClick={() => openAIAssistant()}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/60 rounded-full text-xs font-semibold transition-all shadow-sm group"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:rotate-12 transition-transform" />
            <span>AI Assistant</span>
          </button>

          {/* XP Badge */}
          <div className="hidden lg:flex items-center space-x-1 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-700">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{studentStats.xp.toLocaleString()} XP</span>
          </div>

          {/* Teacher Mode Switch Toggle */}
          <button
            onClick={() => navigateTo(currentView === 'teacher' ? 'dashboard' : 'teacher')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-all shadow-md"
            title="Switch Dashboard View"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">
              {currentView === 'teacher' ? 'Student View' : 'Teacher Dashboard'}
            </span>
          </button>

          {/* User Profile Avatar */}
          <div 
            onClick={() => navigateTo('dashboard')}
            className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-all border border-slate-200/50"
          >
            <img
              src={studentStats.avatar}
              alt={studentStats.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
            />
          </div>

        </div>

      </div>
    </header>
  );
};
