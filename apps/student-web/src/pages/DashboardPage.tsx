import React from 'react';
import { Card } from '../components/ui/Card';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card title="Welcome to Vidya">
        <p className="text-sm text-slate-600">
          Use the sidebar to navigate to your profile, courses, and settings.
        </p>
      </Card>
    </div>
  );
};