import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import {
  User,
  GraduationCap,
  Calendar,
  Phone,
  School,
  LogOut,
  Camera,
  Check,
  MapPin,
  Clock,
  Layers,
  Edit2,
  X,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import styles from './ProfilePage.css';

const AP_DISTRICTS = [
  'Guntur',
  'NTR (Vijayawada)',
  'Krishna (Machilipatnam)',
  'Visakhapatnam',
  'Tirupati',
  'Chittoor',
  'Kurnool',
  'East Godavari (Rajahmundry)',
  'West Godavari (Bhimavaram)',
  'Kakinada',
  'Prakasam (Ongole)',
  'SPSR Nellore',
  'YSR Kadapa',
  'Annamayya (Rayachoty)',
  'Anantapur',
  'Sri Sathya Sai (Puttaparthi)',
  'Srikakulam',
  'Vizianagaram',
  'Eluru',
  'Bapatla',
  'Palnadu (Narasaraopet)',
  'Nandyal',
  'Konaseema (Amalapuram)',
  'Alluri Sitharama Raju',
  'Parvathipuram Manyam',
  'Anakapalli',
];

const POPULAR_SCHOOLS = [
  'Zilla Parishad High School (ZPHS)',
  'A.P. Model School & Junior College',
  'Government High School (Boys/Girls)',
  'Municipal Corporation High School',
  'Kasturba Gandhi Balika Vidyalaya (KGBV)',
  'A.P. Residential School (APRS)',
  'A.P. Tribal Welfare Residential School',
  'Kendriya Vidyalaya (Central School)',
  'Jawahar Navodaya Vidyalaya (JNV)',
  'Sri Chaitanya Techno School',
  'Narayana Olympiad High School',
  'Bhashyam Educational Institution',
];

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, save } = useProfile();

  const [savingGoal, setSavingGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(profile?.studyGoalMinutes || 45);

  // Single Edit Details Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [rollNumber, setRollNumber] = useState('');
  const [district, setDistrict] = useState('Guntur');
  const [location, setLocation] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [customSchool, setCustomSchool] = useState('');
  const [grade, setGrade] = useState('10');
  const [section, setSection] = useState('A');
  const [medium, setMedium] = useState('English');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || profile.name?.split(' ')[0] || '');
      setLastName(profile.lastName || profile.name?.split(' ').slice(1).join(' ') || '');
      setDateOfBirth(profile.dateOfBirth || profile.dob || '2010-08-14');
      setGender(profile.gender || 'Male');
      setRollNumber(profile.rollNumber || '42');
      setDistrict(profile.district || 'Guntur');
      setLocation(profile.location || profile.villageCity || 'Guntur Urban');
      setSchoolName(profile.schoolName || POPULAR_SCHOOLS[0]);
      setGrade(profile.grade || (profile.activeClassId ? profile.activeClassId.replace('class-', '') : '10'));
      setSection(profile.section || 'A');
      setMedium(profile.medium?.includes('Telugu') ? 'Telugu' : 'English');
      setFatherName(profile.fatherName || 'Ramesh Patel');
      setMotherName(profile.motherName || 'Lakshmi Patel');
      setParentPhone(profile.parentPhone || '9876543210');

      if (profile.studyGoalMinutes) {
        setSelectedGoal(profile.studyGoalMinutes);
      }
    }
  }, [profile, isEditModalOpen]);

  const handleStudyGoalChange = async (minutes) => {
    setSelectedGoal(minutes);
    setSavingGoal(true);
    try {
      await save({ studyGoalMinutes: minutes });
    } catch {
      // offline fallback
    } finally {
      setSavingGoal(false);
    }
  };

  const validateStep = (s) => {
    setErrorMessage(null);
    if (s === 1) {
      if (!firstName.trim()) {
        setErrorMessage('First name is required.');
        return false;
      }
      if (!lastName.trim()) {
        setErrorMessage('Last name is required.');
        return false;
      }
      if (!dateOfBirth.trim()) {
        setErrorMessage('Date of birth is required.');
        return false;
      }
    } else if (s === 2) {
      if (!district.trim()) {
        setErrorMessage('District is required.');
        return false;
      }
      if (!location.trim()) {
        setErrorMessage('Location / Mandal is required.');
        return false;
      }
      const school = customSchool.trim() || schoolName.trim();
      if (!school) {
        setErrorMessage('School name is required.');
        return false;
      }
    } else if (s === 3) {
      if (!rollNumber.trim()) {
        setErrorMessage('Roll number is required.');
        return false;
      }
    } else if (s === 4) {
      const cleanPhone = parentPhone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setErrorMessage('Parent phone number must contain exactly 10 digits.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSavingProfile(true);
    setErrorMessage(null);

    const activeClassId = `class-${grade}`;
    const effectiveSchool = customSchool.trim() || schoolName.trim();

    try {
      await save({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        gender,
        rollNumber: rollNumber.trim(),
        schoolName: effectiveSchool,
        grade,
        classId: activeClassId,
        section: section.trim(),
        medium: `${medium} Medium`,
        district,
        location: location.trim(),
        villageCity: location.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        parentPhone: parentPhone.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditModalOpen(false);
        setStep(1);
      }, 1000);
    } catch (err) {
      setErrorMessage(err?.message || 'Could not update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fullName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.fullName || profile?.name || user?.name || 'Student';

  const rollNumberDisplay = profile?.rollNumber || '42';
  const schoolNameDisplay = profile?.schoolName || 'AP SCERT Board School';
  const gradeDisplay = profile?.grade || '10';
  const sectionDisplay = profile?.section || 'A';
  const mediumDisplay = profile?.medium || 'English Medium';

  return (
    <div className={styles.container}>
      {/* ================= HERO BANNER (Matches Dashboard) ================= */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomePillRow}>
            <div className={styles.welcomePill}>
              <User size={15} />
              <span>Student Profile</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <School size={14} />
              <span>{schoolNameDisplay}</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <span>Class {gradeDisplay} • Roll #{rollNumberDisplay}</span>
            </div>
          </div>

          <div className={styles.bannerHeaderFlex}>
            <div className={styles.avatarWrapper}>
              <img
                src={profile?.avatarUrl || '/assets/avatar.png'}
                alt={fullName}
                className={styles.avatarImg}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className={styles.cameraBadge}>
                <Camera size={14} />
              </div>
            </div>

            <div className={styles.profileHeroText}>
              <h1 className={styles.welcomeTitle}>{fullName}</h1>
              <p className={styles.welcomeSubtitle}>
                Class {gradeDisplay} · Section {sectionDisplay} · {mediumDisplay} • Enrolled under AP SCERT State Board Curriculum
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMessage(null);
                setIsEditModalOpen(true);
              }}
              className={styles.primaryBtn}
            >
              <Edit2 size={15} />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= DETAILS GRID (Side by Side) ================= */}
      <div className={styles.detailsGrid}>
        {/* Card 1: Student Personal Details */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle}>Student Details</h2>
              <p className={styles.sectionSubtitle}>Personal identity & roll number</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoGrid}>
              <div className={styles.infoTile}>
                <span className={styles.tileLabel}>
                  <User size={13} />
                  <span>Student Name</span>
                </span>
                <span className={styles.tileValue}>{fullName}</span>
              </div>

              <div className={styles.infoTile}>
                <span className={styles.tileLabel}>
                  <Calendar size={13} />
                  <span>Date of Birth</span>
                </span>
                <span className={styles.tileValue}>
                  {profile?.dateOfBirth || profile?.dob || '14 August 2010'}
                </span>
              </div>

              <div className={styles.infoTile}>
                <span className={styles.tileLabel}>
                  <User size={13} />
                  <span>Gender</span>
                </span>
                <span className={styles.tileValue}>{profile?.gender || 'Male'}</span>
              </div>

              <div className={styles.infoTile}>
                <span className={styles.tileLabel}>
                  <GraduationCap size={13} />
                  <span>Roll Number</span>
                </span>
                <span className={styles.tileValue}>#{rollNumberDisplay}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Academic Information */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle}>Academic Information</h2>
              <p className={styles.sectionSubtitle}>School & curriculum enrollment</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoGrid}>
              <div className={`${styles.infoTile} ${styles.infoTileFull}`}>
                <span className={styles.tileLabel}>
                  <School size={13} />
                  <span>School Name</span>
                </span>
                <span className={styles.tileValue}>{schoolNameDisplay}</span>
              </div>

              <div className={styles.infoTile}>
                <span className={styles.tileLabel}>
                  <Layers size={13} />
                  <span>Enrolled Class</span>
                </span>
                <span className={styles.tileValue}>Class {gradeDisplay}</span>
              </div>

              <div className={styles.infoTile}>
                <span className={styles.tileLabel}>
                  <GraduationCap size={13} />
                  <span>Section</span>
                </span>
                <span className={styles.tileValue}>Section {sectionDisplay}</span>
              </div>

              <div className={styles.infoTile}>
                <span className={styles.tileLabel}>
                  <School size={13} />
                  <span>Medium</span>
                </span>
                <span className={styles.tileValue}>{mediumDisplay}</span>
              </div>

              <div className={styles.infoTile}>
                <span className={styles.tileLabel}>
                  <MapPin size={13} />
                  <span>District</span>
                </span>
                <span className={styles.tileValue}>
                  {profile?.district || 'Guntur'}{profile?.location ? `, ${profile.location}` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Parent & Guardian Details */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle}>Parent & Guardian</h2>
              <p className={styles.sectionSubtitle}>Family contact information</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoGrid}>
              <div className={styles.infoTile}>
                <span className={styles.tileLabel}>
                  <User size={13} />
                  <span>Father's Name</span>
                </span>
                <span className={styles.tileValue}>{profile?.fatherName || 'Ramesh Patel'}</span>
              </div>

              <div className={styles.infoTile}>
                <span className={styles.tileLabel}>
                  <User size={13} />
                  <span>Mother's Name</span>
                </span>
                <span className={styles.tileValue}>{profile?.motherName || 'Lakshmi Patel'}</span>
              </div>

              <div className={`${styles.infoTile} ${styles.infoTileFull}`}>
                <span className={styles.tileLabel}>
                  <Phone size={13} />
                  <span>Parent / Guardian Phone</span>
                </span>
                <span className={styles.tileValue}>{profile?.parentPhone || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Daily Study Goal & Preferences */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle}>Study Habit & Goal</h2>
              <p className={styles.sectionSubtitle}>Daily reading target time</p>
            </div>
          </div>

          <div className={styles.goalCard}>
            <div className={styles.goalLabelRow}>
              <Clock size={16} color="var(--primary)" />
              <span>Target minutes per day</span>
            </div>
            <div className={styles.goalGrid}>
              {[15, 30, 45, 60].map((mins) => {
                const active = selectedGoal === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleStudyGoalChange(mins)}
                    disabled={savingGoal}
                    className={`${styles.goalBtn} ${active ? styles.goalBtnActive : ''}`}
                  >
                    <span>{mins} mins</span>
                    {active && <Check size={14} />}
                  </button>
                );
              })}
            </div>
            <div className={styles.goalSummaryBox}>
              <span className={styles.goalSummaryText}>
                Aiming for <strong>{selectedGoal} minutes</strong> of active textbook reading each day.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Action */}
      <div style={{ paddingTop: '8px' }}>
        <button
          type="button"
          onClick={handleLogout}
          className={styles.signOutBtn}
        >
          <LogOut size={16} />
          <span>Sign Out of Account</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* COMPLETE ONBOARDING & EDIT DETAILS MULTI-STEP MODAL   */}
      {/* ==================================================== */}
      {isEditModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalStepIndicator}>
                  STEP {step} OF 4
                </span>
                <h3 className={styles.modalTitle}>
                  {step === 1 && 'Student Details'}
                  {step === 2 && 'Location & School'}
                  {step === 3 && 'Class & Medium'}
                  {step === 4 && 'Guardian & Contact'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className={styles.progressBarContainer}>
              <div
                className={styles.modalProgressBar}
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className={styles.errorBanner}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Multi-step Form */}
            <form onSubmit={handleSaveProfile} className={styles.modalForm}>
              {/* STEP 1: Student Details */}
              {step === 1 && (
                <div className={styles.inputGroup}>
                  <div className={styles.twoColGrid}>
                    <div>
                      <label className={styles.formLabel}>First Name *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Arjun"
                        required
                        className={styles.textInput}
                      />
                    </div>
                    <div>
                      <label className={styles.formLabel}>Last Name *</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Patel"
                        required
                        className={styles.textInput}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={styles.formLabel}>Date of Birth *</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      className={styles.textInput}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Gender *</label>
                    <div className={styles.radioRow}>
                      {['Male', 'Female', 'Other'].map((g) => {
                        const isSelected = gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`${styles.radioOption} ${isSelected ? styles.radioOptionActive : ''}`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Location & School */}
              {step === 2 && (
                <div className={styles.inputGroup}>
                  <div>
                    <label className={styles.formLabel}>Andhra Pradesh District *</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className={styles.textInput}
                    >
                      {AP_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={styles.formLabel}>Mandal / Town / Village *</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Tenali, Guntur Urban"
                      required
                      className={styles.textInput}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Select School Name *</label>
                    <select
                      value={schoolName}
                      onChange={(e) => {
                        setSchoolName(e.target.value);
                        if (e.target.value !== 'Other') setCustomSchool('');
                      }}
                      className={styles.textInput}
                    >
                      {POPULAR_SCHOOLS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      <option value="Other">Other (Enter Below)</option>
                    </select>
                  </div>

                  {(schoolName === 'Other' || !POPULAR_SCHOOLS.includes(schoolName)) && (
                    <div>
                      <label className={styles.formLabel}>Enter Custom School Name *</label>
                      <input
                        type="text"
                        value={customSchool || (POPULAR_SCHOOLS.includes(schoolName) ? '' : schoolName)}
                        onChange={(e) => setCustomSchool(e.target.value)}
                        placeholder="Enter full school name"
                        className={styles.textInput}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Class, Medium & Roll Number */}
              {step === 3 && (
                <div className={styles.inputGroup}>
                  <div>
                    <label className={styles.formLabel}>Enrolled Class *</label>
                    <div className={styles.classGrid}>
                      {[6, 7, 8, 9, 10].map((g) => {
                        const isSelected = grade === String(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGrade(String(g))}
                            className={`${styles.classOption} ${isSelected ? styles.classOptionActive : ''}`}
                          >
                            Class {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.twoColGrid}>
                    <div>
                      <label className={styles.formLabel}>Section *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {['A', 'B', 'C', 'D'].map((s) => {
                          const isSelected = section === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSection(s)}
                              className={`${styles.classOption} ${isSelected ? styles.classOptionActive : ''}`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className={styles.formLabel}>Medium *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                        {['English', 'Telugu'].map((m) => {
                          const isSelected = medium === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setMedium(m)}
                              className={`${styles.classOption} ${isSelected ? styles.classOptionActive : ''}`}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={styles.formLabel}>Roll Number / Student ID *</label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 42"
                      required
                      className={styles.textInput}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Parent & Guardian Details */}
              {step === 4 && (
                <div className={styles.inputGroup}>
                  <div>
                    <label className={styles.formLabel}>Father's Name</label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Father's Full Name"
                      className={styles.textInput}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Mother's Name</label>
                    <input
                      type="text"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="Mother's Full Name"
                      className={styles.textInput}
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Parent / Guardian Phone (10 digits) *</label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                      className={styles.textInput}
                    />
                  </div>
                </div>
              )}

              {/* Modal Step Navigation Controls */}
              <div className={styles.modalControls}>
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className={styles.modalPrevBtn}
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className={styles.modalPrevBtn}
                  >
                    Cancel
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className={styles.modalNextBtn}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className={styles.modalNextBtn}
                    style={{ opacity: savingProfile ? 0.6 : 1 }}
                  >
                    {saveSuccess ? (
                      <>
                        <Check size={16} />
                        <span>Saved Successfully!</span>
                      </>
                    ) : savingProfile ? (
                      <span>Saving...</span>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

