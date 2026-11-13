# Vidya Learn — School Learning Mobile App (Classes 6–10)

A modern, student-friendly educational mobile application for students studying in **Classes 6, 7, 8, 9, and 10**, developed with **React Native, Expo, and TypeScript** featuring the **Terracotta + Cream** design language derived from the Stitch design specifications.

---

## Design System: Terracotta + Cream

| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary Terracotta** | `#B95D3F` | CTAs, active indicators, milestone buttons, highlight icons |
| **Dark Terracotta** | `#91452F` | Pressed states, high-contrast borders, focused interaction rings |
| **Light Terracotta** | `#F3D9CC` | Subtle icon containers, card borders, gentle accents |
| **Pale Peach** | `#FBECE3` | Category pills, callout cards, inactive containers |
| **Warm Cream Background**| `#FFF9F3` | Primary non-glare reading canvas |
| **Pure White** | `#FFFFFF` | Elevated structural cards, inputs, containers |
| **Primary Text** | `#3A2D29` | Deep mineral brown for optimal readability without glare |
| **Secondary Text** | `#79675F` | Chapter subtitles, descriptions, and metadata |
| **Muted Text** | `#A08C82` | Timestamps, placeholders, disabled states |
| **Border Line** | `#EDE1D8` | Delicate warm structural divider lines |
| **Accent Gold** | `#D6A84F` | Streaks, achievements, study milestone badges |
| **Success Green** | `#24845D` | Completed chapters, checkmarks, progress feedback |

---

## Complete Screen Hierarchy & Implemented Views

### 1. Dashboard (`DashboardScreen.tsx`)
- **Header**: Warm greeting *"Good morning, Aarav!"*, subtitle *"What would you like to learn today?"*, study streak badge (*5 Day Streak *), profile avatar, and instant search.
- **Curriculum Overview (4 Stat Cards)**:
  - *Total Classes*: 5 (Grades 6–10)
  - *Total Subjects*: 28 across syllabi
  - *Total Chapters*: 142 topics
  - *Learning Progress*: 68% Completed
- **Select Your Class**: Horizontal selector cards for **Class 6, 7, 8, 9, and 10** with active *"Selected"* indicator for Class 8.
- **Continue Learning**: Interactive cards for *Class 8 • Mathematics: Chapter 1 (75%)* and *Class 8 • Science: Chapter 2 (40%)*.
- **Recent Milestones & Daily Study Ritual**: Bookmarked formula reminder and habit tip callout.

### 2. Class Subjects (`ClassSubjectsScreen.tsx`)
- Context banner with breadcrumbs (*Dashboard → Class 8 Curriculum*).
- Friendly helper note: *"Clicking any subject opens its full Chapter Index before entering lessons."*
- Subject search bar and category filter pills (*All, Science & Math, Languages, Social Studies*).
- Subject cards stack (*Mathematics, Science, English Literature, Social Science, Hindi*) showing chapter count, completion progress bar, and *"View Index →"* button.

### 3. Subject Index / Table of Contents (`SubjectIndexScreen.tsx`)
- Context navigation (*Back to Subjects • Class 8 > Mathematics*).
- Subject overview banner with curriculum artwork and overall completion segmented track (*25% Done, 4 of 16 Chapters*).
- Quick filter pills (*All Chapters, In Progress, Completed, Unread*).
- Numbered chapter cards with expandable accordion breakdown:
  - **Chapter 1: Rational Numbers** (Completed, 4 Topics, 96% Mastery).
  - Expandable sections (1.1, 1.2, 1.3, 1.4) with duration times.
  - Review / Continue Chapter actions.

### 4. Chapter Details / Learning Content (`ChapterDetailsScreen.tsx`)
- Sticky sub-navigation bar with back link, chapter tag, bookmark toggle button, and *"Done ✓"* status pill.
- Learning goals card with numbered study objectives.
- Atmospheric study illustration banner (*Foundations of Modern Arithmetic*).
- Section 1.1: Introduction to Rational Numbers with formal definition formula card:
  $$\text{Rational Number: } \frac{p}{q}, \quad q \neq 0$$
