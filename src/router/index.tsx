import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// Layout Components
import { Sidebar, TopBar, HorizontalNav } from '../components/layout';

// Page Components - Lazy loaded for performance
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const HotelsList = React.lazy(() => import('../pages/HotelsList'));
const HotelDetail = React.lazy(() => import('../pages/HotelDetail'));

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

// Create router configuration with nested routes
export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            // Dashboard
            {
                index: true,
                element: <Dashboard />,
            },

            // Mars Analysis
            {
                path: 'mars-analysis',
                element: <MarsAnalysis onBack={() => window.history.back()} lang="sr" userLevel={6} onOpenChat={() => { }} onDataUpdate={() => { }} />,
            },

            // Production Module with nested routes
            {
                path: 'production',
                children: [
                    // Production Hub (index)
                    {
                        index: true,
                        element: <ProductionHub onBack={() => window.history.back()} />,
                    },
                    // Hotels List
                    {
                        path: 'hotels',
                        element: <HotelsList />,
                    },
                    // Individual Hotel Detail - deep link by slug
                    // Example: /production/hotels/iberostar-bellevue
                    {
                        path: 'hotels/:hotelSlug',
                        element: <HotelDetail />,
                    },
                    // New Hotel Creation
                    {
                        path: 'hotels/new',
                        element: <ProductionHub onBack={() => window.history.back()} />,
                    },
                ],
            },

            // Suppliers
            {
                path: 'suppliers',
                children: [
                    {
                        index: true,
                        element: <SuppliersModule onBack={() => window.history.back()} />,
                    },
                    // Future: /suppliers/:supplierId for individual supplier
                ],
            },

            // Customers
            {
                path: 'customers',
                children: [
                    {
                        index: true,
                        element: <CustomersModule onBack={() => window.history.back()} />,
                    },
                    // Future: /customers/:customerId for individual customer
                ],
            },

            // Settings
            {
                path: 'settings',
                element: <SettingsModule onBack={() => window.history.back()} lang="sr" userLevel={6} setUserLevel={() => { }} />,
            },

            // Katana Task Manager
            {
                path: 'katana',
                element: <Katana onBack={() => window.history.back()} />,
            },

            // Deep Archive (Level 6+)
            {
                path: 'deep-archive',
                element: (
                    <ProtectedRoute minLevel={6}>
                        <DeepArchive onBack={() => window.history.back()} lang="sr" />
                    </ProtectedRoute>
                ),
            },

            // Fortress Security (Level 6+)
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

