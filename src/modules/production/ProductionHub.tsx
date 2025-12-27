import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Plane,
    Bus,
    Anchor,
    Car,
    MapPin,
    ShoppingBag,
    Briefcase,
    ListPlus,
    Plus,
    X,
    ArrowLeft,
    Bed,
    Info,
    Trash2,
    Download,
    ChevronRight
} from 'lucide-react';
import { exportToJSON } from '../../utils/exportUtils';

// --- TYPES ---
interface AmenityItem { name: string; values: any; }
interface PriceItem { dateFrom: string; dateTo: string; price: number | null; currency: string; percent?: number | null; title: string; type: string; }
interface Unit {
    id: number | string; name: string; type: string; basicBeds: number; extraBeds: number; minOccupancy: number; images: { url: string }[];
    pricelist: { baseRate: PriceItem[]; supplement: PriceItem[]; discount: PriceItem[]; touristTax: PriceItem[]; };
}
interface HotelObject {
    id: number | string; name: string;
    location: { address: string; lat: number | string; lng: number | string; place: string; };
    images: { url: string }[]; amenities: AmenityItem[]; units: Unit[];
    commonItems: { discount: PriceItem[]; touristTax: PriceItem[]; supplement: PriceItem[]; };
}

interface ProductionHubProps {
    onBack: () => void;
}