- Section 1.2: Properties of Rational Numbers (Closure, Commutative, Associative) with compact Bento Summary Matrix.
- Critical concept check warning: *Division by zero ($a \div 0$) is undefined; rational numbers are not closed under division.*
- **Interactive Quick Concept Check Quiz**: Selectable options with immediate feedback and explanation.
- Mark Chapter as Completed button.
- Next Chapter card (*Ch 02: Linear Equations in One Variable*) & Previous Chapter controls.

### 5. Section / Topic Details (`SectionDetailsScreen.tsx`)
- Deep-dive into an individual topic (e.g. *1.1 Comparing Numbers*, *1.2 Properties*).
- Dedicated reading layout, principle callouts, mark topic completed toggle, and Previous/Next topic buttons.

### 6. My Learning (`MyLearningScreen.tsx`)
- Curriculum progress tracker with active day streak.
- Filter tabs: *All Activity*, *In Progress*, *Completed*.
- List of accessed chapters with progress bars and direct resume links.

### 7. Saved Bookmarks (`BookmarksScreen.tsx`)
- Catalog of all bookmarked chapters, sections, and mathematical formulas.
- Fast one-tap navigation to the saved material and remove bookmark options.

### 8. Student Profile & Settings (`ProfileScreen.tsx`)
- Display name (*Aarav Sharma*), enrolled class indicator, study streak.
- **Active Class Switcher**: Switch the active curriculum between Classes 6, 7, 8, 9, and 10 on the fly.
- App preferences: Daily study reminders toggle, offline curriculum cache switch, and version info.

---

## 🗂 Project Structure

```
vidya-learning-app/
├── assets/
│   └── app-images/
│       ├── avatar.png
│       ├── logo.png
│       ├── math_banner.png
│       └── study_banner.png
├── src/
│   ├── constants/
│   │   ├── colors.ts            # Terracotta + Cream color tokens
│   │   └── spacing.ts           # Spacing, border radius, and elevation tokens
│   ├── types/
│   │   ├── curriculum.ts         # Section, Chapter, Subject, SchoolClass types
│   │   └── navigation.ts         # Stack & Tab navigation parameter lists
│   ├── data/
│   │   └── curriculum.ts         # Comprehensive curriculum for Classes 6 to 10
│   ├── services/
│   │   ├── curriculumService.ts  # Data queries, filters, and full-text search
│   │   └── progressService.ts    # AsyncStorage persistence (progress, bookmarks, profile)
│   ├── hooks/
│   │   └── useLearningProgress.ts# React hook syncing UI with storage
│   ├── components/
│   │   ├── HeaderBar.tsx         # Brand header bar with back, search & profile
│   │   ├── StatCard.tsx          # Metric cards on Dashboard
│   │   ├── ClassCard.tsx         # Class 6-10 selection cards
│   │   ├── SubjectCard.tsx       # Subject card with progress bar
│   │   ├── ChapterListItem.tsx   # Numbered chapter item with expandable accordion
│   │   ├── SearchBar.tsx         # Warm search input with clear & filter triggers
│   │   └── CalloutCard.tsx       # Formula, study tip, and notice callouts
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── ClassSubjectsScreen.tsx
│   │   ├── SubjectIndexScreen.tsx
│   │   ├── ChapterDetailsScreen.tsx
│   │   ├── SectionDetailsScreen.tsx
│   │   ├── MyLearningScreen.tsx
│   │   ├── BookmarksScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── navigation/
│       ├── TabNavigator.tsx      # Bottom tabs (Home, My Learning, Bookmarks, Profile)
│       └── RootNavigator.tsx     # Native Stack navigation
├── App.tsx                       # Font loader (Manrope & Inter) and Root Navigator
└── package.json
```

---

## Running the Application

### 1. Set Active Workspace
It is recommended to open the project folder in your IDE:
```bash
/Users/saikumar/.gemini/antigravity-ide/scratch/vidya-learning-app
```

### 2. Run Locally via Expo

Navigate to the project directory:
```bash
cd /Users/saikumar/.gemini/antigravity-ide/scratch/vidya-learning-app
```

**Start the interactive Expo dev server:**
```bash
npx expo start
```

- **Open on Web**: Press `w` in the terminal, or run `npx expo start --web`.
- **Open on iOS Simulator** (macOS with Xcode): Press `i`.
- **Open on Android Emulator**: Press `a`.
- **Open on Real Phone**: Install **Expo Go** from the App Store / Google Play and scan the QR code displayed in the terminal.
