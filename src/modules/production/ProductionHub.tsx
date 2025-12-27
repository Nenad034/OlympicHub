import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    X,
    ArrowLeft,
    Plus,
    MapPin,
    Star
} from 'lucide-react';
import { exportToJSON, exportToExcel, exportToXML, exportToPDF } from '../../utils/exportUtils';

interface Hotel {
    id: string;
    name: string;
    hotel_id?: string;
    city: string;
    destination: string;
    country: string;
    category: string;
    address: string;
    phone: string;
    email: string;
    latitude: string;
    longitude: string;
    mealPlan: string;
    website: string;
    facilities: string[];
}

interface ProductionHubProps {
    onBack: () => void;
    lang: string;
    userLevel: number;
}

const ProductionHub: React.FC<ProductionHubProps> = ({ onBack }) => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<Partial<Hotel>>({
        category: '4',
        mealPlan: 'HB',
        country: 'RS',
        facilities: []
    });

    const categories = [
        { val: '0', label: 'Uncategorized' },
        { val: '1', label: '1 Star' },
        { val: '2', label: '2 Stars' },
        { val: '3', label: '3 Stars' },
        { val: '4', label: '4 Stars' },
        { val: '5', label: '5 Stars' }
    ];

    const mealPlans = [
        { val: 'RO', label: 'Room Only' },
        { val: 'BB', label: 'Bed & Breakfast' },
        { val: 'HB', label: 'Half Board' },
        { val: 'FB', label: 'Full Board' },
        { val: 'AI', label: 'All Inclusive' }
    ];

    const handleAddHotel = (e: React.FormEvent) => {
        e.preventDefault();
        const newHotel = {
            ...formData,
            id: Math.random().toString(36).substr(2, 9),
            hotel_id: Math.floor(Math.random() * 10000000).toString()
        } as Hotel;
        setHotels([...hotels, newHotel]);
        setShowAddForm(false);
    };

    const handleExport = (format: 'json' | 'excel' | 'xml' | 'pdf') => {
        if (hotels.length === 0) return alert('Nema hotela za export');
        switch (format) {
            case 'json': exportToJSON(hotels, 'smestaj_export'); break;
            case 'excel': exportToExcel(hotels, 'smestaj_export'); break;
            case 'xml': exportToXML(hotels, 'smestaj_export'); break;
            case 'pdf': exportToPDF(hotels, 'smestaj_export', 'Baza Smestaja - Olympic Hub'); break;
        }
    };

    return (
        <div className="module-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="btn-icon"><ArrowLeft size={20} /></button>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Smeštaj (Hoteli)</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Upravljanje bazom smeštajnih kapaciteta</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowAddForm(true)} className="btn-primary">
                        <Plus size={18} /> Dodaj Hotel
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
                    <div style={{ padding: '80px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <Building2 size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <p style={{ color: 'var(--text-secondary)' }}>Nema unetih hotela. Kliknite na "Dodaj Hotel" da započnete.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {hotels.map(h => (
                            <motion.div key={h.id} layout className="app-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[...Array(Number(h.category))].map((_, i) => <Star key={i} size={14} fill="var(--accent)" color="var(--accent)" />)}
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: {h.hotel_id}</span>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{h.name}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                    <MapPin size={12} /> {h.city}, {h.country}
                                </p>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '10px', background: 'var(--glass-bg)', padding: '4px 8px', borderRadius: '6px' }}>{h.mealPlan}</span>
                                    {h.facilities?.map(f => <span key={f} style={{ fontSize: '10px', background: 'var(--glass-bg)', padding: '4px 8px', borderRadius: '6px' }}>{f}</span>)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="modal-content" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3>Novi Hotel</h3>
                                <button onClick={() => setShowAddForm(false)} className="btn-icon"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAddHotel} className="form-grid">
                                <div className="form-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Ime Hotela</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Kategorija</label>
                                    <select onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }}>
                                        {categories.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-item">
                                    <label>Usluga (Meal Plan)</label>
                                    <select onChange={e => setFormData({ ...formData, mealPlan: e.target.value })} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'var(--text-primary)' }}>
                                        {mealPlans.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-item">
                                    <label>Grad</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Država (Kod)</label>
                                    <input required type="text" defaultValue="RS" onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                </div>
                                <div className="form-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Adresa</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Email</label>
                                    <input required type="email" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Telefon</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Latitude</label>
                                    <input type="text" placeholder="0.0000" onChange={e => setFormData({ ...formData, latitude: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Longitude</label>
                                    <input type="text" placeholder="0.0000" onChange={e => setFormData({ ...formData, longitude: e.target.value })} />
                                </div>

                                <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '20px', padding: '15px' }}>
                                    Sačuvaj Hotel
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .btn-icon { background: var(--glass-bg); border: 1px solid var(--border); color: var(--text-primary); padding: 8px; borderRadius: 12px; cursor: pointer; display: flex; align-items: center; }
                .btn-primary { background: var(--accent); color: #fff; border: none; padding: 10px 20px; borderRadius: 12px; fontWeight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                .btn-secondary { background: var(--glass-bg); border: 1px solid var(--border); color: var(--text-primary); padding: 10px 15px; borderRadius: 10px; cursor: pointer; font-size: 12px; font-weight: 600; }
                .export-group { display: flex; background: var(--glass-bg); padding: 4px; borderRadius: 14px; border: 1px solid var(--border); gap: 4px; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justifyContent: center; z-index: 1000; }
                .modal-content { background: var(--bg-main); border: 1px solid var(--border); padding: 40px; borderRadius: 32px; width: 600px; max-height: 90vh; overflowY: auto; }
                .form-grid { display: grid; gridTemplateColumns: 1fr 1fr; gap: 20px; }
                .form-item { display: flex; flexDirection: column; gap: 8px; }
                .form-item label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
                .form-item input { background: var(--bg-card); border: 1px solid var(--border); padding: 12px; borderRadius: 12px; color: var(--text-primary); }
            `}</style>
        </div>
    );
};

export default ProductionHub;