const ProductionHub: React.FC<ProductionHubProps> = ({ onBack }) => {
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [hotels, setHotels] = useState<HotelObject[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeFormTab, setActiveFormTab] = useState<'general' | 'units'>('general');

    const [currentHotel, setCurrentHotel] = useState<Partial<HotelObject>>({
        name: '', location: { address: '', lat: '', lng: '', place: '' },
        amenities: [], units: [], commonItems: { discount: [], touristTax: [], supplement: [] }
    });

    const services = [
        { id: 'accommodation', name: 'Smeštaj', desc: 'Hoteli, Apartmani, Vile', icon: <Building2 size={24} />, color: '#3fb950' },
        { id: 'flights', name: 'Avio Karte', desc: 'Redovne linije i Čarteri', icon: <Plane size={24} />, color: '#2188ff' },
        { id: 'bus', name: 'Autobuski Prevoz', desc: 'Linije i Zakup autobusa', icon: <Bus size={24} />, color: '#ffa657' },
        { id: 'trips', name: 'Izleti', desc: 'Lokalne ture i atrakcije', icon: <MapPin size={24} />, color: '#bc8cff' },
        { id: 'transfers', name: 'Transferi', desc: 'Aerodrom - Hotel i lokalno', icon: <Car size={24} />, color: '#f34b7d' },
        { id: 'cruises', name: 'Krstarenja', desc: 'Brodski aranžmani', icon: <Anchor size={24} />, color: '#00d2ff' },
    ];

    const packages = [
        { id: 'summer', name: 'Leto 2024', desc: 'Grčka, Turska, Crna Gora', icon: <ShoppingBag size={20} /> },
        { id: 'winter', name: 'Zima 2024', desc: 'Kopaonik, Jahorina, Alpi', icon: <Briefcase size={20} /> },
        { id: 'group', name: 'Grupna Putovanja', desc: 'Evropski gradovi i daleke destinacije', icon: <ListPlus size={20} /> },
    ];

    const handleAddHotel = () => {
        const hotelToSave = { ...currentHotel, id: currentHotel.id || Date.now() } as HotelObject;
        setHotels([...hotels, hotelToSave]);
        setShowAddForm(false);
        resetHotelForm();
    };

    const resetHotelForm = () => {
        setCurrentHotel({ name: '', location: { address: '', lat: '', lng: '', place: '' }, amenities: [], units: [], commonItems: { discount: [], touristTax: [], supplement: [] } });
        setActiveFormTab('general');
    };

    const handleImport = () => {
        const input = prompt('Nalepite TCT JSON (data niz):');
        if (input) {
            try {
                const parsed = JSON.parse(input);
                const data = parsed.data || (Array.isArray(parsed) ? parsed : [parsed]);
                setHotels([...hotels, ...data]);
                alert(`Uspešno uvezeno ${data.length} objekata!`);
            } catch (e) { alert('Greška u formatu JSON-a.'); }
        }
    };

    // --- MAIN HUB VIEW ---
    if (!selectedService) {
        return (
            <div className="module-container fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={onBack} className="btn-icon"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Produkcija</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Upravljanje turističkim proizvodima</p>
                        </div>
                    </div>
                </div>

                <div className="hub-section">
                    <h3 className="section-subtitle">Glavne stavke</h3>
                    <div className="dashboard-grid">
                        {services.map(s => (
                            <motion.div key={s.id} whileHover={{ y: -5 }} className="app-card highlight-card" onClick={() => setSelectedService(s.id)}>
                                <div className="card-icon" style={{ background: s.color }}>{s.icon}</div>
                                <h3 className="card-title">{s.name}</h3>
                                <p className="card-desc">{s.desc}</p>
                                <div className="card-footer-simple">Otvori modul <ChevronRight size={14} /></div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="hub-section" style={{ marginTop: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 className="section-subtitle">Specijalne kategorije (Paketi)</h3>
                        <button className="btn-secondary" style={{ fontSize: '12px' }}>Upravljaj kategorijama</button>
                    </div>
                    <div className="packages-grid">
                        {packages.map(p => (
                            <div key={p.id} className="package-card">
                                <div className="p-icon">{p.icon}</div>
                                <div className="p-info">
                                    <h4>{p.name}</h4>
                                    <p>{p.desc}</p>
                                </div>
                                <ChevronRight size={18} className="p-arrow" />
                            </div>
                        ))}
                        <div className="package-card add-card" style={{ borderStyle: 'dashed', background: 'transparent' }}>
                            <Plus size={20} />
                            <span>Dodaj novi paket</span>
                        </div>
                    </div>
                </div>

                <style>{`
                    .section-subtitle { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-bottom: 24px; font-weight: 700; }
                    .card-footer-simple { margin-top: 16px; font-size: 12px; font-weight: 600; color: var(--accent); display: flex; align-items: center; gap: 4px; }
                    .packages-grid { display: grid; gridTemplateColumns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
                    .package-card { background: var(--bg-card); border: 1px solid var(--border); padding: 16px; borderRadius: 16px; display: flex; alignItems: center; gap: 16px; cursor: pointer; transition: 0.2s; }
                    .package-card:hover { border-color: var(--accent); background: rgba(255,255,255,0.02); }
                    .p-icon { width: 44px; height: 44px; background: var(--glass-bg); borderRadius: 12px; display: flex; alignItems: center; justifyContent: center; color: var(--accent); }
                    .p-info h4 { font-size: 15px; margin: 0; }
                    .p-info p { font-size: 12px; color: var(--text-secondary); margin: 4px 0 0; }
                    .p-arrow { margin-left: auto; color: var(--text-secondary); opacity: 0.5; }
                    .add-card { border: 1px dashed var(--border); color: var(--text-secondary); justifyContent: center; }
                `}</style>
            </div>
        );
    }

    // --- ACCOMMODATION (SMEŠTAJ) MODULE VIEW ---
    if (selectedService === 'accommodation') {
        return (
            <div className="module-container fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setSelectedService(null)} className="btn-icon"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Smeštaj (TCT)</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Baza objekata i jedinica</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleImport} className="btn-secondary"><Download size={18} /> Import</button>
                        <button onClick={() => setShowAddForm(true)} className="btn-primary"><Plus size={18} /> Kreiraj</button>
                        <button className="btn-secondary" onClick={() => exportToJSON(hotels, 'tct')}>JSON</button>
                    </div>
                </div>

                <div className="hotels-grid">
                    {hotels.length === 0 ? (
                        <div style={{ padding: '80px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                            <Building2 size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>Nema objekata. Uvezite JSON ili kreirajte novi.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {hotels.map(h => (
                                <motion.div layout className="app-card highlight-card" key={h.id} style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{h.name}</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><MapPin size={12} /> {h.location.place}</p>
                                    <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>{h.units.length} JEDINICE</div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* MODAL IS THE SAME AS PREVIOUSLY CREATED */}
                <AnimatePresence>
                    {showAddForm && (
                        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                                <div className="modal-sidebar">
                                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}><h3>Novi Objekat</h3></div>
                                    <div className="modal-nav">
                                        <button className={activeFormTab === 'general' ? 'active' : ''} onClick={() => setActiveFormTab('general')}><Info size={16} /> Opšte</button>
                                        <button className={activeFormTab === 'units' ? 'active' : ''} onClick={() => setActiveFormTab('units')}><Bed size={16} /> Jedinice</button>
                                    </div>
                                    <div style={{ marginTop: 'auto', padding: '16px' }}><button onClick={handleAddHotel} className="btn-primary" style={{ width: '100%' }}>SAČUVAJ</button></div>
                                </div>
                                <div className="modal-main">
                                    <button className="close-btn" onClick={() => setShowAddForm(false)}><X size={20} /></button>
                                    {activeFormTab === 'general' && (
                                        <div className="form-section">
                                            <h2 className="section-title">Osnovne informacije</h2>
                                            <div className="form-grid">
                                                <div className="form-item spread"><label>Ime Objekta</label><input value={currentHotel.name} onChange={e => setCurrentHotel({ ...currentHotel, name: e.target.value })} /></div>
                                                <div className="form-item"><label>Mesto</label><input value={currentHotel.location?.place} onChange={e => setCurrentHotel({ ...currentHotel, location: { ...currentHotel.location!, place: e.target.value } })} /></div>
                                                <div className="form-item"><label>Adresa</label><input value={currentHotel.location?.address} onChange={e => setCurrentHotel({ ...currentHotel, location: { ...currentHotel.location!, address: e.target.value } })} /></div>
                                            </div>
                                        </div>
                                    )}
                                    {activeFormTab === 'units' && (
                                        <div className="form-section">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                                <h2 className="section-title" style={{ margin: 0 }}>Smeštajne Jedinice</h2>
                                                <button className="btn-secondary" onClick={() => {
                                                    const nu = { id: Date.now(), name: 'Nova ', type: 'room', basicBeds: 2, extraBeds: 0, minOccupancy: 1, images: [], pricelist: { baseRate: [], supplement: [], discount: [], touristTax: [] } };
                                                    setCurrentHotel({ ...currentHotel, units: [...(currentHotel.units || []), nu] });
                                                }}>+ Dodaj</button>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {currentHotel.units?.map((u, i) => (
                                                    <div key={u.id} className="unit-nav-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <input value={u.name} onChange={e => {
                                                            const nu = [...currentHotel.units!]; nu[i].name = e.target.value; setCurrentHotel({ ...currentHotel, units: nu });
                                                        }} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '14px' }} />
                                                        <Trash2 size={16} color="#ff4444" style={{ cursor: 'pointer' }} onClick={() => setCurrentHotel({ ...currentHotel, units: currentHotel.units?.filter(unit => unit.id !== u.id) })} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style>{`
                    .large-modal { width: 900px !important; height: 70vh !important; display: flex !important; padding: 0 !important; overflow: hidden !important; border-radius: 20px !important; }
                    .modal-sidebar { width: 220px; background: var(--bg-card); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
                    .modal-nav { padding: 10px; display: flex; flex-direction: column; gap: 4px; }
                    .modal-nav button { background: transparent; border: none; padding: 10px 15px; border-radius: 8px; color: var(--text-secondary); text-align: left; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; font-size: 14px; }
                    .modal-nav button.active { background: var(--accent); color: #fff; }
                    .modal-main { flex: 1; padding: 40px; position: relative; background: var(--bg-main); overflow-y: auto; }
                    .close-btn { position: absolute; top: 15px; right: 15px; background: transparent; border: none; color: var(--text-secondary); cursor: pointer; }
                    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                    .spread { grid-column: span 2; }
                    .form-item label { font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: block; }
                    .form-item input { width: 100%; padding: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); outline: none; }
                    .unit-nav-item { padding: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; }
                `}</style>
            </div>
        );
    }

    // Placeholder for other services
    return (
        <div className="module-container fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={() => setSelectedService(null)} className="btn-icon"><ArrowLeft size={20} /></button>
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}> {selectedService?.toUpperCase()} </h2>
            </div>
            <div style={{ padding: '100px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '32px' }}>
                <Plus size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Ovaj modul je u fazi razvoja.</p>
            </div>
        </div>
    );
};

export default ProductionHub;
