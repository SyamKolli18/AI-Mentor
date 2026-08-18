# Changelog

All notable changes to the AI Mentor application during the development of Phases 14, 15, 16, and 17 will be documented in this file.

---

## [1.2.0-stable] - 2026-07-07

### Added

#### Phase 14: AI Learning Assistant
* **Backend Model**: Added `AIChatSession` schema logging titles, user/assistant messages history logs, saved statuses, and favorites list.
* **Backend API**: Added endpoints:
  - `POST /api/assistant/chat` (Respond to query using context histories and local markdown heuristics)
  - `GET /api/assistant/sessions` (Retrieve history logs list)
  - `POST /api/assistant/sessions/:id/save` (Bookmark thread)
  - `POST /api/assistant/sessions/:id/favorite` (Pin specific reply)
* **Frontend View**: Added `AIAssistantView.tsx` with sidebar suggestion cards, conversations window, and regex markdown parsers.

#### Phase 15: Community & Mentorship Platform
* **Backend Model**: Added `CommunityForum`, `StudyGroup`, `ProjectShowcase`, and `Achievement` collections.
* **Backend API**: Added endpoints:
  - Discussions: `GET /api/community/forums`, `POST /api/community/forums`, `POST /api/community/forums/:id/comment`
  - Groups: `GET /api/community/groups`, `POST /api/community/groups/join`
  - Showcases: `GET /api/community/showcase`, `POST /api/community/showcase`, `POST /api/community/showcase/:id/review`
  - Analytics Standings: `GET /api/community/leaderboard`
* **Frontend View**: Added `CommunityView.tsx` supporting forum posts, group memberships toggle, showcase ratings, and badges cabinets.

#### Phase 16: Admin Dashboard & Platform Analytics
* **Backend API**: Added `GET /api/admin/analytics` returning user statistics counts, growth analytics list, AI usage metrics, and error logs pools.
* **Frontend View**: Added Analytics & Settings tab to `AdminPanel.tsx` showing AreaChart growths, BarChart AI usage, feature flags controls, announcements, and backups managers.

#### Phase 17: Final Production Optimization
* **Backend Security**: Added role authorization checks `authorize(['admin'])` to all admin routes. Modified `User` schema to register `role` and `refreshToken` variables.
* **Backend Diagnostics**: Added `GET /api/health` returning memory consumption, database connection state, and uptime check.
* **DevOps Configs**: Created backend/frontend multi-stage Dockerfiles and root `docker-compose.yml` configurations.

### Changed
* **App Routing**: Modified `frontend/src/App.tsx` and `frontend/src/layouts/DashboardLayout.tsx` to register `/assistant` and `/community` navigation links.
