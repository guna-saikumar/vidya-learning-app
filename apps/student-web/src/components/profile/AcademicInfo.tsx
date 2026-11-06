import React from 'react';
import type { StudentProfile } from '../../types/profile';

interface AcademicInfoProps {
  profile: StudentProfile;
}

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900">{value}</span>
  </div>
);

export const AcademicInfo: React.FC<AcademicInfoProps> = ({ profile }) => {
  const classLabel =
    profile.grade
      ? `Grade ${profile.grade}${profile.section ? ` - Section ${profile.section}` : ''}`
      : profile.activeClassId || profile.classId || 'Not available';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Academic Information</h3>
      <Row label="School" value={profile.schoolName || 'Not available'} />
      <Row label="District" value={profile.district || 'Not available'} />
      <Row label="Location" value={profile.location || profile.villageCity || 'Not available'} />
      <Row label="Class" value={classLabel} />
      <Row label="Section" value={profile.section || 'Not available'} />
      <Row label="Medium" value={profile.medium || 'Not available'} />
      <Row label="Roll Number" value={profile.rollNumber ? `#${profile.rollNumber}` : 'Not available'} />
      <Row label="Study Goal" value={`${profile.studyGoalMinutes || 30} mins/day`} />
      <Row label="Streak Days" value={String(profile.streakDays ?? 0)} />
    </div>
  );
};