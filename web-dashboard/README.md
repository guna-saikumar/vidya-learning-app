# Vidya Learning — Web Dashboard

Standalone Next.js companion to the Vidya React Native app. It connects to the **real local Vidya API** — no static demo data.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Server Actions + httpOnly cookies
- `server-only` data layer (`src/lib`)

## Run

```powershell
cd C:\Users\hp\OneDrive\Desktop\Vidya\web-dashboard
npm install
npm run build
npm run start
```

Open:

```
http://localhost:3000
```

Sign in with the seeded student account:

```
student@vidya.test / StudentDemo1!
```

If port 3000 is already taken, start on another port with `npx next start -p 3001`.

## Screens

The dashboard mirrors every student screen from the mobile app:

- `/` — dashboard (progress ring, continue learning, syllabus overview, bookmarks, notifications, streak)
- `/learn` — curriculum with search + category filters
- `/learn/[classId]` — class subjects
- `/learn/[classId]/[subjectId]` — chapters with search + status filters, bookmark and complete toggles
- `/learn/[classId]/[subjectId]/[chapterId]` — chapter reader with sections
- `/learn/[classId]/[subjectId]/[chapterId]/[sectionId]` — section reader
- `/my-learning` — study log with completed/in-progress tabs
- `/bookmarks` — saved chapters/sections with remove
- `/notifications` and `/notifications/[id]` — circulars, mark read, mark all read
- `/profile` — profile details, achievements, study settings
- `/profile/edit` — edit details and upload/remove avatar

## API connection

Defaults to `http://127.0.0.1:4000`. Override with `API_URL` (server-side calls) and
`NEXT_PUBLIC_API_URL` (browser-visible avatar URLs):

```powershell
$env:API_URL="http://<LAN-IP>:4000"
$env:NEXT_PUBLIC_API_URL="http://<LAN-IP>:4000"
npm run start
```

See `.env.example` for the same values in `.env.local` format.

The dashboard reads:

- `GET /api/v1/auth/me`
- `GET /api/v1/students/me/profile`
- `GET /api/v1/students/me/progress`
- `GET /api/v1/students/me/bookmarks`
- `GET /api/v1/curriculum/classes`
- `GET /api/v1/curriculum/classes/:classId/subjects`
- `GET /api/v1/curriculum/subjects/:subjectId`
- `GET /api/v1/curriculum/chapters/:chapterId`
- `GET /api/v1/notifications?unread=true`

## Notes

- The mobile app and API are unchanged.
- Login is a server action; tokens are stored in **httpOnly** cookies.
- Bookmarks, notifications, progress and subjects are all live from the database.
- The page is intentionally not wired into the monorepo yet — it’s a separate folder for demo/presentation.
