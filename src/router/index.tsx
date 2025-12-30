import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// Layout Components
import { Sidebar, TopBar, HorizontalNav } from '../components/layout';
import { VSCodeLayout } from '../components/vscode';

// Page Components - Lazy loaded for performance
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const HotelsList = React.lazy(() => import('../pages/HotelsList'));
const HotelDetail = React.lazy(() => import('../pages/HotelDetail'));
const HotelEdit = React.lazy(() => import('../pages/HotelEdit'));
const HotelNew = React.lazy(() => import('../pages/HotelNew'));
const HotelRooms = React.lazy(() => import('../pages/HotelRooms'));
const HotelPrices = React.lazy(() => import('../pages/HotelPrices'));
const SupplierDetail = React.lazy(() => import('../pages/SupplierDetail'));
const CustomerDetail = React.lazy(() => import('../pages/CustomerDetail'));


const MarsAnalysis = React.lazy(() => import('../modules/production/MarsAnalysis'));
const ProductionHub = React.lazy(() => import('../modules/production/ProductionHub'));
const SuppliersModule = React.lazy(() => import('../modules/production/Suppliers'));
const CustomersModule = React.lazy(() => import('../modules/production/Customers'));
const SettingsModule = React.lazy(() => import('../modules/system/Settings'));
const DeepArchive = React.lazy(() => import('../modules/system/DeepArchive'));
const Katana = React.lazy(() => import('../modules/system/Katana'));
const Fortress = React.lazy(() => import('../modules/system/Fortress'));
const PricingIntelligence = React.lazy(() => import('../modules/pricing/PricingIntelligence'));
const OlympicMail = React.lazy(() => import('../modules/mail/OlympicMail'));
const Login = React.lazy(() => import('../pages/Login'));

// Stores
import { useThemeStore, useAuthStore } from '../stores';
import { Navigate, useLocation } from 'react-router-dom';

// Loading fallback
const LoadingFallback = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-main)',
        color: 'var(--text-secondary)'
    }}>
        <div className="loading-spinner">Učitavanje...</div>
    </div>
);

// Auth Guard for global protection
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userLevel } = useAuthStore();
    const location = useLocation();

    if (userLevel === 0) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

// Main Layout Component - Switches between Modern and Classic
const MainLayout: React.FC = () => {
    const { layoutMode } = useThemeStore();

    return (
        <React.Suspense fallback={<LoadingFallback />}>
            {layoutMode === 'modern' ? <VSCodeLayout /> : <ClassicLayout />}
        </React.Suspense>
    );
};

// Classic Layout Component (Fallback)
const ClassicLayout: React.FC = () => {
    const { navMode } = useThemeStore();

    return (
        <div className={`hub-container ${navMode}-mode`}>
            {/* If horizontal mode, show menu at the very top, outside main-content */}
            {navMode === 'horizontal' && <HorizontalNav />}

            {/* Sidebar - only if navMode is sidebar */}
            {navMode === 'sidebar' && <Sidebar />}

            {/* Main Content Area */}
            <main className="main-content">
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
        path: '/login',
        element: (
            <React.Suspense fallback={<LoadingFallback />}>
                <Login />
            </React.Suspense>
        ),
    },
    {
        path: '/',
        element: (
            <AuthGuard>
                <MainLayout />
            </AuthGuard>
        ),
        children: [
            // Dashboard
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
                children: [
                    {
                        index: true,
                        element: <ProductionHub onBack={() => window.history.back()} />,
                    },
                    {
                        path: 'hotels',
                        element: <HotelsList />,
                    },
                    {
                        path: 'hotels/new',
                        element: <HotelNew />,
                    },
                    {
                        path: 'hotels/:hotelSlug',
                        element: <HotelDetail />,
                    },
                    {
                        path: 'hotels/:hotelSlug/edit',
                        element: <HotelEdit />,
                    },
                    {
                        path: 'hotels/:hotelSlug/rooms',
                        element: <HotelRooms />,
                    },
                    {
                        path: 'hotels/:hotelSlug/prices',
                        element: <HotelPrices />,
                    },
                ],
            },
            {
                path: 'suppliers',
                children: [
                    {
                        index: true,
                        element: <SuppliersModule onBack={() => window.history.back()} />,
                    },
                    {
                        path: ':supplierId',
                        element: <SupplierDetail />,
                    },
                ],
            },
            {
                path: 'customers',
                children: [
                    {
                        index: true,
                        element: <CustomersModule onBack={() => window.history.back()} />,
                    },
                    {
                        path: ':customerId',
                        element: <CustomerDetail />,
                    },
                ],
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
            {
                path: 'pricing-intelligence',
                element: <PricingIntelligence />,
            },
            {
                path: 'mail',
                element: <OlympicMail />,
            },
        ],
    },
]);

// Router Provider Component
export const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;

