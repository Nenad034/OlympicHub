# Project To-Do List & Reminders

## ⚠️ IMPORTANT: Documentation Rules

**Always update documentation when making changes:**

| Change Type | Update Required |
|-------------|-----------------|
| New API endpoint | `docs/API.md` |
| New component | `docs/COMPONENTS.md` |
| New hook | `docs/COMPONENTS.md` |
| New store | `docs/COMPONENTS.md` |
| Architecture change | `docs/ARCHITECTURE.md` |
| New route | `docs/ARCHITECTURE.md` |
| New constant | `src/constants/index.ts` |

**Workflows:** See `.agent/workflows/` for detailed instructions.

---

## 🎉 Major Refactoring - 2025-12-29

### ✅ Completed Architecture Improvements

1. **React Router Integration**
   - Implemented `react-router-dom` for proper SPA routing
   - Added deep linking support (e.g., `/suppliers`, `/production`)
   - Browser history now works (back/forward buttons)
   - Protected routes for Level 6+ modules

2. **Zustand State Management**
   - Created `authStore.ts` - User level and permissions
   - Created `themeStore.ts` - Theme, language, navigation mode
   - Created `appStore.ts` - Global app state (chat, search, status)
   - Replaced scattered `useState` calls with centralized stores

3. **Component Architecture**
   - Split `App.tsx` from 532 lines to ~100 lines
   - Created `Sidebar.tsx` - Navigation component
   - Created `TopBar.tsx` - Header with controls
   - Created `HorizontalNav.tsx` - Alternative navigation
   - Created `Dashboard.tsx` - Extracted dashboard page

4. **Code Organization**
   - Created `src/stores/` - Zustand stores
   - Created `src/hooks/` - Custom React hooks
   - Created `src/router/` - Router configuration
   - Created `src/pages/` - Page components
   - Created `src/components/layout/` - Layout components

5. **Performance Improvements**
   - Lazy loading for all module pages
   - Suspense fallback for loading states

### 📁 New File Structure
```
src/
├── stores/
│   ├── authStore.ts
│   ├── themeStore.ts
│   ├── appStore.ts
│   └── index.ts
├── hooks/
│   ├── useTheme.ts
│   ├── useNavigation.ts
│   └── index.ts
├── router/
│   └── index.tsx
├── pages/
│   └── Dashboard.tsx
├── components/
│   └── layout/
│       ├── Sidebar.tsx
│       ├── TopBar.tsx
│       ├── HorizontalNav.tsx
│       └── index.ts
└── App.tsx (refactored)
```

---


## 🚀 Deep Linking - TODO (Phase 2)
- [x] **Hotel Routes Expansion**:
    - [x] `/production/hotels/new` - Create new hotel wizard ✅
    - [x] `/production/hotels/:slug/edit` - Edit hotel ✅
    - [x] `/production/hotels/:slug/rooms` - Room management ✅
    - [ ] `/production/hotels/:slug/rooms/:roomId` - Individual room detail
    - [x] `/production/hotels/:slug/prices` - Price management ✅
- [x] **Supplier Routes**:
    - [x] `/suppliers/:supplierId` - Supplier detail page ✅
    - [ ] `/suppliers/:supplierId/contracts` - Contract management
- [x] **Customer Routes**:
    - [x] `/customers/:customerId` - Customer detail page ✅
    - [ ] `/customers/:customerId/bookings` - Customer booking history
- [ ] **Booking Routes** (Future):
    - [ ] `/bookings/:bookingId` - Booking detail
    - [ ] `/bookings/new` - New booking wizard

---

## Future Tasks (Pending)

### 🔔 NotificationCenter Improvements
- [ ] **Dodatne opcije notifikacija**:
    - [ ] Zvučne notifikacije (sound notifications)
    - [ ] Email notifikacije (email notifications)
- [ ] **Prioritet notifikacija**:
    - [ ] Dodati mogućnost podešavanja prioriteta notifikacija (Low, Medium, High, Critical)
- [ ] **Napredne opcije**:
    - [ ] Desktop notifikacije (browser push notifications)
    - [ ] Grupiranje notifikacija po tipu
    - [ ] Istorija notifikacija

### 🤖 AI Asistent za Call Centar
- [ ] **Inteligentni Call Centar Asistent**:
    - [ ] Agregacija svih informacija o ponudama u sistemu (hoteli, cene, dostupnost, usluge)
    - [ ] Brzo pretraživanje i filtriranje ponuda na osnovu upita prodavca
    - [ ] Instant odgovori na pitanja o:
        - Dostupnosti smeštaja
        - Cenama i popustima
        - Uslovima plaćanja
        - Dodatnim uslugama (transfer, osiguranje, ekskurzije)
        - Specijalnim ponudama i akcijama
    - [ ] Integracija sa svim modulima (Production Hub, Pricing Intelligence, Suppliers)
    - [ ] Natural Language Processing za razumevanje upita na srpskom jeziku
    - [ ] Automatsko generisanje odgovora sa relevantnim detaljima
    - [ ] Istorija konverzacija i često postavljanih pitanja (FAQ)
    - [ ] Sugestije za upselling i cross-selling
    - [ ] Real-time sinhronizacija sa bazom podataka
    - [ ] Multi-channel podrška (chat, email, telefon)
