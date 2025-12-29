import React, { useEffect } from 'react';
import {
    Search,
    Github,
    Globe,
    LayoutDashboard,
    Settings as SettingsIcon,
    Sun,
    Moon,
    Zap,
    Coffee,
    Sparkles,
} from 'lucide-react';
import { useThemeStore, useAppStore, useAuthStore } from '../../stores';
import { translations } from '../../translations';

const TopBar: React.FC = () => {
    const {
        theme,
        cycleTheme,
        isPrism,
        togglePrism,
        lang,
        setLang,
        navMode,
        toggleNavMode
    } = useThemeStore();
    const { appStatus, setAppStatus, searchQuery, setSearchQuery } = useAppStore();
    const { userLevel, userName } = useAuthStore();
    const t = translations[lang];

    useEffect(() => {
        fetch('/app-status.json')
            .then(res => res.json())
            .then(data => setAppStatus(data))
            .catch(err => console.error("Error fetching app status:", err));
    }, [setAppStatus]);

    const getThemeIcon = () => {
        switch (theme) {
            case 'dark': return <Moon size={18} />;
            case 'navy': return <Zap size={18} color="#38bdf8" />;
            case 'light': return <Sun size={18} />;
            case 'cream': return <Coffee size={18} />;
            default: return <Moon size={18} />;
        }
    };

    const getThemeLabel = () => {
        return theme.charAt(0).toUpperCase() + theme.slice(1);
    };

    return (
        <div className="top-bar">
            {/* Show search only in sidebar mode */}
            {navMode === 'sidebar' && (
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search
                        size={20}
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)'
                        }}
                    />
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

            {/* Status Indicators */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginLeft: '20px' }}>
                <div
                    className={`status-indicator github ${!appStatus.gitPushed ? 'error' : ''}`}
                    title={appStatus.gitPushed ? "Git Status: Synced" : "Git Status: Unpushed Changes"}
                >
                    <Github size={14} />
                    <span>{appStatus.gitPushed ? 'Git pushed' : 'No pushed'}</span>
                </div>
                <div
                    className={`status-indicator vercel ${!appStatus.vercelLive ? 'error' : ''}`}
                    title={appStatus.vercelLive ? "Vercel Status: Live" : "Vercel Status: Build Failed"}
                >
                    <Globe size={14} />
                    <span>{appStatus.vercelLive ? 'Vercel Live' : 'No live'}</span>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginLeft: 'auto' }}>
                {/* Nav Mode Toggle */}
                <button
                    className="btn-glass"
                    onClick={toggleNavMode}
                    title="Toggle Nav Layout"
                >
                    {navMode === 'sidebar' ? <LayoutDashboard size={18} /> : <SettingsIcon size={18} />}
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>
                        {navMode === 'sidebar' ? 'Horizontal Menu' : 'Sidebar Menu'}
                    </span>
                </button>

                {/* Language Toggle */}
                <div style={{
                    display: 'flex',
                    background: 'var(--glass-bg)',
                    padding: '4px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)'
                }}>
                    <button
                        onClick={() => setLang('sr')}
                        style={{
                            padding: '6px 10px',
                            border: 'none',
                            background: lang === 'sr' ? 'var(--bg-card)' : 'transparent',
                            borderRadius: '6px',
                            color: lang === 'sr' ? 'var(--accent)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                        }}
                    >
                        SRB
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        style={{
                            padding: '6px 10px',
                            border: 'none',
                            background: lang === 'en' ? 'var(--bg-card)' : 'transparent',
                            borderRadius: '6px',
                            color: lang === 'en' ? 'var(--accent)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                        }}
                    >
                        ENG
                    </button>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={cycleTheme}
                    style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: '12px',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center'
                    }}
                >
                    {getThemeIcon()}
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>
                        {getThemeLabel()}
                    </span>
                </button>

                {/* Prism Toggle */}
                <button
                    onClick={togglePrism}
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

                {/* User Profile */}
                <div className="user-profile">
                    <div className="avatar"></div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>
                        {userName} (Lvl {userLevel})
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
