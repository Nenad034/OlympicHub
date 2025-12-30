import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import {
    Database,
    BarChart3,
    Mail,
    Package,
    Building2,
    Users,
    ChevronRight,
    Sword,
    ShieldAlert,
    Castle,
    ShieldCheck,
    Shield,
    Lock,
    Cpu
} from 'lucide-react';
import { useThemeStore, useAppStore, useAuthStore } from '../stores';
import { translations } from '../translations';
import DailyWisdom from '../components/DailyWisdom';

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
    path: string;
}

const apps: AppConfig[] = [
    { id: 'mars-analysis', name: 'Mars ERP Analitika', desc: 'Finansijska i operativna analiza procesa.', icon: <Database size={24} />, category: 'production', color: 'var(--gradient-blue)', badge: 'Live', minLevel: 1, path: '/mars-analysis' },
    { id: 'production-hub', name: 'Upravljanje Produkcijom', desc: 'Smeštaj, putovanja, transferi i paketi.', icon: <Package size={24} />, category: 'production', color: 'var(--gradient-green)', badge: 'Novo', minLevel: 1, path: '/production' },
    { id: 'suppliers', name: 'Dobavljači', desc: 'Upravljanje bazom dobavljača.', icon: <Database size={24} />, category: 'production', color: 'var(--gradient-orange)', minLevel: 1, path: '/suppliers' },
    { id: 'customers', name: 'Kupci', desc: 'Baza B2C i B2B kupaca.', icon: <Users size={24} />, category: 'production', color: 'var(--gradient-purple)', minLevel: 1, path: '/customers' },
    { id: 'price-generator', name: 'Generator Cenovnika', desc: 'Kreiranje cenovnika i import u Mars.', icon: <BarChart3 size={24} />, category: 'production', color: 'var(--gradient-green)', minLevel: 3, path: '/pricing-intelligence' },
    { id: 'portfolio', name: 'Naša Ponuda', desc: 'Upravljanje bazom hotela i prevoza.', icon: <Building2 size={24} />, category: 'sales', color: 'var(--gradient-purple)', minLevel: 2, path: '/portfolio' },
    { id: 'marketing-ses', name: 'Amazon SES Marketing', desc: 'Slanje newslettera subagentima.', icon: <Mail size={24} />, category: 'marketing', color: 'var(--gradient-orange)', badge: 'Novi', minLevel: 4, path: '/marketing' },
    { id: 'olympic-mail', name: 'Olympic Mail', desc: 'Centralizovano upravljanje email nalozima i komunikacijom.', icon: <Mail size={24} />, category: 'communication', color: 'var(--gradient-blue)', badge: 'Live', minLevel: 1, path: '/mail' },
    { id: 'katana', name: 'Katana (To-Do)', desc: 'Efikasno upravljanje procesima i zadacima.', icon: <Sword size={24} />, category: 'system', color: 'var(--gradient-blue)', badge: 'Musashi', minLevel: 1, path: '/katana' },
    { id: 'deep-archive', name: 'Duboka Arhiva', desc: 'Centralni registar svih obrisanih i promenjenih stavki.', icon: <ShieldAlert size={24} />, category: 'system', color: 'var(--gradient-purple)', minLevel: 6, path: '/deep-archive' },
    { id: 'fortress', name: 'Fortress Security', desc: 'Command Center za nadzor i bezbednost koda.', icon: <Castle size={24} />, category: 'system', color: 'var(--gradient-purple)', badge: 'Master', minLevel: 6, path: '/fortress' }
];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { lang } = useThemeStore();
    const { searchQuery } = useAppStore();
    const { userLevel } = useAuthStore();
    const t = translations[lang];

    // Draggable Dashboard Apps
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

    const filteredApps = userApps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch && userLevel >= app.minLevel;
    });

    const getUserRights = (minLevel: number) => {
        if (userLevel >= minLevel + 2 || userLevel === 5) return t.editView;
        return t.viewOnly;
    };

    const handleAppClick = (app: AppConfig) => {
        navigate(app.path);
    };

    return (
        <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                    {t.welcomeBack}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>{t.hubDesc}</p>
            </div>

            {/* Apps Grid */}
            {searchQuery ? (
                <div className="dashboard-grid">
                    {filteredApps.map((app, idx) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="module-card"
                            onClick={() => handleAppClick(app)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="card-icon" style={{ background: app.color }}>{app.icon}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    {app.badge && (
                                        <span className="badge" style={{ position: 'static', background: 'rgba(63, 185, 80, 0.1)', color: '#3fb950' }}>
                                            {app.badge}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <ShieldAlert size={10} /> {getUserRights(app.minLevel)}
                                    </span>
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
                    {userApps
                        .filter(app => userLevel >= app.minLevel)
                        .map((app, idx) => (
                            <Reorder.Item
                                key={app.id}
                                value={app}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="module-card draggable"
                                onClick={() => handleAppClick(app)}
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
                                        {app.badge && (
                                            <span className="badge" style={{ position: 'static', background: 'rgba(63, 185, 80, 0.1)', color: '#3fb950' }}>
                                                {app.badge}
                                            </span>
                                        )}
                                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ShieldAlert size={10} /> {getUserRights(app.minLevel)}
                                        </span>
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

            {/* Daily Wisdom */}
            <DailyWisdom />

            {/* Security Promise Section */}
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

                    <div className="security-promise-grid">
                        <SecurityFeature
                            icon={<Lock size={20} color="var(--accent)" />}
                            bgColor="rgba(0, 92, 197, 0.1)"
                            title="Enkripcija bankarskog nivoa"
                            description="Svi vaši podaci (ime, pasoš) su šifrovani u našoj bazi koristeći AES-256 standard."
                        />
                        <SecurityFeature
                            icon={<Shield size={20} color="#22c55e" />}
                            bgColor="rgba(34, 197, 94, 0.1)"
                            title="Deep Vault Arhiviranje"
                            description="Podaci stariji od 90 dana se automatski zaključavaju u Master Vault, dostupni samo najvišem nivou autorizacije."
                        />
                        <SecurityFeature
                            icon={<Shield size={20} color="#f59e0b" />}
                            bgColor="rgba(245, 158, 11, 0.1)"
                            title="Sigurna plaćanja"
                            description="Ne čuvamo brojeve kartica. transakcije idu putem sigurnih tokena globalnih provajdera."
                        />
                        <SecurityFeature
                            icon={<Cpu size={20} color="var(--accent)" />}
                            bgColor="rgba(0, 92, 197, 0.1)"
                            title="Bezbedne API konekcije"
                            description="Komunikacija sa partnerima se vrši kroz strogo kontrolisane i šifrovane kanale."
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Security Feature Component
interface SecurityFeatureProps {
    icon: React.ReactNode;
    bgColor: string;
    title: string;
    description: string;
}

const SecurityFeature: React.FC<SecurityFeatureProps> = ({ icon, bgColor, title, description }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{
            background: bgColor,
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{title}</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{description}</p>
    </div>
);

export default Dashboard;
