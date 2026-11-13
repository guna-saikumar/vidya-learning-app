## Repo Structure

```
vidya-learning-app/
│
├── mobile-frontend/          # Expo / React Native student mobile application (Classes 6–10)
│   ├── src/
│   │   ├── screens/          # All 13 application screens (Dashboard, Login, SubjectIndex, etc.)
│   │   ├── components/       # UI components (common, curriculum, home, navigation)
│   │   ├── api-client/       # Typed client calling backend REST endpoints
│   │   ├── services/         # Client services (auth, curriculum, progress, notifications)
│   │   ├── store/            # Redux Toolkit state slices
│   │   ├── hooks/            # Reusable hooks (useAuth, useLearningProgress)
│   │   ├── constants/        # Terracotta + Cream design tokens
│   │   └── types/            # TypeScript interfaces (auth, curriculum, navigation)
│   ├── assets/               # Images, banners, and logos
│   ├── test/                 # Test suites (auth, service integration, avatars)
│   ├── App.tsx               # Root component & font loaders
│   └── package.json
│
├── web-frontend/             # Student Web Portal (Vite, React, CSS Modules)
│   ├── src/
│   │   ├── pages/            # LandingPage, LoginPage, DashboardPage, CoursesPage, etc.
│   │   ├── components/       # Layouts, Top Navbar, UI widgets
│   │   ├── hooks/            # useAuth, useProfile
│   │   ├── services/         # API services
│   │   └── lib/              # Axios client and avatar resolver
│   ├── public/               # Logos, hero student image, book stack assets
│   └── package.json
│
├── backend/                  # Unified NestJS v11 + Fastify API & PostgreSQL Database
│   ├── src/
│   │   ├── modules/          # Feature modules (curriculum, health, notifications, schools, students)
│   │   ├── auth/             # Student auth, JWT issuance, roles & guards
│   │   ├── db/               # PostgreSQL database service & connection pool
│   │   ├── common/           # Exception filters, file uploads & Zod pipes
│   │   └── mailer/           # Mailer service
│   ├── db/                   # PostgreSQL schema migrations & seed data scripts
│   ├── benchmarks/           # k6 load testing suite
│   ├── postman/              # Postman API collections
│   ├── scripts/              # Local startup & ngrok helper scripts
│   └── package.json
│
├── docs/                     # Project documentation & tech specs
│
└── README.md                 # Project overview and run guides
```
