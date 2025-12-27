import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    X,
    ArrowLeft,
    Plus,
    MapPin,
    Bed,
    Download,
    ChevronRight,
    Search,
    Navigation,
    Shield,
    Waves,
    Utensils,
    Car,
    Maximize,
    Tag,
    Clock,
    UserCheck,
    CheckCircle2
} from 'lucide-react';
import { exportToJSON } from '../../utils/exportUtils';
import PropertyWizard from '../../components/PropertyWizard';
import type { Property } from '../../types/property.types';

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
    amenites?: any[]; // Note: Typo in JSON "amenites"
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
}

interface ProductionHubProps {
    onBack: () => void;
}

const ProductionHub: React.FC<ProductionHubProps> = ({ onBack }) => {
    const [viewMode, setViewMode] = useState<'hub' | 'list' | 'detail'>('hub');
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
    const [showImport, setShowImport] = useState(false);
    const [importData, setImportData] = useState('');
    const [showWizard, setShowWizard] = useState(false);

    const handleWizardSave = (property: Partial<Property>) => {
        // Convert OTA Property to Hotel format for now
        const newHotel: Hotel = {
            id: Math.random().toString(36).substr(2, 9),
            name: property.content?.[0]?.displayName || 'New Property',
            location: {
                address: property.address?.addressLine1 || '',
                lat: (property.geoCoordinates?.latitude || 0).toString(),
                lng: (property.geoCoordinates?.longitude || 0).toString(),
                place: property.address?.city || ''
            },
            amenities: [],
            units: [],
            commonItems: { discount: [], touristTax: [], supplement: [] },
            images: []
        };
        setHotels([...hotels, newHotel]);
        setShowWizard(false);
        alert('Objekat uspešno kreiran!');
    };

    const handleImport = () => {
        try {
            const parsed = JSON.parse(importData);
            const data = parsed.data || (Array.isArray(parsed) ? parsed : [parsed]);
            setHotels([...hotels, ...data]);
            setShowImport(false);
            setImportData('');
            alert(`Uspešno uvezeno ${data.length} objekata!`);
        } catch (e) {
            alert('Greška u formatu JSON-a.');
        }
    };

    const getDistance = (name: string) => {
        const item = selectedHotel?.amenities.find(a => a.name === name);
        return item ? `${item.values}m` : 'N/A';
    };

    const getAmenityValue = (name: string) => {
        const item = selectedHotel?.amenities.find(a => a.name === name);
        if (!item) return 'N/A';
        if (typeof item.values === 'boolean') return item.values ? 'Da' : 'Ne';
        return item.values;
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
                    <div className="header-actions">
                        <button className="btn-glass" onClick={() => setShowImport(true)}><Download size={18} /> Import JSON</button>
                    </div>
                </div>


                <div className="dashboard-grid">
                    {[
                        { id: 'accommodation', name: 'Smeštaj', desc: 'Hoteli, apartmani i smeštajni objekti.', icon: <Building2 />, color: '#10b981', count: hotels.length, badge: 'LIVE' },
                        { id: 'flights', name: 'Avio Karte', desc: 'Letovi i avio prevoz putnika.', icon: <Navigation />, color: '#3b82f6', count: 0, badge: 'USKORO' },
                        { id: 'bus', name: 'Prevoz', desc: 'Autobuski i drugi vid prevoza.', icon: <Car />, color: '#f59e0b', count: 0, badge: 'USKORO' },
                        { id: 'trips', name: 'Izleti', desc: 'Organizovani izleti i ture.', icon: <Waves />, color: '#8b5cf6', count: 0, badge: 'USKORO' }
                    ].map(s => (
                        <motion.div
                            key={s.id}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className="module-card"
                            onClick={() => { if (s.id === 'accommodation') setViewMode('list'); }}
                            style={{ cursor: s.id === 'accommodation' ? 'pointer' : 'not-allowed', opacity: s.id === 'accommodation' ? 1 : 0.6 }}
                        >
                            <div className="module-icon" style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)` }}>
                                {s.icon}
                            </div>

                            <div className={`module-badge ${s.badge === 'LIVE' ? 'live' : 'new'}`}>{s.badge}</div>

                            <h3 className="module-title">{s.name}</h3>
                            <p className="module-desc">{s.desc}</p>

                            {s.id === 'accommodation' && (
                                <button className="module-action">
                                    Otvori Modul
                                    <ChevronRight size={16} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>


                <AnimatePresence>
                    {showImport && (
                        <div className="modal-overlay-blur" onClick={() => setShowImport(false)}>
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content-glass" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Import TCT-IMC Podataka</h3>
                                    <button onClick={() => setShowImport(false)}><X size={20} /></button>
                                </div>
                                <textarea
                                    placeholder="Nalepite JSON objekat ovde..."
                                    className="import-textarea"
                                    value={importData}
                                    onChange={e => setImportData(e.target.value)}
                                />
                                <div className="modal-footer">
                                    <button className="btn-primary-glow" onClick={handleImport}>Potvrdi Uvoz</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="module-container fade-in">
                <div className="top-section-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setViewMode('hub')} className="btn-icon circle"><ArrowLeft size={20} /></button>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>Baza Smeštaja</h1>
                            <p className="subtitle">Upravljanje hotelima i smeštajnim objektima</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="search-bar">
                            <Search size={18} />
                            <input type="text" placeholder="Pretraži objekte..." />
                        </div>
                        <button className="btn-primary-action" onClick={() => setShowWizard(true)}>
                            <Plus size={18} /> Kreiraj Objekat (OTA)
                        </button>
                        <button className="btn-secondary" onClick={() => setShowImport(true)}>
                            <Download size={18} /> Import JSON
                        </button>
                    </div>
                </div>

                {/* Property Wizard */}
                {showWizard && (
                    <PropertyWizard onClose={() => setShowWizard(false)} onSave={handleWizardSave} />
                )}

                <div className="dashboard-grid" style={{ marginTop: '32px' }}>
                    {hotels.map(h => (
                        <motion.div
                            key={h.id}
                            className="module-card"
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => { setSelectedHotel(h); setViewMode('detail'); }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="module-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                <Building2 size={28} />
                            </div>

                            <div className="module-badge live">AKTIVAN</div>

                            <h3 className="module-title">{h.name}</h3>
                            <p className="module-desc">
                                <MapPin size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                {h.location.place}, {h.location.address}
                            </p>

                            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <div className="info-badge">
                                    <Bed size={12} />
                                    {h.units.length} Jedinica
                                </div>
                                <div className="info-badge">
                                    <Tag size={12} />
                                    ID: {h.id}
                                </div>
                            </div>

                            <button className="module-action">
                                Otvori Modul
                                <ChevronRight size={16} />
                            </button>
                        </motion.div>
                    ))}

                    <motion.div
                        className="module-card add-new"
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => setShowWizard(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="add-icon">
                            <Plus size={48} />
                        </div>
                        <span className="add-text">Dodaj Novi Objekat</span>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedHotel) {
        return (
            <div className="module-container fade-in detail-view">
                <div className="detail-top-bar">
                    <button onClick={() => setViewMode('list')} className="btn-back-circle"><ArrowLeft size={20} /></button>
                    <div className="breadcrumb">Produkcija / Smeštaj / {selectedHotel.name}</div>
                    <div className="detail-actions">
                        <button className="btn-export" onClick={() => exportToJSON(selectedHotel, `hotel_${selectedHotel.id}`)}>EXPORT</button>
                    </div>
                </div>

                <div className="detail-grid-layout">
                    {/* Left Panel: Profile Info */}
                    <div className="profile-panel">
                        <section className="profile-hero">
                            <div className="hero-img">
                                <img src={selectedHotel.images[0]?.url} alt={selectedHotel.name} />
                            </div>
                            <div className="hero-content">
                                <div className="badge-id">#OBJ-{selectedHotel.id}</div>
                                <h1>{selectedHotel.name}</h1>
                                <div className="location-info">
                                    <MapPin size={16} />
                                    <span>{selectedHotel.location.address}, {selectedHotel.location.place}</span>
                                </div>
                                <div className="coords">
                                    <Navigation size={14} /> {selectedHotel.location.lat}, {selectedHotel.location.lng}
                                </div>
                            </div>
                        </section>

                        <section className="amenities-section">
                            <h2 className="section-title"><Shield size={18} /> Sadržaji Objekta</h2>
                            <div className="amenity-groups">
                                <div className="amenity-group">
                                    <h4><Maximize size={16} /> Karakteristike</h4>
                                    <ul>
                                        <li>Broj soba: {getAmenityValue('numberOfRooms')}</li>
                                        <li>Spratnost: {getAmenityValue('numberOfFloors')}</li>
                                        <li>Internet: {getAmenityValue('internetAccess')}</li>
                                        <li>Klimatizovano: {getAmenityValue('airConditioning')}</li>
                                    </ul>
                                </div>
                                <div className="amenity-group">
                                    <h4><MapPin size={16} /> Udaljenosti</h4>
                                    <div className="distance-grid">
                                        <div className="dist-item"><span>Centar</span><strong>{getDistance('Center')}</strong></div>
                                        <div className="dist-item"><span>Plaža</span><strong>{getDistance('Beach')}</strong></div>
                                        <div className="dist-item"><span>Prodavnica</span><strong>{getDistance('Shop')}</strong></div>
                                        <div className="dist-item"><span>Restoran</span><strong>{getDistance('Restaurant')}</strong></div>
                                    </div>
                                </div>
                                <div className="amenity-group">
                                    <h4><Utensils size={16} /> Ishrana i Bar</h4>
                                    <p>{getAmenityValue('fb')}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Panel: Units & Pricing */}
                    <div className="logic-panel">
                        <section className="units-section">
                            <div className="section-header">
                                <h2><Bed size={20} /> Smeštajne Jedinice</h2>
                                <span className="unit-count">{selectedHotel.units.length} Jedinica</span>
                            </div>

                            {selectedHotel.units.map(unit => (
                                <div key={unit.id} className="unit-card-erp">
                                    <div className="unit-header">
                                        <h3>{unit.name} <span>(ID: {unit.id})</span></h3>
                                        <div className="unit-type-tag">{unit.type}</div>
                                    </div>

                                    <div className="unit-stats-grid">
                                        <div className="stat-box"><Bed size={14} /> {unit.basicBeds} osnovnih</div>
                                        <div className="stat-box"><Plus size={14} /> {unit.extraBeds} pomoćnih</div>
                                        <div className="stat-box"><Clock size={14} /> Min. {unit.minOccupancy} osobe</div>
                                        <div className="stat-box"><UserCheck size={14} /> Instant Booking</div>
                                    </div>

                                    {/* Pricing Logic Table */}
                                    <div className="pricing-matrix">
                                        <div className="matrix-title">Cenovnik i pravila (Base Rate)</div>
                                        <table className="erp-table">
                                            <thead>
                                                <tr>
                                                    <th>Period</th>
                                                    <th>Noćenje</th>
                                                    <th>Min. Stay</th>
                                                    <th>Dolasci / Odlasci</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {unit.pricelist.baseRate.map((rate, i) => (
                                                    <tr key={i}>
                                                        <td>{rate.dateFrom} - {rate.dateTo}</td>
                                                        <td className="price-td">{rate.price} {rate.currency}</td>
                                                        <td>{rate.minStay} dana</td>
                                                        <td>D: {rate.arrivalDays} / O: {rate.departureDays}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="supplements-row">
                                        <div className="supp-item">
                                            <Tag size={12} /> <strong>Popust:</strong> {unit.pricelist.discount[0]?.title} ({unit.pricelist.discount[0]?.percent}%)
                                        </div>
                                        <div className="supp-item">
                                            <Waves size={12} /> <strong>Taksa:</strong> {unit.pricelist.touristTax[0]?.title} ({unit.pricelist.touristTax[0]?.price} {unit.pricelist.touristTax[0]?.currency})
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>

                        <section className="common-rules-section">
                            <h2><CheckCircle2 size={18} /> Zajednička pravila i doplate</h2>
                            <div className="common-items-cards">
                                {selectedHotel.commonItems.supplement.map((s, i) => (
                                    <div key={i} className="common-rule-card">
                                        <div className="rule-title">{s.title}</div>
                                        <div className="rule-price">{s.price} {s.currency} <span>({s.paymentType})</span></div>
                                    </div>
                                ))}
                                {selectedHotel.commonItems.discount.map((d, i) => (
                                    <div key={i} className="common-rule-card discount">
                                        <div className="rule-title">{d.title}</div>
                                        <div className="rule-price">{d.percent}% popusta</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                <style>{`
                    .detail-view { background: var(--bg-dark); min-height: 100vh; }
                    .detail-top-bar { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
                    .btn-back-circle { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border); background: var(--glass-bg); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                    .breadcrumb { font-size: 13px; color: var(--text-secondary); flex: 1; }
                    
                    .detail-grid-layout { display: grid; grid-template-columns: 400px 1fr; gap: 30px; }
                    
                    .profile-panel { display: flex; flex-direction: column; gap: 30px; }
                    .profile-hero { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; }
                    .hero-img img { width: 100%; height: 250px; object-fit: cover; }
                    .hero-content { padding: 24px; }
                    .badge-id { font-size: 11px; background: var(--accent-glow); color: var(--accent); padding: 4px 8px; border-radius: 6px; width: fit-content; margin-bottom: 12px; font-weight: 700; }
                    .hero-content h1 { font-size: 28px; margin-bottom: 12px; }
                    .location-info { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 14px; margin-bottom: 8px; }
                    .coords { font-size: 12px; color: var(--text-secondary); opacity: 0.6; display: flex; align-items: center; gap: 6px; }

                    .section-title { font-size: 16px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #fff; }
                    .amenities-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 24px; }
                    .amenity-group { margin-bottom: 24px; }
                    .amenity-group h4 { font-size: 13px; color: var(--accent); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; }
                    .amenity-group ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
                    .amenity-group li { font-size: 14px; color: var(--text-secondary); display: flex; justify-content: space-between; }
                    .distance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                    .dist-item { background: var(--glass-bg); padding: 10px; border-radius: 12px; display: flex; flex-direction: column; gap: 4px; }
                    .dist-item span { font-size: 11px; color: var(--text-secondary); }
                    .dist-item strong { font-size: 14px; color: #fff; }

                    .logic-panel { display: flex; flex-direction: column; gap: 30px; }
                    .unit-card-erp { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 24px; margin-bottom: 24px; }
                    .unit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                    .unit-header h3 { font-size: 18px; }
                    .unit-header h3 span { font-size: 12px; color: var(--text-secondary); font-weight: 400; }
                    .unit-type-tag { font-size: 11px; background: var(--border); padding: 4px 10px; border-radius: 100px; font-weight: 700; text-transform: uppercase; }
                    .unit-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
                    .stat-box { background: var(--glass-bg); padding: 10px; border-radius: 12px; font-size: 12px; display: flex; align-items: center; gap: 8px; color: var(--text-secondary); border: 1px solid var(--glass-border); }

                    .pricing-matrix { background: rgba(0,0,0,0.2); border-radius: 16px; padding: 16px; border: 1px solid var(--border); }
                    .matrix-title { font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; }
                    .erp-table { width: 100%; border-collapse: collapse; }
                    .erp-table th { text-align: left; font-size: 11px; color: var(--text-secondary); padding: 8px; border-bottom: 1px solid var(--border); }
                    .erp-table td { padding: 12px 8px; font-size: 13px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.05); }
                    .price-td { color: var(--accent) !important; font-weight: 700; }

                    .supplements-row { display: flex; gap: 16px; margin-top: 20px; }
                    .supp-item { font-size: 12px; color: var(--text-secondary); background: var(--glass-bg); padding: 6px 12px; border-radius: 8px; display: flex; align-items: center; gap: 8px; }

                    .common-items-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
                    .common-rule-card { background: var(--bg-card); border: 1px solid var(--border); padding: 16px; border-radius: 16px; border-left: 4px solid var(--accent); }
                    .common-rule-card.discount { border-left-color: #f59e0b; }
                    .rule-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
                    .rule-price { font-size: 15px; color: var(--accent); font-weight: 700; }
                    .rule-price span { font-size: 11px; color: var(--text-secondary); font-weight: 400; }

                    /* HUB STYLING REFINED */
                    .hub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
                    .title-gradient { font-size: 36px; font-weight: 800; background: linear-gradient(to right, #fff, #8b949e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                    .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
                    .service-card-premium { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 4px; cursor: pointer; position: relative; }
                    .card-inner { padding: 24px; display: flex; align-items: center; gap: 20px; }
                    .icon-wrapper { width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: #fff; }
                    .card-content h3 { font-size: 18px; margin-bottom: 4px; }
                    .stats { display: flex; align-items: baseline; gap: 6px; }
                    .count { font-size: 18px; font-weight: 700; color: var(--accent); }
                    .label { font-size: 12px; color: var(--text-secondary); }
                    .card-arrow { margin-left: auto; color: var(--text-secondary); opacity: 0.5; }

                    .hotel-list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
                    .hotel-item-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; cursor: pointer; transition: 0.3s; }
                    .hotel-item-card:hover { border-color: var(--accent); transform: translateY(-4px); }
                    .hotel-thumb { position: relative; height: 180px; }
                    .hotel-thumb img { width: 100%; height: 100%; object-fit: cover; }
                    .hotel-id-tag { position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }
                    .hotel-info { padding: 20px; }
                    .hotel-info h3 { font-size: 18px; margin-bottom: 8px; }
                    .loc { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
                    .units-info { font-size: 12px; color: var(--accent); font-weight: 600; display: flex; align-items: center; gap: 6px; }

                    .modal-overlay-blur { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
                    .modal-content-glass { background: rgba(22, 27, 34, 0.9); border: 1px solid var(--glass-border); width: 600px; border-radius: 32px; padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                    .modal-header h3 { font-size: 20px; font-weight: 700; margin: 0; }
                    .modal-header button { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; transition: 0.2s; }
                    .modal-header button:hover { color: var(--accent); }
                    .modal-footer { margin-top: 24px; }
                    .import-textarea { width: 100%; height: 300px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 16px; padding: 16px; color: #fff; font-family: monospace; font-size: 12px; margin: 20px 0; outline: none; }
                    .btn-primary-glow { width: 100%; background: var(--accent); color: #fff; border: none; padding: 16px; border-radius: 100px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 20px var(--accent-glow); transition: 0.2s; }
                    .btn-primary-glow:hover { transform: translateY(-2px); box-shadow: 0 15px 30px var(--accent-glow); }
                    
                    .btn-icon { background: transparent; border: 1px solid var(--border); color: var(--text-primary); padding: 10px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
                    .btn-icon:hover { background: var(--glass-bg); border-color: var(--accent); }
                    .btn-icon.circle { border-radius: 50%; width: 40px; height: 40px; }
                    
                    .subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
                    .header-actions { display: flex; gap: 12px; }
                    
                    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
                    .list-header h1 { font-size: 32px; font-weight: 700; margin: 0; }
                    .btn-back { background: var(--glass-bg); border: 1px solid var(--border); color: var(--text-primary); padding: 10px 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 600; transition: 0.2s; }
                    .btn-back:hover { background: var(--glass-border); }
                    
                    .search-bar { position: relative; width: 400px; }
                    .search-bar input { width: 100%; padding: 12px 20px 12px 48px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 100px; color: var(--text-primary); font-size: 14px; outline: none; }
                    .search-bar svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
                    
                    .add-hotel-placeholder { background: var(--bg-card); border: 2px dashed var(--border); border-radius: 20px; padding: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; cursor: pointer; transition: 0.3s; color: var(--text-secondary); }
                    .add-hotel-placeholder:hover { border-color: var(--accent); color: var(--accent); }
                    
                    .btn-export { background: var(--accent); color: #fff; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                    .btn-export:hover { transform: translateY(-2px); box-shadow: 0 10px 20px var(--accent-glow); }
                    
                    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                    .section-header h2 { font-size: 20px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 10px; }
                    .unit-count { font-size: 14px; color: var(--text-secondary); background: var(--glass-bg); padding: 6px 12px; border-radius: 100px; }
                    
                    .common-rules-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; padding: 24px; }
                    
                    .top-section-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
                    .btn-primary-action { background: var(--accent); color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
                    .btn-primary-action:hover { transform: translateY(-2px); box-shadow: 0 10px 20px var(--accent-glow); }
                `}</style>
            </div>
        );
    }

    return null;
};

export default ProductionHub;
