# 🏔️ Olympic Hub

**Kompletna poslovna platforma za turističke agencije** sa AI asistentom, email sistemom, i production modulima.

## ✨ Ključne Funkcionalnosti

### 📧 Email Sistem (NOVO!)
- **SMTP/IMAP Integration** - Slanje i primanje email-ova
- **Multi-Account Support** - Upravljanje sa više email naloga
- **Outlook-Style UI** - Profesionalan email klijent
- **AI Assistant** - Automatsko generisanje odgovora
- **Master View** - Admin pristup svim nalozima

👉 **[Quick Start Email](./docs/QUICKSTART_EMAIL.md)** | **[Detaljna Dokumentacija](./docs/EMAIL_SETUP.md)**

### 🎯 Production Moduli

- **Production Hub** - Centralno upravljanje proizvodnjom
- **Mars Analysis** - AI analiza podataka sa Mars sistema
- **Pricing Intelligence** - Napredni sistem za cenovnike
- **Tour Wizard** - Kreiranje i upravljanje turističkim aranžmanima
- **Deep Archive** - Arhiviranje i restore podataka
- **System Pulse** - Real-time monitoring infrastrukture

### 🤖 AI Asistent

- **Gemini Integration** - Google Gemini AI za analizu
- **Smart Responses** - Automatsko generisanje email odgovora
- **Data Analysis** - AI analiza rezervacija i prodaje
- **Price Suggestions** - AI predlozi za cene

### 🎨 Moderni UI/UX

- **VSCode-Style Layout** - Profesionalan developer experience
- **Multi-Theme Support** - Dark, Light, Cream, Navy + Rainbow modes
- **Responsive Design** - Optimizovano za sve uređaje
- **Glassmorphism** - Moderni vizuelni efekti

## 🚀 Quick Start

### Instalacija

```bash
# Clone repository
git clone https://github.com/Nenad034/olympichub034.git
cd olympichub034

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Dodajte Supabase i Gemini API keys u .env

# Start development server
npm run dev
```

### Email Setup (5 minuta)

```bash
# 1. Deploy Edge Functions
cd supabase/functions
.\deploy-functions.ps1  # Windows
# ili
./deploy-functions.sh   # Linux/Mac

# 2. Otvorite Olympic Mail
# http://localhost:5173/mail

# 3. Podesite nalog preko Settings dugmeta
```

📖 **[Detaljne Instrukcije](./docs/QUICKSTART_EMAIL.md)**

## 📁 Struktura Projekta

```
olympichub034/
├── src/
│   ├── components/       # Reusable komponente
│   │   ├── email/       # Email komponente
│   │   ├── layout/      # Layout komponente
│   │   └── vscode/      # VSCode-style UI
│   ├── modules/         # Glavni moduli
│   │   ├── mail/        # Email sistem
│   │   ├── pricing/     # Pricing Intelligence
│   │   ├── production/  # Production Hub
│   │   └── system/      # System moduli
│   ├── services/        # Backend servisi
│   │   └── emailService.ts
│   ├── stores/          # Zustand state management
│   └── pages/           # React Router stranice
├── supabase/
│   ├── functions/       # Edge Functions
│   │   ├── send-email/
│   │   ├── fetch-emails/
│   │   └── test-email-connection/
│   └── migrations/      # Database migracije
└── docs/               # Dokumentacija
```

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Zustand
- **Routing**: React Router v7
- **Styling**: CSS Variables + Modern CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Google Gemini API
- **Email**: SMTP/IMAP via Deno Edge Functions

## 📚 Dokumentacija

- **[Email Setup Guide](./docs/EMAIL_SETUP.md)** - Kompletno uputstvo za email sistem
- **[Quick Start Email](./docs/QUICKSTART_EMAIL.md)** - Brzi start za email
- **[Implementation Summary](./docs/EMAIL_IMPLEMENTATION_SUMMARY.md)** - Detaljan pregled implementacije
- **[Edge Functions README](./supabase/functions/README.md)** - Deployment guide
- **[Architecture](./docs/ARCHITECTURE.md)** - Arhitektura sistema
- **[Components](./docs/COMPONENTS.md)** - Dokumentacija komponenti
- **[API](./docs/API.md)** - API dokumentacija
- **[Security](./docs/SECURITY.md)** - Sigurnosne smernice
- **[TODO List](./TODO_LIST.md)** - Planirane funkcionalnosti

## 🔧 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Supabase Edge Functions

```bash
# Deploy all functions
cd supabase/functions
.\deploy-functions.ps1

# Deploy single function
supabase functions deploy send-email

# View logs
supabase functions logs send-email --follow

# Test locally
supabase functions serve
```

## 🌟 Najnovije Izmene

### v2.0.0 - Email Sistem (30.12.2024)
- ✅ SMTP email sending
- ✅ IMAP email fetching
- ✅ Email configuration modal
- ✅ Multi-account support
- ✅ Connection testing
- ✅ Supabase Edge Functions
- ✅ Deployment scripts

### v1.5.0 - Pricing Intelligence
- ✅ Advanced pricing module
- ✅ VSCode-style code view
- ✅ Supabase persistence
- ✅ AI price suggestions

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details

## 👥 Authors

- **Nenad** - Initial work and development

## 🙏 Acknowledgments

- Google Gemini AI
- Supabase
- React Team
- Vite Team

---

**Made with ❤️ for Olympic Travel**
