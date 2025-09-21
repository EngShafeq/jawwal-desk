import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

const Index = () => {
  return (
    <div className="min-h-screen p-4 bg-gradient-backdrop">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        <DashboardTabs />
      </div>
    </div>
  );
};

export default Index;
