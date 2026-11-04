## Repo Structure

```
vidya-learning-app/
│
├── frontend/                 # Expo / React Native student mobile application (Classes 6–10)
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
├── backend/                  # NestJS v11 + Fastify API
│   ├── src/
│   │   ├── modules/          # Feature modules (curriculum, health, notifications, schools, students)
│   │   ├── auth/             # Student auth, JWT issuance, roles & guards
│   │   ├── db/               # PostgreSQL database service & connection pool
│   │   ├── common/           # Exception filters, file uploads & Zod pipes
│   │   └── mailer/           # Mailer service
│   ├── db/                   # Database migrations & demo seed scripts
│   ├── benchmarks/           # k6 load testing suite
│   ├── postman/              # Postman API collections
│   ├── scripts/              # Local startup & ngrok helper scripts
│   └── package.json
│
├── docs/                     # Project documentation & tech specs
│
└── README.md                 # Project overview and run guides
```
