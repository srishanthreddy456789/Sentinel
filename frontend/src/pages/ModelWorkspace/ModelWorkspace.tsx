import React from 'react';
import { useSentinel } from '../../context/SentinelContext';
import { ModelWorkspaceHeader } from './ModelWorkspaceHeader';
import { ModelWorkspaceNav } from './ModelWorkspaceNav';
import { IndividualDashboardTab } from './tabs/IndividualDashboardTab';
import { ChatTab } from './tabs/ChatTab';
import { PlaygroundTab } from './tabs/PlaygroundTab';
import { EvaluationsTab } from './tabs/EvaluationsTab';
import { FailuresTab } from './tabs/FailuresTab';
import { DiagnosisTab } from './tabs/DiagnosisTab';
import { HealingTab } from './tabs/HealingTab';
import { RequestsTab } from './tabs/RequestsTab';
import { ExperimentsTab } from './tabs/ExperimentsTab';
import { PromptsTab } from './tabs/PromptsTab';
import { IntegrationTab } from './tabs/IntegrationTab';
import { SettingsTab } from './tabs/SettingsTab';

export const ModelWorkspace: React.FC = () => {
  const { activeTab } = useSentinel();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <IndividualDashboardTab />;
      case 'Chat':
        return <ChatTab />;
      case 'Playground':
        return <PlaygroundTab />;
      case 'Evaluations':
        return <EvaluationsTab />;
      case 'Failures':
        return <FailuresTab />;
      case 'Diagnosis':
        return <DiagnosisTab />;
      case 'Healing':
        return <HealingTab />;
      case 'Requests':
        return <RequestsTab />;
      case 'Experiments':
        return <ExperimentsTab />;
      case 'Prompts':
        return <PromptsTab />;
      case 'Integration':
        return <IntegrationTab />;
      case 'Settings':
        return <SettingsTab />;
      default:
        return <IndividualDashboardTab />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#09090b]">
      {/* Workspace Header with ← Dashboard Back Navigation & Exact User Name */}
      <ModelWorkspaceHeader />

      {/* Horizontal Workspace Navigation Tabs */}
      <ModelWorkspaceNav />

      {/* Active Tab View Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderActiveTab()}
      </div>
    </div>
  );
};
