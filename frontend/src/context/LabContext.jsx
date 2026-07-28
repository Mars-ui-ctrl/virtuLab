import React, { createContext, useContext, useState, useEffect } from 'react';
import { EXPERIMENTS as DEFAULT_EXPERIMENTS, ACHIEVEMENTS as BASE_ACHIEVEMENTS } from '../data/mockData';

const LabContext = createContext();
const API_BASE = 'http://localhost:5000/api';

export const LabProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedExperimentId, setSelectedExperimentId] = useState('phys-circuit');

  // Real Dynamic User Profile State (persisted in localStorage)
  const [studentStats, setStudentStats] = useState(() => {
    const saved = localStorage.getItem('virtulab_user_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: "Master",
      title: "Class 12th Science - Active Researcher",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      xp: 0,
      level: 1,
      completedCount: 0,
      hoursPracticed: 0.5,
      avgScore: 0,
      currentStreak: 1
    };
  });

  // Track completed experiment IDs
  const [completedExperiments, setCompletedExperiments] = useState(() => {
    const saved = localStorage.getItem('virtulab_completed_ids');
    if (saved) {
      try { return new Set(JSON.parse(saved)); } catch (e) {}
    }
    return new Set();
  });

  const [achievements, setAchievements] = useState(BASE_ACHIEVEMENTS);
  const [activeResult, setActiveResult] = useState(null);
  const [experimentsData, setExperimentsData] = useState(DEFAULT_EXPERIMENTS);

  // Toast & AI Assistant modal states
  const [toastMessage, setToastMessage] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiCustomQuestion, setAiCustomQuestion] = useState('');

  // Save student stats & completed IDs to localStorage
  useEffect(() => {
    localStorage.setItem('virtulab_user_stats', JSON.stringify(studentStats));
    window.dispatchEvent(new Event('virtulab_session_updated'));
  }, [studentStats]);

  useEffect(() => {
    localStorage.setItem('virtulab_completed_ids', JSON.stringify([...completedExperiments]));
    window.dispatchEvent(new Event('virtulab_session_updated'));
  }, [completedExperiments]);

  // Sync live experiment session for Teacher Monitoring
  useEffect(() => {
    const exp = experimentsData[selectedExperimentId] || DEFAULT_EXPERIMENTS['phys-circuit'];
    const session = {
      studentName: "Master",
      experimentId: exp.id,
      experimentTitle: exp.title,
      subject: exp.subject,
      xp: studentStats.xp,
      level: studentStats.level,
      completedCount: completedExperiments.size,
      status: "ONLINE (Active Lab)",
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    localStorage.setItem('virtulab_live_session', JSON.stringify(session));
    window.dispatchEvent(new Event('virtulab_session_updated'));
  }, [selectedExperimentId, experimentsData, studentStats.xp, studentStats.level, completedExperiments.size]);

  // Sync profile with Backend API on launch
  useEffect(() => {
    fetch(`${API_BASE}/user/profile`)
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setStudentStats(prev => ({
            ...prev,
            ...data,
            name: "Master"
          }));
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (title, message, icon = '✨') => {
    setToastMessage({ title, message, icon, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const navigateTo = (view, experimentId = null) => {
    setCurrentView(view);
    if (experimentId) {
      setSelectedExperimentId(experimentId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectExperiment = (expId) => {
    const exp = experimentsData[expId] || DEFAULT_EXPERIMENTS[expId];
    if (!exp) return;
    setSelectedExperimentId(expId);
    setCurrentView(exp.subject);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeExperiment = (expId, metrics = {}) => {
    const exp = experimentsData[expId] || experimentsData[selectedExperimentId] || DEFAULT_EXPERIMENTS['phys-circuit'];
    const earnedXP = exp.xpReward || 100;
    const score = metrics.score || 95;
    const timeTaken = metrics.timeTaken || "03:45";
    const accuracy = metrics.accuracy || "98%";

    // Update real completed set
    const newCompletedSet = new Set([...completedExperiments, exp.id]);
    setCompletedExperiments(newCompletedSet);

    // Compute dynamic user stats
    setStudentStats(prev => {
      const nextXP = prev.xp + earnedXP;
      const nextCount = newCompletedSet.size;
      const nextAvg = prev.avgScore === 0 ? score : Math.round((prev.avgScore + score) / 2);
      const nextLevel = Math.floor(nextXP / 200) + 1;

      return {
        ...prev,
        xp: nextXP,
        completedCount: nextCount,
        avgScore: nextAvg,
        level: nextLevel,
        hoursPracticed: parseFloat((prev.hoursPracticed + 0.5).toFixed(1))
      };
    });

    // Dynamic achievement unlock check
    setAchievements(prev => prev.map(ach => {
      if (ach.id === 'ach-1') return { ...ach, unlocked: true }; // First experiment
      if (ach.id === 'ach-2' && exp.subject === 'physics') return { ...ach, unlocked: true };
      if (ach.id === 'ach-3' && exp.subject === 'chemistry') return { ...ach, unlocked: true };
      if (ach.id === 'ach-4' && score >= 90) return { ...ach, unlocked: true };
      return ach;
    }));

    // Construct dynamic result summary
    const resultObj = {
      experimentId: exp.id,
      experimentTitle: exp.title,
      subject: exp.subject,
      score,
      earnedXP,
      timeTaken,
      accuracy,
      observations: metrics.observations || [
        `Verified 3D parameters for ${exp.title}.`,
        `Experimental measurements matched theoretical expectations with 98%+ precision.`
      ],
      suggestions: [
        "Proceed to the next interactive virtual lab module on your dashboard."
      ],
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Post real report telemetry to backend API
    fetch(`${API_BASE}/reports/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultObj)
    }).catch(() => {});

    setActiveResult(resultObj);
    showToast("Experiment Completed! 🎉", `+${earnedXP} XP Earned! Score: ${score}%`);

    setTimeout(() => {
      setCurrentView('result');
    }, 800);
  };

  const openAIAssistant = (prefilledQuery = '') => {
    if (prefilledQuery) {
      setAiCustomQuestion(prefilledQuery);
    }
    setIsAIModalOpen(true);
  };

  return (
    <LabContext.Provider value={{
      currentView,
      setCurrentView,
      selectedExperimentId,
      setSelectedExperimentId,
      currentExperiment: experimentsData[selectedExperimentId] || DEFAULT_EXPERIMENTS['phys-circuit'],
      experimentsData,
      studentStats,
      completedExperiments,
      achievements,
      activeResult,
      toastMessage,
      isAIModalOpen,
      setIsAIModalOpen,
      aiCustomQuestion,
      setAiCustomQuestion,
      navigateTo,
      selectExperiment,
      completeExperiment,
      showToast,
      openAIAssistant
    }}>
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => useContext(LabContext);
