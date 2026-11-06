import React from 'react';
import type { StudentProfile } from '../../types/profile';

interface PersonalInfoProps {
  profile: StudentProfile;
}

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900">{value}</span>
  </div>
);

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ profile }) => {
  const fullName =
    profile.name ||
    [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() ||
    'Student';
  const mobile = profile.parentPhone || 'Not available';
  const address = [profile.location || profile.villageCity, profile.district]
    .filter(Boolean)
    .join(', ') || 'Not available';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Personal Information</h3>
      <Row label="Full Name" value={fullName} />
      <Row label="Email" value={profile.email} />
      <Row label="Mobile Number" value={mobile} />
      <Row label="Date of Birth" value={profile.dob || profile.dateOfBirth || 'Not available'} />
      <Row label="Gender" value={profile.gender || 'Not available'} />
      <Row label="Address" value={address} />
    </div>
  );
};