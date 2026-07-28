import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { ReportModal } from '../components/common/ReportModal';
import { Award, Clock, Target, CheckCircle2, RotateCcw, Download, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const ResultPageView = () => {
  const { activeResult, currentExperiment, selectExperiment, navigateTo } = useLab();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const res = activeResult || {
    experimentTitle: currentExperiment.title,
    score: 96,
    earnedXP: currentExperiment.xpReward || 100,
    timeTaken: "04:15",
    accuracy: "98%",
    observations: [
      "Circuits formed a valid closed loop with 0 short-circuit errors.",
      "Measured voltage (12.0V) and resistance (10.0Ω) produced exactly 1.20A current (I = V/R).",
      "Bulb illumination bloom matched power dissipation calculations."
    ]
  };

  return (
    <div className="w-full bg-[#F8FAFF] min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6"
      >
        
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl gradient-primary flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <Award className="w-9 h-9 text-amber-300 animate-bounce" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Experiment Verified Pass</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {res.experimentTitle}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Virtual laboratory execution completed and scored by automated telemetry.
          </p>
        </div>

        {/* Score Ring & XP Badge */}
        <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-around gap-6">
          <div className="text-center">
            <div className="w-28 h-28 mx-auto rounded-full border-8 border-indigo-600 border-t-amber-400 flex items-center justify-center shadow-inner">
              <span className="text-3xl font-black text-slate-900">{res.score}%</span>
            </div>
            <span className="block text-xs font-bold text-slate-500 mt-2">Overall Score</span>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
              <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="text-[11px] text-slate-400 font-bold block">Time Taken</span>
              <span className="text-base font-extrabold text-slate-900">{res.timeTaken}</span>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
              <Target className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <span className="text-[11px] text-slate-400 font-bold block">Accuracy</span>
              <span className="text-base font-extrabold text-slate-900">{res.accuracy}</span>
            </div>
          </div>
        </div>

        {/* Observations Checklist */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-slate-900 flex items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" /> Key Telemetry Observations
          </h3>
          <div className="space-y-2">
            {res.observations.map((obs, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 flex items-start space-x-2">
                <span className="font-bold text-indigo-600">{idx + 1}.</span>
                <span>{obs}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
          <button
            onClick={() => selectExperiment(currentExperiment.id)}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Experiment</span>
          </button>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </button>

            <button
              onClick={() => navigateTo('dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 gradient-primary hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-500/25 transition-all"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </motion.div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        resultData={res}
      />

    </div>
  );
};