- [ ] **Ubrzanje protoka informacija**:
    - [ ] Smanjenje vremena odgovora sa minuta na sekunde
    - [ ] Automatsko formatiranje odgovora za slanje putniku
    - [ ] Template-i za česte upite
    - [ ] Voice-to-text integracija za telefonske pozive

### 🧠 Master Orchestrator - AI Agent Management
- [x] **UI Implementation**:
    - [x] Master Orchestrator modul (`modules/ai/MasterOrchestrator.tsx`)
    - [x] Agent Registry prikaz sa 6 agenata
    - [x] Chat interface za komunikaciju
    - [x] Real-time status prikaz agenata
    - [x] Integracija u Activity Bar (samo Level 6)
    - [x] Integracija u VSCode Sidebar
    - [x] Routing (`/orchestrator`)
- [ ] **Backend Integration**:
    - [ ] Agent Registry Service
    - [ ] Context Manager implementation
    - [ ] Agent-to-Agent communication protocol
    - [ ] Real AI integration (trenutno simulacija)
- [ ] **Specialized Agents**:
    - [ ] Hotel Agent implementation
    - [ ] Pricing Agent implementation
    - [ ] Mail Agent implementation
    - [ ] Customer Agent implementation
    - [ ] Fortress Agent implementation
    - [ ] Data Agent implementation
- [ ] **Advanced Features**:
    - [ ] Machine Learning integration
    - [ ] Continuous learning from interactions
    - [ ] Performance metrics tracking
    - [ ] A/B testing framework

### 🛡️ The Fortress - 24/7 Security Defense System
- [x] **Osnovna arhitektura**:
    - [x] Fortress Store (Zustand) za upravljanje attack logs, metrics i alerts
    - [x] Security Defense Service za detekciju napada
    - [x] Integracija sa postojećim Fortress UI modulom
- [ ] **Detekcija napada (Attack Detection)**:
    - [x] SQL Injection detekcija
    - [x] XSS (Cross-Site Scripting) detekcija
    - [x] Brute Force detekcija (failed login tracking)
    - [x] DDoS detekcija (rate limiting)
    - [x] Path Traversal detekcija
    - [ ] CSRF (Cross-Site Request Forgery) detekcija
    - [ ] File Upload Attack detekcija
    - [ ] Command Injection detekcija
    - [ ] LDAP Injection detekcija
    - [ ] XML External Entity (XXE) detekcija
- [ ] **24/7 Monitoring**:
    - [x] Real-time attack logging
    - [x] Automatic IP blocking za maliciozne izvore
    - [ ] Geo-location tracking napadača
    - [ ] Attack pattern recognition (AI-powered)
    - [ ] Predictive threat analysis
    - [ ] Honeypot implementation za privlačenje napadača
- [ ] **Alerting System**:
    - [x] Real-time alerts za kritične pretnje
    - [ ] Email notifikacije za security team
    - [ ] SMS alerts za kritične napade
    - [ ] Slack/Teams integracija
    - [ ] Escalation protocol (Low → Medium → High → Critical)
    - [ ] Alert deduplication (sprečavanje spam-a)
- [ ] **Attack Logs \u0026 Forensics**:
    - [x] Detaljno logovanje svih napada
    - [x] Severity classification (Low, Medium, High, Critical)
    - [ ] Attack timeline visualization
    - [ ] IP reputation tracking
    - [ ] User-Agent analysis
    - [ ] Payload inspection i analiza
    - [ ] Export logs (JSON, CSV, PDF)
    - [ ] Integration sa SIEM sistemima
- [ ] **Security Recommendations**:
    - [x] Automatsko generisanje bezbednosnih preporuka
    - [ ] Vulnerability assessment
    - [ ] Patch management suggestions
    - [ ] Configuration hardening tips
    - [ ] Compliance checking (OWASP Top 10, GDPR, PCI-DSS)
- [ ] **Advanced Features**:
    - [ ] Machine Learning za detekciju novih vrsta napada
    - [ ] Behavioral analysis (anomaly detection)
    - [ ] Threat Intelligence feed integration
    - [ ] Automated incident response (auto-blocking, auto-patching)
    - [ ] Security scoring dashboard
    - [ ] Penetration testing simulator
    - [ ] WAF (Web Application Firewall) rules generator
- [ ] **UI Enhancements**:
    - [ ] Attack Map (geografska mapa napada)
    - [ ] Real-time attack counter
    - [ ] Security Health Score
    - [ ] Attack Type Distribution (pie chart)
    - [ ] Timeline view za attack history
    - [ ] Blocked IPs management interface
    - [ ] Whitelist management
    - [ ] Security audit reports generator
- [ ] **Integration**:
    - [ ] Supabase Edge Functions za server-side validation
    - [ ] Cloudflare integration za DDoS protection
    - [ ] Rate limiting na API Gateway nivou
    - [ ] JWT token validation
    - [ ] Session management i timeout
    - [ ] Multi-factor authentication (MFA)
