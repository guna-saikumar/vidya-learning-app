import React from 'react';
import { resolveAvatarUrl } from '../../lib/avatar';
import type { StudentProfile } from '../../types/profile';

interface ProfileOverviewProps {
  profile: StudentProfile;
}

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900">{value}</span>
  </div>
);

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ profile }) => {
  const avatar = resolveAvatarUrl(profile.avatarUrl);
  const fullName =
    profile.name ||
    [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() ||
    'Student';
  const course =
    profile.grade
      ? `Grade ${profile.grade}`
      : profile.activeClassId || profile.classId || 'Not available from API';

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card md:flex-row md:items-center">
      <div className="flex-shrink-0">
        {avatar ? (
          <img src={avatar} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-700">
            {(fullName[0] || 'S').toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
        <p className="text-sm text-slate-500">{profile.email}</p>
        <div className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2">
          <Row label="Student ID" value={profile.id} />
          <Row label="Department" value="Not available from API" />
          <Row label="Course" value={course} />
          <Row label="Email" value={profile.email} />
          <Row label="Academic Year" value="Not available from API" />
        </div>
      </div>
    </div>
  );
};