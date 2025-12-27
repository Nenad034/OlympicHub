import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck,
    X,
    ArrowLeft,
    ChevronRight,
    Download,
    Plus,
    Building,
    Globe,
    Phone,
    Mail,
    CreditCard
} from 'lucide-react';
import { exportToJSON, exportToExcel, exportToXML, exportToPDF } from '../../utils/exportUtils';

interface Supplier {
    id: string;
    name: string;
    type: string;
    firmName: string;
    cui: string; // Tax ID
    jNo: string; // Reg No
    iban: string;
    bank: string;
    address: string;
    city: string;
    country: string;
    email: string;
    phone: string;
    contactPerson: string;
}

interface SuppliersProps {
    onBack: () => void;
}

const Suppliers: React.FC<SuppliersProps> = ({ onBack }) => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [types] = useState(['Hoteli', 'Hotelske grupe i organizacije', 'Touroperatori', 'Prevoznici']);
    const [selectedType, setSelectedType] = useState<string>('Hoteli');
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState<Partial<Supplier>>({
        type: 'Hoteli',
        country: 'RS',
        city: 'Beograd'
    });

    const handleAddSupplier = (e: React.FormEvent) => {
        e.preventDefault();
        const newSupplier = {
            ...formData,
            id: Math.random().toString(36).substr(2, 9),
            type: selectedType
        } as Supplier;
        setSuppliers([...suppliers, newSupplier]);
        setShowAddForm(false);
        setFormData({ type: selectedType });
    };

    const handleExport = (format: 'json' | 'excel' | 'xml' | 'pdf') => {
        const dataToExport = suppliers.filter(s => s.type === selectedType);
        if (dataToExport.length === 0) return alert('Nema podataka za export');

        switch (format) {
            case 'json': exportToJSON(dataToExport, `dobavljaci_${selectedType}`); break;
            case 'excel': exportToExcel(dataToExport, `dobavljaci_${selectedType}`); break;
            case 'xml': exportToXML(dataToExport, `dobavljaci_${selectedType}`); break;
            case 'pdf': exportToPDF(dataToExport, `dobavljaci_${selectedType}`, `Lista Dobavljaca - ${selectedType}`); break;
        }
    };

    return (
        <div className="module-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="btn-icon">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Dobavljači</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Baza partnera i ugovora</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowAddForm(true)} className="btn-primary">
                        <Plus size={18} /> Dodaj Dobavljača
                    </button>
                    <div className="export-group">
                        <button className="btn-secondary" onClick={() => handleExport('json')}>JSON</button>
                        <button className="btn-secondary" onClick={() => handleExport('excel')}>XLSX</button>
                        <button className="btn-secondary" onClick={() => handleExport('pdf')}>PDF</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
                {types.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: selectedType === type ? 'var(--accent)' : 'var(--bg-card)',
                            color: selectedType === type ? '#fff' : 'var(--text-primary)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="suppliers-list">
                {suppliers.filter(s => s.type === selectedType).length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <Truck size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <p style={{ color: 'var(--text-secondary)' }}>Nema unetih dobavljača u kategoriji {selectedType}</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {suppliers.filter(s => s.type === selectedType).map(s => (
                            <motion.div key={s.id} layout className="app-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{s.name}</h3>
                                    <span style={{ fontSize: '11px', background: 'rgba(63, 185, 80, 0.1)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '6px' }}>{s.city}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={14} /> {s.firmName} ({s.cui})</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> {s.email}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> {s.phone}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={14} /> {s.iban} ({s.bank})</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3>Novi Dobavljač ({selectedType})</h3>
                                <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <form onSubmit={handleAddSupplier} className="form-grid">
                                <div className="form-item">
                                    <label>Ime/Naziv</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Naziv Firme</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, firmName: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>PIB / CUI</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, cui: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Reg. Broj / JNo</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, jNo: e.target.value })} />
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
                                    <label>Grad</label>
                                    <input required type="text" defaultValue="Beograd" onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                </div>
                                <div className="form-item">
                                    <label>Država (Kod)</label>
                                    <input required type="text" defaultValue="RS" maxLength={2} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                </div>
                                <div className="form-item" style={{ gridColumn: 'span 2' }}>
                                    <label>IBAN</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, iban: e.target.value })} />
                                </div>
                                <div className="form-item" style={{ gridColumn: 'span 2' }}>
                                    <label>Banka</label>
                                    <input required type="text" onChange={e => setFormData({ ...formData, bank: e.target.value })} />
                                </div>

                                <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '20px', padding: '15px' }}>
                                    Sačuvaj Dobavljača
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

export default Suppliers;
