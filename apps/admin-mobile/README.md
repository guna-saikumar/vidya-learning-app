# Vidya School Learning Admin App — Classes 6–10 (`apps/admin-mobile`)

A mobile administrator application built with **React Native**, **Expo (SDK 57)**, **TypeScript**, **React Navigation**, **NativeWind v4 (TailwindCSS)**, and a dedicated **PostgreSQL** database to manage the curriculum and learning materials for the Vidya Educational App.

---

## 1. Project Architecture & Stack

- **Framework:** React Native 0.86.3 / Expo SDK 57.0.27
- **Language:** TypeScript 6.0
- **Styling:** NativeWind v4 (Pure White `#FFFFFF` + Terracotta design system)
- **Navigation:** `@react-navigation/native-stack` + `@react-navigation/bottom-tabs`
- **Icons:** `lucide-react-native`
- **Database Engine:** PostgreSQL through the shared backend/API stack
- **Authentication:** Direct Administrator Console Access (No login screen or login lock)
- **Media & Document Uploads:** `expo-document-picker` with metadata stored in PostgreSQL
- **Typography:** Google Fonts `Manrope` and `Inter`

---

## 2. Terracotta Design System

The application strictly adheres to the pure white background aesthetic with warm Terracotta accents:

| Token | Hex Code | Usage |
|---|---|---|
| **Primary Terracotta** | `#B95D3F` | Primary buttons, active tabs, brand accents |
| **Dark Terracotta** | `#91452F` | Pressed states, high-contrast headings |
| **Light Terracotta** | `#F3D9CC` | Subtle chips, secondary badges |
| **Pale Peach** | `#FBECE3` | Tinted pill backgrounds, active indicators |
| **Background & Cards** | `#FFFFFF` | All screens, cards, modal sheets |
| **Primary Text** | `#3A2D29` | Headings, titles, primary copy |
| **Secondary Text** | `#79675F` | Subtitles, metadata, placeholders |
| **Borders** | `#EDE1D8` | Cards, input fields, dividers |
| **Accent Gold** | `#D6A84F` | Starred items, highlight callouts |
| **Success** | `#24845D` | Published badges, completed actions |

---

## 3. Curriculum Hierarchy (Andhra Pradesh State Board SCERT 2026–2027)

```
Class (6 - 10)
 └── Subject (Telugu, Hindi, English, Mathematics, General/Physical/Biological Science, Social Studies)
      └── Chapter (e.g., Real Numbers, Cell Structure)
           └── Section / Topic (e.g., Fundamental Theorem of Arithmetic)
                └── Learning Materials (PDF, Video, Notes, PPT, Diagrams)
```

- **Classes 6–7:** Telugu, Hindi, English, Mathematics, General Science, Social Studies.
- **Classes 8–10:** Telugu, Hindi, English, Mathematics, Physical Science, Biological Science, Social Studies.

---

## 4. Key Screens & Features

1. **Direct Admin Access:**
   - Opens immediately to the admin console without any login prompts or locks.
   - Immediate access to all management operations.

2. **Dashboard (`DashboardScreen.tsx`):**
   - Real-time statistics: Total Classes, Subjects, Chapters, Sections, Total Materials, Published Materials, Drafts.
   - Quick action shortcuts (Add Subject, Add Chapter, Add Section, Upload Material).
   - Recent activity list with one-tap status toggles.

3. **Classes & Subjects (`ClassesScreen.tsx`):**
   - Class selector tabs (Class 6 to Class 10).
   - Subject grid with chapter counts and color-coded icons.
   - Modal for adding or editing subjects (code, name, language, display order).

4. **Chapters & Sections (`ChaptersScreen.tsx`):**
   - Chapter index view replicating student order.
   - Add/edit chapters with learning objectives and summary.
   - Add/edit sections nested under each chapter.
   - Delete safeguards preventing deletion of content with dependent materials.

5. **Materials Library (`MaterialsLibraryScreen.tsx`):**
   - Filters by Class, Subject, Chapter, Material Type (PDF, Video, Notes, PPT, Image), and Status (All, Published, Draft, Archived).
   - Search bar for quick discovery.
   - Quick publish/unpublish toggles.

6. **Add / Edit Material (`AddEditMaterialScreen.tsx`):**
   - Multi-step metadata form (Title, Description, Class, Subject, Chapter, Section, Type, Language).
   - Document & media attachment via file picker or external video URL.
   - Direct shortcut to the Rich Content Editor.

7. **Rich Content Editor (`ContentEditorScreen.tsx`):**
   - Structured markdown & notes editor.
   - Quick insert toolbar: Heading (`#`), Bold (`**`), Bullet list (`•`), Link, Formula (`$E=mc^2$`), Image, Axiom callout.
   - Live Split-screen / Toggle Preview mode.

8. **Preview & Publish Screen (`PreviewPublishScreen.tsx`):**
   - Exact student-side view simulation before publishing.
   - One-tap status updates (Publish, Unpublish to Draft, Archive).

9. **Settings & Database (`ProfileSettingsScreen.tsx`):**
   - Administrator identity details, SCERT AP board metadata, PostgreSQL database status, connection ping, and data restoration.

---

## 5. PostgreSQL Data Layer

Database schema, migrations, and seed data belong in the shared backend/database packages, not inside the mobile app. The admin mobile app talks to the API and stores offline-friendly local state when the API is unavailable.

---

## 6. How to Run

From the monorepo root:
```bash
# Start the admin mobile app directly
pnpm dev:admin-mobile

# Or from apps/admin-mobile directory
cd apps/admin-mobile
npx expo start
```

Press `w` in the terminal to view in web browser, or scan the QR code using Expo Go on iOS/Android.
