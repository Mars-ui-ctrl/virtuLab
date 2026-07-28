import React from 'react';
import { useLab } from '../context/LabContext';
import { EXPERIMENTS } from '../data/mockData';
import { Beaker, Zap, FlaskConical, Cpu, ArrowRight, Play, CheckCircle2, ShieldCheck, Monitor, Sparkles, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPageView = () => {
  const { navigateTo, selectExperiment } = useLab();

  const features = [
    {
      icon: Beaker,
      title: "Interactive 3D Simulations",
      desc: "Realistic 3D virtual experiments with orbit controls, snapping grids, and dynamic particle effects."
    },
    {
      icon: Globe,
      title: "Browser-Based Platform",
      desc: "No heavy downloads or VR hardware required. Access your high-fidelity lab directly from any WebGL browser."
    },
    {
      icon: ShieldCheck,
      title: "100% Safe Experiments",
      desc: "Perform hazardous acid titrations, high-voltage circuits, and rapid thermal reactions safely without physical danger."
    },
    {
      icon: Monitor,
      title: "Multi-Device Sync",
      desc: "Seamless cross-platform performance optimized for desktops, laptops, tablets, and interactive classroom screens."
    }
  ];

  return (
    <div className="w-full bg-[#F8FAFF] min-h-screen text-slate-900 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Glow backdrop decorative blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-32 right-10 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-200/80 rounded-full text-xs font-bold text-indigo-600 shadow-2xs">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Next-Gen Virtual Science Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Practical Science. <br />
              <span className="gradient-text">Virtual Experience.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Perform realistic Physics, Chemistry, and Electronics experiments directly inside your browser. Safe, interactive, and accessible anywhere.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigateTo('dashboard')}
                className="w-full sm:w-auto px-7 py-3.5 gradient-primary hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center space-x-2 transition-all active:scale-95 group"
              >
                <span>Start Learning Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => selectExperiment('phys-circuit')}
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-2xl shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span>Watch Interactive Demo</span>
              </button>
            </div>

            {/* Micro proof badges */}
            <div className="pt-4 flex items-center justify-center lg:justify-start space-x-6 text-xs text-slate-500 font-semibold">
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Free for Students</span>
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> No Downloads</span>
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> 3D R3F Engine</span>
            </div>

          </div>

          {/* Right Column Laptop SaaS Preview Graphic (Matching Screenshot 1) */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto max-w-lg lg:max-w-none"
            >
              {/* Laptop Shell Frame */}
              <div className="glass-panel p-3 rounded-3xl border border-slate-200 shadow-2xl relative">
                
                {/* Mock Screenshot Window */}
                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-800">
                  <div className="bg-slate-800/80 px-4 py-2 flex items-center space-x-2 border-b border-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-400 font-mono ml-2">virtulab.edu/workspace/physics-circuit</span>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white min-h-[320px] flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-400">Physics Laboratory</span>
                        <h3 className="font-extrabold text-lg text-white">Electric Circuit Simulation</h3>
                      </div>
                      <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-bold">
                        ● Circuit Complete
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 my-4">
                      <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                        <span className="text-[10px] text-slate-300 block">Voltage</span>
                        <span className="text-lg font-bold text-cyan-300">12.0 V</span>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                        <span className="text-[10px] text-slate-300 block">Current</span>
                        <span className="text-lg font-bold text-cyan-300">1.20 A</span>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                        <span className="text-[10px] text-slate-300 block">Bulb State</span>
                        <span className="text-lg font-bold text-amber-300">ON (14.4W)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => selectExperiment('phys-circuit')}
                      className="w-full py-2.5 gradient-primary hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-[1.02]"
                    >
                      Open Interactive 3D Workspace →
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          </div>

        </div>

      </section>

      {/* Feature Cards Showcase */}
      <section className="py-16 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for Next-Generation STEM Education
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Empowering students and teachers with rich 3D virtual laboratoy environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="glass-card p-6 rounded-3xl space-y-3 border border-slate-200/80 group hover:border-indigo-300 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subject Launcher Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Virtual Subjects
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            Select a laboratory discipline to launch instant 3D interactive simulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Physics Card */}
          <div 
            onClick={() => selectExperiment('phys-circuit')}
            className="glass-card p-6 rounded-3xl cursor-pointer group hover:scale-[1.02] transition-all border border-slate-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-600/30">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              Physics Laboratory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Build DC circuits, analyze simple harmonic pendulums, and fire projectile motions in 3D.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              Launch Physics Workspace →
            </span>
          </div>

          {/* Chemistry Card */}
          <div 
            onClick={() => selectExperiment('chem-neutralization')}
            className="glass-card p-6 rounded-3xl cursor-pointer group hover:scale-[1.02] transition-all border border-slate-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center mb-4 shadow-md shadow-cyan-500/30">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">
              Chemistry Laboratory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Perform acid-base titrations, Bunsen burner water heating, and pH scale indicator tests.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-cyan-600 group-hover:translate-x-1 transition-transform">
              Launch Chemistry Workspace →
            </span>
          </div>

          {/* Electronics Card */}
          <div 
            onClick={() => selectExperiment('elec-led-circuit')}
            className="glass-card p-6 rounded-3xl cursor-pointer group hover:scale-[1.02] transition-all border border-slate-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-md shadow-blue-600/30">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              Electronics Laboratory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Design Tinkercad-style breadboard circuits, program Arduino controllers, and run sensor fans.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              Launch Electronics Workspace →
            </span>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 border-t border-slate-800 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white">
              <Beaker className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">VirtuLab EdTech</span>
          </div>
          <p>© 2026 VirtuLab. Practical Science. Virtual Experience. College Exhibition Demo.</p>
        </div>
      </footer>

    </div>
  );
};
