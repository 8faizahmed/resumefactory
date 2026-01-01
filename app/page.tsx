'use client';
import { useState } from 'react';
import { JobTracker } from './components/tracker/JobTracker';
import { Workspace } from './components/workspace/Workspace';

export default function Home() {
  const [view, setView] = useState<'tracker' | 'workspace'>('tracker');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const handleOpenJob = (id: string) => {
    setActiveJobId(id);
    setView('workspace');
  };

  const handleBack = () => {
    setActiveJobId(null);
    setView('tracker');
  };

  // ROUTER
  if (view === 'tracker') {
    return <JobTracker onOpenJob={handleOpenJob} />;
  }

  if (view === 'workspace' && activeJobId) {
    return <Workspace jobId={activeJobId} onBack={handleBack} />;
  }

  return <div className="p-10">Error: Unknown State</div>;
}