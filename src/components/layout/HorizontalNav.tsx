import React from 'react';
import {
    LayoutDashboard,
    Package,
    Truck,
    Users,
    Settings as SettingsIcon,
    Search,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useThemeStore, useAppStore } from '../../stores';
import { translations } from '../../translations';

const HorizontalNav: React.FC = () => {
    const { lang } = useThemeStore();
    const { searchQuery, setSearchQuery } = useAppStore();
    const t = translations[lang];

    const navItemClass = (isActive: boolean) =>
        `h-nav-item ${isActive ? 'active' : ''}`;

    return (
        <div className="horizontal-nav">
            <div
                className="logo-container sm"
                style={{ background: 'transparent', boxShadow: 'none', width: '48px', height: '48px' }}
            >
                <img
                    src="/logo.jpg"
                    alt="Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                />
            </div>

            <div className="nav-horizontal-items">
                <NavLink
                    to="/"
                    className={({ isActive }) => navItemClass(isActive)}
                    end
                >
                    <LayoutDashboard size={18} /> {t.dashboard}
                </NavLink>
                <NavLink
                    to="/production"
                    className={({ isActive }) => navItemClass(isActive)}
                >
                    <Package size={18} /> {t.production}
                </NavLink>
                <NavLink
                    to="/suppliers"
                    className={({ isActive }) => navItemClass(isActive)}
                >
                    <Truck size={18} /> Dobavljači
                </NavLink>
                <NavLink
                    to="/customers"
                    className={({ isActive }) => navItemClass(isActive)}
                >
                    <Users size={18} /> Kupci
                </NavLink>
                <NavLink
                    to="/settings"
                    className={({ isActive }) => navItemClass(isActive)}
                >
                    <SettingsIcon size={18} /> {t.settings}
                </NavLink>
            </div>

            {/* Search in Horizontal Nav */}
            <div style={{ position: 'relative', marginLeft: 'auto' }}>
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
                    style={{ width: '300px', padding: '10px 20px 10px 48px' }}
                />
            </div>
        </div>
    );
};

export default HorizontalNav;
