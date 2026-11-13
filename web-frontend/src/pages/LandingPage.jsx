import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Bookmark,
  TrendingUp,
  Bell,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Layers,
  Globe,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Check,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { CURRICULUM_DATA, BOARD_INFO } from '../data/curriculum';
import styles from './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState(10);

  const selectedClass =
    CURRICULUM_DATA.find((c) => c.grade === selectedGrade) || CURRICULUM_DATA[0];

  const handleGetStarted = () => {
    navigate('/login');
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.pageWrapper} id="home">
      {/* ================= NAVBAR ================= */}
      <header className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.brandLogo}>
            <div className={styles.logoIconBadge}>
              <img
                src="/assets/logo.png"
                alt="Vidya Learning"
                className={styles.brandLogoImg}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <span className={styles.brandName}>
              Vidya <span className={styles.brandHighlight}>Learning</span>
            </span>
          </Link>

          <nav>
            <ul className={styles.navLinks}>
              <li>
                <a
                  href="#home"
                  onClick={(e) => scrollToSection(e, 'home')}
                  className={`${styles.navLink} ${styles.navLinkActive}`}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#why-vidya"
                  onClick={(e) => scrollToSection(e, 'why-vidya')}
                  className={styles.navLink}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#curriculum"
                  onClick={(e) => scrollToSection(e, 'curriculum')}
                  className={styles.navLink}
                >
                  Curriculum
                </a>
              </li>
              <li>
                <a
                  href="#schools"
                  onClick={(e) => scrollToSection(e, 'schools')}
                  className={styles.navLink}
                >
                  Schools
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => scrollToSection(e, 'features')}
                  className={styles.navLink}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, 'contact')}
                  className={styles.navLink}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <button onClick={handleGetStarted} className={styles.navCta}>
            <span>Get Started</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackgroundBlobs}>
          <div className={styles.blob1} />
          <div className={styles.blob2} />
        </div>

        <div className={styles.heroContainer}>
          {/* Left Text Column */}
          <div className={styles.heroContent}>
            <div className={styles.pillBadge}>
              <GraduationCap size={15} />
              <span>A Learning Platform for Classes 6 – 10</span>
            </div>

            <h1 className={styles.heroTitle}>
              Learn, Read and <br />
              Grow with <br />
              <span className={styles.heroTitlePrimary}>Vidya Learning</span>
            </h1>

            <p className={styles.heroSubtitle}>
              A digital learning platform for school students to access textbooks,
              build reading habits, track progress, and stay updated with important
              academic notifications.
            </p>

            <div className={styles.heroActions}>
              <button onClick={handleGetStarted} className={styles.primaryBtn}>
                <span>Get Started</span>
                <ArrowRight size={18} />
              </button>

              <a
                href="#why-vidya"
                onClick={(e) => scrollToSection(e, 'why-vidya')}
                className={styles.secondaryBtn}
              >
                <span>Learn More</span>
              </a>
            </div>
          </div>

          {/* Right Visual Graphic: Background Circle Window with Student, Attached Popups & 3D Books */}
          <div className={styles.heroVisualWrapper}>
            <div className={styles.circleStage}>
              {/* Background Circle with Student cleanly framed inside */}
              <div className={styles.circleWindow}>
                <div className={styles.stageCircleBg} />
                <img
                  src="/assets/hero-student.png"
                  alt="Student learning on Vidya platform"
                  className={styles.heroStudentImg}
                  loading="eager"
                />
              </div>

              {/* Popup 1: Read Textbooks (Upper-Left) */}
              <div className={`${styles.attachedPopup} ${styles.popupTopLeft}`}>
                <div className={`${styles.badgeIcon} ${styles.badgeIconPeach}`}>
                  <BookOpen size={18} strokeWidth={2.3} />
                </div>
                <span className={styles.popupTitle}>Read Textbooks</span>
              </div>

              {/* Popup 2: Save Bookmarks (Upper-Right) */}
              <div className={`${styles.attachedPopup} ${styles.popupTopRight}`}>
                <div className={`${styles.badgeIcon} ${styles.badgeIconAmber}`}>
                  <Bookmark size={18} strokeWidth={2.3} />
                </div>
                <span className={styles.popupTitle}>Save Bookmarks</span>
              </div>

              {/* Popup 3: Track Progress (Lower-Left above 3D books) */}
              <div className={`${styles.attachedPopup} ${styles.popupBottomLeft}`}>
                <div className={`${styles.badgeIcon} ${styles.badgeIconGreen}`}>
                  <TrendingUp size={18} strokeWidth={2.3} />
                </div>
                <span className={styles.popupTitle}>Track Progress</span>
              </div>

              {/* Popup 4: Get Notifications (Lower-Right) */}
              <div className={`${styles.attachedPopup} ${styles.popupBottomRight}`}>
                <div className={`${styles.badgeIcon} ${styles.badgeIconPurple}`}>
                  <Bell size={18} strokeWidth={2.3} />
                </div>
                <span className={styles.popupTitle}>Get Notifications</span>
              </div>

              {/* 3D Stack of Hardcover Books on Lower Left */}
              <div className={styles.books3dWrapper}>
                <img
                  src="/assets/books-stack.png"
                  alt="Textbooks stack"
                  className={styles.books3dImg}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WAVE DIVIDER ================= */}
      <div className={styles.waveDivider}>
        <svg
          className={styles.waveSvg}
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,28 C280,55 520,10 800,32 C1080,54 1260,15 1440,28 L1440,60 L0,60 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* ================= WHY CHOOSE VIDYA LEARNING ================= */}
      <section className={styles.sectionBlock} id="why-vidya">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Why Choose <span className={styles.sectionTitleHighlight}>Vidya Learning?</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            A simple and focused learning experience designed specifically for school students.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className={styles.featureCardsGrid}>
          {/* Card 1: Digital Textbooks */}
          <div className={`${styles.featureCard} ${styles.featureCardPeach}`}>
            <div className={`${styles.featureCardIconWrapper} ${styles.badgeIconPeach}`}>
              <BookOpen size={24} strokeWidth={2.2} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Digital Textbooks</h3>
              <p className={styles.featureDescription}>
                Access your complete class-wise textbooks anytime, anywhere with clear typography.
              </p>
            </div>
          </div>

          {/* Card 2: Reading Progress */}
          <div className={`${styles.featureCard} ${styles.featureCardGreen}`}>
            <div className={`${styles.featureCardIconWrapper} ${styles.badgeIconGreen}`}>
              <TrendingUp size={24} strokeWidth={2.2} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Reading Progress</h3>
              <p className={styles.featureDescription}>
                Track your syllabus completion percentage, daily goals, and stay consistent.
              </p>
            </div>
          </div>

          {/* Card 3: Bookmarks */}
          <div className={`${styles.featureCard} ${styles.featureCardAmber}`}>
            <div className={`${styles.featureCardIconWrapper} ${styles.badgeIconAmber}`}>
              <Bookmark size={24} strokeWidth={2.2} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Bookmarks</h3>
              <p className={styles.featureDescription}>
                Save key formulas, theorems, and definitions to review right before exams.
              </p>
            </div>
          </div>

          {/* Card 4: Academic Updates */}
          <div className={`${styles.featureCard} ${styles.featureCardPurple}`}>
            <div className={`${styles.featureCardIconWrapper} ${styles.badgeIconPurple}`}>
              <Bell size={24} strokeWidth={2.2} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Academic Updates</h3>
              <p className={styles.featureDescription}>
                Receive official board announcements, timetable updates, and academic notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EXPLORE CURRICULUM ================= */}
      <section className={styles.curriculumSection} id="curriculum">
        <div className={styles.curriculumContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Explore <span className={styles.sectionTitleHighlight}>Curriculum</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Access state board textbooks and curriculum learning material for Classes 6 to 10.
            </p>
          </div>

          {/* 5 Class Cards/Tabs */}
          <div className={styles.classTabsGrid}>
            {[6, 7, 8, 9, 10].map((grade) => {
              const isActive = selectedGrade === grade;
              const cardClassStyle = styles[`classTabCard${grade}`];
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`${styles.classTabCard} ${cardClassStyle} ${
                    isActive ? styles.classTabActive : ''
                  }`}
                >
                  <div className={styles.classIconPill}>
                    <BookOpen size={20} strokeWidth={2.2} />
                  </div>
                  <span className={styles.classTabTitle}>Class {grade}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Subject Showcase for Active Class */}
          <div className={styles.subjectShowcase}>
            <div className={styles.subjectShowcaseHeader}>
              <div>
                <h3 className={styles.showcaseHeading}>
                  Class {selectedGrade} Syllabus & Textbooks
                </h3>
                <p className={styles.subjectMeta}>
                  Aligned with {BOARD_INFO.authority} ({BOARD_INFO.academicYear})
                </p>
              </div>

              <div className={styles.showcaseBadge}>
                {selectedClass?.subjects?.length || 0} Subjects Available
              </div>
            </div>

            <div className={styles.subjectsGrid}>
              {selectedClass?.subjects?.map((sub) => (
                <div
                  key={sub.id}
                  onClick={handleGetStarted}
                  className={styles.subjectCard}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.subjectCardTop}>
                    <div className={styles.subjectIconCircle}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className={styles.subjectName}>{sub.name}</h4>
                      <p className={styles.subjectMeta}>{sub.code}</p>
                    </div>
                  </div>

                  <p className={styles.featureDescription}>
                    {sub.chapters?.length || 0} Complete Chapters • Includes quizzes and formula vaults
                  </p>

                  <div className={styles.subjectFooter}>
                    <span>Read Lessons</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT & SCERT BOARD SECTION ================= */}
      <section className={styles.sectionBlock} id="about">
        <div className={styles.aboutGrid}>
          <div className={styles.aboutHighlights}>
            <div className={styles.pillBadge}>
              <ShieldCheck size={15} />
              <span>Academic Integrity & Quality</span>
            </div>

            <h2 className={styles.sectionTitle}>
              Designed for State Board Excellence
            </h2>

            <p className={styles.sectionSubtitle}>
              Vidya Learning brings standard textbook curriculum to every student's
              hands, ensuring consistent academic progress across urban and rural schools.
            </p>

            <div className={styles.highlightItem}>
              <div className={styles.highlightIcon}>
                <Check size={20} strokeWidth={2.5} />
              </div>
              <div className={styles.highlightText}>
                <h4>100% Official SCERT AP Textbooks</h4>
                <p>
                  Every chapter and section mirrors the prescribed curriculum of Andhra
                  Pradesh State Council of Educational Research and Training.
                </p>
              </div>
            </div>

            <div className={styles.highlightItem}>
              <div className={styles.highlightIcon}>
                <Globe size={20} strokeWidth={2.5} />
              </div>
              <div className={styles.highlightText}>
                <h4>Multi-Lingual Mediums</h4>
                <p>
                  Supports English Medium and Telugu Medium students with bilingual vocabulary
                  and accessible explanations.
                </p>
              </div>
            </div>

            <div className={styles.highlightItem}>
              <div className={styles.highlightIcon}>
                <Award size={20} strokeWidth={2.5} />
              </div>
              <div className={styles.highlightText}>
                <h4>Zero Ads & Distraction-Free</h4>
                <p>
                  A safe, dedicated reading environment without advertisements, trackers, or
                  unnecessary popups.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.aboutInfoCard}>
            <div className={styles.boardSealBadge}>
              <Award size={16} />
              <span>Official Academic Framework</span>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#2b201c' }}>
              {BOARD_INFO.board}
            </h3>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {BOARD_INFO.notes[0]}
            </p>

            <ul className={styles.boardInfoList}>
              <li className={styles.boardInfoItem}>
                <CheckCircle2 size={18} color="var(--primary)" />
                <span>Academic Session: {BOARD_INFO.academicYear}</span>
              </li>
              <li className={styles.boardInfoItem}>
                <CheckCircle2 size={18} color="var(--primary)" />
                <span>Regulatory Body: {BOARD_INFO.authority}</span>
              </li>
              <li className={styles.boardInfoItem}>
                <CheckCircle2 size={18} color="var(--primary)" />
                <span>Classes: Secondary Education (6th to 10th)</span>
              </li>
              <li className={styles.boardInfoItem}>
                <CheckCircle2 size={18} color="var(--primary)" />
                <span>Formative & Summative Exam Aligned</span>
              </li>
            </ul>

            <button
              onClick={handleGetStarted}
              className={styles.primaryBtn}
              style={{ marginTop: 8, alignSelf: 'flex-start' }}
            >
              <span>Access Your Books</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ================= STATS BAR ================= */}
      <section className={styles.sectionBlock} id="schools">
        <div className={styles.statsBanner}>
          <div className={styles.statsGrid}>
            <div>
              <div className={styles.statNumber}>5</div>
              <div className={styles.statLabel}>Secondary Grades (6 to 10)</div>
            </div>
            <div>
              <div className={styles.statNumber}>30+</div>
              <div className={styles.statLabel}>Complete Subject Textbooks</div>
            </div>
            <div>
              <div className={styles.statNumber}>150+</div>
              <div className={styles.statLabel}>Interactive Reading Chapters</div>
            </div>
            <div>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>Free & Open Access for Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES DEEP DIVE ================= */}
      <section className={styles.sectionBlock} id="features">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Modern Learning Features for School Students
          </h2>
          <p className={styles.sectionSubtitle}>
            Built with modern technology to help students read attentively and retain concepts.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureBox}>
            <div className={styles.featureBoxIcon}>
              <BookOpen size={24} />
            </div>
            <h3 className={styles.featureBoxTitle}>Focused Chapter Reader</h3>
            <p className={styles.featureBoxText}>
              Clean layout with adjustable font sizes, learning objectives, section checkboxes,
              and key terms highlighted for quick recall.
            </p>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureBoxIcon}>
              <TrendingUp size={24} />
            </div>
            <h3 className={styles.featureBoxTitle}>Real-time Progress Tracker</h3>
            <p className={styles.featureBoxText}>
              Keep track of chapters read, sections completed, and view your overall syllabus
              completion meter across all registered subjects.
            </p>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureBoxIcon}>
              <Bookmark size={24} />
            </div>
            <h3 className={styles.featureBoxTitle}>Formula & Concept Vault</h3>
            <p className={styles.featureBoxText}>
              Bookmark critical theorems, science experiments, and grammar points in one click
              for instant review during revision.
            </p>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureBoxIcon}>
              <Layers size={24} />
            </div>
            <h3 className={styles.featureBoxTitle}>Chapter Self-Assessment</h3>
            <p className={styles.featureBoxText}>
              Quick interactive multiple-choice questions at the end of every chapter to test
              understanding and earn study achievements.
            </p>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureBoxIcon}>
              <Bell size={24} />
            </div>
            <h3 className={styles.featureBoxTitle}>Circulars & Notifications</h3>
            <p className={styles.featureBoxText}>
              Stay updated on exam dates, holiday schedules, syllabus revisions, and school
              announcements directly within the student portal.
            </p>
          </div>

          <div className={styles.featureBox}>
            <div className={styles.featureBoxIcon}>
              <HelpCircle size={24} />
            </div>
            <h3 className={styles.featureBoxTitle}>Dedicated Helpdesk</h3>
            <p className={styles.featureBoxText}>
              Raise inquiries or technical feedback to your school support team with trackable
              ticket status and responsive assistance.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section className={styles.sectionBlock} id="contact">
        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to begin your learning journey?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of students learning smarter with Vidya Learning. Sign in with
            your student account to start reading your class textbooks today.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={handleGetStarted} className={styles.primaryBtn}>
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>
            <a
              href="mailto:support@vidyalearning.org"
              className={styles.secondaryBtn}
            >
              <HelpCircle size={16} />
              <span>Contact Support Desk</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerBrandCol}>
            <div className={styles.footerBrandLogo}>
              <div className={styles.logoIconBadge}>
                <img
                  src="/assets/logo.png"
                  alt="Vidya Learning"
                  className={styles.brandLogoImg}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <span>Vidya Learning</span>
            </div>
            <p className={styles.footerBrandDesc}>
              A digital textbook and academic tracking platform for secondary school students
              under the Andhra Pradesh State Board.
            </p>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Quick Links</h4>
            <ul className={styles.footerLinksList}>
              <li>
                <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className={styles.footerLink}>
                  Home
                </a>
              </li>
              <li>
                <a href="#why-vidya" onClick={(e) => scrollToSection(e, 'why-vidya')} className={styles.footerLink}>
                  About Vidya
                </a>
              </li>
              <li>
                <a href="#curriculum" onClick={(e) => scrollToSection(e, 'curriculum')} className={styles.footerLink}>
                  Curriculum & Grades
                </a>
              </li>
              <li>
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className={styles.footerLink}>
                  Platform Features
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Curriculum</h4>
            <ul className={styles.footerLinksList}>
              <li>
                <a href="#curriculum" onClick={() => setSelectedGrade(6)} className={styles.footerLink}>
                  Class 6 Textbooks
                </a>
              </li>
              <li>
                <a href="#curriculum" onClick={() => setSelectedGrade(7)} className={styles.footerLink}>
                  Class 7 Textbooks
                </a>
              </li>
              <li>
                <a href="#curriculum" onClick={() => setSelectedGrade(8)} className={styles.footerLink}>
                  Class 8 Textbooks
                </a>
              </li>
              <li>
                <a href="#curriculum" onClick={() => setSelectedGrade(9)} className={styles.footerLink}>
                  Class 9 Textbooks
                </a>
              </li>
              <li>
                <a href="#curriculum" onClick={() => setSelectedGrade(10)} className={styles.footerLink}>
                  Class 10 Textbooks
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Support & Desk</h4>
            <ul className={styles.footerLinksList}>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, 'contact')}
                  className={styles.footerLink}
                >
                  Helpdesk Support
                </a>
              </li>
              <li>
                <a href="mailto:support@vidyalearning.org" className={styles.footerLink}>
                  support@vidyalearning.org
                </a>
              </li>
              <li>
                <span className={styles.footerLink}>Vijayawada, Andhra Pradesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div>© {new Date().getFullYear()} Vidya Learning Platform. All rights reserved.</div>
          <div>SCERT Andhra Pradesh Academic Alignment</div>
        </div>
      </footer>
    </div>
  );
}
