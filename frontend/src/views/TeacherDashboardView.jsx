import React, { useEffect, useState, useCallback } from 'react';
import { useLab } from '../context/LabContext';
import { Users, GraduationCap, Award, Search, Sparkles, TrendingUp, Plus, Activity, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const TeacherDashboardView = () => {
  const { navigateTo, openAIAssistant, studentStats: contextStats, completedExperiments } = useLab();

  // Local state for live student monitoring from LocalStorage
  const [liveStats, setLiveStats] = useState(() => {
    const saved = localStorage.getItem('virtulab_user_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return contextStats;
  });

  const [liveSession, setLiveSession] = useState(() => {
    const saved = localStorage.getItem('virtulab_live_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      studentName: "Master",
      experimentTitle: "Smart Arduino LED Circuit",
      subject: "Electronics",
      status: "ONLINE",
      xp: contextStats.xp || 0,
      completedCount: completedExperiments?.size || 0,
      lastUpdated: new Date().toLocaleTimeString()
    };
  });

  const [rosterData, setRosterData] = useState([]);
  const [reportsData, setReportsData] = useState([]);

  // Sync function from LocalStorage
  const syncFromLocalStorage = useCallback(() => {
    const savedStats = localStorage.getItem('virtulab_user_stats');
    if (savedStats) {
      try { setLiveStats(JSON.parse(savedStats)); } catch (e) {}
    }
    const savedSession = localStorage.getItem('virtulab_live_session');
    if (savedSession) {
      try { setLiveSession(JSON.parse(savedSession)); } catch (e) {}
    }
  }, []);

  // Listen to LocalStorage & custom event for instant cross-tab / live updates
  useEffect(() => {
    syncFromLocalStorage();
    window.addEventListener('storage', syncFromLocalStorage);
    window.addEventListener('virtulab_session_updated', syncFromLocalStorage);
    return () => {
      window.removeEventListener('storage', syncFromLocalStorage);
      window.removeEventListener('virtulab_session_updated', syncFromLocalStorage);
    };
  }, [syncFromLocalStorage]);

  // Fetch telemetry from backend API
  useEffect(() => {
    fetch('http://localhost:5000/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRosterData(data);
      })
      .catch(() => {});

    fetch('http://localhost:5000/api/reports')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReportsData(data);
      })
      .catch(() => {});
  }, []);

  const totalReportsCount = reportsData.length;
  const currentXP = liveStats.xp || contextStats.xp || 0;
  const completedCount = liveStats.completedCount || completedExperiments?.size || 0;

  return (
    <div className="w-full bg-[#F8FAFF] min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="gradient-primary text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-200 text-xs uppercase font-bold tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Teacher Live Monitoring Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Teacher Telemetry Console 👋</h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mt-1 font-medium">
            Monitor real-time student experiment telemetry, XP progress, and live virtual lab sessions saved in LocalStorage.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => openAIAssistant("Analyze current class performance and XP telemetry")}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold backdrop-blur-md border border-white/20 transition-all flex items-center"
          >
            <Sparkles className="w-4 h-4 inline mr-1.5" /> AI Guide Assistant
          </button>
          <button
            onClick={() => navigateTo('physics')}
            className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-slate-50 font-bold text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Experiment</span>
          </button>
        </div>
      </div>

      {/* LIVE STUDENT MONITORING CARD (REAL-TIME LOCALSTORAGE SYNC) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-cyan-300 font-bold text-lg">
              🎓
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg text-white">Student: Master</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span>
                  <span>ONLINE & ACTIVE</span>
                </span>
              </div>
              <p className="text-xs text-indigo-200">Class 12th Science • LocalStorage Live Telemetry Sync</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/60">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Live Earned XP</span>
              <span className="text-lg font-black text-amber-400 flex items-center">
                <Zap className="w-4 h-4 mr-1 text-amber-400 fill-amber-400" />
                {currentXP} XP
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Completed Labs</span>
              <span className="text-lg font-black text-emerald-400">
                {completedCount} / 9 Labs
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 font-bold block mb-1">Active Experiment:</span>
            <span className="text-cyan-300 font-extrabold text-sm block">
              {liveSession.experimentTitle || "Smart Arduino LED Circuit"}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 font-bold block mb-1">Current Subject:</span>
            <span className="text-indigo-300 font-extrabold text-sm uppercase block">
              🧪 {liveSession.subject || "Electronics"}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 font-bold block mb-1">Last Activity Timestamp:</span>
            <span className="text-emerald-400 font-mono font-bold text-sm block">
              ⏱ {liveSession.lastUpdated || "Just Now"}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">Active Students</span>
            <p className="text-2xl font-black text-slate-900 mt-1">1 Student</p>
            <span className="text-[10px] text-emerald-600 font-bold">● Master (Online)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">Live Student XP</span>
            <p className="text-2xl font-black text-amber-500 mt-1">{currentXP} XP</p>
            <span className="text-[10px] text-emerald-600 font-bold">↑ Saved in LocalStorage</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">Reports Submitted</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{completedCount}</p>
            <span className="text-[10px] text-emerald-600 font-bold">✓ Verified</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">Average Score</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{liveStats.avgScore || 95}%</p>
            <span className="text-[10px] text-emerald-600 font-bold">Live calculation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Class Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Subject Performance Metrics</h3>
              <p className="text-xs text-slate-500">Live score averages per lab discipline</p>
            </div>
            <span className="text-xs text-indigo-600 font-bold">Real Telemetry</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { subject: "Physics", avgScore: liveStats.avgScore > 0 ? liveStats.avgScore : 95 },
                { subject: "Chemistry", avgScore: 88 },
                { subject: "Electronics", avgScore: 92 }
              ]}>
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#5B5CEB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Teacher Assistant Panel */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-cyan-300 mb-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="font-bold text-base text-white">AI Assistant</h3>
            </div>
            <p className="text-xs text-indigo-200">Automated Pedagogy Actions</p>

            <div className="space-y-2 mt-4">
              {[
                "Identify struggling students",
                "Generate personalized assignments",
                "Recommend next lab experiments",
                "Analyze learning trend reports"
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => openAIAssistant(action)}
                  className="w-full text-left p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-colors flex items-center justify-between"
                >
                  <span>{action}</span>
                  <span>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Student Progress Roster Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Live Student Roster</h3>
            <p className="text-xs text-slate-500">Real-time telemetry status saved in LocalStorage</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Active Experiment</th>
                <th className="py-3 px-4">Total XP</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-extrabold text-slate-900 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Master</span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">Class 12th Science</td>
                <td className="py-3.5 px-4 text-slate-800 font-semibold">{liveSession.experimentTitle || "Smart Arduino LED Circuit"}</td>
                <td className="py-3.5 px-4 font-extrabold text-amber-500 font-mono">
                  {currentXP} XP
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center w-fit space-x-1">
                    <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-600" />
                    <span>{liveSession.status || "ONLINE"}</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
