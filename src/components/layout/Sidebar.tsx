import React from 'react';
import {
    LayoutDashboard,
    Package,
    Truck,
    Users,
    Settings as SettingsIcon,
    ChevronRight,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { GeometricBrain } from '../icons/GeometricBrain';
import { useThemeStore, useAppStore } from '../../stores';
import { translations } from '../../translations';

const Sidebar: React.FC = () => {
    const { lang, isSidebarCollapsed, toggleSidebar } = useThemeStore();
    const { setChatOpen } = useAppStore();
    const t = translations[lang];

    const navItemClass = (isActive: boolean) =>
        `nav-item ${isActive ? 'active' : ''}`;

    return (
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container" style={{ background: 'transparent', boxShadow: 'none' }}>
                    <img
                        src="/logo.jpg"
                        alt="Olympic Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                    />
                </div>
                {!isSidebarCollapsed && <span className="brand-text">Olympic Hub</span>}
                <button className="collapse-toggle" onClick={toggleSidebar}>
                    {isSidebarCollapsed ? (
                        <ChevronRight size={16} />
                    ) : (
                        <div style={{ transform: 'rotate(180deg)' }}>
                            <ChevronRight size={16} />
                        </div>
                    )}
                </button>
            </div>

            <nav className="nav-section">
                <div className="nav-group">
                    <h3 className="nav-label">{!isSidebarCollapsed && 'Main'}</h3>
                    <NavLink
                        to="/"
                        className={({ isActive }) => navItemClass(isActive)}
                        title={t.dashboard}
                        end
                    >
                        <LayoutDashboard size={20} /> {!isSidebarCollapsed && t.dashboard}
                    </NavLink>
                    <div
                        className="nav-item"
                        title="AI Chat"
                        onClick={() => setChatOpen(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        <GeometricBrain size={30} color="#FFD700" /> {!isSidebarCollapsed && 'AI Chat'}
                    </div>
                </div>

                <div className="nav-group">
                    <h3 className="nav-label">{!isSidebarCollapsed && t.sectors}</h3>
                    <NavLink
                        to="/production"
                        className={({ isActive }) => navItemClass(isActive)}
                        title={t.production}
                    >
                        <Package size={20} /> {!isSidebarCollapsed && t.production}
                    </NavLink>
                    <NavLink
                        to="/suppliers"
                        className={({ isActive }) => navItemClass(isActive)}
                        title="Dobavljači"
                    >
                        <Truck size={20} /> {!isSidebarCollapsed && 'Dobavljači'}
                    </NavLink>
                    <NavLink
                        to="/customers"
                        className={({ isActive }) => navItemClass(isActive)}
                        title="Kupci"
                    >
                        <Users size={20} /> {!isSidebarCollapsed && 'Kupci'}
                    </NavLink>
                </div>

                <div className="nav-group" style={{ marginTop: 'auto', paddingBottom: '10px' }}>
                    <h3 className="nav-label">{!isSidebarCollapsed && t.system}</h3>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => navItemClass(isActive)}
                        title={t.settings}
                    >
                        <SettingsIcon size={20} /> {!isSidebarCollapsed && t.settings}
                    </NavLink>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
