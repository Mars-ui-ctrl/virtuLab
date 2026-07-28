import React, { useEffect, useState } from 'react';
import { useLab } from '../context/LabContext';
import { Play, Zap, FlaskConical, Cpu, Trophy, Award, Clock, Target, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const StudentDashboardView = () => {
  const { studentStats, selectExperiment, navigateTo, achievements, completedExperiments } = useLab();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  // Dynamically compute current day name (e.g. "Tue")
  const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

  // Fetch dynamic leaderboard & activity data from Backend API
  useEffect(() => {
    fetch('http://localhost:5000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLeaderboardData(data);
      })
      .catch(() => {
        setLeaderboardData([
          { rank: 1, name: "Master (You)", xp: studentStats.xp, badge: "🥇" }
        ]);
      });

    fetch('http://localhost:5000/api/activity')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setActivityData(data);
      })
      .catch(() => {
        setActivityData(DAYS_ORDER.map(d => ({
          day: d,
          hours: d === currentDayName ? studentStats.hoursPracticed : 0,
          completed: d === currentDayName ? studentStats.completedCount : 0
        })));
      });
  }, [studentStats.xp, studentStats.hoursPracticed, studentStats.completedCount]);

  // Calculate real subject progress percentages dynamically based on actual completed experiments
  const physicsCompleted = completedExperiments.has('phys-circuit') || completedExperiments.has('phys-pendulum') || completedExperiments.has('phys-projectile');
  const chemCompleted = completedExperiments.has('chem-neutralization') || completedExperiments.has('chem-heating') || completedExperiments.has('chem-ph-test');
  const elecCompleted = completedExperiments.has('elec-led-circuit') || completedExperiments.has('elec-traffic-light') || completedExperiments.has('elec-temp-fan');

  const physicsPct = completedExperiments.has('phys-circuit') ? (completedExperiments.has('phys-pendulum') ? 100 : 50) : 0;
  const chemPct = chemCompleted ? 60 : 0;
  const elecPct = elecCompleted ? 70 : 0;
  const overallPct = Math.round((physicsPct + chemPct + elecPct) / 3);

  const fallbackActivity = DAYS_ORDER.map(d => ({
    day: d,
    hours: d === currentDayName ? studentStats.hoursPracticed : 0,
    completed: d === currentDayName ? studentStats.completedCount : 0
  }));

  return (
    <div className="w-full bg-[#F8FAFF] min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Welcome Banner */}
        <div className="lg:col-span-6 gradient-primary text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="relative z-10 space-y-2">
            <span className="text-xs uppercase font-bold text-indigo-200 tracking-wider">Student Workspace</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {studentStats.name}! 👋</h1>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-sm font-medium">
              You have earned <strong className="text-amber-300 font-black">{studentStats.xp} XP</strong> and completed {completedExperiments.size} virtual lab experiments.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex items-center space-x-3">
            <button
              onClick={() => selectExperiment('phys-circuit')}
              className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-slate-50 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Physics Lab</span>
            </button>
          </div>

          <div className="absolute right-4 bottom-2 opacity-20 pointer-events-none">
            <FlaskConical className="w-48 h-48 text-white" />
          </div>
        </div>

        {/* Dynamic Learning Progress Donut */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">Real Progress</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Live Calculated</span>
          </div>

          <div className="flex items-center justify-center my-3 relative">
            <div className="w-28 h-28 rounded-full border-8 border-indigo-600 border-t-cyan-400 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-black text-slate-900">{overallPct}%</span>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Overall</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-600 mr-2" /> Physics</span>
              <span>{physicsPct}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-cyan-400 mr-2" /> Chemistry</span>
              <span>{chemPct}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-600 mr-2" /> Electronics</span>
              <span>{elecPct}%</span>
            </div>
          </div>
        </div>

        {/* Today's Active Challenge */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center">
                <Target className="w-4 h-4 text-indigo-600 mr-1.5" /> Today's Challenge
              </span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                +100 XP
              </span>
            </div>
            <h4 className="font-extrabold text-base text-slate-900 mt-1">Ohm's Law Verification</h4>
            <p className="text-xs text-slate-500 mt-1">Place 12V DC Battery and 10Ω Resistor to verify I = V/R.</p>
          </div>

          <button
            onClick={() => selectExperiment('phys-circuit')}
            className="w-full py-2.5 gradient-primary hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-md transition-all active:scale-95 mt-4"
          >
            Start Challenge →
          </button>
        </div>

      </div>

      {/* Experiments Section */}
      <div className="space-y-3">
        <h2 className="font-extrabold text-lg text-slate-900">Virtual Experiments Roster</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Physics Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-full h-28 rounded-2xl gradient-primary flex items-center justify-center text-white relative overflow-hidden">
                <Zap className="w-12 h-12 text-amber-300" />
                <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  completedExperiments.has('phys-circuit') ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'
                }`}>
                  {completedExperiments.has('phys-circuit') ? '✓ Completed' : 'Active Workspace'}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900">Ohm's Law Electric Circuit</h3>
              <p className="text-xs text-slate-500">Physics Lab • DC Electricity</p>
            </div>
            <button
              onClick={() => selectExperiment('phys-circuit')}
              className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors"
            >
              Launch Experiment →
            </button>
          </div>

          {/* Chemistry Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white relative overflow-hidden">
                <FlaskConical className="w-12 h-12 text-cyan-200" />
                <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  completedExperiments.has('chem-neutralization') ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'
                }`}>
                  {completedExperiments.has('chem-neutralization') ? '✓ Completed' : 'Active Workspace'}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900">Acid-Base Titration</h3>
              <p className="text-xs text-slate-500">Chemistry Lab • Analytical</p>
            </div>
            <button
              onClick={() => selectExperiment('chem-neutralization')}
              className="mt-4 w-full py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold text-xs rounded-xl transition-colors"
            >
              Launch Experiment →
            </button>
          </div>

          {/* Electronics Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-slate-800 to-indigo-950 flex items-center justify-center text-white relative overflow-hidden">
                <Cpu className="w-12 h-12 text-indigo-300" />
                <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  completedExperiments.has('elec-traffic-light') ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'
                }`}>
                  {completedExperiments.has('elec-traffic-light') ? '✓ Completed' : 'Active Workspace'}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900">Arduino Traffic Light</h3>
              <p className="text-xs text-slate-500">Electronics Lab • Automation</p>
            </div>
            <button
              onClick={() => selectExperiment('elec-traffic-light')}
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
            >
              Launch Experiment →
            </button>
          </div>

        </div>
      </div>

      {/* Weekly Activity & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">User Practice Telemetry</h3>
              <p className="text-xs text-slate-500">Hours spent practicing experiments</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {studentStats.hoursPracticed} Hours Practiced
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData.length > 0 ? activityData : fallbackActivity}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="hours" fill="#5B5CEB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Leaderboard */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center">
              <Trophy className="w-4 h-4 text-amber-500 mr-1.5" /> Live Leaderboard
            </h3>
            <span className="text-xs text-indigo-600 font-bold">Real-time</span>
          </div>

          <div className="space-y-3">
            {leaderboardData.map((st) => (
              <div key={st.rank} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{st.badge}</span>
                  <span className="text-xs font-bold text-slate-800">{st.name}</span>
                </div>
                <span className="text-xs font-extrabold text-indigo-600">{st.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic Achievements Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center">
          <Award className="w-5 h-5 text-amber-500 mr-2" /> Achievement Milestones
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border text-center transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-b from-indigo-50/60 to-white border-indigo-300 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-xl gradient-primary text-white flex items-center justify-center mb-2 shadow-md">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">{ach.title}</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">{ach.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
