import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    Building2,
    ArrowLeft,
    Plus,
    ChevronRight,
    Search,
    RefreshCw,
    Users,
    Globe,
    LayoutGrid,
    Calendar,
    DollarSign,
    Pencil
} from 'lucide-react';
import { exportToJSON } from '../../utils/exportUtils';
import PropertyWizard from '../../components/PropertyWizard';
import TourWizard from '../../components/TourWizard/TourWizard';
import type { Property } from '../../types/property.types';
import type { Tour } from '../../types/tour.types';
import {
    saveToCloud,
    loadFromCloud
} from '../../utils/storageUtils';
import { useSecurity } from '../../hooks/useSecurity';

// --- TCT-IMC DATA STRUCTURES ---

interface Amenity {
    name: string;
    values: any;
}

interface PriceRule {
    dateFrom: string;
    dateTo: string;
    price: number | null;
    currency: string;
    percent?: number | null;
    arrivalDays?: string;
    departureDays?: string;
    minStay?: number;
    maxStay?: number;
    title: string;
    type: string;
    paymentType?: string;
}

interface Unit {
    id: number | string;
    name: string;
    type: string;
    basicBeds: number;
    extraBeds: number;
    minOccupancy: number;
    images: { url: string }[];
    amenites?: any[];
    availabilities: {
        dateFrom: string;
        dateTo: string;
        type: string;
        quantity: number;
    }[];
    pricelist: {
        baseRate: PriceRule[];
        supplement: PriceRule[];
        discount: PriceRule[];
        touristTax: PriceRule[];
    };
}

interface Hotel {
    id: number | string;
    name: string;
    location: {
        address: string;
        lat: number;
        lng: number;
        place: string;
    };
    images: { url: string }[];
    amenities: Amenity[];
    units: Unit[];
    commonItems: {
        discount: PriceRule[];
        touristTax: PriceRule[];
        supplement: PriceRule[];
    };
    originalPropertyData?: Partial<Property>;
}

interface ProductionHubProps {
    onBack: () => void;
}

