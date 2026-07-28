import React from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Navbar } from './components/common/Navbar';
import { Toast } from './components/common/Toast';
import { AIAssistantModal } from './components/common/AIAssistantModal';

import { LandingPageView } from './views/LandingPageView';
import { StudentDashboardView } from './views/StudentDashboardView';
import { PhysicsWorkspaceView } from './views/PhysicsWorkspaceView';
import { ChemistryWorkspaceView } from './views/ChemistryWorkspaceView';
import { ElectronicsWorkspaceView } from './views/ElectronicsWorkspaceView';
import { TeacherDashboardView } from './views/TeacherDashboardView';
import { ResultPageView } from './views/ResultPageView';

const MainContent = () => {
  const { currentView, toastMessage } = useLab();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFF] font-sans antialiased text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navbar always on top */}
      <Navbar />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'landing' && <LandingPageView />}
        {currentView === 'dashboard' && <StudentDashboardView />}
        {currentView === 'physics' && <PhysicsWorkspaceView />}
        {currentView === 'chemistry' && <ChemistryWorkspaceView />}
        {currentView === 'electronics' && <ElectronicsWorkspaceView />}
        {currentView === 'teacher' && <TeacherDashboardView />}
        {currentView === 'result' && <ResultPageView />}
      </main>

      {/* Overlays */}
      <Toast toast={toastMessage} />
      <AIAssistantModal />
    </div>
  );
};

export default function App() {
  return (
    <LabProvider>
      <MainContent />
    </LabProvider>
  );
}
