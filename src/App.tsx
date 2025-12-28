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
  Users,
  Truck,
  Coffee,
  Sparkles,
  Github,
  Globe,
  Sword,
  ShieldAlert,
  Castle,
  ShieldCheck,
  Shield,
  Lock,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import MarsAnalysis from './modules/production/MarsAnalysis';
import ProductionHub from './modules/production/ProductionHub';
import SuppliersModule from './modules/production/Suppliers';
import CustomersModule from './modules/production/Customers';
import SettingsModule from './modules/system/Settings';
import DeepArchive from './modules/system/DeepArchive';
import Katana from './modules/system/Katana';
import Fortress from './modules/system/Fortress';
import GeneralAIChat from './components/GeneralAIChat';
import DailyWisdom from './components/DailyWisdom';
import { GeometricBrain } from './components/icons/GeometricBrain';
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
  { id: 'marketing-ses', name: 'Amazon SES Marketing', desc: 'Slanje newslettera subagentima.', icon: <Mail size={24} />, category: 'marketing', color: 'var(--gradient-orange)', badge: 'Novi', minLevel: 4 },
  { id: 'katana', name: 'Katana (To-Do)', desc: 'Efikasno upravljanje procesima i zadacima.', icon: <Sword size={24} />, category: 'system', color: 'var(--gradient-blue)', badge: 'Musashi', minLevel: 1 },
  { id: 'deep-archive', name: 'Duboka Arhiva', desc: 'Centralni registar svih obrisanih i promenjenih stavki.', icon: <ShieldAlert size={24} />, category: 'system', color: 'var(--gradient-purple)', minLevel: 6 },
  { id: 'fortress', name: 'Fortress Security', desc: 'Command Center za nadzor i bezbednost koda.', icon: <Castle size={24} />, category: 'system', color: 'var(--gradient-purple)', badge: 'Master', minLevel: 6 }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isPrism, setIsPrism] = useState(() => localStorage.getItem('isPrism') === 'true');
  const [appStatus, setAppStatus] = useState({ gitPushed: true, vercelLive: true });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isLoading } = useConfig();

  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'sr');
  const [userLevel, setUserLevel] = useState<number>(6);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [navMode, setNavMode] = useState<'sidebar' | 'horizontal'>(() => (localStorage.getItem('nav-mode') as any) || 'sidebar');

  const [analysisData, setAnalysisData] = useState<any[]>([]);

  // Draggable Dashboad Apps
  const [userApps, setUserApps] = useState<AppConfig[]>(() => {
    const saved = localStorage.getItem('hub-apps-order');
    if (saved) {
      try {
        const orderIds = JSON.parse(saved) as string[];
        return [...apps].sort((a, b) => orderIds.indexOf(a.id) - orderIds.indexOf(b.id));
      } catch (e) {
        return apps;
      }
    }
    return apps;
  });

  useEffect(() => {
    localStorage.setItem('hub-apps-order', JSON.stringify(userApps.map(a => a.id)));
  }, [userApps]);

  const t = translations[lang];

  useEffect(() => {
    let themeClass = '';
    if (theme === 'light') themeClass = 'light-theme';
    else if (theme === 'cream') themeClass = 'cream-theme';
    else if (theme === 'navy') themeClass = 'navy-theme';

    // Apply prism-mode independently
    if (isPrism) {
      themeClass += ' prism-mode';
    }

    document.body.className = themeClass.trim();
    localStorage.setItem('theme', theme);
    localStorage.setItem('isPrism', String(isPrism));
  }, [theme, isPrism]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('nav-mode', navMode);
  }, [navMode]);

  useEffect(() => {
    fetch('/app-status.json')
      .then(res => res.json())
      .then(data => setAppStatus(data))
      .catch(err => console.error("Error fetching app status:", err));
  }, []);

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ color: 'var(--accent)' }}>
          <Zap size={48} />
        </motion.div>
      </div>
    );
  }

  const filteredApps = userApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && userLevel >= app.minLevel;
  });

  const getUserRights = (minLevel: number) => {
    if (userLevel >= minLevel + 2 || userLevel === 5) return t.editView;
    return t.viewOnly;
  };

  return (
    <div className={`hub-container ${navMode}-mode`}>
      {/* Sidebar - only if navMode is sidebar */}
      {navMode === 'sidebar' && (
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="logo-container" style={{ background: 'transparent', boxShadow: 'none' }}>
              <img src="/logo.jpg" alt="Olympic Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
            {!isSidebarCollapsed && <span className="brand-text">Olympic Hub</span>}
            <button className="collapse-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <div style={{ transform: 'rotate(180deg)' }}><ChevronRight size={16} /></div>}
            </button>
          </div>

          <nav className="nav-section">
            <div className="nav-group">
              <h3 className="nav-label">{!isSidebarCollapsed && 'Main'}</h3>
              <div className={`nav-item ${(activeTab === 'dashboard' && !activeModule) ? 'active' : ''}`} title={t.dashboard} onClick={() => { setActiveTab('dashboard'); setActiveModule(null); }}>
                <LayoutDashboard size={20} /> {!isSidebarCollapsed && t.dashboard}
              </div>
              <div className={`nav-item ${isChatOpen ? 'active' : ''}`} title="AI Chat" onClick={() => setIsChatOpen(true)}>
                <GeometricBrain size={30} color="#FFD700" /> {!isSidebarCollapsed && 'AI Chat'}
              </div>
            </div>

            <div className="nav-group">
              <h3 className="nav-label">{!isSidebarCollapsed && t.sectors}</h3>
              <div className={`nav-item ${activeTab === 'prod' ? 'active' : ''}`} title={t.production} onClick={() => { setActiveTab('prod'); setActiveModule('production-hub'); }}>
                <Package size={20} /> {!isSidebarCollapsed && t.production}
              </div>
              <div className={`nav-item ${activeModule === 'suppliers' ? 'active' : ''}`} title="Dobavljači" onClick={() => setActiveModule('suppliers')}>
                <Truck size={20} /> {!isSidebarCollapsed && 'Dobavljači'}
              </div>
              <div className={`nav-item ${activeModule === 'customers' ? 'active' : ''}`} title="Kupci" onClick={() => setActiveModule('customers')}>
                <Users size={20} /> {!isSidebarCollapsed && 'Kupci'}
              </div>
            </div>

            <div className="nav-group" style={{ marginTop: 'auto', paddingBottom: '10px' }}>
              <h3 className="nav-label">{!isSidebarCollapsed && t.system}</h3>
              <div className={`nav-item ${activeModule === 'settings' ? 'active' : ''}`} title={t.settings} onClick={() => { setActiveModule('settings'); setActiveTab('settings'); }}>
                <SettingsIcon size={20} /> {!isSidebarCollapsed && t.settings}
              </div>
            </div>
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {/* Horizontal Menu if enabled */}
        {navMode === 'horizontal' && (
          <div className="horizontal-nav">
            <div className="logo-container sm" style={{ background: 'transparent', boxShadow: 'none', width: '48px', height: '48px' }}>
              <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
            </div>
            <div className="nav-horizontal-items">
              <div className={`h-nav-item ${(activeTab === 'dashboard' && !activeModule) ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setActiveModule(null); }}>
                <LayoutDashboard size={18} /> {t.dashboard}
              </div>
              <div className={`h-nav-item ${activeTab === 'prod' ? 'active' : ''}`} onClick={() => { setActiveTab('prod'); setActiveModule('production-hub'); }}>
                <Package size={18} /> {t.production}
              </div>
              <div className={`h-nav-item ${activeModule === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveModule('suppliers')}>
                <Truck size={18} /> Dobavljači
              </div>
              <div className={`h-nav-item ${activeModule === 'customers' ? 'active' : ''}`} onClick={() => setActiveModule('customers')}>
                <Users size={18} /> Kupci
              </div>
              <div className={`h-nav-item ${activeModule === 'settings' ? 'active' : ''}`} onClick={() => { setActiveModule('settings'); setActiveTab('settings'); }}>
                <SettingsIcon size={18} /> {t.settings}
              </div>
            </div>

            {/* Search in Horizontal Nav */}
            <div style={{ position: 'relative', marginLeft: 'auto' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '300px', padding: '10px 20px 10px 48px' }}
              />
            </div>
          </div>
        )}

        <div className="top-bar">
          {/* Show search only in sidebar mode */}
          {navMode === 'sidebar' && (
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', maxWidth: '400px' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginLeft: '20px' }}>
            <div className={`status-indicator github ${!appStatus.gitPushed ? 'error' : ''}`} title={appStatus.gitPushed ? "Git Status: Synced" : "Git Status: Unpushed Changes"}>
              <Github size={14} /> <span>{appStatus.gitPushed ? 'Git pushed' : 'No pushed'}</span>
            </div>
            <div className={`status-indicator vercel ${!appStatus.vercelLive ? 'error' : ''}`} title={appStatus.vercelLive ? "Vercel Status: Live" : "Vercel Status: Build Failed"}>
              <Globe size={14} /> <span>{appStatus.vercelLive ? 'Vercel Live' : 'No live'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginLeft: 'auto' }}>
            <button
              className="btn-glass"
              onClick={() => setNavMode(navMode === 'sidebar' ? 'horizontal' : 'sidebar')}
              title="Toggle Nav Layout"
            >
              {navMode === 'sidebar' ? <LayoutDashboard size={18} /> : <SettingsIcon size={18} />}
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{navMode === 'sidebar' ? 'Horizontal Menu' : 'Sidebar Menu'}</span>
            </button>
            <div style={{ display: 'flex', background: 'var(--glass-bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <button onClick={() => setLang('sr')} style={{ padding: '6px 10px', border: 'none', background: lang === 'sr' ? 'var(--bg-card)' : 'transparent', borderRadius: '6px', color: lang === 'sr' ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>SRB</button>
              <button onClick={() => setLang('en')} style={{ padding: '6px 10px', border: 'none', background: lang === 'en' ? 'var(--bg-card)' : 'transparent', borderRadius: '6px', color: lang === 'en' ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>ENG</button>
            </div>

            <button
              onClick={() => {
                if (theme === 'dark') setTheme('navy');
                else if (theme === 'navy') setTheme('light');
                else if (theme === 'light') setTheme('cream');
                else setTheme('dark');
              }}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              {theme === 'dark' ? <Moon size={18} /> :
                theme === 'navy' ? <Zap size={18} color="#38bdf8" /> :
                  theme === 'light' ? <Sun size={18} /> : <Coffee size={18} />}
              <span style={{ fontSize: '11px', fontWeight: 600 }}>
                {theme === 'dark' ? 'Dark' : theme === 'navy' ? 'Navy' : theme === 'light' ? 'Light' : 'Cream'}
              </span>
            </button>

            <button
              onClick={() => setIsPrism(!isPrism)}
              className={`btn-glass ${isPrism ? 'active' : ''}`}
              style={{
                padding: '10px',
                borderRadius: '12px',
                borderColor: isPrism ? '#bb9af7' : 'var(--border)',
                boxShadow: isPrism ? '0 0 15px rgba(187, 154, 247, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              title="Sarena slova (Prism Mode)"
            >
              <Sparkles size={18} color={isPrism ? '#bb9af7' : 'var(--text-secondary)'} />
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
              <ProductionHub key="prod-hub" onBack={() => setActiveModule(null)} />
            ) : activeModule === 'suppliers' ? (
              <SuppliersModule key="suppliers" onBack={() => setActiveModule(null)} />
            ) : activeModule === 'customers' ? (
              <CustomersModule key="customers" onBack={() => setActiveModule(null)} />
            ) : activeModule === 'settings' ? (
              <SettingsModule key="settings" onBack={() => setActiveModule(null)} lang={lang} userLevel={userLevel} setUserLevel={setUserLevel} />
            ) : activeModule === 'deep-archive' ? (
              <DeepArchive key="deep-archive" onBack={() => setActiveModule(null)} lang={lang} />
            ) : activeModule === 'katana' ? (
              <Katana key="katana" onBack={() => setActiveModule(null)} />
            ) : activeModule === 'fortress' ? (
              <Fortress key="fortress" onBack={() => setActiveModule(null)} />
            ) : (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{t.welcomeBack}</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>{t.hubDesc}</p>
                </div>

                {searchQuery ? (
                  <div className="dashboard-grid">
                    {filteredApps.map((app, idx) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="module-card"
                        onClick={() => setActiveModule(app.id)}
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
                ) : (
                  <Reorder.Group
                    values={userApps}
                    onReorder={setUserApps}
                    className="dashboard-grid"
                    style={{ listStyle: 'none', padding: 0 }}
                  >
                    {userApps.map((app, idx) => (
                      <Reorder.Item
                        key={app.id}
                        value={app}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="module-card draggable"
                        onClick={() => setActiveModule(app.id)}
                        style={{ cursor: 'grab', position: 'relative' }}
                        whileDrag={{
                          scale: 1.05,
                          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
                          zIndex: 50,
                        }}
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
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}

                <DailyWisdom />

                {/* Security Promise / Trust Section */}
                <div style={{ marginTop: '40px' }}>
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '32px',
                    padding: '40px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--gradient-blue)' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                      <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Sigurnost Vaših Podataka</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Vaša privatnost je naša prodajna prednost i najviši prioritet.</p>
                      </div>
                      <ShieldCheck size={48} color="var(--accent)" style={{ opacity: 0.2 }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: 'rgba(0, 92, 197, 0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Lock size={20} color="var(--accent)" />
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Enkripcija bankarskog nivoa</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Svi vaši podaci (ime, pasoš) su šifrovani u našoj bazi koristeći AES-256 standard.</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Shield size={20} color="#22c55e" />
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Deep Vault Arhiviranje</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Podaci stariji od 90 dana se automatski zaključavaju u Master Vault, dostupni samo najvišem nivou autorizacije.</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Shield size={20} color="#f59e0b" />
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Sigurna plaćanja</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Ne čuvamo brojeve kartica. transakcije idu putem sigurnih tokena globalnih provajdera.</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: 'rgba(0, 92, 197, 0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Cpu size={20} color="var(--accent)" />
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Bezbedne API konekcije</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Komunikacija sa partnerima se vrši kroz strogo kontrolisane i šifrovane kanale.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Persistent AI Assistant - Outside Main Scroll */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, translateY: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsChatOpen(true)}
            style={{
              position: 'fixed',
              bottom: '32px',
              right: '32px',
              width: '64px',
              height: '64px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 12px 36px rgba(37, 99, 235, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 9999,
              backdropFilter: 'blur(10px)'
            }}
          >
            <GeometricBrain size={34} color="#FFD700" />
          </motion.button>
        )}
      </AnimatePresence>

      <GeneralAIChat
        isOpen={isChatOpen}
        onOpen={() => setIsChatOpen(true)}
        onClose={() => setIsChatOpen(false)}
        lang={lang} userLevel={userLevel}
        context={activeModule || "Dashboard"}
        analysisData={analysisData}
      />
    </div>
  );
}

export default App;
