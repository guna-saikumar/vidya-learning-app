import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { getClassById, getSubjectsByClass } from '../services/curriculumService';
import {
  getStoredProgress,
  getStoredBookmarks,
  getStoredNotifications,
} from '../services/progressService';
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Play,
  ChevronRight,
  GraduationCap,
  Clock,
  Bell,
  HelpCircle,
  ExternalLink,
  School,
  Tag,
} from 'lucide-react';
import styles from './DashboardPage.css';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const activeClassId = profile?.activeClassId || 'class-10';
  const schoolClass = useMemo(() => getClassById(activeClassId), [activeClassId]);
  const subjects = useMemo(() => getSubjectsByClass(activeClassId), [activeClassId]);
  const progressMap = useMemo(() => getStoredProgress(), []);
  const bookmarks = useMemo(() => getStoredBookmarks(), []);
  const notifications = useMemo(() => getStoredNotifications(), []);

  // Compute enrolled curriculum stats
  const { totalSubjects, totalChapters, completedChapters, progressPercent } = useMemo(() => {
    let total = 0;
    let completed = 0;

    for (const sub of subjects) {
      total += sub.chapters.length;
      for (const ch of sub.chapters) {
        if (progressMap[ch.id]?.completed) {
          completed++;
        }
      }
    }

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalSubjects: subjects.length,
      totalChapters: total,
      completedChapters: completed,
      progressPercent: percent,
    };
  }, [subjects, progressMap]);

  // Find recent in-progress chapter
  const continueItem = useMemo(() => {
    for (const sub of subjects) {
      for (const ch of sub.chapters) {
        const p = progressMap[ch.id];
        if (p && !p.completed && (p.progressPercent > 0 || (p.completedSections && p.completedSections.length > 0))) {
          return {
            subject: sub,
            chapter: ch,
            progress: p.progressPercent || 0,
            completedSections: p.completedSections?.length || 0,
            totalSections: ch.sections.length,
          };
        }
      }
    }

    // Default to first chapter
    if (subjects[0]?.chapters[0]) {
      return {
        subject: subjects[0],
        chapter: subjects[0].chapters[0],
        progress: 0,
        completedSections: 0,
        totalSections: subjects[0].chapters[0].sections.length,
      };
    }

    return null;
  }, [subjects, progressMap]);

  const displayName = profile?.firstName || profile?.fullName || user?.name || 'Student';
  const grade = profile?.grade || '10';
  const section = profile?.section || 'A';
  const medium = profile?.medium || 'ENGLISH';
  const studyGoal = profile?.studyGoalMinutes || 45;
  const schoolName = profile?.schoolName || 'AP State Board High School';

  return (
    <div className={styles.container}>
      {/* ================= WELCOME HERO BANNER (No 5-day streak) ================= */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomePillRow}>
            <div className={styles.welcomePill}>
              <GraduationCap size={15} />
              <span>
                {schoolClass?.title || `Class ${grade}`} • Section {section}
              </span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <School size={14} />
              <span>{schoolName}</span>
            </div>
          </div>

          <h1 className={styles.welcomeTitle}>
            Welcome back, <span className={styles.welcomeTitlePrimary}>{displayName.split(' ')[0]}!</span>
          </h1>

          <p className={styles.welcomeSubtitle}>
            Your central academic hub. Review your syllabus progress, access textbook chapters, check
            saved formulas, and stay updated with board circulars.
          </p>

          <div className={styles.welcomeActions}>
            {continueItem && (
              <button
                onClick={() =>
                  navigate(`/courses/${activeClassId}/${continueItem.subject.id}/${continueItem.chapter.id}`)
                }
                className={styles.primaryBtn}
              >
                <Play size={15} fill="currentColor" />
                <span>Resume Reading</span>
              </button>
            )}

            <button onClick={() => navigate('/courses')} className={styles.secondaryBtn}>
              <BookOpen size={16} />
              <span>Browse All Subjects</span>
            </button>
          </div>
        </div>

        {/* Right Readiness Meter (Streak pod removed) */}
        <div className={styles.heroProgressPod}>
          <div
            className={styles.heroProgressCircle}
            style={{ '--progress-val': Math.max(progressPercent, 6) }}
          >
            <div className={styles.heroProgressInner}>
              {progressPercent}%
            </div>
          </div>
          <div className={styles.heroProgressDetails}>
            <div className={styles.heroProgressTitle}>Syllabus Readiness</div>
            <div className={styles.heroProgressSub}>
              {completedChapters} of {totalChapters} chapters done
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4 PASTEL STAT CARDS ================= */}
      <section className={styles.statCardsGrid}>
        {/* Card 1: Syllabus Progress */}
        <Link to="/courses" className={`${styles.statCard} ${styles.statCardPeach}`}>
          <div className={`${styles.statIconBox} ${styles.statIconPeach}`}>
            <TrendingUp size={22} strokeWidth={2.2} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{progressPercent}%</div>
            <div className={styles.statTitle}>Curriculum Progress</div>
            <div className={styles.statDescription}>Across enrolled subjects</div>
          </div>
        </Link>

        {/* Card 2: Chapters Completed */}
        <Link to="/courses" className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={`${styles.statIconBox} ${styles.statIconGreen}`}>
            <CheckCircle2 size={22} strokeWidth={2.2} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>
              {completedChapters} <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>/ {totalChapters}</span>
            </div>
            <div className={styles.statTitle}>Chapters Completed</div>
            <div className={styles.statDescription}>Self-assessments cleared</div>
          </div>
        </Link>

        {/* Card 3: Saved Bookmarks */}
        <Link to="/bookmarks" className={`${styles.statCard} ${styles.statCardAmber}`}>
          <div className={`${styles.statIconBox} ${styles.statIconAmber}`}>
            <Bookmark size={22} strokeWidth={2.2} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{bookmarks.length}</div>
            <div className={styles.statTitle}>Saved Formulas</div>
            <div className={styles.statDescription}>Theorems, notes & formulas</div>
          </div>
        </Link>

        {/* Card 4: Daily Goal & Medium */}
        <Link to="/settings" className={`${styles.statCard} ${styles.statCardPurple}`}>
          <div className={`${styles.statIconBox} ${styles.statIconPurple}`}>
            <Clock size={22} strokeWidth={2.2} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{studyGoal}m</div>
            <div className={styles.statTitle}>Daily Study Goal</div>
            <div className={styles.statDescription}>{medium} Medium</div>
          </div>
        </Link>
      </section>

      {/* ================= TWO COLUMN COMPREHENSIVE WORKSPACE ================= */}
      <div className={styles.twoColLayout}>
        {/* Left Column: Learning Flows & Textbooks */}
        <div className={styles.leftCol}>
          {/* Continue Reading Spotlight */}
          {continueItem && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <h2 className={styles.sectionTitle}>Continue Learning</h2>
                  <p className={styles.sectionSubtitle}>Jump back into your recent textbook reading</p>
                </div>
                <Link
                  to={`/courses/${activeClassId}/${continueItem.subject.id}`}
                  className={styles.viewAllLink}
                >
                  <span>View Syllabus</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className={styles.continueCard}>
                <div className={styles.continueLeft}>
                  <div className={styles.continueIconCircle}>
                    <BookOpen size={24} />
                  </div>
                  <div className={styles.continueDetails}>
                    <span className={styles.continueSubjectTag}>{continueItem.subject.name}</span>
                    <h3 className={styles.continueChapterName}>
                      {continueItem.chapter.title}
                    </h3>
                    <span className={styles.continueProgressMeta}>
                      {continueItem.completedSections} of {continueItem.totalSections} sections read ({continueItem.progress}%)
                    </span>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${Math.max(continueItem.progress, 6)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/courses/${activeClassId}/${continueItem.subject.id}/${continueItem.chapter.id}`)
                  }
                  className={styles.primaryBtn}
                >
                  <span>Resume</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Subjects Showcase Grid (From Courses Page) */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <h2 className={styles.sectionTitle}>Class {grade} Textbooks</h2>
                <p className={styles.sectionSubtitle}>Official state board curriculum subjects</p>
              </div>
              <Link to="/courses" className={styles.viewAllLink}>
                <span>All Subjects</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className={styles.subjectsGrid}>
              {subjects.map((sub) => {
                let completedCount = 0;
                for (const ch of sub.chapters) {
                  if (progressMap[ch.id]?.completed) completedCount++;
                }
                const pct = sub.chapters.length > 0 ? Math.round((completedCount / sub.chapters.length) * 100) : 0;

                return (
                  <Link
                    key={sub.id}
                    to={`/courses/${activeClassId}/${sub.id}`}
                    className={styles.subjectCard}
                  >
                    <div className={styles.subjectHeader}>
                      <div className={styles.subjectIconCircle}>
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h3 className={styles.subjectName}>{sub.name}</h3>
                        <p className={styles.subjectCode}>{sub.code} • {sub.chapters.length} Chapters</p>
                      </div>
                    </div>

                    <div style={{ marginTop: 2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 5 }}>
                        <span>{completedCount} / {sub.chapters.length} done</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, width: '100%', background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 9999 }} />
                      </div>
                    </div>

                    <div className={styles.subjectFooter}>
                      <span>Open Book</span>
                      <ChevronRight size={15} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Bookmarks, Notifications & Support */}
        <div className={styles.rightCol}>
          {/* 1. Saved Bookmarks Vault (From Bookmarks Page) */}
          <div className={styles.bookmarksMiniCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <h3 className={styles.sectionTitle} style={{ fontSize: 17 }}>
                  Saved Formulas & Notes
                </h3>
                <p className={styles.sectionSubtitle}>{bookmarks.length} items saved for revision</p>
              </div>
              <Link to="/bookmarks" className={styles.viewAllLink}>
                <span>Vault</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {bookmarks.length > 0 ? (
              <div className={styles.bookmarkList}>
                {bookmarks.slice(0, 3).map((bm) => (
                  <Link
                    key={bm.id}
                    to={`/courses/${activeClassId}/${bm.chapterId}`}
                    className={styles.bookmarkItem}
                  >
                    <div className={styles.bookmarkLeft}>
                      <div className={styles.bookmarkIconBox}>
                        <Bookmark size={15} />
                      </div>
                      <div>
                        <h4 className={styles.bookmarkTitle}>{bm.title}</h4>
                        <span className={styles.bookmarkSub}>{bm.subtitle || 'Chapter Formula'}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 12px', color: 'var(--text-muted)', fontSize: 13 }}>
                No bookmarks saved yet. Tap the bookmark icon while reading chapters to save key formulas!
              </div>
            )}
          </div>

          {/* 3. Board Circulars & Announcements (From Notifications Page) */}
          <div className={styles.notifsMiniCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <h3 className={styles.sectionTitle} style={{ fontSize: 17 }}>
                  Board Circulars & Updates
                </h3>
                <p className={styles.sectionSubtitle}>Official SCERT announcements</p>
              </div>
              <Link to="/notifications" className={styles.viewAllLink}>
                <span>Notices</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className={styles.notifList}>
              {notifications.slice(0, 2).map((notif) => (
                <div key={notif.id} className={styles.notifItem}>
                  <div className={styles.notifIconBox}>
                    <Bell size={16} />
                  </div>
                  <div className={styles.notifContent}>
                    <h4 className={styles.notifTitle}>{notif.title}</h4>
                    <p className={styles.notifMessage}>{notif.message || notif.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Support Desk (From Contact Page) */}
          <div className={styles.supportQuickCard}>
            <div className={styles.supportLeft}>
              <div className={styles.supportIconCircle}>
                <HelpCircle size={22} />
              </div>
              <div>
                <h4 className={styles.supportTitle}>Need Academic Support?</h4>
                <p className={styles.supportSub}>Connect with your school teacher or helpdesk</p>
              </div>
            </div>
            <Link to="/contact" className={styles.primaryBtn} style={{ padding: '8px 16px', fontSize: 13 }}>
              <span>Helpdesk</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
