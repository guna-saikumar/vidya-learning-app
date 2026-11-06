import React from 'react';
import { Card } from '../components/ui/Card';

export const SettingsPage: React.FC = () => {
  return (
    <Card title="Settings">
      <p className="text-sm text-slate-600">Account settings are managed from your profile.</p>
    </Card>
  );
};