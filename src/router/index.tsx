import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// Layout Components
import { Sidebar, TopBar, HorizontalNav } from '../components/layout';

// Page Components - Lazy loaded for performance
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const MarsAnalysis = React.lazy(() => import('../modules/production/MarsAnalysis'));
const ProductionHub = React.lazy(() => import('../modules/production/ProductionHub'));
const SuppliersModule = React.lazy(() => import('../modules/production/Suppliers'));
const CustomersModule = React.lazy(() => import('../modules/production/Customers'));
const SettingsModule = React.lazy(() => import('../modules/system/Settings'));
const DeepArchive = React.lazy(() => import('../modules/system/DeepArchive'));
const Katana = React.lazy(() => import('../modules/system/Katana'));
const Fortress = React.lazy(() => import('../modules/system/Fortress'));

// Stores
import { useThemeStore, useAuthStore } from '../stores';

// Loading fallback
const LoadingFallback = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-secondary)'
    }}>
        <div className="loading-spinner">Učitavanje...</div>
    </div>
);

// Main Layout Component
const MainLayout: React.FC = () => {
    const { navMode } = useThemeStore();

    return (
        <div className={`hub-container ${navMode}-mode`}>
            {/* Sidebar - only if navMode is sidebar */}
            {navMode === 'sidebar' && <Sidebar />}

            {/* Main Content Area */}
            <main className="main-content">
                {/* Horizontal Menu if enabled */}
                {navMode === 'horizontal' && <HorizontalNav />}

                <TopBar />

                <section className="fade-in">
                    <React.Suspense fallback={<LoadingFallback />}>
                        <Outlet />
                    </React.Suspense>
                </section>
            </main>
        </div>
    );
};

// Protected Route wrapper for level-based access
interface ProtectedRouteProps {
    children: React.ReactNode;
    minLevel: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, minLevel }) => {
    const { userLevel } = useAuthStore();

    if (userLevel < minLevel) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh',
                gap: '20px',
                color: 'var(--text-secondary)'
            }}>
                <h2 style={{ color: 'var(--accent)' }}>🔒 Pristup Odbijen</h2>
                <p>Potreban je nivo {minLevel} za pristup ovom modulu.</p>
                <p>Vaš trenutni nivo: {userLevel}</p>
            </div>
        );
    }

    return <>{children}</>;
};

// Create router configuration
export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: 'mars-analysis',
                element: <MarsAnalysis onBack={() => window.history.back()} lang="sr" userLevel={6} onOpenChat={() => { }} onDataUpdate={() => { }} />,
            },
            {
                path: 'production',
                element: <ProductionHub onBack={() => window.history.back()} />,
            },
            {
                path: 'suppliers',
                element: <SuppliersModule onBack={() => window.history.back()} />,
            },
            {
                path: 'customers',
                element: <CustomersModule onBack={() => window.history.back()} />,
            },
            {
                path: 'settings',
                element: <SettingsModule onBack={() => window.history.back()} lang="sr" userLevel={6} setUserLevel={() => { }} />,
            },
            {
                path: 'katana',
                element: <Katana onBack={() => window.history.back()} />,
            },
            {
                path: 'deep-archive',
                element: (
                    <ProtectedRoute minLevel={6}>
                        <DeepArchive onBack={() => window.history.back()} lang="sr" />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'fortress',
                element: (
                    <ProtectedRoute minLevel={6}>
                        <Fortress onBack={() => window.history.back()} />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

// Router Provider Component
export const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