- [ ] **Compliance \u0026 Reporting**:
    - [ ] GDPR compliance monitoring
    - [ ] PCI-DSS compliance checking
    - [ ] ISO 27001 alignment
    - [ ] Automated compliance reports
    - [ ] Audit trail za sve security events
    - [ ] Data retention policies



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
### 🗺️ TOTAL TRIP & EXPERIENCES
- [ ] **Unified Iconography**: Osigurati da se iste ikone iz pretrage (Musashi stil) koriste i u prikazima cenovnika i generisanim ponudama.
- [ ] **Marketing-Steered AI Assistant**: Naučiti AI asistenta da, pored pronalaženja najboljih opcija, suptilno predlaže "Promoted" ponude koje su u strateškom interesu agencije.
- [ ] **Verified Experiences**: Razviti logiku koja na osnovu izabranog hotela/destinacije nudi "Verified Experiences" (restorani, lokalni dragulji, najbolja kafa).
- [ ] **Group Travel Logic**: Implementirati pretragu i kalkulaciju za grupna putovanja (popusti na količinu, grupni prevoz).
- [ ] **Trip Builder**: Omogućiti korisniku da "sklapa" putovanje kao mozaik (Avio + Hotel + Transfer + Disneyland + Večera).
- [x] **Zero Trust Arhitektura**:
    - [x] RBAC enforcement (Levels 1-6).
    - [x] Deep Archive for immutable audit logs.
    - [x] AI Gateways for sensitive action confirmation.

- [x] **AI-Guided Confirmation**:
    - [x] AI Assistant should provide a confirmation dialog before sensitive actions like deletion or critical configuration changes.
- [x] **Vercel Environment Setup (CRITICAL)**:
    - [x] Wait for current build to finish and verify app loads (White Screen fix). ✅
    - [x] **Action Required**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Project Settings -> Environment Variables to enable real database connection in production. ✅
- [x] **Production Routing & Deep Linking**:
    - [x] Implement robust routing logic (React Router) for the final production version. ✅
    - [x] Goal: Ensure every module and item has a unique, shareable URL (e.g., `.../app/reservations/list?id=101`), matching professional ERP standards. ✅


## Completed Tasks
- [x] Initial List Creation
- [x] **Navy Dark Mode Theme**: Implemented a lighter navy blue variant.
- [x] **Prism Mode (Sarena slova)**: Added a colorful syntax-like toggle for all themes.
- [x] **Contrast & Legibility Overhaul**: Fixed hardcoded colors and improved readability across all themes.
- [x] **Vercel Build Fix**: Resolved TypeScript errors blocking deployment.
- [x] **Deployment Status Indicators**: Added GitHub/Vercel status badges to the Dashboard.

## Future Architecture Ideas (Reference)

### Human-in-the-Loop (HITL) Agentic Workflow Specification
*Sačuvano za kasniju implementaciju*

**Opcija 1: JSON Prompt (Structured)**
```json
{
  "role": "Senior Python Architect & AI Engineer",
  "project_context": {
    "domain": "Tourist Agency ERP",
    "tech_stack": "React/Vite Frontend + Supabase Backend",
    "current_status": "Existing functional prototype"
  },
  "request": {
    "goal": "Implement Human-in-the-Loop (HITL) Agentic Workflow",
    "question": "Can we refactor the current codebase to support an approval mechanism for AI actions?",
    "specific_requirements": [
      {
        "component": "State Management",
        "description": "Introduce a 'pending_tool_call' variable in the app state to hold the JSON payload from the LLM before execution."
      },
      {
        "component": "UI Layer",
        "description": "Add a conditional 'Approval Card' component that renders only when 'pending_tool_call' is not null. Must have [APPROVE] and [DENY] buttons."
      },
      {
        "component": "Logic Flow",
        "description": "Split the AI logic into two steps: 1. Reasoning (generate JSON), 2. Execution (run function only after user clicks APPROVE)."
      }
    ]
  },
  "instruction": "Please analyze my current code structure. Is it possible to introduce this 'Pause-for-Approval' flow? Show me a pseudo-code example."
}
```

**Opcija 2: Tekstualni Prompt (Chat)**
"Uloga: Ponašaj se kao Senior Arhitekta.
Kontekst: Pravim ERP aplikaciju za turističku agenciju.
Zahtev: Želim da implementiram 'Human-in-the-Loop' (HITL) arhitekturu za agente.

Tehnički detalji koje želim:
1. **Pending State**: Umesto da AI odmah izvrši akciju (npr. rezervaciju), želim da aplikacija presretne taj zahtev i sačuva ga u privremenu varijablu (npr. `pending_action`).
2. **UI Odobrenje**: Želim da se korisniku pojavi 'Kartica za potvrdu' sa dugmićima 'ODOBRI' i 'ODBIJ'.
3. **Izvršenje**: Funkcija (npr. upis u bazu) se poziva TEK kada ja kliknem 'ODOBRI'."
