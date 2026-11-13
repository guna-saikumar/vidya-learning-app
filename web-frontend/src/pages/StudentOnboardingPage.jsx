import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import styles from './StudentOnboardingPage.css';

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

export const StudentOnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, save } = useProfile();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2010-08-14');
  const [gender, setGender] = useState('Male');
  const [district, setDistrict] = useState('Guntur');
  const [location, setLocation] = useState('Guntur Urban');
  const [schoolName, setSchoolName] = useState(POPULAR_SCHOOLS[0]);
  const [customSchool, setCustomSchool] = useState('');
  const [grade, setGrade] = useState('10');
  const [section, setSection] = useState('A');
  const [medium, setMedium] = useState('English');
  const [rollNumber, setRollNumber] = useState('42');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.lastName) setLastName(profile.lastName);
      if (profile.dateOfBirth) setDateOfBirth(profile.dateOfBirth);
      if (profile.gender) setGender(profile.gender);
      if (profile.district) setDistrict(profile.district);
      if (profile.location) setLocation(profile.location);
      if (profile.schoolName) setSchoolName(profile.schoolName);
      if (profile.grade) setGrade(profile.grade);
      if (profile.section) setSection(profile.section);
      if (profile.rollNumber) setRollNumber(profile.rollNumber);
      if (profile.fatherName) setFatherName(profile.fatherName);
      if (profile.motherName) setMotherName(profile.motherName);
      if (profile.parentPhone) setParentPhone(profile.parentPhone);
    }
  }, [profile]);

  const validateStep = (s) => {
    setErrorMessage(null);
    if (s === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMessage('Student first name and last name are required.');
        return false;
      }
      if (!dateOfBirth.trim()) {
        setErrorMessage('Date of birth is required.');
        return false;
      }
    } else if (s === 2) {
      if (!district.trim() || !location.trim()) {
        setErrorMessage('District and location/mandal are required.');
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

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    setErrorMessage(null);

    const activeClassId = `class-${grade}`;
    const effectiveSchool = customSchool.trim() || schoolName.trim();

    try {
      await save({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        gender,
        district,
        location: location.trim(),
        villageCity: location.trim(),
        schoolName: effectiveSchool,
        grade,
        classId: activeClassId,
        section: section.trim(),
        medium: `${medium} Medium`,
        rollNumber: rollNumber.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        parentPhone: parentPhone.trim(),
      });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err?.message || 'Could not complete onboarding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.logoBox}>
            <img
              src="/assets/logo.png"
              alt="Vidya"
              className={styles.logoImg}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <span className={styles.stepIndicator}>
              STUDENT ONBOARDING · STEP {step} OF 4
            </span>
            <h1 className={styles.stepTitle}>
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Location & School Selection'}
              {step === 3 && 'Academic Class & Medium'}
              {step === 4 && 'Guardian & Contact Details'}
            </h1>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* STEP 1 */}
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

          {/* STEP 2 */}
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
                  <option value="Other">Other (Enter Custom School)</option>
                </select>
              </div>

              {(schoolName === 'Other' || !POPULAR_SCHOOLS.includes(schoolName)) && (
                <div>
                  <label className={styles.formLabel}>Custom School Name *</label>
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

          {/* STEP 3 */}
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

          {/* STEP 4 */}
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

          {/* Navigation Controls */}
          <div className={styles.controlsRow}>
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className={styles.backBtn}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className={styles.nextBtn}
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className={styles.nextBtn}
                style={{ opacity: submitting ? 0.6 : 1 }}
              >
                <span>{submitting ? 'Completing Setup...' : 'Complete Registration'}</span>
                <Check size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

