import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WaitingList } from './sections/WaitingList';
import { Shipping } from './sections/Shipping';
import { Returns } from './sections/Returns';
import { Issues } from './sections/Issues';
import { Tasks } from './sections/Tasks';
import { DropdownManager } from './sections/DropdownManager';
import { Reports } from './sections/Reports';
import { Archive } from './sections/Archive';
import { 
  Users, 
  Truck, 
  RotateCcw, 
  AlertTriangle, 
  CheckSquare, 
  Settings, 
  BarChart3, 
  Archive as ArchiveIcon 
} from 'lucide-react';

export const DashboardTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "لوحة التحكم", icon: BarChart3, component: Reports },
    { id: "waiting", label: "قائمة الانتظار", icon: Users, component: WaitingList },
    { id: "shipping", label: "الشحنات", icon: Truck, component: Shipping },
    { id: "returns", label: "الإرجاعات", icon: RotateCcw, component: Returns },
    { id: "issues", label: "القضايا", icon: AlertTriangle, component: Issues },
    { id: "tasks", label: "المهام", icon: CheckSquare, component: Tasks },
    { id: "dropdowns", label: "إدارة القوائم", icon: Settings, component: DropdownManager },
    { id: "archive", label: "الأرشيف", icon: ArchiveIcon, component: Archive },
  ];

  return (
    <div className="glass-card animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 glass-input border-0 p-2 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium rounded-lg transition-all duration-200"
              >
                <Icon className="h-4 w-4 ml-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};