const ProductionHub: FC<ProductionHubProps> = ({ onBack }) => {
    const [viewMode, setViewMode] = useState<'hub' | 'list' | 'detail'>('hub');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeModuleTab, setActiveModuleTab] = useState('all'); // For Hub view
    const [tourCategoryFilter, setTourCategoryFilter] = useState<'All' | 'Grupno' | 'Individualno' | 'Krstarenje'>('All'); // For List view

    const { trackAction, isAnomalyDetected } = useSecurity();

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const [tours, setTours] = useState<Tour[]>([]);
    const [showTourWizard, setShowTourWizard] = useState(false);
    const [activeModule, setActiveModule] = useState<'accommodation' | 'trips'>('accommodation');

    const filteredHotels = hotels.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.location.place.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTours = tours.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (tourCategoryFilter === 'All' || t.category === tourCategoryFilter || (tourCategoryFilter === 'Krstarenje' && t.category === 'StayAndCruise'))
    );

    // Load data from Supabase on mount
    useEffect(() => {
        const loadInitialData = async () => {
            const hotelRes = await loadFromCloud('properties');
            if (hotelRes.success && hotelRes.data) {
                setHotels(hotelRes.data as Hotel[]);
            } else {
                const saved = localStorage.getItem('olympic_hub_hotels');
                if (saved) setHotels(JSON.parse(saved));
            }

            const tourRes = await loadFromCloud('tours');
            if (tourRes.success && tourRes.data) {
                setTours(tourRes.data as Tour[]);
            } else {
                const saved = localStorage.getItem('olympic_hub_tours');
                if (saved) setTours(JSON.parse(saved));
            }
        };
        loadInitialData();
    }, []);

    // Save/Sync helper
    const syncToSupabase = async (updatedHotels: Hotel[]) => {
        setIsSyncing(true);
        const { success } = await saveToCloud('properties', updatedHotels);
        if (success) {
            localStorage.setItem('olympic_hub_hotels', JSON.stringify(updatedHotels));
        }
        setTimeout(() => setIsSyncing(false), 500);
    };

    // Auto-save to localStorage as quick cache
    useEffect(() => {
        localStorage.setItem('olympic_hub_hotels', JSON.stringify(hotels));
    }, [hotels]);

    const [showWizard, setShowWizard] = useState(false);
    const [wizardInitialData, setWizardInitialData] = useState<Partial<Property> | undefined>(undefined);

    const handleWizardSave = (property: Partial<Property>, shouldClose: boolean = true) => {
        if (wizardInitialData && selectedHotel) {
            const updatedHotel: Hotel = {
                ...selectedHotel,
                originalPropertyData: property
            };
            const updatedList = hotels.map(h => h.id === selectedHotel.id ? updatedHotel : h);
            setHotels(updatedList);
            setSelectedHotel(updatedHotel);
            syncToSupabase(updatedList);
        } else {
            const newHotel: Hotel = {
                id: Math.random().toString(36).substr(2, 9),
                name: property.content?.[0]?.displayName || 'New Property',
                location: {
                    address: property.address?.addressLine1 || '',
                    lat: property.geoCoordinates?.latitude || 0,
                    lng: property.geoCoordinates?.longitude || 0,
                    place: property.address?.city || ''
                },
                amenities: [],
                units: [],
                commonItems: { discount: [], touristTax: [], supplement: [] },
                images: [],
                originalPropertyData: property
            };
            const updatedList = [...hotels, newHotel];
            setHotels(updatedList);
            syncToSupabase(updatedList);

            if (!shouldClose) {
                setSelectedHotel(newHotel);
                setWizardInitialData(newHotel.originalPropertyData);
            }
        }

        if (shouldClose) {
            setShowWizard(false);
            setWizardInitialData(undefined);
        }
    };

    const handleTourSave = async (tour: Partial<Tour>) => {
        setIsSyncing(true);
        const newTour: Tour = {
            id: tour.id || Math.random().toString(36).substr(2, 9),
            title: tour.title || 'Novo Putovanje',
            slug: tour.slug || Math.random().toString(36).substr(2, 5),
            category: tour.category || 'Grupno',
            status: tour.status || 'Draft',
            shortDescription: tour.shortDescription || '',
            longDescription: tour.longDescription || '',
            highlights: tour.highlights || [],
            gallery: tour.gallery || [],
            itinerary: tour.itinerary || [],
            basePrice: tour.basePrice || 0,
            currency: tour.currency || 'EUR',
            supplements: tour.supplements || [],
            durationDays: tour.durationDays || 0,
            totalSeats: tour.totalSeats || 0,
            availableSeats: tour.totalSeats || 0,
            startDate: tour.startDate || '',
            endDate: tour.endDate || '',
            createdAt: tour.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedTours = tour.id
            ? tours.map(t => t.id === tour.id ? newTour : t)
            : [...tours, newTour];

        setTours(updatedTours);
        await saveToCloud('tours', updatedTours);
        localStorage.setItem('olympic_hub_tours', JSON.stringify(updatedTours));

        setIsSyncing(false);
        setShowTourWizard(false);
    };

    const handleBulkExport = () => {
        if (isAnomalyDetected) {
            alert("BEZBEDNOSNO BLOKIRANJE: Detektovana anomalija u izvozu.");
            return;
        }
        trackAction('bulk_export');
        exportToJSON(hotels, `Olympic_Hotels_Export_${new Date().toISOString().split('T')[0]}.json`);
    };

    const startCreate = () => {
        setWizardInitialData(undefined);
        setShowWizard(true);
    };

    const startEdit = (hotelToEdit?: Hotel) => {
        const target = hotelToEdit || selectedHotel;
        if (target) {
            setWizardInitialData(target.originalPropertyData);
            setShowWizard(true);
        }
    };

    if (viewMode === 'hub') {
        return (
            <div className="module-container fade-in">
                <div className="hub-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={onBack} className="btn-icon circle"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 className="title-gradient">ERP Produkcija</h2>
                            <p className="subtitle">Centralni sistem za upravljanje turističkim inventarom</p>
                        </div>
                    </div>
                    <button className="btn-glass" onClick={handleBulkExport}>Bulk Export</button>
                </div>

                <div className="hub-tabs-container" style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                    {[
                        { id: 'all', label: 'Sve', icon: <LayoutGrid size={16} /> },
                        { id: 'accommodation', label: 'Smeštaj', icon: <Building2 size={16} /> },
                        { id: 'trips', label: 'Putovanja', icon: <Globe size={16} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`hub-tab-btn ${activeModuleTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveModuleTab(tab.id)}
                            style={{
                                padding: '10px 20px',
                                background: activeModuleTab === tab.id ? 'var(--accent)' : 'var(--bg-card)',
                                borderRadius: '12px', border: 'none', color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="dashboard-grid">
                    {[
                        { id: 'accommodation', name: 'Smeštaj', cat: 'accommodation', icon: <Building2 />, color: '#10b981' },
                        { id: 'trips', name: 'Grupna Putovanja', cat: 'trips', icon: <Users />, color: '#3b82f6' }
                    ].filter(s => activeModuleTab === 'all' || s.cat === activeModuleTab).map(s => (
                        <div key={s.id} className="module-card" onClick={() => { setActiveModule(s.cat as any); setViewMode('list'); }}>
                            <div className="module-icon" style={{ background: s.color }}>{s.icon}</div>
                            <h3>{s.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="module-container fade-in">
                <div className="top-section-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setViewMode('hub')} className="btn-icon circle"><ArrowLeft size={20} /></button>
                        <h1>{activeModule === 'accommodation' ? 'Baza Smeštaja' : 'Baza Aranžmana'}</h1>
                        {isSyncing && <RefreshCw className="spin" size={14} />}
                    </div>
                </div>

                {/* Sub-tabs for Trips Module */}
                {activeModule === 'trips' && (
                    <div className="hub-tabs-container" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                        {[
                            { id: 'All', label: 'Sve' },
                            { id: 'Grupno', label: 'Grupna' },
                            { id: 'Individualno', label: 'Individualna' },
                            { id: 'Krstarenje', label: 'Krstarenja' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setTourCategoryFilter(tab.id as any)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: '1px solid ' + (tourCategoryFilter === tab.id ? 'var(--accent)' : 'var(--border)'),
                                    background: tourCategoryFilter === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: tourCategoryFilter === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 500
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                    <div className="search-bar" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-card)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <Search size={18} />
                        <input
                            style={{ background: 'transparent', border: 'none', color: '#fff', padding: '12px', width: '100%', outline: 'none' }}
                            placeholder="Pretraži..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary-action" onClick={() => {
                        if (activeModule === 'accommodation') startCreate();
                        else setShowTourWizard(true);
                    }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        <Plus size={18} /> Novo
                    </button>
                </div>

                <div className="dashboard-grid">
                    {activeModule === 'accommodation' ? filteredHotels.map(h => (
                        <div key={h.id} className="module-card" onClick={() => { setSelectedHotel(h); setViewMode('detail'); }}>
                            <Building2 size={24} color="var(--accent)" />
                            <h3 style={{ margin: '12px 0 4px' }}>{h.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{h.location.place}</p>
                            <div className="module-action" style={{ marginTop: '16px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Otvori <ChevronRight size={14} />
                            </div>
                        </div>
                    )) : filteredTours.map(t => (
                        <div key={t.id} className="module-card tour-card" style={{ border: '1px solid var(--border)' }}>
                            <Globe size={24} color="#3b82f6" />
                            <h3 style={{ margin: '12px 0 4px' }}>{t.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t.shortDescription}</p>
                            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <DollarSign size={12} /> {t.basePrice} {t.currency}
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} /> {t.durationDays} dana
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {showWizard && (
                        <PropertyWizard
                            onClose={() => setShowWizard(false)}
                            onSave={handleWizardSave}
                            initialData={wizardInitialData}
                        />
                    )}
                    {showTourWizard && (
                        <TourWizard
                            onClose={() => setShowTourWizard(false)}
                            onSave={handleTourSave}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedHotel) {
        return (
            <div className="detail-view fade-in" style={{ padding: '24px' }}>
                <div className="detail-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <button onClick={() => setViewMode('list')} className="btn-icon circle"><ArrowLeft size={20} /></button>
                    <h2 style={{ flex: 1 }}>{selectedHotel.name}</h2>
                    <button className="btn-primary" onClick={() => startEdit(selectedHotel)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        <Pencil size={18} /> Uredi Objekat
                    </button>
                </div>
                <div className="detail-content">
                    <div className="glass-card" style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: '16px' }}>Detalji Objekta</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Lokacija: {selectedHotel.location.place}</p>
                        <p style={{ color: 'var(--text-secondary)' }}>Adresa: {selectedHotel.location.address}</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default ProductionHub;
