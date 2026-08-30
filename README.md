# Vigil

> **Vigil** is a modern, minimalist productivity timer built with React and Supabase. Track your focused sessions, set daily goals, and gain insights into your work patterns—all in a clean, distraction‑free interface.

![Vigil Screenshot](https://via.placeholder.com/800x400?text=Vigil+Timer+App) <!-- replace with actual screenshot -->

---

## ✨ Features

- ⏱️ **Smart Timer** – Start, pause, and resume sessions with persistence across page refreshes.
- 📊 **Dashboard** – At-a‑glance stats: total time, session count, average duration, and current streak.
- 📅 **History** – View sessions by date, edit or delete entries.
- 🎯 **Daily Goals** – Set a daily focus target and track your achievement ratio.
- 🌗 **Theme Toggle** – Light, dark, and system‑preference themes with a keyboard shortcut (`D` key).
- 🔐 **Authentication** – Secure login and sign‑up via Supabase Auth.
- 📦 **Offline‑ready** – Active session is saved in the database, so you never lose progress.
- 🔍 **Built‑in Log Viewer** – Debug and inspect application logs (Ctrl+Shift+L).

---

## 🛠️ Tech Stack

| Category       | Technologies                                                                 |
|----------------|-------------------------------------------------------------------------------|
| **Frontend**   | React 19, TypeScript, Vite, React Router DOM                                 |
| **UI**         | shadcn/ui components, Tailwind CSS 4, Lucide icons, `tw-animate-css`        |
| **State**      | React Context API (`TimerContext`)                                          |
| **Backend**    | Supabase (PostgreSQL, Auth, Row Level Security)                             |
| **Date/Time**  | date‑fns                                                                     |
| **Logging**    | Custom `logger` singleton that intercepts `console` methods                 |
| **Forms**      | Base‑UI (headless components)                                               |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm or pnpm
- A Supabase project (free tier works)

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Database Setup

Run the SQL script `supabase-setup.sql` in your Supabase SQL editor. It creates:

- `timer_entries` – stores start/end times, elapsed seconds, and `stopped_at` for pending saves.
- `user_settings` – stores each user’s daily goal in minutes.

Row Level Security (RLS) policies are included to ensure users can only access their own data.

### Installation

```bash
git clone https://github.com/yourusername/vigil.git
cd vigil
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure (Key Files)

```
vigil/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/            # shadcn/ui components (button, card, etc.)
│   │   ├── Layout.tsx     # Main layout with sidebar and mobile menu
│   │   ├── LoginSignup.tsx
│   │   ├── LogViewer.tsx  # Debug log viewer
│   │   └── theme-provider.tsx
│   ├── context/
│   │   └── TimerContext.tsx   # Global timer state + Supabase CRUD
│   ├── lib/
│   │   ├── supabase.ts    # Supabase client
│   │   ├── utils.ts       # `cn`, time formatters
│   │   └── logger.ts      # Console interceptor
│   ├── pages/
│   │   ├── Dashboard/     # Stats, last session, productivity cards
│   │   ├── Timer/         # Timer logic (start/stop/save/reset)
│   │   ├── History/       # Session list with edit/delete
│   │   └── Settings/      # Daily goal & theme toggle
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase-setup.sql     # Database schema + RLS
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🕹️ Usage Guide

### Timer Workflow

1. **Start** – Creates a new database entry with `end_time = null` and `stopped_at = null`.
2. **Stop** – Updates `stopped_at` to the current timestamp (pauses the timer) but does not save the final duration.
3. **Save** – Sets `end_time` and calculates `elapsed_time` – the session is permanently stored.
4. **Reset** – Deletes the current active session (if unsaved) or resets the display.

### Keyboard Shortcuts

- `D` – Toggle dark/light theme (respects system preference when on `system`).
- `Ctrl+Shift+L` – Open the log viewer.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) – Component library
- [Supabase](https://supabase.com/) – Backend & authentication
- [Lucide](https://lucide.dev/) – Icons
- [date‑fns](https://date-fns.org/) – Date utilities

---

**Built with ❤️ by the Sayantan.**