# Project To-Do List & Reminders

## Future Tasks (Pending)
- [x] **Master Administrator Role**: 
    - [x] Define a role above Level 5 (Master Level 6).
    - [x] Master Admin is the only one who can permanently delete data and access system source code.
    - [x] Implement a "Deep Archive" (Duboka Arhiva) only visible to Master Admin.
- [x] **Katana (Process Management)**:
    - [x] Implement Microsoft To Do style task manager.
    - [x] Integrate "Katana AI" for natural language task entry.
    - [x] Categorization (My Day, Planned, Important).
- [x] **Data Shield & External API Security**:
    - [ ] Implement AI-driven Anomaly Detection (monitors for bulk exports or frequent deletions).
    - [x] Add "Master Lock" for Level 6: Second-factor confirmation for any action involving Banks or Government systems.
    - [ ] API Guardian: Encrypt and isolate all external API keys (Banks, CIS, e-Turista).
    - [ ] Implement IP Whitelisting for backend authentication to prevent "upad sa strane".
- [x] **Zero Trust Arhitektura**:
    - [x] RBAC enforcement (Levels 1-6).
    - [x] Deep Archive for immutable audit logs.
    - [x] AI Gateways for sensitive action confirmation.

- [x] **AI-Guided Confirmation**:
    - [x] AI Assistant should provide a confirmation dialog before sensitive actions like deletion or critical configuration changes.
- [ ] **Vercel Environment Setup (CRITICAL)**:
    - [ ] Wait for current build to finish and verify app loads (White Screen fix).
    - [ ] **Action Required**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Project Settings -> Environment Variables to enable real database connection in production.
- [ ] **Production Routing & Deep Linking**:
    - [ ] Implement robust routing logic (React Router) for the final production version.
    - [ ] Goal: Ensure every module and item has a unique, shareable URL (e.g., `.../app/reservations/list?id=101`), matching professional ERP standards.


## Completed Tasks
- [x] Initial List Creation
- [x] **Navy Dark Mode Theme**: Implemented a lighter navy blue variant.
- [x] **Prism Mode (Sarena slova)**: Added a colorful syntax-like toggle for all themes.
- [x] **Contrast & Legibility Overhaul**: Fixed hardcoded colors and improved readability across all themes.
- [x] **Vercel Build Fix**: Resolved TypeScript errors blocking deployment.
- [x] **Deployment Status Indicators**: Added GitHub/Vercel status badges to the Dashboard.
