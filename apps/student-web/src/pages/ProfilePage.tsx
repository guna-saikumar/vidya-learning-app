import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { apiClient } from '../lib/apiClient';
import { resolveAvatarUrl } from '../lib/avatar';
import { uploadAvatar } from '../services/profileService';
import type { StudentProfile } from '../types/profile';
import { ProfileEditForm } from '../components/profile/ProfileEditForm';
import { Button } from '../components/ui/Button';
import { AlertBanner } from '../components/ui/AlertBanner';
import { Pencil, LogOut, Camera, Flame, CheckCircle, Trophy } from 'lucide-react';
import { extractErrorMessage } from '../lib/apiClient';
import type { ProfileEditValues } from '../schemas/profileSchema';

interface ProgressSummary {
  completedChapters: number;
  completedTopics: number;
}

export const ProfilePage: React.FC = () => {
  const { profile, loading, error, refresh, save, setProfile } = useProfile();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [progress, setProgress] = useState<ProgressSummary>({ completedChapters: 0, completedTopics: 0 });
  const [offlineCache, setOfflineCache] = useState(true);
  const [studyMedium, setStudyMedium] = useState<'English' | 'Telugu'>('English');
  const [studyGoal, setStudyGoal] = useState('45 mins');
  const [avatarError, setAvatarError] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarError(false);
  }, [profile?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (profile?.medium) {
      setStudyMedium(profile.medium.toUpperCase().includes('TELUGU') ? 'Telugu' : 'English');
    }
    if (profile?.studyGoalMinutes) {
      setStudyGoal(`${profile.studyGoalMinutes} mins`);
    }
  }, [profile?.medium, profile?.studyGoalMinutes]);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get<{ overallPercent: number; chapters: Record<string, { completed: boolean; completedSections?: string[] }> }>(
        '/api/v1/students/me/progress'
      )
      .then((res) => {
        if (!mounted) return;
        const chapters = res.data?.chapters || {};
        const completedChapters = Object.values(chapters).filter((c) => c.completed).length;
        const completedTopics = Object.values(chapters).reduce(
          (sum, c) => sum + (c.completedSections?.length || 0),
          0
        );
        setProgress({ completedChapters, completedTopics });
      })
      .catch(() => {
        // keep defaults
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (values: ProfileEditValues) => {
    setSaving(true);
    setNotice(null);
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        dob: values.dob,
        dateOfBirth: values.dob,
        district: values.district,
        villageCity: values.location,
        location: values.location,
        schoolName: values.schoolName,
        grade: values.grade,
        section: values.section,
        medium: values.medium,
        rollNumber: values.rollNumber,
        fatherName: values.fatherName,
        motherName: values.motherName,
        parentPhone: values.parentPhone,
        studyGoalMinutes: values.studyGoalMinutes,
      };
      Object.keys(payload).forEach((k) => {
        if ((payload as Record<string, unknown>)[k] === undefined) {
          delete (payload as Record<string, unknown>)[k];
        }
      });
      await save(payload);
      setEditMode(false);
      setNotice({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setNotice({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const updateMedium = async (medium: 'English' | 'Telugu') => {
    setStudyMedium(medium);
    try {
      await save({ medium: medium === 'English' ? 'ENGLISH' : 'TELUGU' });
    } catch {
      setNotice({ type: 'error', message: 'Could not update study medium.' });
    }
  };

  const updateStudyGoal = async (goal: string) => {
    setStudyGoal(goal);
    const minutes = parseInt(goal, 10) || 30;
    try {
      await localStorage.setItem('@vidya_study_goal', goal);
    } catch {
      // ignore
    }
    try {
      await save({ studyGoalMinutes: minutes });
    } catch {
      setNotice({ type: 'error', message: 'Could not update study goal.' });
    }
  };

  const allowedAvatarTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxAvatarSize = 5 * 1024 * 1024;

  const openAvatarPicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    setAvatarUploadError(null);
    if (!allowedAvatarTypes.includes(file.type)) {
      setAvatarUploadError('Please select a JPG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > maxAvatarSize) {
      setAvatarUploadError('Image must be 5 MB or smaller.');
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const cancelAvatarUpload = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setSelectedAvatar(null);
    setAvatarPreview(null);
    setAvatarUploadError(null);
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatar) return;
    setUploadingAvatar(true);
    setAvatarUploadError(null);
    try {
      const result = await uploadAvatar(selectedAvatar);
      if (profile) {
        setProfile({ ...profile, avatarUrl: result.avatarUrl });
      }
      setNotice({ type: 'success', message: 'Profile picture updated successfully.' });
      cancelAvatarUpload();
    } catch (err) {
      setAvatarUploadError(extractErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <AlertBanner type="error" message={error} />
        <Button onClick={() => void refresh()}>Retry</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-[22px] border border-borderWarm bg-white p-8 text-center shadow-card">
        <p className="text-textSecondary">No profile data available.</p>
      </div>
    );
  }

  const fullName =
    profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || 'Student';
  const avatar = resolveAvatarUrl(profile.avatarUrl);
  const activeClass =
    profile.grade ? `Class ${profile.grade}` : profile.activeClassId || profile.classId || 'Class not set';
  const classSection = profile.section ? `${activeClass} — Section ${profile.section}` : activeClass;
  const course = profile.grade ? `Grade ${profile.grade}` : profile.activeClassId || profile.classId || 'Not available';
  const mobile = profile.parentPhone || '—';
  const address = [profile.location || profile.villageCity, profile.district].filter(Boolean).join(', ') || '—';

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      {notice && (
        <AlertBanner type={notice.type} message={notice.message} onClose={() => setNotice(null)} />
      )}

      {avatarPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-[22px] border border-borderWarm bg-white p-5 shadow-card">
            <h3 className="mb-4 font-manrope text-lg font-extrabold text-textPrimary">Profile Photo</h3>
            <div className="mb-4 flex justify-center">
              <img
                src={avatarPreview}
                alt="Selected profile"
                className="h-32 w-32 rounded-full border-2 border-borderWarm object-cover"
              />
            </div>
            {avatarUploadError && (
              <div className="mb-4">
                <AlertBanner type="error" message={avatarUploadError} onClose={() => setAvatarUploadError(null)} />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={cancelAvatarUpload} disabled={uploadingAvatar}>
                Cancel
              </Button>
              <Button loading={uploadingAvatar} onClick={handleAvatarUpload}>
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Page intro */}
      <div className="py-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="font-manrope text-[11px] font-extrabold uppercase tracking-widest text-primary">
            STUDENT ACCOUNT
          </span>
          <span className="rounded-full bg-palePeach px-2 py-0.5 font-manrope text-[10px] font-bold text-primaryDark">
            {activeClass} Enrolled
          </span>
        </div>
        <h2 className="font-manrope text-[22px] font-extrabold tracking-tight text-textPrimary">
          Student Profile &amp; Settings
        </h2>
      </div>

      {/* Profile card */}
      <div className="rounded-[22px] border border-[#f2ded3] bg-palePeach p-[22px] shadow-card">
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatar && !avatarError ? (
              <img
                src={avatar}
                alt="Profile"
                onError={() => setAvatarError(true)}
                className="h-[66px] w-[66px] rounded-full border-2 border-white object-cover shadow-card"
              />
            ) : (
              <div className="flex h-[66px] w-[66px] items-center justify-center rounded-full border-2 border-white bg-primary text-xl font-bold text-white shadow-card">
                {(fullName[0] || 'S').toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={openAvatarPicker}
              aria-label="Change profile picture"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary shadow-md transition hover:bg-primaryDark"
            >
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarSelected}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-manrope text-lg font-extrabold text-textPrimary">{fullName}</h3>
              <span className="rounded-full bg-primary px-2.5 py-0.5 font-manrope text-[10px] font-bold text-white">
                Roll #{profile.rollNumber || '—'}
              </span>
            </div>
            <p className="font-manrope text-xs font-medium text-textSecondary">{profile.schoolName || 'School not set'}</p>
            <p className="mt-0.5 font-manrope text-xs font-bold text-primaryDark">
              {activeClass} · Section {profile.section || '—'} · {profile.medium || '—'}
            </p>
          </div>
        </div>
      </div>

      {!editMode && (
        <>
          {/* Student details */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-manrope text-lg font-extrabold tracking-tight text-textPrimary">Student Details</h3>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1 rounded-full border border-borderWarm bg-palePeach px-3 py-1.5 font-manrope text-xs font-bold text-primary"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </button>
            </div>
            <div className="rounded-[22px] border border-borderWarm bg-white p-5 shadow-card">
              <Row label="Student Name" value={fullName} />
              <Row label="Date of Birth" value={profile.dob || profile.dateOfBirth || '—'} />
              <Row label="Gender" value={profile.gender || '—'} />
              <Row label="Roll Number" value={profile.rollNumber ? `#${profile.rollNumber}` : '—'} last />
            </div>
          </div>

          {/* Academic info */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-manrope text-lg font-extrabold tracking-tight text-textPrimary">Academic Information</h3>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1 rounded-full border border-borderWarm bg-palePeach px-3 py-1.5 font-manrope text-xs font-bold text-primary"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Details
              </button>
            </div>
            <div className="rounded-[22px] border border-borderWarm bg-white p-5 shadow-card">
              <Row label="School" value={profile.schoolName || '—'} />
              <Row label="Location & District" value={address} />
              <Row label="Class & Section" value={classSection} />
              <Row label="Medium" value={profile.medium || '—'} />
              <Row label="Academic Session" value={`${profile.academicYear || '—'} (AP SCERT)`} last />
            </div>
          </div>

          {/* Parents & contact */}
          <div className="space-y-2.5">
            <h3 className="font-manrope text-lg font-extrabold tracking-tight text-textPrimary">Parents &amp; Contact Details</h3>
            <div className="rounded-[22px] border border-borderWarm bg-white p-5 shadow-card">
              <Row label="Father's Name" value={profile.fatherName || '—'} />
              <Row label="Mother's Name" value={profile.motherName || '—'} />
              <Row label="Parent Contact Mobile" value={mobile} />
              <Row label="Login Email" value={user?.email || profile.email} last />
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-2">
            <h3 className="font-manrope text-lg font-extrabold tracking-tight text-textPrimary">Achievements</h3>
            <div className="flex gap-2.5">
              <StatTile value={profile.streakDays || 0} label="Day Streak" />
              <StatTile value={progress.completedTopics} label="Topics Done" />
              <StatTile value={progress.completedChapters} label="Chapters Done" />
            </div>
          </div>

          {/* Study settings */}
          <div className="space-y-2">
            <h3 className="font-manrope text-lg font-extrabold tracking-tight text-textPrimary">Study Settings</h3>
            <div className="rounded-[22px] border border-borderWarm bg-white p-5 shadow-card">
              <div className="flex items-center justify-between border-b border-borderWarm pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-primary">🌐</span>
                  <div>
                    <p className="font-manrope text-[13px] font-bold text-textPrimary">Study Medium / Language</p>
                    <p className="font-manrope text-[11px] font-medium text-textSecondary">Primary instruction language</p>
                  </div>
                </div>
                <div className="flex gap-1 rounded-xl bg-surfaceSoft p-1">
                  {(['English', 'Telugu'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => updateMedium(m)}
                      className={`rounded-lg px-2.5 py-1 font-manrope text-[11px] font-bold transition ${
                        studyMedium === m ? 'bg-primary text-white' : 'text-textSecondary'
                      }`}
                    >
                      {m === 'Telugu' ? 'తెలుగు' : m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-b border-borderWarm py-4">
                <div className="mb-2.5 flex items-center gap-3">
                  <span className="text-primary">⏱</span>
                  <div>
                    <p className="font-manrope text-[13px] font-bold text-textPrimary">Daily Study Goal</p>
                    <p className="font-manrope text-[11px] font-medium text-textSecondary">Target daily learning time</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['15 mins', '30 mins', '45 mins', '60 mins'].map((goal) => {
                    const selected = studyGoal === goal;
                    return (
                      <button
                        key={goal}
                        onClick={() => updateStudyGoal(goal)}
                        className={`flex-1 rounded-xl border py-2 font-manrope text-[11px] font-bold transition ${
                          selected
                            ? 'border-primary bg-primary text-white shadow-sm'
                            : 'border-borderWarm bg-white text-textSecondary'
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  <span className="text-primary">📌</span>
                  <div>
                    <p className="font-manrope text-[13px] font-bold text-textPrimary">Offline Content Cache</p>
                    <p className="font-manrope text-[11px] font-medium text-textSecondary">Cached curriculum for offline reading</p>
                  </div>
                </div>
                <button
                  onClick={() => setOfflineCache((v) => !v)}
                  className={`h-6 w-11 rounded-full transition ${offlineCache ? 'bg-primary' : 'bg-borderWarm'}`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white shadow transition ${
                      offlineCache ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account actions */}
          <div>
            <button
              onClick={() => void logout().then(() => navigate('/login'))}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 font-manrope text-sm font-bold text-red-600 shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

          {/* App info */}
          <div className="py-2 text-center">
            <p className="font-manrope text-xs font-bold text-textSecondary">Vidya Learning App v1.2.0</p>
            <p className="font-manrope text-[10px] font-medium text-textMuted">Aligned with Andhra Pradesh SCERT Curriculum</p>
          </div>
        </>
      )}

      {editMode && (
        <div className="rounded-[22px] border border-borderWarm bg-white p-5 shadow-card">
          <h3 className="mb-4 font-manrope text-lg font-extrabold text-textPrimary">Edit Profile</h3>
          <ProfileEditForm
            profile={profile}
            saving={saving}
            onSubmit={handleSave}
            onCancel={() => setEditMode(false)}
          />
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; last?: boolean }> = ({ label, value, last }) => {
  return (
    <div className={`flex items-center justify-between py-3 ${last ? '' : 'border-b border-borderWarm'}`}>
      <span className="font-manrope text-xs font-medium text-textSecondary">{label}</span>
      <span className="font-manrope text-xs font-bold text-textPrimary">{value}</span>
    </div>
  );
};

const StatTile: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const bg =
    label === 'Day Streak' ? 'bg-amber-50' : label === 'Topics Done' ? 'bg-emerald-50' : 'bg-palePeach';
  const iconColor =
    label === 'Day Streak' ? 'text-amber-600' : label === 'Topics Done' ? 'text-emerald-600' : 'text-primary';
  const Icon = label === 'Day Streak' ? Flame : label === 'Topics Done' ? CheckCircle : Trophy;
  return (
    <div className="flex-1 rounded-2xl border border-borderWarm bg-white px-2 py-3.5 text-center shadow-sm">
      <div className={`mx-auto mb-2 flex h-[34px] w-[34px] items-center justify-center rounded-[10px] ${bg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="font-manrope text-lg font-extrabold text-textPrimary">{value}</p>
      <p className="mt-0.5 font-manrope text-[11px] font-semibold text-textSecondary">{label}</p>
    </div>
  );
};