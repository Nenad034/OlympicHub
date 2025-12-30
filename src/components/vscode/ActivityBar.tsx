import React from 'react';
import {
    Files,
    Search,
    GitBranch,
    Puzzle,
    Settings,
    Package,
    Database,
    Users,
    Building2,
    BarChart3,
    Mail
} from 'lucide-react';
import { useVSCodeStore, type ActivityType } from '../../stores/vscodeStore';
import { useAppStore } from '../../stores';
import { GeometricBrain } from '../icons/GeometricBrain';

interface ActivityItem {
    id: ActivityType;
    icon: React.ReactNode;
    title: string;
    badge?: number;
}

const topActivities: ActivityItem[] = [
    { id: 'explorer', icon: <Files size={24} />, title: 'Explorer' },
    { id: 'search', icon: <Search size={24} />, title: 'Search' },
    { id: 'production', icon: <Package size={24} />, title: 'Production' },
    { id: 'suppliers', icon: <Database size={24} />, title: 'Suppliers' },
    { id: 'customers', icon: <Users size={24} />, title: 'Customers' },
    { id: 'hotels', icon: <Building2 size={24} />, title: 'Hotels' },
    { id: 'analytics', icon: <BarChart3 size={24} />, title: 'Analytics' },
    { id: 'source-control', icon: <GitBranch size={24} />, title: 'Source Control', badge: 3 },
    { id: 'mail', icon: <Mail size={24} />, title: 'Mail', badge: 12 },
    { id: 'extensions', icon: <Puzzle size={24} />, title: 'Extensions' },
];

const bottomActivities: ActivityItem[] = [
    { id: 'settings', icon: <Settings size={24} />, title: 'Settings' },
];

export const ActivityBar: React.FC = () => {
    const { activeActivity, setActiveActivity, toggleSidebar, isSidebarVisible } = useVSCodeStore();
    const { setChatOpen } = useAppStore();

    const handleActivityClick = (activity: ActivityType) => {
        if (activity === activeActivity && isSidebarVisible) {
            toggleSidebar();
        } else {
            setActiveActivity(activity);
            if (!isSidebarVisible) {
                toggleSidebar();
            }
        }
    };

    return (
        <div className="vscode-activity-bar">
            <div className="activity-bar-top">
                {topActivities.map((item) => (
                    <button
                        key={item.id}
                        className={`activity-bar-item ${activeActivity === item.id ? 'active' : ''}`}
                        onClick={() => handleActivityClick(item.id)}
                        title={item.title}
                    >
                        {item.icon}
                        {item.badge && (
                            <span className="activity-badge">{item.badge}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="activity-bar-bottom">
                {/* AI Assistant Button */}
                <button
                    className="activity-bar-item ai-assistant"
                    onClick={() => setChatOpen(true)}
                    title="AI Assistant"
                >
                    <GeometricBrain size={24} color="#FFD700" />
                </button>

                {bottomActivities.map((item) => (
                    <button
                        key={item.id}
                        className={`activity-bar-item ${activeActivity === item.id ? 'active' : ''}`}
                        onClick={() => handleActivityClick(item.id)}
                        title={item.title}
                    >
                        {item.icon}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ActivityBar;
