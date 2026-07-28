import React from 'react';
import { useLab } from '../../context/LabContext';
import { FileText, Download, Printer, CheckCircle, Award, Clock, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ReportModal = ({ isOpen, onClose, resultData }) => {
  const { studentStats, currentExperiment } = useLab();

  if (!isOpen) return null;

  const result = resultData || {
    experimentTitle: currentExperiment.title,
    subject: currentExperiment.subject,
    score: 96,
    earnedXP: currentExperiment.xpReward || 100,
    timeTaken: "04:25",
    accuracy: "98%",
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    observations: [
      "Circuits formed a valid closed loop with 0 short-circuit errors.",
      "Measured voltage (12.0V) and resistance (10.0Ω) produced exactly 1.20A current (I = V/R).",
      "Bulb illumination bloom matched power dissipation calculations."
    ],
    suggestions: [
      "Proceed to advanced micro-controller traffic light experiments.",
      "Explore changing wire length parameters for secondary resistance effects."
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">VirtuLab Verified Experiment Report</h3>
                <p className="text-xs text-indigo-300">Official Certificate of Completion & Telemetry</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Printable Report Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-800" id="printable-report">
            
            {/* Student & Date Meta Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Student</span>
                <span className="font-bold text-sm text-slate-900">{studentStats.name}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Class</span>
                <span className="font-medium text-sm text-slate-700">{studentStats.title}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Timestamp</span>
                <span className="font-medium text-sm text-slate-700">{result.completedAt || 'Today'}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-3 h-3 mr-1" /> Verified Pass
                </span>
              </div>
            </div>

            {/* Title & Score Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gradient-primary text-white rounded-2xl shadow-md">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-indigo-200">Experiment</span>
                <h2 className="text-xl font-extrabold">{result.experimentTitle}</h2>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <Award className="w-8 h-8 text-amber-300" />
                <div>
                  <span className="text-2xl font-black">{result.score}%</span>
                  <span className="block text-[10px] text-indigo-100">Overall Accuracy</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <span className="text-xs text-slate-500 font-medium">Time Taken</span>
                <p className="text-base font-bold text-slate-900">{result.timeTaken}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Target className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-xs text-slate-500 font-medium">Accuracy</span>
                <p className="text-base font-bold text-slate-900">{result.accuracy}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-xs text-slate-500 font-medium">XP Reward</span>
                <p className="text-base font-bold text-slate-900">+{result.earnedXP} XP</p>
              </div>
            </div>

            {/* Observations */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                Key Lab Observations & Calculations
              </h4>
              <ul className="space-y-2">
                {result.observations.map((obs, idx) => (
                  <li key={idx} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-start">
                    <span className="font-bold text-indigo-600 mr-2">{idx + 1}.</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructor Recommendation */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wider mb-1">
                AI / Instructor Feedback
              </h4>
              <p className="text-xs text-indigo-800">
                Outstanding laboratory execution. Demonstrated mastery over component circuit loop verification and Ohm's Law principles. Ready for advanced micro-controller automation.
              </p>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">ID: VL-RPT-2026-{Math.floor(1000 + Math.random() * 9000)}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center space-x-1.5 px-4 py-2 gradient-primary hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
