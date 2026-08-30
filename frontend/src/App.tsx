import React, { useState } from 'react';
import { SentinelProvider, useSentinel } from './context/SentinelContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DesktopHeader } from './components/shell/DesktopHeader';
import { DesktopSidebar } from './components/shell/DesktopSidebar';
import { AddApiModal } from './components/modals/AddApiModal';
import { GlobalDashboard } from './pages/GlobalDashboard/GlobalDashboard';
import { ModelWorkspace } from './pages/ModelWorkspace/ModelWorkspace';
import { AuthPage } from './pages/Auth/AuthPage';

const MainShell: React.FC = () => {
  const { selectedModelId } = useSentinel();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#09090b] text-zinc-100 antialiased font-sans">
      {/* Top Desktop Window Header */}
      <DesktopHeader />

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Compact Desktop Sidebar */}
        <DesktopSidebar />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedModelId === null ? <GlobalDashboard /> : <ModelWorkspace />}
        </main>
      </div>

      {/* Add API Modal Dialog */}
      <AddApiModal />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);

  if (!isAuthenticated && !isGuestMode) {
    return <AuthPage onContinueAsGuest={() => demoLogin('engineer')} />;
  }

  return (
    <SentinelProvider>
      <MainShell />
    </SentinelProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

