import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    X,
    ArrowLeft,
    Plus,
    MapPin,
    Settings2,
    Bed,
    Info,
    DollarSign,
    Download
} from 'lucide-react';
import { exportToJSON, exportToExcel, exportToXML, exportToPDF } from '../../utils/exportUtils';

// Types based on the provided JSON
interface AmenityItem {
    name: string;
    values: any;
}

interface PriceItem {
    dateFrom: string;
    dateTo: string;
    price: number | null;
    currency: string;
    percent?: number | null;
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
    pricelist: {
        baseRate: PriceItem[];
        supplement: PriceItem[];
        discount: PriceItem[];
        touristTax: PriceItem[];
    };
}

interface HotelObject {
    id: number | string;
    name: string;
    location: {
        address: string;
        lat: number | string;
        lng: number | string;
        place: string;
    };
    images: { url: string }[];
    amenities: AmenityItem[];
    units: Unit[];
    commonItems: {
        discount: PriceItem[];
        touristTax: PriceItem[];
        supplement: PriceItem[];
    };
}

interface ProductionHubProps {
    onBack: () => void;
    lang: string;
    userLevel: number;
}

const ProductionHub: React.FC<ProductionHubProps> = ({ onBack }) => {
    const [hotels, setHotels] = useState<HotelObject[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeFormTab, setActiveFormTab] = useState<'general' | 'amenities' | 'units' | 'common'>('general');
    const [selectedUnitIdx, setSelectedUnitIdx] = useState<number | null>(null);

    const [currentHotel, setCurrentHotel] = useState<Partial<HotelObject>>({
        name: '',
        location: { address: '', lat: '', lng: '', place: '' },
        amenities: [],
        units: [],
        commonItems: { discount: [], touristTax: [], supplement: [] }
    });

    const handleAddHotel = () => {
        const hotelToSave = {
            ...currentHotel,
            id: currentHotel.id || Date.now()
        } as HotelObject;
        setHotels([...hotels, hotelToSave]);
        setShowAddForm(false);
        resetForm();
    };

    const resetForm = () => {
        setCurrentHotel({
            name: '',
            location: { address: '', lat: '', lng: '', place: '' },
            amenities: [],
            units: [],
            commonItems: { discount: [], touristTax: [], supplement: [] }
        });
        setActiveFormTab('general');
        setSelectedUnitIdx(null);
    };

    const handleImport = () => {
        const input = prompt('Nalepite TCT JSON (data niz):');
        if (input) {
            try {
                const parsed = JSON.parse(input);
                const data = parsed.data || (Array.isArray(parsed) ? parsed : [parsed]);
                setHotels([...hotels, ...data]);
                alert(`Uspešno uvezeno ${data.length} objekata!`);
            } catch (e) {
                alert('Greška u formatu JSON-a.');
            }
        }
    };

    const handleExport = (format: 'json' | 'excel' | 'xml' | 'pdf') => {
        if (hotels.length === 0) return alert('Nema hotela za export');
        switch (format) {
            case 'json': exportToJSON(hotels, 'tct_export'); break;
            case 'excel': exportToExcel(hotels.map(h => ({ Name: h.name, Place: h.location.place, Units: h.units.length })), 'tct_export'); break;
            case 'xml': exportToXML(hotels, 'tct_export'); break;
            case 'pdf': exportToPDF(hotels.map(h => ({ Ime: h.name, Mesto: h.location.place, Jedinice: h.units.length })), 'tct_export', 'Plan Produkcije - Smeštaj'); break;
        }
    };

    const addEmptyUnit = () => {
        const newUnit: Unit = {
            id: Date.now(),
            name: 'Nova jedinica',
            type: 'room',
            basicBeds: 2,
            extraBeds: 0,
            minOccupancy: 1,
            images: [],
            pricelist: { baseRate: [], supplement: [], discount: [], touristTax: [] }
        };
        const updatedUnits = [...(currentHotel.units || []), newUnit];
        setCurrentHotel({ ...currentHotel, units: updatedUnits });
        setSelectedUnitIdx(updatedUnits.length - 1);
    };

    return (
        <div className="module-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="btn-icon"><ArrowLeft size={20} /></button>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Smeštaj (TCT standard)</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Upravljanje bazom objekata, jedinica i cenovnika</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleImport} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={18} /> Import JSON
                    </button>
                    <button onClick={() => setShowAddForm(true)} className="btn-primary">
                        <Plus size={18} /> Kreiraj Objekat
                    </button>
                    <div className="export-group">
                        <button className="btn-secondary" onClick={() => handleExport('json')}>JSON</button>
                        <button className="btn-secondary" onClick={() => handleExport('excel')}>XLSX</button>
                        <button className="btn-secondary" onClick={() => handleExport('pdf')}>PDF</button>
                    </div>
                </div>
            </div>

            <div className="hotels-grid">
                {hotels.length === 0 ? (
                    <div style={{ padding: '100px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '32px', border: '1px dashed var(--border)' }}>
                        <Building2 size={64} style={{ opacity: 0.1, marginBottom: '24px' }} />
                        <h3 style={{ color: 'var(--text-secondary)' }}>Nema unetih objekata</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Uvezite JSON ili kreirajte novi putem formulara.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {hotels.map(h => (
                            <motion.div key={h.id} layout className="app-card" style={{ padding: '24px', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{h.name}</h3>
                                        <span style={{ fontSize: '12px', color: 'var(--accent)' }}>{h.location.place}</span>
                                    </div>
                                    <div className="unit-badge" style={{ width: '40px', height: '40px', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}>{h.units.length}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <span><MapPin size={12} /> {h.location.address}</span>
                                    <span><Bed size={12} /> {h.units.map(u => u.name).join(', ')}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-sidebar">
                                <div style={{ padding: '30px', borderBottom: '1px solid var(--border)' }}>
                                    <h3 style={{ margin: 0 }}>Novi Objekat</h3>
                                </div>
                                <div className="modal-nav">
                                    <button className={activeFormTab === 'general' ? 'active' : ''} onClick={() => setActiveFormTab('general')}><Info size={16} /> Opšte</button>
                                    <button className={activeFormTab === 'amenities' ? 'active' : ''} onClick={() => setActiveFormTab('amenities')}><Settings2 size={16} /> Sadržaji</button>
                                    <button className={activeFormTab === 'units' ? 'active' : ''} onClick={() => setActiveFormTab('units')}><Bed size={16} /> Jedinice</button>
                                    <button className={activeFormTab === 'common' ? 'active' : ''} onClick={() => setActiveFormTab('common')}><DollarSign size={16} /> Grupni Cenovnik</button>
                                </div>
                                <div style={{ marginTop: 'auto', padding: '20px' }}>
                                    <button onClick={handleAddHotel} className="btn-primary" style={{ width: '100%', padding: '15px' }}>SAČUVAJ SVE</button>
                                </div>
                            </div>

                            <div className="modal-main">
                                <button className="close-btn" onClick={() => setShowAddForm(false)}><X size={20} /></button>

                                {activeFormTab === 'general' && (
                                    <div className="form-section">
                                        <h2 className="section-title">Osnovni Podaci</h2>
                                        <div className="form-grid">
                                            <div className="form-item spread"><label>Ime Objekta</label><input value={currentHotel.name} onChange={e => setCurrentHotel({ ...currentHotel, name: e.target.value })} /></div>
                                            <div className="form-item"><label>Mesto</label><input value={currentHotel.location?.place} onChange={e => setCurrentHotel({ ...currentHotel, location: { ...currentHotel.location!, place: e.target.value } })} /></div>
                                            <div className="form-item"><label>Adresa</label><input value={currentHotel.location?.address} onChange={e => setCurrentHotel({ ...currentHotel, location: { ...currentHotel.location!, address: e.target.value } })} /></div>
                                            <div className="form-item"><label>Lat</label><input value={currentHotel.location?.lat} onChange={e => setCurrentHotel({ ...currentHotel, location: { ...currentHotel.location!, lat: e.target.value } })} /></div>
                                            <div className="form-item"><label>Lng</label><input value={currentHotel.location?.lng} onChange={e => setCurrentHotel({ ...currentHotel, location: { ...currentHotel.location!, lng: e.target.value } })} /></div>
                                        </div>
                                    </div>
                                )}

                                {activeFormTab === 'units' && (
                                    <div className="form-section">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                            <h2 className="section-title">Upravljanje Jedinicama</h2>
                                            <button className="btn-primary" onClick={addEmptyUnit}>+ Dodaj</button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                                            <div className="units-list-sidebar">
                                                {currentHotel.units?.map((u, i) => (
                                                    <div key={u.id} className={`unit-nav-item ${selectedUnitIdx === i ? 'active' : ''}`} onClick={() => setSelectedUnitIdx(i)}>
                                                        {u.name}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="unit-detail-panel">
                                                {selectedUnitIdx !== null && currentHotel.units?.[selectedUnitIdx] ? (
                                                    <div className="form-grid mini">
                                                        <div className="form-item spread"><label>Ime Jedinice</label><input value={currentHotel.units[selectedUnitIdx].name} onChange={e => {
                                                            const nu = [...currentHotel.units!]; nu[selectedUnitIdx].name = e.target.value; setCurrentHotel({ ...currentHotel, units: nu });
                                                        }} /></div>
                                                        <div className="form-item"><label>Beds (Basic)</label><input type="number" value={currentHotel.units[selectedUnitIdx].basicBeds} onChange={e => {
                                                            const nu = [...currentHotel.units!]; nu[selectedUnitIdx].basicBeds = Number(e.target.value); setCurrentHotel({ ...currentHotel, units: nu });
                                                        }} /></div>
                                                        <div className="form-item"><label>Beds (Extra)</label><input type="number" value={currentHotel.units[selectedUnitIdx].extraBeds} onChange={e => {
                                                            const nu = [...currentHotel.units!]; nu[selectedUnitIdx].extraBeds = Number(e.target.value); setCurrentHotel({ ...currentHotel, units: nu });
                                                        }} /></div>
                                                        <div className="form-item"><label>Min Occ</label><input type="number" value={currentHotel.units[selectedUnitIdx].minOccupancy} onChange={e => {
                                                            const nu = [...currentHotel.units!]; nu[selectedUnitIdx].minOccupancy = Number(e.target.value); setCurrentHotel({ ...currentHotel, units: nu });
                                                        }} /></div>
                                                        <div className="form-item spread" style={{ marginTop: '20px' }}>
                                                            <label>Cenovnik (Pricelist)</label>
                                                            <div className="price-mini-table">
                                                                <p style={{ opacity: 0.5 }}>Cenovnik za: {currentHotel.units[selectedUnitIdx].name}</p>
                                                                {/* Pricelist fields from JSON: dateFrom, dateTo, price, title... */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : <div style={{ opacity: 0.3, textAlign: 'center', paddingTop: '100px' }}>Odaberite jedinicu sa leve strane</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeFormTab === 'common' && (
                                    <div className="form-section">
                                        <h2 className="section-title">Grupni Elementi (Common Items)</h2>
                                        <div className="common-items-grid">
                                            <div className="common-card">
                                                <h4>Doplate (Supplements)</h4>
                                                <div className="items-placeholder">JSON: supplements niz</div>
                                            </div>
                                            <div className="common-card">
                                                <h4>Popusti (Discounts)</h4>
                                                <div className="items-placeholder">JSON: discount niz</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .large-modal { width: 1000px; height: 80vh; display: flex; padding: 0; overflow: hidden; border-radius: 24px; }
                .modal-sidebar { width: 250px; background: var(--bg-card); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
                .modal-nav { padding: 10px; display: flex; flex-direction: column; gap: 4px; }
                .modal-nav button { background: transparent; border: none; padding: 12px 16px; border-radius: 8px; color: var(--text-secondary); text-align: left; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; font-weight: 600; }
                .modal-nav button:hover { background: rgba(255,255,255,0.05); }
                .modal-nav button.active { background: var(--accent); color: #fff; }
                .modal-main { flex: 1; padding: 40px; position: relative; background: var(--bg-main); overflow-y: auto; }
                .close-btn { position: absolute; top: 20px; right: 20px; background: transparent; border: none; color: var(--text-secondary); cursor: pointer; }
                .section-title { font-size: 20px; font-weight: 700; margin-bottom: 24px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-grid.mini { gap: 12px; }
                .spread { grid-column: span 2; }
                .form-item label { font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: block; }
                .form-item input { width: 100%; padding: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; color: var(--text-primary); outline: none; }
                .units-list-sidebar { display: flex; flex-direction: column; gap: 8px; }
                .unit-nav-item { padding: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; }
                .unit-nav-item.active { border-color: var(--accent); color: var(--accent); background: rgba(0,122,255,0.05); }
                .price-mini-table { background: var(--bg-card); padding: 20px; border-radius: 12px; border: 1px solid var(--border); min-height: 100px; }
                .common-items-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .common-card { background: var(--bg-card); padding: 20px; border-radius: 16px; border: 1px solid var(--border); }
                .items-placeholder { margin-top: 12px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 8px; font-size: 12px; opacity: 0.5; text-align: center; }
                .unit-badge { display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 800; font-size: 14px; }
            `}</style>
        </div>
    );
};

export default ProductionHub;
