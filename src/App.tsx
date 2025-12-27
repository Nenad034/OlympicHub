import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Mail,
  Settings as SettingsIcon,
  Search,
  ChevronRight,
  Package,
  Building2,
  Zap,
  Sun,
  Moon,
  ShieldAlert,
  Brain,
  Users,
  Truck,
  Coffee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MarsAnalysis from './modules/production/MarsAnalysis';
import ProductionHub from './modules/production/ProductionHub';
import SuppliersModule from './modules/production/Suppliers';
import CustomersModule from './modules/production/Customers';
import SettingsModule from './modules/system/Settings';
import GeneralAIChat from './components/GeneralAIChat';
import { translations, type Language } from './translations';
import { useConfig } from './context/ConfigContext';

// Types
interface AppConfig {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  category: string;
  color: string;
  badge?: string;
  minLevel: number;
}

const apps: AppConfig[] = [
  { id: 'mars-analysis', name: 'Mars ERP Analitika', desc: 'Finansijska i operativna analiza procesa.', icon: <Database size={24} />, category: 'production', color: 'var(--gradient-blue)', badge: 'Live', minLevel: 1 },
  { id: 'production-hub', name: 'Upravljanje Produkcijom', desc: 'Smeštaj, putovanja, transferi i paketi.', icon: <Package size={24} />, category: 'production', color: 'var(--gradient-green)', badge: 'Novo', minLevel: 1 },
  { id: 'suppliers', name: 'Dobavljači', desc: 'Upravljanje bazom dobavljača.', icon: <Database size={24} />, category: 'production', color: 'var(--gradient-orange)', minLevel: 1 },
  { id: 'customers', name: 'Kupci', desc: 'Baza B2C i B2B kupaca.', icon: <Users size={24} />, category: 'production', color: 'var(--gradient-purple)', minLevel: 1 },
  { id: 'price-generator', name: 'Generator Cenovnika', desc: 'Kreiranje cenovnika i import u Mars.', icon: <BarChart3 size={24} />, category: 'production', color: 'var(--gradient-green)', minLevel: 3 },
  { id: 'portfolio', name: 'Naša Ponuda', desc: 'Upravljanje bazom hotela i prevoza.', icon: <Building2 size={24} />, category: 'sales', color: 'var(--gradient-purple)', minLevel: 2 },
  { id: 'marketing-ses', name: 'Amazon SES Marketing', desc: 'Slanje newslettera subagentima.', icon: <Mail size={24} />, category: 'marketing', color: 'var(--gradient-orange)', badge: 'Novi', minLevel: 4 }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isLoading } = useConfig();

  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'sr');
  const [userLevel, setUserLevel] = useState<number>(5);

  const [analysisData, setAnalysisData] = useState<any[]>([]);

  const t = translations[lang];

  useEffect(() => {
    let themeClass = '';
    if (theme === 'light') themeClass = 'light-theme';
    else if (theme === 'cream') themeClass = 'cream-theme';
    document.body.className = themeClass;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ color: 'var(--accent)' }}>
          <Zap size={48} />
        </motion.div>
      </div>
    );
  }

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && userLevel >= app.minLevel;
  });

  const getUserRights = (minLevel: number) => {
    if (userLevel >= minLevel + 2 || userLevel === 5) return t.editView;
    return t.viewOnly;
  };

  return (
    <div className="hub-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src="/logo.jpg" alt="Olympic Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
          <span className="brand-text">Olympic Hub</span>
        </div>

        <nav className="nav-section">
          <div className="nav-group">
            <h3 className="nav-label">Main</h3>
            <div className={`nav-item ${(activeTab === 'dashboard' && !activeModule) ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setActiveModule(null); }}>
              <LayoutDashboard size={20} /> {t.dashboard}
            </div>
            <div className={`nav-item ${isChatOpen ? 'active' : ''}`} onClick={() => setIsChatOpen(true)}>
              <Brain size={20} color="var(--accent)" /> AI Chat
            </div>
          </div>

          <div className="nav-group">
            <h3 className="nav-label">{t.sectors}</h3>
            <div className={`nav-item ${activeTab === 'prod' ? 'active' : ''}`} onClick={() => { setActiveTab('prod'); setActiveModule('production-hub'); }}>
              <Package size={20} /> {t.production}
            </div>
            <div className={`nav-item ${activeModule === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveModule('suppliers')}>
              <Truck size={20} /> Dobavljači
            </div>
            <div className={`nav-item ${activeModule === 'customers' ? 'active' : ''}`} onClick={() => setActiveModule('customers')}>
              <Users size={20} /> Kupci
            </div>
          </div>

          <div className="nav-group" style={{ marginTop: 'auto', paddingBottom: '10px' }}>
            <h3 className="nav-label">{t.system}</h3>
            <div className={`nav-item ${activeModule === 'settings' ? 'active' : ''}`} onClick={() => { setActiveModule('settings'); setActiveTab('settings'); }}>
              <SettingsIcon size={20} /> {t.settings}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="top-bar">
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '100px', padding: '12px 20px 12px 48px', color: 'var(--text-primary)', width: '400px', fontSize: '14px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--glass-bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <button onClick={() => setLang('sr')} style={{ padding: '6px 10px', border: 'none', background: lang === 'sr' ? 'var(--bg-card)' : 'transparent', borderRadius: '6px', color: lang === 'sr' ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>SRB</button>
              <button onClick={() => setLang('en')} style={{ padding: '6px 10px', border: 'none', background: lang === 'en' ? 'var(--bg-card)' : 'transparent', borderRadius: '6px', color: lang === 'en' ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>ENG</button>
            </div>

            <button
              onClick={() => {
                if (theme === 'dark') setTheme('light');
                else if (theme === 'light') setTheme('cream');
                else setTheme('dark');
              }}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex' }}
            >
              {theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Coffee size={18} />}
            </button>
            <div className="user-profile">
              <div className="avatar"></div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Nenad (Lvl {userLevel})</div>
            </div>
          </div>
        </div>

        <section className="fade-in">
          <AnimatePresence mode="wait">
            {activeModule === 'mars-analysis' ? (
              <MarsAnalysis key="mars" onBack={() => setActiveModule(null)} lang={lang} userLevel={userLevel} onOpenChat={() => setIsChatOpen(true)} onDataUpdate={setAnalysisData} />
            ) : activeModule === 'production-hub' ? (
              <ProductionHub key="prod-hub" onBack={() => setActiveModule(null)} lang={lang} userLevel={userLevel} />
            ) : activeModule === 'suppliers' ? (
              <SuppliersModule key="suppliers" onBack={() => setActiveModule(null)} />
            ) : activeModule === 'customers' ? (
              <CustomersModule key="customers" onBack={() => setActiveModule(null)} />
            ) : activeModule === 'settings' ? (
              <SettingsModule key="settings" onBack={() => setActiveModule(null)} lang={lang} userLevel={userLevel} setUserLevel={setUserLevel} />
            ) : (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{t.welcomeBack}</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>{t.hubDesc}</p>
                </div>

                <div className="dashboard-grid">
                  {filteredApps.map((app, idx) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="app-card"
                      onClick={() => (app.id === 'mars-analysis' || app.id === 'production-hub' || app.id === 'suppliers' || app.id === 'customers') && setActiveModule(app.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="card-icon" style={{ background: app.color }}>{app.icon}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          {app.badge && <span className="badge" style={{ position: 'static', background: 'rgba(63, 185, 80, 0.1)', color: '#3fb950' }}>{app.badge}</span>}
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={10} /> {getUserRights(app.minLevel)}</span>
                        </div>
                      </div>
                      <h3 className="card-title">{app.name}</h3>
                      <p className="card-desc">{app.desc}</p>
                      <div className="card-footer" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: 'var(--accent)' }}>
                        {t.openModule} <ChevronRight size={14} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '600' }}>{t.recentActivity}</h3>
                      <span style={{ fontSize: '13px', color: 'var(--accent)', cursor: 'pointer' }}>{t.viewAll}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div onClick={() => setIsChatOpen(true)} style={{ background: 'var(--gradient-blue)', borderRadius: '24px', padding: '24px', color: '#fff', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{t.aiAssistant}</h3>
                      <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '20px' }}>{t.aiDesc}</p>
                      <button onClick={(e) => { e.stopPropagation(); setIsChatOpen(true); }} style={{ background: '#fff', color: '#005cc5', border: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>{t.startChat}</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <GeneralAIChat
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            lang={lang} userLevel={userLevel}
            context={activeModule || "Dashboard"}
            analysisData={analysisData}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
