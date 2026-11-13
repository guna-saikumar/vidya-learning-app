import React, { useState } from 'react';
import { Sun, Moon, Type, Volume2, ShieldCheck, Check, Sliders, Sparkles } from 'lucide-react';
import styles from './SettingsPage.css';

export const SettingsPage = () => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(
      '@vidya_web_settings',
      JSON.stringify({ theme, fontSize, soundEnabled })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.container}>
      {/* ================= HERO BANNER (Matches Dashboard) ================= */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomePillRow}>
            <div className={styles.welcomePill}>
              <Sliders size={15} />
              <span>Portal Preferences</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <Sparkles size={14} />
              <span>Study Comfort</span>
            </div>
          </div>

          <h1 className={styles.welcomeTitle}>
            Reading & App <span className={styles.welcomeTitlePrimary}>Preferences</span>
          </h1>

          <p className={styles.welcomeSubtitle}>
            Customize your textbook reader interface, adjust typography sizing for comfortable long-session
            reading, and manage study chimes and accessibility preferences.
          </p>
        </div>
      </section>

      {/* ================= SETTINGS CARD ================= */}
      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2 className={styles.sectionTitle}>Reading & Appearance</h2>
            <p className={styles.sectionSubtitle}>
              Changes apply instantly across your textbook chapters and reader views
            </p>
          </div>
        </div>

        {/* Theme */}
        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>Visual Theme</label>
          <div className={styles.twoColGrid}>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`${styles.toggleBtn} ${theme === 'light' ? styles.toggleBtnActive : ''}`}
            >
              <Sun size={17} />
              <span>Warm Light (Default)</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`${styles.toggleBtn} ${theme === 'dark' ? styles.toggleBtnActive : ''}`}
            >
              <Moon size={17} />
              <span>Dark Study Mode</span>
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>Textbook Reading Font Scale</label>
          <div className={styles.threeColGrid}>
            {[
              { id: 'small', label: 'Compact (14px)' },
              { id: 'medium', label: 'Standard (16px)' },
              { id: 'large', label: 'Comfort (18px)' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFontSize(item.id)}
                className={`${styles.toggleBtn} ${fontSize === item.id ? styles.toggleBtnActive : ''}`}
              >
                <Type size={15} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sound Toggle */}
        <div className={styles.soundRow}>
          <div className={styles.soundLeft}>
            <div className={styles.soundIconBox}>
              <Volume2 size={20} />
            </div>
            <div>
              <div className={styles.soundTitle}>Completion Audio Feedback</div>
              <div className={styles.soundSub}>
                Play subtle motivational audio chimes when finishing chapter sections
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className={styles.checkbox}
          />
        </div>

        <button onClick={handleSave} className={styles.primaryBtn} style={{ alignSelf: 'flex-start' }}>
          {saved ? (
            <>
              <Check size={16} />
              <span>Preferences Saved!</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </div>

      {/* Compliance / Info Card */}
      <div className={styles.complianceCard}>
        <div className={styles.complianceHeader}>
          <div className={styles.complianceIconCircle}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className={styles.complianceTitle}>Official State Board Curriculum Compliance</h3>
            <p className={styles.complianceText}>
              Vidya Learning complies with Andhra Pradesh SCERT curriculum guidelines for Classes 6 through 10.
              All digital textbook materials are licensed for state educational usage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
